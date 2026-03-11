import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../Utils/ErrorHandler';
import { catchAsyncError } from '../middlewares/catchAsyncErrors';
import OrderModel, { IOrder } from '../Models/orderModel'
import UserModel from '../Models/userModel'
import path from 'path'
import ejs from 'ejs'
import sendMail from '../Utils/sendMail';
import NotificationModel from '../Models/notificationModel';
import { AuthenticatedRequest } from '@/@types';

// Create Order 

interface IOrderRequest{
    courseId: string;
    paymentInfo: object
}
export const createOrder = catchAsyncError(async(req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const {courseId, paymentInfo} = req.body as IOrder
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})