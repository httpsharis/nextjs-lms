require('dotenv').config()
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const emailRegExPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string,
        url: string
    };
    role: string;
    isVerified: boolean;
    courses: Array<{ courseId: string }>
    // Compare pass Method
    comparePassword: (password: string) => Promise<boolean>

    SignAccessToken: () => string;
    SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter you name"]
    },
    email: {
        type: String,
        required: [true, "Please enter you email"],
        validate: {
            validator: function (value: string) {
                return emailRegExPattern.test(value)
            },
            message: "Please enter the valid Email"
        },
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please enter you password"],
        minLength: [6, "Password must be at least 6 Characters"]
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    courses: [
        {
            courseId: String,

        }
    ]
}, { timestamps: true })


// Hash Password
userSchema.pre('save', async function () { // @pre('save') is mongoose hook that runs before saving it in the database
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// @Sign-Access-Token - Generates an access token when login in.
userSchema.methods.SignAccessToken = function () {
    // An Access Token will be assigned to the user _id after login
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || '', { expiresIn: '5m' })
}

// @Sign-Refresh-Token - Generates the refresh token
userSchema.methods.SignRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || '', { expiresIn: '3d' })
}

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password)
}

const userModel: Model<IUser> = mongoose.model("User", userSchema)
export default userModel; 