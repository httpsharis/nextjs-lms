const mongoose = require('mongoose')
require('dotenv').config()

const dbURL = process.env.DB_URI
if (!dbURL) {
    throw new Error('Missing required environment variable: DB_URI')
}

export const connectDB = async () => {
    try {
        const data = await mongoose.connect(dbURL)
        console.log(`Database is connected with ${data.connection.host}`)
    } catch (error: any) {
        console.error(error.message)
        setTimeout(connectDB, 5000)
    }
}