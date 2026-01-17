import jwt from 'jsonwebtoken';
import { RegisterBody, ActivationToken } from '@/@types';

/**
 * ACTIVATION TOKEN UTILITY
 * -------------------------
 * Logic:
 * 1. Generates a random 4-digit code (OTP).
 * 2. Wraps the user data and code into a JWT.
 * 3. Returns both so the controller can send them to the user.
 */

export const createActivationToken = (user: RegisterBody): ActivationToken => {
    // Logic: Create a 4-digit number as a string
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Logic: Sign the JWT with a short 5-minute expiry for security
    const token = jwt.sign(
        { user, activationCode },
        process.env.ACTIVATION_SECRET as string,
        { expiresIn: '5m' }
    );

    return { token, activationCode };
};