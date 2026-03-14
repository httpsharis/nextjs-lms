import NotificationModel from '../Models/notificationModel';
import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from '../middlewares/catchAsyncErrors';
import ErrorHandler from "../Utils/ErrorHandler";
import { AuthenticatedRequest } from "@/@types";
const cron = require('node-cron');

// Notification 
export const getNotifications = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: Function) => {
    try {
        const notification = await NotificationModel.find().sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            notification
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

// Update Notification
export const updateNotification = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const notification = await NotificationModel.findById(req.params.id)

        if (!notification) {
            return next(new ErrorHandler("Notification not found", 404))
        }

        notification.status = "read"
        await notification.save()

        const notifications = await NotificationModel.find().sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            notifications
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

// delete Notification
cron.schedule('0 0 * * *', async () => {
    // 1. Calculate the exact time 30 days ago
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 2. Delete all read notifications older than that time
    await NotificationModel.deleteMany({
        status: "read",
        createdAt: { $lt: thirtyDaysAgo }
    });

    console.log('Cleaned up old read notifications.');
});