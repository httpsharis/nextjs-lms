import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from 'bcryptjs'

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
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare Password
userSchema.methods.comparePasswords = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password)
}

const userModel: Model<IUser> = mongoose.model("User", userSchema)
export default userModel;