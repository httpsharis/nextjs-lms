import userModel from "../Models/userModel";
import { Response } from "express";


// @get-User-Info
export const getUserById = async(id: string, res: Response) => {
    const user = await userModel.findById(id)
    res.status(201).json({
        success: true,
        user
    })
}