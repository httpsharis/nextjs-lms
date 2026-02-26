import { Response } from 'express';
import CourseModel from '../Models/courseModel';
import ErrorHandler from '../Utils/ErrorHandler';
import { catchAsyncError } from '../middlewares/catchAsyncErrors';


// create course 
export const createCourse = catchAsyncError(async (data: any, res: Response) => {
    const course = await CourseModel.create(data);
    res.status(201).json({
        success: true,
        course
    })
})