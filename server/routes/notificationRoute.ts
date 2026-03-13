import express from 'express';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';
import { getNotifications, updateNotification } from '../Controllers/notificationController';

const notificationRouter = express.Router()

notificationRouter.get('/get-all-notification', isAuthenticated, isAuthorized('admin'), getNotifications)
notificationRouter.put('/update-notification/:id', isAuthenticated, isAuthorized('admin'), updateNotification)


export default notificationRouter