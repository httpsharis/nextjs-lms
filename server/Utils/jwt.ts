require('dotenv').config();
import { Response } from 'express';
import { IUser } from '../Models/userModel';
import { redis } from '../config/redis';

// Interface will be saved in cookies
interface TokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

// parse environment to integrate with te fallback 
export const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10)
export const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10)

// options for cookies
export const accessTokenOptions: TokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
}

export const refreshTokenOptions: TokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
}
// Function that accepts the user, code and res
export const sendToken = (user: IUser, statusCode: number, res: Response) => {
    // a. Generates Tokens
    const accessToken = user.SignAccessToken(); // expires after 5 to 10 mins
    const refreshToken = user.SignRefreshToken(); // Keep the user logged in as they're active

    // b. Upload session to redis
    redis.set(user._id.toString(), JSON.stringify(user) as any)

    // This func will make the access token secure when in production mode.
    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true;
    }

    // c. Set Cookies
    res.cookie("access_token", accessToken, accessTokenOptions)
    res.cookie("refresh_token", refreshToken, refreshTokenOptions)

    // d. send response
    res.status(statusCode).json({
        success: true,
        user,
        accessToken
    })
}