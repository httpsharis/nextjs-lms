import { Request, Response, NextFunction } from 'express';
import userModel, { IUser } from '../Models/userModel';
import ErrorHandler from '@/Utils/ErrorHandler';
import { catchAsyncError } from '@/middlewares/catchAsyncErrors';
import jwt from 'jsonwebtoken'
require('dotenv').config()

// Register User
interface IRegistrationBody {
    name: string,
    email: string,
    password: string,
    avatar?: string
}

export const registerUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, avatar } = req.body

        const isEmailExist = await userModel.findOne({ email })
        if (isEmailExist) {
            return next(new ErrorHandler("Email Already Exist", 400))
        }

        const user: IRegistrationBody = { name, email, password }

        const activationToken = createActivationToken(user)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

interface IActivationToken {
    token: string;
    activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString()

    const token = jwt.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET, {
        expiresIn: '5m'
    })

    return {token, activationCode}
}