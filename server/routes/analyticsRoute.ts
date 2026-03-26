import { getCourseAnalytics, getOrderAnalytics, getUserAnalytics } from '../Controllers/analyticsController'
import { isAuthenticated, isAuthorized } from '../middlewares/auth'
import express from 'express'

const analyticsRouter = express.Router()

// ----Admin----
analyticsRouter.get('/get-users-analytics', isAuthenticated, isAuthorized('admin'), getUserAnalytics)
analyticsRouter.get('/get-course-analytics', isAuthenticated, isAuthorized('admin'), getCourseAnalytics)
analyticsRouter.get('/get-order-analytics', isAuthenticated, isAuthorized('admin'), getOrderAnalytics)


export default analyticsRouter