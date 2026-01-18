import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../Utils/ErrorHandler";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { redis } from "../config/redis";
import { IUser } from "../Models/userModel";

// @isAuthenticated Func
export const isAuthenticated = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string

    if (!access_token) {
        return next(new ErrorHandler('Please login to access this resource', 400))
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload

    if (!decoded) {
        return next(new ErrorHandler('access_token is not valid', 400))
    }

    const user = await redis.get(decoded.id)

    if (!user) {
        return next(new ErrorHandler('User not found', 400))
    }

    (req as any).user = JSON.parse(user) as IUser;
    next()
})

// @isAuthorizedRoles 
export const isAuthorized = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {

        const userRole = (req as any).user?.role;
        if (!userRole || !roles.includes(userRole)) {
            return next(
                new ErrorHandler(`Role: ${userRole || "unknown"} is not allowed to access this resource`, 403)
            )
        }
        next()
    }
}