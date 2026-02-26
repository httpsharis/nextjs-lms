import express from 'express';
import { uploadCourse } from '@/Controllers/courseController';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';

const courseRouter = express.Router();

courseRouter.post("/create-course", isAuthorized('admin'), isAuthenticated, uploadCourse)