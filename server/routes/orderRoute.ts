import express from 'express';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';
import { createOrder, getAllOrdersAdmin } from '../Controllers/orderController';

const OrderRouter = express.Router()

OrderRouter.post('/create-order', isAuthenticated, createOrder)

OrderRouter.get('/get-all-orders', isAuthenticated, isAuthorized('admin'), getAllOrdersAdmin)

export default OrderRouter