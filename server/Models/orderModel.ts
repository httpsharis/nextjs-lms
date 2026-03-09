import mongoose, { Document, Model, Schema } from 'mongoose';

export interface Order extends Document {
    courseId: string;
    userId: string;
    paymentInfo: object;
}

const orderSchema = new Schema<Order>({
    courseId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    paymentInfo: {
        type: Object,
    },
}, { timestamps: true });

const OrderModel = mongoose.model<Order>('Order', orderSchema);

export default OrderModel;