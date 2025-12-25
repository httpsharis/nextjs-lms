import { app } from './app'
import { connectDB } from './config/db'
import { redis } from './config/redis'
require('dotenv').config()

// create server
app.listen(process.env.PORT, () => {
    console.log(`Server is connected with PORT ${process.env.PORT}`)
    connectDB();
    redis;
})

