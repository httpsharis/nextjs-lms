# CODE BASE NOTES

## Definitions

**Type Assertion**: *"**as**"* *Keyword is used as type assertion when assigning a variable as "**any**" even tho they are of any type.*

**Redis**: *REmote DIrectory Server - used as a database, cache, message broker and streamline engine. e.g, a game with a leaderboard and redis use RAM to fetch data.*

*We are using it for few simple things like:*

- Live Notifications
- Streaming
- State Management

## Codes

### **Test API**

```Typescript
// Test API
app.get('/test', (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(200).json({
        success: true,
        message: "API is working"
    })
})
```

### **TS Config File**

```Typescript
{
    "compilerOptions": {
        "module": "nodenext", // Important to note
        "moduleResolution": "nodenext", // Important
        "paths": {
            "@/*": ["./*"] // paths allowed to be used
        },
        "outDir": "dist", // Compiled file to the dist folder
        "sourceMap": true, // Mapping of Code to JS file for 
        "noImplicitAny": true
    },
    "include": ["./**/*"]
}
```

### Database Connection

1. Created a file [db.ts](../server/config/db.ts) Added the code to connect the DB

```Typescript
const mongoose = require('mongoose')
require('dotenv').config()

const dbURL: String = process.env.DB_URI

export const connectDB = async () => {
    try {
        await mongoose.connect(dbURL).then((data: any) => {
            console.log(`Database is connected with ${data.connection.host}`) // host actually is the IP or the host name of the Database assigned in the MongoDB
        })
    } catch (error: any) {
        console.error(error.message)
        setTimeout(connectDB, 5000)
    }
}
```

2. Called the this file in the [app.ts](../server/app.ts)