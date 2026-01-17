import { Request, Response, NextFunction, request } from 'express';
import userModel, { IUser } from '../Models/userModel';
import ErrorHandler from '../Utils/ErrorHandler';
import { catchAsyncError } from '../middlewares/catchAsyncErrors';
import jwt, { JwtPayload } from 'jsonwebtoken'
import sendMail from '../Utils/sendMail';
import rateLimit from 'express-rate-limit'
import { accessTokenOptions, refreshTokenOptions, sendToken } from '../Utils/jwt';
import { redis } from '../config/redis';
import { createNewUser, getUserById } from '../Services/userService';
import { checkUserExist } from '../Services/userService';
import { createActivationToken } from '../Utils/activationToken';
import { RegisterBody, ActivationRequest, LoginUser } from '@/@types';

require('dotenv').config()

interface AuthenticatedRequest extends Request {
    user?: IUser;
}

/**
 * REGISTER USER CONTROLLER
 * ------------------------
 * Initiates the sign-up process for a new student.
 * * @logic
 * 1. Validation: Calls 'checkUserExist' service to prevent duplicate emails.
 * 2. Tokenization: Packages user data into a temporary JWT (Activation Token).
 * 3. Communication: Triggers an activation email containing a 4-digit code.
 * * @param req - Express request containing 'RegisterBody' (name, email, password).
 * @param res - Sends 201 status and the encoded activation token to the frontend.
 * @param next - Error handler for database or mail-server failures.
 */

export const registerUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    // Logic Check (userServices)
    await checkUserExist(email);

    const user: RegisterBody = { name, email, password };

    // Security: Create temporary session
    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;
    const data = { user: { name: user.name }, activationCode };

    try {
        // Send the "Payload" (data) to the email service
        await sendMail({
            email: user.email,
            subject: "Activate your account",
            template: "activationMail.ejs",
            data,
        });

        res.status(201).json({
            success: true,
            message: `Please check your email (${user.email}) to activate your account`,
            activationCode: activationToken.token,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Rate Limit for the mails
export const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Min
    max: 3, // 3 Attempts per 15 min
    message: 'Too many registration attempts, please try again later'
})


/**
 * ACTIVATE USER CONTROLLER
 * ------------------------
 * @logic
 * 1. Decodes the token sent from the frontend.
 * 2. Compares the 4-digit code provided by the user with the one in the token.
 * 3. If they match, calls 'createNewUser' service to save the record.
 */
export const activateUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { activation_token, activation_code } = req.body as ActivationRequest;

    // 1. Decode the JWT (The "Reservation Ticket")
    const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
    ) as { user: IUser; activationCode: string };

    // 2. Security Check: Does the code match?
    if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler('Invalid Activation Code', 400));
    }

    const { name, email, password } = newUser.user;

    // 3. Double Check: Did they register while this token was pending?
    await checkUserExist(email);

    // 4. Calling our NEW Service
    const user = await createNewUser({
        name,
        email,
        password,
    });

    // 5. Success Response
    res.status(201).json({
        success: true,
        message: 'Your account is now active! You can log in.',
        user // Optional: you can send the user data back here
    });
});

/**
 * LOGIN USER CONTROLLER
 * --------------------
 * @logic
 * 1. Validates that the user actually typed something.
 * 2. Finds the user in MongoDB (including the hidden password field).
 * 3. Compares the provided password with the hashed one in the DB.
 * 4. Calls 'sendToken' to handle Redis storage and Cookie delivery.
 */
export const loginUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as LoginUser;

    // 1. Logic Check: Are fields empty?
    if (!email || !password) {
        return next(new ErrorHandler('Please enter both email and password', 400));
    }

    // 2. Database Check: Find user
    // We use .select('+password') because we usually hide the password for security
    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 400));
    }

    // 3. Password Verification
    // This calls the method you wrote in your User Model
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return next(new ErrorHandler('Invalid email or password', 400));
    }

    /**
     * 4. The "Golden Step": sendToken
     * This function (from your jwt.ts file):
     * - Creates Access & Refresh tokens.
     * - Saves the user session in REDIS.
     * - Sends Cookies to the browser.
     */
    sendToken(user, 200, res);
});

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

/**
 * REFRESH TOKEN CONTROLLER
 * ------------------------
 * @logic
 * 1. Pulls the Refresh Token from the user's cookies.
 * 2. Verifies the token is real (not faked).
 * 3. Checks Redis to see if the user session still exists.
 * 4. Issues a BRAND NEW pair of tokens to keep the user active.
 */
export const updateAccessToken = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Get the "Voucher" from the cookie
        const refresh_token = req.cookies.refresh_token as string;

        // 2. Verify the Voucher is valid
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;

        if (!decoded) {
            return next(new ErrorHandler('Refresh token is invalid or expired', 400));
        }

        // 3. Check the "Clipboard" (Redis)
        // We look for the user by the ID stored inside the Refresh Token
        const session = await redis.get(decoded.id as string);

        if (!session) {
            return next(new ErrorHandler('Please login to access this resource', 400));
        }

        const user = JSON.parse(session);

        // 4. Generate NEW tokens (Resetting the timer)
        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, { expiresIn: '5m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, { expiresIn: '3d' });

        // 5. Update the Cookies on the user's browser
        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

        res.status(200).json({
            success: true,
            accessToken // We send the new access token in the response too
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

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