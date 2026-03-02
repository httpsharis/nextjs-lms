require('dotenv').config()
import mongoose, { Document, Model, Schema } from "mongoose";

interface Comment extends Document {
    user: object;
    question: string;
    questionReplies?: Comment[]
}

interface Review extends Document {
    user: string;
    rating: number;
    comment: string;
    commentReplies: Comment[];
}

interface Link extends Document {
    title: string;
    url: string;
}

interface CourseData extends Document {
    title: string;
    description: string;
    videoUrl: string;
    videoThumbnail: {
        public_id: string;
        url: string;
    };
    videoSection: string;
    videoLength: number;
    videoPlayer: string;
    links: Link[];
    suggestion: string;
    questions: Comment[];
}

interface Course extends Document {
    name: string;
    description: string;
    price: number;
    estimatedPrice?: number;
    thumbnail: {
        public_id: string;
        url: string;
    };
    tags: string;
    level: string;
    demoUrl: string;
    benefits: { title: string }[];
    prerequisites: { title: string }[];
    reviews: Review[];
    courseData: CourseData[];
    ratings?: number;
    purchased?: number;
}

const reviewSchema = new Schema<Review>({
    user: Object,
    rating: {
        type: Number,
        default: 0,
    },
    comment: String,
});

const linkSchema = new Schema<Link>({
    title: String,
    url: String
});

const commentSchema = new Schema<Comment>({
    user: Object,
    question: String,
    questionReplies: [Object],
})

const courseDataSchema = new Schema<CourseData>({
    videoUrl: String,
    title: String,
    videoSection: String,
    description: String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchema]
})

const courseSchema = new Schema<Course>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    estimatedPrice: {
        type: Number,
    },
    thumbnail: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    tags: {
        required: true,
        type: String,
    },
    level: {
        required: true,
        type: String,
    },
    demoUrl: {
        required: true,
        type: String,
    },
    // Changed Array of List to Objects for future changes.
    benefits: [{
        title: { type: String, required: true }
    }],
    prerequisites: [{
        title: { type: String, required: true }
    }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
        type: Number,
        default: 0
    },
    purchased: {
        type: Number,
        default: 0,
    }
})

const CourseModel: Model<Course> = mongoose.model("Course", courseSchema)

export default CourseModel