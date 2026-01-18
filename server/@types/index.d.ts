/**
 * SHARED DATA SHAPES (INTERFACES)
 * -------------------------------
 * This is the master list for all objects in our LMS.
 */

import { IUser } from "@/Models/userModel";
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: IUser;
}
export interface RegisterBody { // @Interface defines the structure and shape of an object.
    name: string,
    email: string,
    password: string,
    avatar?: string // @? Represents that this is optional for the user.
}

export interface ActivationToken {
    token: string;
    activationCode: string;
}

export interface ActivationRequest {
    activation_token: string;
    activation_code: string;
}

export interface LoginUser {
    email: string,
    password: string,
}

export interface UpdateUserInfo {
    name?: string;
    email?: string;
}

export interface UpdatePassword {
    oldPassword: string;
    newPassword: string;
}

