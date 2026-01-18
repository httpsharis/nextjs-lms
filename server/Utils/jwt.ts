require('dotenv').config();
import { Response } from 'express';
import { IUser } from '../Models/userModel';
import { redis } from '../config/redis';

/**
 * AUTHENTICATION TOKEN SERVICE
 * ----------------------------
 * This file handles "Logging in" the user by giving them two digital keys:
 * 1. Access Token: For quick, short-term access. (expires in 5 - 10 mins)
 * 2. Refresh Token: To keep them logged in for a long time. (expires in 10-15 mins)
 * 3. Redis: Saving user data in redis for quick session lookups
 */

/**
 * Configuration for the "Cookie" (the digital box where tokens are stored in the browser).
 */
interface TokenOptions {
    expires: Date;      // When the cookie disappears
    maxAge: number;     // How long the cookie lives (in milliseconds)
    httpOnly: boolean;  // If true, the browser's JavaScript cannot touch this (Security)
    sameSite: 'lax' | 'strict' | 'none' | undefined; // Prevents other websites from stealing this cookie
    secure?: boolean;   // Only send over HTTPS (Encrypted connection)
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

/**
 * SEND TOKEN UTILITY
 * ------------------
 * @async
 * @description
 * 1. Signs Access/Refresh tokens via User Model methods.
 * 2. Syncs user document to Redis for fast session retrieval.
 * 3. Configures and sets HTTP-only cookies for security.
 * * @param user - The authenticated user document.
 * @param statusCode - HTTP status code (usually 200 or 201).
 * @param res - Express response object.
 */
export const sendToken = async (user: IUser, statusCode: number, res: Response) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    const userObj = user.toObject();
    const sessionData = JSON.stringify(userObj);
    await redis.set(user._id.toString(), sessionData);

    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true;
    }

    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken
    });
};