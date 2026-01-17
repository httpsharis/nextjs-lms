import ErrorHandler from "@/Utils/ErrorHandler";
import userModel from "../Models/userModel";
import { Response } from "express";


// @get-User-Info
export const getUserById = async (id: string, res: Response) => {
    const user = await userModel.findById(id)
    res.status(201).json({
        success: true,
        user
    })
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
        throw new ErrorHandler('Email already exist', 400)
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