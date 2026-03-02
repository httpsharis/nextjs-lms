import express from 'express';
import { addQuestion, editCourse, getAllCourses, getCourseByUser, getSingleCourse, uploadCourse } from '../Controllers/courseController';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';

const courseRouter = express.Router();

courseRouter.post("/create-course", isAuthenticated, isAuthorized('admin'), uploadCourse)
courseRouter.put("/edit-course/:id", isAuthenticated, isAuthorized('admin'), editCourse)
courseRouter.get("/get-course-content/:id", isAuthenticated, getCourseByUser)
courseRouter.put("/add-question", isAuthenticated, addQuestion)

courseRouter.get("/get-course/:id", getSingleCourse)
courseRouter.get("/get-courses", getAllCourses)

export default courseRouter