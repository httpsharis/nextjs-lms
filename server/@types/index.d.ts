/**
 * SHARED DATA SHAPES (INTERFACES)
 * -------------------------------
 * This is the master list for all objects in our LMS.
 */

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

interface ActivationRequest {
    activation_token: string;
    activation_code: string;
}

interface LoginUser {
    email: string,
    password: string,
}