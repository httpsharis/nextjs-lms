import { Request, Response, NextFunction, request } from 'express';
import userModel, { IUser } from '../Models/userModel';
import ErrorHandler from '../Utils/ErrorHandler';
import { catchAsyncError } from '../middlewares/catchAsyncErrors';
import jwt, { JwtPayload } from 'jsonwebtoken'
import ejs from 'ejs'
import path from 'path';
import sendMail from '../Utils/sendMail';
import rateLimit from 'express-rate-limit'
import { accessTokenOptions, refreshTokenOptions, sendToken } from '../Utils/jwt';
import { redis } from '../config/redis';
import { getUserById } from '../Services/userService';
require('dotenv').config()

interface AuthenticatedRequest extends Request {
    user?: IUser;
}

// @Register-User
interface RegisterBody { // @Interface defines the structure and shape of an object.
    name: string,
    email: string,
    password: string,
    avatar?: string // @? Represents that this is optional for the user.
}

export const registerUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    // Defining the body = req.body
    const { name, email, password, avatar } = req.body;

    // Checking if email already Exist
    const isEmailExist = await userModel.findOne({ email })
    if (isEmailExist) {
        return next(new ErrorHandler('Email already Exist', 400))
    }

    // User body define
    const user: RegisterBody = { name, email, password }

    // activation token
    const activationToken = createActivationToken(user)
    const activationCode = activationToken.activationCode

    const data = { user: { name: user.name }, activationCode }

    // @ejs.renderFile - ejs function
    // @path - Node.js utility that provides methods for working with file and directory paths
    // @join - joins arguments together, Passed 2 arguments __dirname and ejs template file and data that we defined
    const html = await ejs.renderFile(path.join(__dirname, "../mails/activationMail.ejs"), data)

    try {
        await sendMail({
            email: user.email,
            subject: "Activate you account",
            template: "activationMail.ejs",
            data,
        })

        res.status(201).json({
            success: true,
            message: `Please Check you ${user.email} to activate your account`,
            activationCode: activationToken.token,
        })
    } catch (error: any) {
        return next(new ErrorHandler("error.message", 400))
    }
})

interface ActivationToken {
    token: string;
    activationCode: string;
}

export const createActivationToken = (user: RegisterBody): ActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString()

    const token = jwt.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET, {
        expiresIn: '5m'
    })

    return { token, activationCode }
}

// Rate Limit for the mails
export const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Min
    max: 3, // 3 Attempts per 15 min
    message: 'Too many registration attempts, please try again later'
})

// Activate User
interface ActivationRequest {
    activation_token: string;
    activation_code: string;
}

// @Activate-User
export const activateUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { activation_token, activation_code } = req.body as ActivationRequest // Defining the types

    const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
    ) as { user: IUser; activationCode: string }

    if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler('Activation Code is Invalid', 400))
    }

    const { name, email, password } = newUser.user;

    const existedUser = await userModel.findOne({ email })

    if (existedUser) {
        return next(new ErrorHandler('Email Already Exist!', 400))
    }

    const user = await userModel.create({
        name, email, password
    })

    res.status(201).json({
        success: true,
        message: 'Your account is Activated'
    })
})

// @Login-User 
interface LoginUser {
    email: string,
    password: string,
}
export const loginUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    // Extract credentials
    const { email, password } = req.body as LoginUser;

    // Validate Input: Checks if the user inputs the Email & Password
    if (!email || !password) {
        return next(new ErrorHandler('Please Enter Email and password', 400))
    }

    // Check DB if the user already exit?
    const user = await userModel.findOne({ email }).select('+password')
    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password', 400))
    }

    // Compare password from DB to the one User added
    const isPasswordMatch = await user.comparePassword(password) // comparePassword func exist in ./Models/userModels
    if (!isPasswordMatch) {
        return next(new ErrorHandler('Invalid Password', 400))
    }

    // Sends token and response - Function exist in the Utils/jwt.ts
    sendToken(user, 200, res)
})

// @logout-user 
export const logoutUser = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    res.cookie("access_token", "", { maxAge: 1 })
    res.cookie("refresh_token", "", { maxAge: 1 })

    const userId = req.user?._id?.toString() || ""
    redis.del(userId)

    res.status(200).json({
        success: true,
        message: "User Logged out successfully!"
    })
})

// @update-access-token
export const updateAccessToken = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const refresh_token = req.cookies.refresh_token as string;
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload
    if (!decoded) {
        return next(new ErrorHandler('Could not refresh token', 400))
    }

    const session = await redis.get(decoded.id as string)
    if (!session) {
        return next(new ErrorHandler('Could not refresh token', 400))
    }

    const user = JSON.parse(session);

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, { expiresIn: '5m' })
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, { expiresIn: '3d' })

    // Updating the Cookie
    res.cookie("access_token", accessToken, accessTokenOptions)
    res.cookie("refresh_token", refreshToken, refreshTokenOptions)

    res.status(200).json({
        success: true,
        accessToken
    })
})

// @get-User-Info - Getting the info from @userService.ts file
export const getUserInfo = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id.toString()
    if (!userId) {
        return next(new ErrorHandler('User not found', 404))
    }
    getUserById(userId, res)
})

interface SocialAuthBody {
    email: string;
    name: string;
    avatar: string;
}

// @socialAuth
export const socialAuth = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, avatar } = req.body as SocialAuthBody
    const user = await userModel.findOne({ email });
    if (!user) {
        const newUser = await userModel.create({
            email,
            name,
            avatar: {
                public_id: "social_auth",
                url: avatar
            },
            isSocial: true
            // No password needed!
        });
        sendToken(newUser, 200, res)
    } else {
        sendToken(user, 200, res)
    }
})