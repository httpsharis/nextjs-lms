import ErrorHandler from "../Utils/ErrorHandler";
import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error!"

    // Mongo/Mongoose ID Error
    if (err.name == "CastError") {
        const message = `Resource not found, Invalid: ${err.path}` // @desc Path gives me the Field of Error: _id
        err = new ErrorHandler(message, 400)
    }

    // Duplicate Key Error 
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`
        err = new ErrorHandler(message, 400)
    }

    // Wrong JWT token
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is Invalid, Try again!`
        err = new ErrorHandler(message, 400)
    }

    if (err.name === "TokenExpiredError") {
        const message = `Json Token is Expired, Try again!`
        err = new ErrorHandler(message, 400)
    }



    // Send response to client
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}

