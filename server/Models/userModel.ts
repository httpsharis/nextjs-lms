require('dotenv').config()
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const emailRegExPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // Make optional for social users
    avatar: {
        public_id: string,
        url: string
    };
    role: string;
    isVerified: boolean;
    isSocial: boolean; // Add this
    courses: Array<{ courseId: string }>
    // Compare pass Method
    comparePassword: (password: string) => Promise<boolean>

    SignAccessToken: () => string;
    SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value: string) {
                return emailRegExPattern.test(value)
            },
            message: "Please enter a valid Email"
        },
        unique: true,
    },
    password: {
        type: String,
        required: function (this: IUser) {
            return !this.isSocial; // Only require password if NOT a social user
        },
        minLength: [6, "Password must be at least 6 Characters"],
        select: false
    },
    isSocial: {
        type: Boolean,
        default: false,
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
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// @Sign-Access-Token
userSchema.methods.SignAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || '', { expiresIn: '5m' })
}

// @Sign-Refresh-Token
userSchema.methods.SignRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || '', { expiresIn: '3d' })
}

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password)
}

const userModel: Model<IUser> = mongoose.model("User", userSchema);
export default userModel;