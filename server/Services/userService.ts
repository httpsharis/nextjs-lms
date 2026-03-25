import ErrorHandler from "../Utils/ErrorHandler";
import userModel from "../Models/userModel";
import { Response } from "express";
import { redis } from "../config/redis";

/**
 * GET USER INFO
 * -------------
 * 
 * Getting user info from the redis for better speed and giving low load on the DB
 */
export const getUserById = async (id: string, res: Response) => {
    const userJson = await redis.get(id)
    if (userJson) {
        const user = JSON.parse(userJson)
        res.status(201).json({
            success: true,
            user
        })
    }
}

/**
 * USER SERVICE - Register Logic
 * @description Handles the heavy lifting of checking duplicates and preparing user data.
 * @param email - The email to check.
 * @returns - Returns true if email is unique, otherwise throws an error.
 */
export const checkUserExist = async (email: string) => {
    const isEmailExist = await userModel.findOne({ email })
    if (isEmailExist) {
        throw new ErrorHandler("Email already exist", 400)
    }
    return false
}

/**
 * USER SERVICE - Create User
 * -------------------------
 * This function officially saves the user to MongoDB.
 * @param data - The user details extracted from the decoded JWT.
 * @returns - The newly created user document.
 */
export const createNewUser = async (data: any) => {
    // 1. Business Logic: Final DB creation
    const user = await userModel.create(data);
    return user;
};

/**
 * GET ALL USER SERVICE 
 * -------------------------
 * 
 * Finding the user and sorting it
 */

export const getAllUserService = async () => {
    const users = await userModel.find().sort({ createdAt: -1 })
    return users
}

export const updateUserRoleService = async (id: string, role: string) => {
    const updatedRole = await userModel.findByIdAndUpdate(id, { role }, { new: true, runValidators: true })
    return updatedRole
}

export const deleteUserService = async (id: string) => {
    const user = await userModel.findByIdAndDelete(id)

    if (user) {
        await redis.del(id)
    }

    return user
}