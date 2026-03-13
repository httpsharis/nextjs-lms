import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../Utils/ErrorHandler';
import { catchAsyncError } from '../middlewares/catchAsyncErrors';
import cloudinary from 'cloudinary';
import { addAnswerService, addQuestionService, addReviewReplyService, createCourse } from '../Services/courseService';
import { AuthenticatedRequest } from '@/@types';
import CourseModel from '../Models/courseModel';
import { redis } from '../config/redis';
import mongoose from 'mongoose';
import sendMail from '../Utils/sendMail';
import NotificationModel from '../Models/notificationModel';

/**
 * 1. UPLOAD COURSE - (Authenticated User)
 *    ------------------------------------
 * - Created @interface - to Tackle the explicit Any
 * 
 * 1. Requesting Data from frontend 
 * 2. Making Name & Description Compulsory before uploading the Thumbnail
 * 3. Passing Thumbnail to Data after checking Name & Description Available.
 * 4. Checking typeof Thumbnail (string) 
 * 5. Uploading it and passing it as an Object
 * 6. Create course and passing data to database
 * 7. Deleting the old cache 
*/
interface IUploadCourse {
    name: string;
    description: string;
    thumbnail: string | { public_id: string; url: string };
    [key: string]: any; // Tells TypeScript to Expect other type of data
}

export const uploadCourse = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // 1. Getting the data
        const data = req.body as IUploadCourse

        // Validating if Name and Description of the course is available
        if (!data.name || !data.description) {
            return next(new ErrorHandler("Enter Name and Description First", 400))
        }

        // Passing thumbnail to the data
        const thumbnail = data.thumbnail;

        // Validating the Thumbnail as a string and uploading 
        if (thumbnail && typeof thumbnail === "string") {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            })

            // Passing Thumbnail as Object (Defined in interface)
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        // Creating the course and passing the data (Function in courseService)
        const course = await createCourse(data)

        // Deleting the older data
        await redis.del("allCourses")

        // Sending response
        res.status(201).json({
            success: true,
            course
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

/**
 * 2. UPLOAD COURSE - (Authenticated User)
 *    ------------------------------------
 * 1. Requesting Data from frontend 
 * 2. Getting course Id from the params
 * 3. Fetching Existing Course and Validating 
 * 4. Thumbnail: 
 *      - Checking User uploaded the string
 *      - Deleting the Existing Image
 *      - Uploading the New Thumbnail
 *      - Updating New object details in the DB
 * 5. Updating the course in the database
 *      - 'new: true' returns the freshly updated document
 * 6. Clearing the redis
 * 7. Sending the response
*/
export const editCourse = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Assign the incoming request body to our expected data structure.
        const data = req.body as IUploadCourse;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;

        // Fetch the existing course from the database first. 
        // This prevents multiple unnecessary database reads later.
        const existingCourse = await CourseModel.findById(courseId);

        if (!existingCourse) {
            return next(new ErrorHandler("Course not found", 404));
        }

        // Check if the user uploaded a new image as a text string.
        if (thumbnail && typeof thumbnail === "string") {

            // Delete the old image from cloud storage to save space.
            if (existingCourse.thumbnail?.public_id) {
                await cloudinary.v2.uploader.destroy(existingCourse.thumbnail.public_id);
            }

            // Upload the new image to the designated cloud folder.
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });

            // Update the data object with the new cloud storage details.
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }

        // Update the course in the database. 
        // The 'new: true' option returns the freshly updated document.
        const updatedCourse = await CourseModel.findByIdAndUpdate(
            courseId,
            { $set: data },
            { new: true }
        );

        // Clear the old data from the cache. 
        // This ensures all users see the new updates immediately.
        await redis.del(courseId);
        await redis.del("allCourses");

        // Send a success response back to the user.
        res.status(200).json({
            success: true,
            course: updatedCourse,
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

/**
 * 3. Get Single Course - (Unpaid User)
 *    -----------------------------------
 * 1. Getting course Id from the params
 * 2. Checking if the course Exist in the redis
 *      - If it does then sending it as a response
 * 3. If not then using the DB
 * 4. Hiding the data: 
 *      - "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links" from the unpaid users.
 * 5. Validating the course 
 * 6. Saving it in the redis for 7 days
 * 7. Sending the response
*/
export const getSingleCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id

        // Check if the course exist in redis
        const isCacheExist = await redis.get(courseId)
        if (isCacheExist) {
            // If Exist send it immediately
            const course = JSON.parse(isCacheExist)
            return res.status(201).json({
                success: true,
                course
            })
        }

        // If not cache, fetch it from DB
        const course = await CourseModel
            .findById(courseId)
            // We hide the sensitive video and link data from unpaid users.
            .select(
                "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
            )

        if (!course) {
            return next(new ErrorHandler("Course not found", 404))
        }

        // Save the fetched course in the redis for 7 days
        // "EX" means expire, 604800 = 7 days
        await redis.set(courseId, JSON.stringify(course), "EX", 604800)

        res.status(201).json({
            success: true,
            course
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }

})

/**
 * 3. Get All Course - (Unpaid User)
 *    -----------------------------------
 * 2. Checking if the course Exist in the redis
 *      - If it does then sending it as a response
 * 3. If not then using the DB
 * 4. Hiding the data: 
 *      - "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links" from the unpaid users.
 * 5. Validating the course 
 * 6. Saving it in the redis for 1 hour
 * 7. Sending the response
*/
export const getAllCourses = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check Redis cache first to serve data quickly.
        const isCacheExist = await redis.get("allCourses");

        if (isCacheExist) {
            // Parse the cached string and send it immediately.
            const courses = JSON.parse(isCacheExist);
            return res.status(200).json({
                success: true,
                courses
            });
        }

        // Fetch all courses from the database if cache is empty.
        // Hide sensitive data like video URLs from public view.
        const courses = await CourseModel.find().select(
            "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        // Store the new database result in Redis for one hour.
        await redis.set("allCourses", JSON.stringify(courses), "EX", 3600);

        // Send the fresh data back to the user.
        res.status(200).json({
            success: true,
            courses
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

/**
 * 4. Course Content for User - (Paid User)
 *    -------------------------------------
 * 1. Fetching the list of purchased Courses
 * 2. Requesting ID from param
 * 3. Checking if the course Exist in the list
 *      - If not we block the access 
 * 4. Fetch full course from from database via courseId
 * 5. Extract the Video and other links for paid user
 * 5. Sending the response
*/
export const getCourseByUser = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Get the list of courses the user has purchased.
        const userCourseList = req.user?.courses || [];
        const courseId = req.params.id;

        // Check if the requested course ID is in their list.
        const courseExist = userCourseList.find(
            (course: any) => course._id.toString() === courseId
        );

        // If they did not buy it, block access immediately.
        // We use 403 because the content exists but is locked.
        if (!courseExist) {
            return next(new ErrorHandler("You must purchase to access this course", 403));
        }

        // Fetch the full course from the database.
        const course = await CourseModel.findById(courseId);

        // Extract the premium content like videos and links.
        const content = course?.courseData;

        // Send the premium content to the valid user.
        res.status(200).json({
            success: true,
            content
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});


/**
 * Add Question - (Authenticated User)
 * -----------------------------------
 * 1. Extracts question, courseId, and contentId from the request body.
 * 2. Validates the ID formats to prevent database errors.
 * 3. Prepares the question object with the current user's details.
 * 4. Calls 'addQuestionService' to process the database update.
 * 5. Returns a 200 OK response with the updated course.
 */
interface AddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestion = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { question, courseId, contentId } = req.body as AddQuestionData;

        // Validation
        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid ID format", 400));
        }

        const questionData = {
            user: req.user,
            question,
            questionReplies: [] as any[],
        };

        // Call Service
        const updatedCourse = await addQuestionService(courseId, contentId, questionData);

        if (!updatedCourse) {
            return next(new ErrorHandler("Course or Content not found", 404));
        }

        await NotificationModel.create({
            userId: req.user?._id.toString(),
            title: "New Question Received",
            message: `A student asked a new question in ${updatedCourse.name}.`,
        });

        res.status(200).json({
            success: true,
            course: updatedCourse,
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});


/**
 * Controller: Add Answer - (Authenticated User)
 * -------------------------------------------
 * 1. Validates all required IDs (Course, Content, Question).
 * 2. Prepares the answer object with user details and timestamp.
 * 3. Calls 'addAnswerService' to update the database and cache.
 * 4. Triggers an email notification to the question owner (if applicable).
 * 5. Dispatches a 200 OK success response.
 */
interface AddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

export const addAnswer = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { answer, courseId, contentId, questionId } = req.body as AddAnswerData;

        // Validation
        if (!mongoose.Types.ObjectId.isValid(courseId) ||
            !mongoose.Types.ObjectId.isValid(contentId) ||
            !mongoose.Types.ObjectId.isValid(questionId)) {
            return next(new ErrorHandler("Invalid ID format", 400));
        }

        const answerData = {
            user: req.user,
            answer,
            createdAt: new Date(),
        };

        // 1. Database & Cache Update
        const result = await addAnswerService(courseId, contentId, questionId, answerData);

        if (!result) {
            return next(new ErrorHandler("Course, Content, or Question not found", 404));
        }

        // 2. Email Logic (Controller handles external communications)
        // 2. Email & Notification Logic
        const { questionUser, questionText } = result;
        const isOriginalAsker = req.user?._id?.toString() === (questionUser as any)?._id?.toString();

        if (isOriginalAsker) {
            // The student replied to their own question
            await NotificationModel.create({
                userId: req.user?._id.toString(),
                title: "New Question Reply",
                message: `A student replied to a question in ${result.course.name}.`,
            });
        } else {
            // An admin (or another user) replied
            try {
                const data = {
                    user: questionUser,
                    question: questionText,
                    reply: answer,
                    questionLink: `${process.env.CLIENT_URL}/course/${courseId}`,
                };

                await sendMail({
                    email: (questionUser as any).email,
                    subject: "New Reply to Your Question",
                    template: "questionReplies.ejs",
                    data,
                });
            } catch (error: any) {
                console.error("Email notification failed:", error.message);
            }
        }

        res.status(200).json({
            success: true,
            message: "Answer added successfully",
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

/**
 * 1. Add Review - (Authenticated User)
 * ------------------------------------
 * 1. Requesting rating and review data from frontend.
 * 2. Checking if the user actually purchased the course.
 * 3. Fetching the course using the provided courseId.
 * 4. Extracting data securely using the AddReviewData interface.
 * 5. Creating the new review object with user details.
 * 6. Pushing the new review into the course reviews array.
 * 7. Calculating the new average rating using math logic.
 * 8. Saving the updated course back to the database.
 * 9. Deleting the Redis cache to show fresh data.
 * 10. Sending the success response to the user.
 */

interface AddReviewData {
    review: string;
    rating: number;
}
export const addReview = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // 1. Get course ID and user's purchased courses
        const courseList = req.user?.courses || [];
        const courseId = req.params.id;

        // 2. Check if the user actually bought this course
        const courseExists = courseList.find(
            (course: any) => course._id.toString() === courseId
        );

        if (!courseExists) {
            return next(new ErrorHandler("You must buy this course first", 403));
        }

        // 3. Find the exact course in the database
        const course = await CourseModel.findById(courseId);

        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }

        // 4. Extract data using our new interface
        const { review, rating } = req.body as AddReviewData;

        // 5. Create the new review object
        const reviewData: any = {
            user: req.user,
            rating: rating, // Using the validated number
            comment: review, // Using the validated string
        };

        // 6. Add the new review to the course
        course.reviews.push(reviewData);

        // 7. Use your math formula to calculate the average
        let totalRating = 0;
        course.reviews.forEach((rev: any) => {
            totalRating = totalRating + rev.rating;
        });

        // Update the average rating field
        course.ratings = totalRating / course.reviews.length;

        // 8. Save the smart Mongoose object back to the database
        await course.save();

        // 9. Delete old cache so everyone sees the new review
        await redis.del(courseId);

        // 10. Send success message
        res.status(200).json({
            success: true,
            course,
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

/**
 * Add Reply to Review - (Admin/Staff Only)
 * ----------------------------------------
 * 1. Validates the incoming request body using the AddReplyData interface.
 * 2. Formats the user's reply object with a timestamp.
 * 3. Delegates database and cache logic to the 'addReviewReplyService'.
 * 4. Checks for successful service execution (Course/Review existence).
 * 5. Dispatches a 200 OK success response with the updated course data.
 * 6. Catches and passes any errors to the global error middleware.
 */
interface AddReplyData {
    comment: string;
    courseId: string;
    reviewId: string;
}

export const addReplyToReview = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { comment, courseId, reviewId } = req.body as AddReplyData;

        // 1. Create the new reply object.
        const replyData: any = {
            user: req.user,
            comment,
            createdAt: new Date(),
        };

        // Calling Service function to do the heavy lifting
        const updatedCourse = await addReviewReplyService(courseId, reviewId, replyData)
        if (!updatedCourse) {
            return next(new ErrorHandler("Course or Review not found", 404));
        }

        // 8. Send the success response.
        res.status(200).json({
            success: true,
            course: updatedCourse,
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});