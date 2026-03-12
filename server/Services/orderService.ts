import userModel from "../Models/userModel";
import OrderModel from "../Models/orderModel";
import { redis } from "../config/redis";

export const newOrderService = async (userId: string, courseId: string, paymentInfo: any) => {
    const order = await OrderModel.create({
        courseId, userId, paymentInfo
    })

    const user = await userModel.findById(userId)
    if (user) {
        user.courses.push({ courseId })
        await user.save()
    }

    await redis.del(userId)

    return order
}