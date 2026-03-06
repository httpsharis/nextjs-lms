import { redis } from '../config/redis';
import CourseModel from '../Models/courseModel';

/**
 * CREATE COURSE SERVICE
 * ---------------------
 * 1. Receive Data from the controller (Like Name, Price, Thumbnail)
 * 2. Saving the Data in the Database 
 *      - `CourseModel.create(data)` commands the MongoDB to save the new Data in the Database
 * 3. Return Data: After saving the data in the database it returns the unique _id. 
*/
export const createCourse = async (data: any) => {
    const course = await CourseModel.create(data);
    return course
}

/**
 * Service: Add Reply to Review
 * ----------------------------
 * 1. Finds the specific course document in MongoDB.
 * 2. Locates the unique review within the course's reviews array.
 * 3. Initializes the replies array if it is empty.
 * 4. Pushes the new reply data into the nested array.
 * 5. Commits changes to the database.
 * 6. Invalidates the Redis cache to ensure data consistency.
 * 7. Returns the updated course object.
 */
export const addReviewReplyService = async (courseId: string, reviewId: string, replyData: any) => {
    // Fetch the course 
    const course = await CourseModel.findById(courseId)
    if (!course) return null

    // Find the specific review
    const review = course.reviews?.find((rev: any) => rev._id.toString() === reviewId)
    if (!review) return null

    // Add Reply
    if (!review.commentReplies) {
        review.commentReplies = []
    }
    review.commentReplies.push(replyData)

    // Save in DB and clear Cache
    await course.save();
    await redis.del(courseId)

    return course
}

/**
 * Service: Add Question to Course Content
 * ---------------------------------------
 * 1. Finds the course by ID in the database.
 * 2. Locates the specific video content within the courseData array.
 * 3. Formats and pushes the new question object.
 * 4. Saves the updated course document.
 * 5. Clears the Redis cache for this specific course.
 * 6. Returns the updated course object.
 */
export const addQuestionService = async (
    courseId: string, 
    contentId: string, 
    questionData: any
) => {
    const course = await CourseModel.findById(courseId);
    if (!course) return null;

    // Find the specific video content
    const courseContent = course.courseData?.find((item: any) =>
        item._id.equals(contentId)
    );
    if (!courseContent) return null;

    // Push the new question
    courseContent.questions.push(questionData);

    // Save and clear cache
    await course.save();
    await redis.del(courseId);

    return course;
};

/**
 * Service: Add Answer/Reply to a Question
 * ---------------------------------------
 * 1. Fetches the course from MongoDB.
 * 2. Finds the specific content (video) and the specific question.
 * 3. Pushes the new answer into the 'questionReplies' array.
 * 4. Saves the updated course document.
 * 5. Invalidates the Redis cache for immediate updates.
 * 6. Returns the updated course and the original question user (for emails).
 */
export const addAnswerService = async (
    courseId: string, 
    contentId: string, 
    questionId: string, 
    answerData: any
) => {
    const course = await CourseModel.findById(courseId);
    if (!course) return null;

    const content = course.courseData?.find((item: any) => item._id.equals(contentId));
    if (!content) return null;

    const question = content.questions?.find((item: any) => item._id.equals(questionId));
    if (!question) return null;

    // Add the answer
    (question.questionReplies as any[]).push(answerData);

    await course.save();
    await redis.del(courseId);

    // Return the course and the user who asked the question
    return { course, questionUser: question.user, questionText: question.question };
};