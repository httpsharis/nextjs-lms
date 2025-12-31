import { Request, Response, NextFunction } from 'express';
import userModel, { IUser } from '../Models/userModel';
import ErrorHandler from '../Utils/ErrorHandler';
import { catchAsyncError } from '../middlewares/catchAsyncErrors';
import jwt from 'jsonwebtoken'
import ejs from 'ejs'
import path from 'path';
import sendMail from '../Utils/sendMail';
import rateLimit from 'express-rate-limit'
require('dotenv').config()


// Register User
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