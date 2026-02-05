import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// 1. Logic: Configuration (Ensure these are in your .env file)
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

/**
 * @description Uploads an image to Cloudinary and returns the secure URL
 * @param {string} file - Can be a local path or a Base64 string from the frontend
 * @param {string} folder - Logic: Keeps your Cloudinary dashboard organized
 */
export const uploadImage = async (file: string, folder: string): Promise<string | undefined> => {
    try {
        // 2. Logic: Explicitly typing the result as UploadApiResponse
        const result: UploadApiResponse = await cloudinary.uploader.upload(file, {
            folder: folder, // Organize by 'avatars', 'courses', etc.
            width: 150,     // Logic: Auto-resize for profile pictures to save bandwidth
            crop: "fill",
        });

        console.log("Upload successful:", result.secure_url);
        return result.secure_url;
        
    } catch (error) {
        // 3. Logic: Cast error to Cloudinary's error response type
        const err = error as UploadApiErrorResponse;
        console.error("Cloudinary Upload Error:", err.message);
        throw new Error("Image upload failed");
    }
};