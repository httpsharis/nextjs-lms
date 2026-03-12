import express from 'express';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';
import { createOrder } from '../Controllers/orderController';

const OrderRouter = express.Router()

OrderRouter.post('/create-order', isAuthenticated, createOrder)

export default OrderRouter