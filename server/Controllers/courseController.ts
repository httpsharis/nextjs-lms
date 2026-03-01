import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../Utils/ErrorHandler';
import { catchAsyncError } from '../middlewares/catchAsyncErrors';
import cloudinary from 'cloudinary';
import { createCourse } from '../Services/courseService';
import { AuthenticatedRequest } from '@/@types';
import CourseModel from '../Models/courseModel';
import { redis } from '../config/redis';

// Upload Course
export const uploadCourse = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const data = req.body
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            })

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }
        createCourse(data, res, next)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

// edit course 
export const editCourse = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            await cloudinary.v2.uploader.destroy(thumbnail.public_id)
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            }
        }

        const courseId = req.params.id;

        const course = await CourseModel.findByIdAndUpdate(courseId, { $set: data }, { new: true })

        res.status(201).json({
            success: true,
            course,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

// Get Single Course - not purchased
export const getSingleCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await CourseModel
            .findById(req.params.id)
            // Choosing not send this data. This will be sent when user will but the course.
            .select(
                "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
            )

        res.status(201).json({
            success: true,
            course
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }

})

// Get all Courses - not purchased 
export const getAllCourses = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isCacheExist = await redis.get("allCourses");

        if (isCacheExist) {
            console.log('hitting redis');
            const courses = JSON.parse(isCacheExist);

            return res.status(200).json({
                success: true,
                courses
            });
        }

        console.log("hitting mongodb");
        const courses = await CourseModel.find().select(
            "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );


        await redis.set("allCourses", JSON.stringify(courses));

        res.status(200).json({
            success: true,
            courses
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// get course content - valid users
export const getCourseByUser = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses
        const courseId = req.params.id

        const courseExist = userCourseList?.find((course: any) => course._id.toString() === courseId)

        if (!courseExist) {
            return next(new ErrorHandler("You are not eligible to access this course", 404))
        }

        const course = await CourseModel.findById(courseId)

        const content = course?.courseData

        res.status(200).json({
            success: true,
            content
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})