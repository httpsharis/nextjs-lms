import OrderModel from "../Models/orderModel"
import userModel from "../Models/userModel"
import { generateLast12MonthsData } from "../Utils/analyticsGenerate"
import CourseModel from "../Models/courseModel"

export const getUserAnalyticService = async () => {
    const users = await generateLast12MonthsData(userModel)
    return users
}

export const getCoursesAnalyticsService = async () => {
    const courses = await generateLast12MonthsData(CourseModel);
    return courses;
};

export const getOrdersAnalyticsService = async () => {
    const orders = await generateLast12MonthsData(OrderModel);
    return orders;
};