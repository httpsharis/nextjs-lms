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
import CourseModel from '../Models/courseModel';
import { redis } from '@/config/redis';
import { newOrderService } from '../Services/orderService';

// Create Order 

type IOrderRequest = Omit<IOrder, 'userId'>
export const createOrder = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { courseId, paymentInfo } = req.body as IOrder

        const userId = req.user?._id;

        if (!userId) {
            return next(new ErrorHandler("Please login to continue", 400));
        }

        const userCourseList = req.user?.courses || []

        const courseExist = userCourseList.find(
            (course: any) => course.courseId.toString() === courseId
        )

        if (courseExist) {
            return next(new ErrorHandler("You already have purchased this course", 400))
        }

        const course = await CourseModel.findById(courseId)

        if (!course) {
            return next(new ErrorHandler("Course not found", 404))
        }

        const order = await newOrderService(
            userId.toString(),
            course._id.toString(),
            paymentInfo,
        )

        await NotificationModel.create({
            userId: req.user?._id.toString(),
            title: "New Order",
            message: `You have a new order for the course: ${course.name}`,
        });

        try {
            const mailData = {
                order: {
                    _id: course._id.toString().slice(0, 6),
                    name: course.name,
                    price: course.price,
                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                },
                // Add the missing user data here
                user: {
                    name: req.user?.name || "Student"
                },
                // Add the missing link data here
                courseLink: `http://localhost:3000/course/${course._id.toString()}`
            };

            // Notice we only send the exact file name here
            await sendMail({
                email: req.user?.email || "",
                subject: "Order Confirmation",
                template: "orderConfirmation.ejs",
                data: mailData,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }

        // 10. Send the success response
        res.status(201).json({
            success: true,
            order,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})