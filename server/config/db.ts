const mongoose = require('mongoose')
require('dotenv').config()

const dbURL: String = process.env.DB_URI

export const connectDB = async () => {
    try {
        await mongoose.connect(dbURL).then((data: any) => {
            console.log(`Database is connected with ${data.connection.host}`)
        })
    } catch (error: any) {
        console.error(error.message)
        setTimeout(connectDB, 5000)
    }
}
