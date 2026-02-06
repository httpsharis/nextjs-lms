import { v2 as cloudinary, UploadApiResponse, ResourceApiResponse } from 'cloudinary';

// 1. Logic: Configuration Interface
// Professional tareeqa ye hai ke config ko aik jagah rakha jaye
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true
});

/**
 * @class CloudinaryService
 * Logic: Static methods use kar rahe hain taake 'new' keyword ke baghair 
 * direct access mil sakay.
 */
export class CloudinaryService {

    /**
     * @description Image upload karne ke liye
     * @param filePath - Local path ya Base64 string
     * @param folder - Cloudinary mein folder ka naam (LMS organization ke liye zaroori hai)
     */
    static async uploadImage(filePath: string, folder: string): Promise<UploadApiResponse> {
        try {
            // Logic: Professional options jo LMS mein kaam aate hain
            const options = {
                folder: folder,
                use_filename: true,
                unique_filename: true, // Unique rakhna behtar hai security ke liye
                overwrite: true,
                resource_type: "auto" as const, // Auto-detect image/video
            };

            const result = await cloudinary.uploader.upload(filePath, options);
            return result;
        } catch (error: any) {
            console.error("Cloudinary Upload Error:", error.message);
            throw new Error("Image upload failed");
        }
    }

    /**
     * @description Image ki details aur colors nikalne ke liye
     */
    static async getAssetDetails(publicId: string): Promise<ResourceApiResponse> {
        try {
            // Logic: Colors extract karna design consistency ke liye kaam aata hai
            const result = await cloudinary.api.resource(publicId, {
                colors: true
            });
            return result;
        } catch (error: any) {
            console.error("Cloudinary Resource Error:", error.message);
            throw new Error("Could not fetch asset details");
        }
    }

    /**
     * @description Profile Picture ke liye circular thumbnail generate karna
     */
    static generateAvatarTag(publicId: string, borderColor: string = 'black'): string {
        // Logic: Face detection ke saath auto-crop karna
        return cloudinary.image(publicId, {
            transformation: [
                { width: 250, height: 250, gravity: 'faces', crop: 'thumb' },
                { radius: 'max' },
                { effect: 'outline:10', color: borderColor },
            ],
        });
    }

    /**
     * @description Purani image delete karna (Storage bachane ke liye professional step)
     */
    static async deleteImage(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error: any) {
            console.error("Cloudinary Delete Error:", error.message);
        }
    }
}