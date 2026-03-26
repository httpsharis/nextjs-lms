import express, { Request, Response, NextFunction } from 'express'
export const app = express();
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/error'

require('dotenv').config()

// Body Parser
app.use(express.json({ limit: "50mb" })) // Limiting the amount to Data for the API || Saving out APIs from DDOS attack.

// Cookie Parser
app.use(cookieParser())

// CROSS ORIGIN RESOURCE SHARING 
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))

// Routes
import UserRouter from './routes/userRoute';
import courseRouter from './routes/courseRoute'
import OrderRouter from './routes/orderRoute'
import notificationRouter from './routes/notificationRoute';
import analyticsRouter from './routes/analyticsRoute';

app.use('/api/v1', UserRouter)
app.use('/api/v1', courseRouter)
app.use('/api/v1', OrderRouter)
app.use('/api/v1', notificationRouter)
app.use('/api/v1', analyticsRouter)


app.use(errorMiddleware)