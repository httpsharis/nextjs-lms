import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../Utils/ErrorHandler';
import { catchAsyncError } from '../middlewares/catchAsyncErrors';
import cloudinary from 'cloudinary';
import { createCourse } from '../Services/courseService';
import { AuthenticatedRequest } from '@/@types';
import CourseModel from '../Models/courseModel';
import { redis } from '../config/redis';
import mongoose from 'mongoose';
import ejs from 'ejs'
import path from 'node:path';
import sendMail from '../Utils/sendMail';

// Upload Course
export const uploadCourse = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const data = req.body
        const thumbnail = data.thumbnail;
        if (thumbnail && typeof thumbnail === "string") {
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

        if (thumbnail && typeof thumbnail === "string") {
            // Destroy the OLD thumbnail from the existing course
            const existingCourse = await CourseModel.findById(req.params.id);
            if (existingCourse?.thumbnail?.public_id) {
                await cloudinary.v2.uploader.destroy(existingCourse.thumbnail.public_id);
            }

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

        // Set Redis cache with expiry time (e.g., 1 hour)
        await redis.set("allCourses", JSON.stringify(courses), "EX", 3600);

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

// Add Questions in Course 
interface AddQuestion {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestion = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { question, courseId, contentId }: AddQuestion = req.body;
        const course = await CourseModel.findById(courseId)

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid content ID", 400))
        }

        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId))

        if (!courseContent) {
            return next(new ErrorHandler("Invalid content ID", 400))
        }

        // New Question Object
        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: [],
        };

        // adding this question to out course content
        courseContent.questions.push(newQuestion)

        // Save the updated course 
        await course?.save()

        res.status(200).json({
            success: true,
            course,
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})


// Add Answer to Course Question
interface AddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string
}

export const addAnswer = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { answer, courseId, contentId, questionId }: AddAnswerData = req.body;

        // Validate courseId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return next(new ErrorHandler("Invalid course ID", 400));
        }

        // Validate contentId
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid content ID", 400));
        }

        const course = await CourseModel.findById(courseId);

        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }

        const courseContent = course.courseData?.find((item: any) => item._id.equals(contentId));

        if (!courseContent) {
            return next(new ErrorHandler("Invalid content ID", 400));
        }

        const question = courseContent.questions?.find((item: any) => item._id.equals(questionId));

        if (!question) {
            return next(new ErrorHandler("Invalid question ID", 400));
        }

        // Create new answer object
        const newAnswer: any = {
            user: req.user,
            answer,
            createdAt: new Date(),
        };

        (question.questionReplies as any[]).push(newAnswer);

        // Save the updated course
        await course.save();

        // Send notification email if the answer is from a different user
        const questionUser = question.user as any;

        if (req.user?._id?.toString() !== questionUser?._id?.toString()) {
            const data = {
                user: questionUser,
                question: courseContent.title,
                reply: newAnswer,
                questionLink: `${process.env.CLIENT_URL || 'http://localhost:3000'}/course/${courseId}`,
            };

            try {
                await ejs.renderFile(
                    path.join(__dirname, "../mails/questionReplies.ejs"),
                    data
                );

                await sendMail({
                    email: questionUser?.email,
                    subject: "Your Question Reply",
                    template: "questionReplies.ejs",
                    data,
                });
            } catch (error: any) {
                console.error("Failed to send email:", error);
                return next(new ErrorHandler("Failed to send email notification", 500));
            }
        }

        res.status(200).json({
            success: true,
            message: "Answer added successfully",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})