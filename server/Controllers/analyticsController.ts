import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../Utils/ErrorHandler';
import { catchAsyncError } from '../middlewares/catchAsyncErrors';
import { AuthenticatedRequest } from '@/@types';
import { getCoursesAnalyticsService, getOrdersAnalyticsService, getUserAnalyticService } from '../Services/analyticsService';

// get users analytics --- only Admin
export const getUserAnalytics = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const users = await getUserAnalyticService()

        res.status(200).json({
            success: true,
            users
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

export const getCourseAnalytics = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await getCoursesAnalyticsService();

        res.status(200).json({
            success: true,
            courses,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const getOrderAnalytics = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await getOrdersAnalyticsService();

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});