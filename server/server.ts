import { app } from './app'
import { connectDB } from './config/db'
import { redis } from './config/redis'
import { v2 as cloudinary, UploadApiResponse, ResourceApiResponse } from 'cloudinary';
require('dotenv').config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true
});

// create server
app.listen(process.env.PORT, () => {
    console.log(`Server is connected with PORT ${process.env.PORT}`)
    connectDB();
    redis;
})