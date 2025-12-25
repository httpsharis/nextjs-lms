import express, { Request, Response, NextFunction } from 'express'
export const app = express();
import cors from 'cors'
import cookieParser from 'cookie-parser';

require('dotenv').config()

// Body Parser
app.use(express.json({ limit: "50mb" })) // Limiting the amount to Data for the API || Saving out APIs from DDOS attack.

// Cookie Parser
app.use(cookieParser())

// CROSS ORIGIN RESOURCE SHARING 
app.use(cors({
    origin: process.env.ORIGIN
}))

