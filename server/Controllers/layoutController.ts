import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../Utils/ErrorHandler';
import { catchAsyncError } from '../middlewares/catchAsyncErrors';
import { AuthenticatedRequest } from '../@types/index';
import LayoutModel from '../Models/layoutModel';
import cloudinary from 'cloudinary';
import { createLayoutService, updateLayoutService } from '../Services/layoutService';

export const createLayout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;

        // 1. Check if this exact layout already exists
        const isTypeExist = await LayoutModel.findOne({ type });
        if (isTypeExist) {
            return next(new ErrorHandler(`${type} already exists`, 400));
        }

        // 2. Handle the Banner Image Upload
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;
            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: "layout",
            });

            const banner = {
                type: "Banner",
                banner: {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    },
                    title,
                    subTitle,
                },
            };
            await createLayoutService(banner);
        }

        // 3. Handle the FAQ Question List
        if (type === "FAQ") {
            const { faq } = req.body;
            const faqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    };
                })
            );
            await createLayoutService({ type: "FAQ", faq: faqItems });
        }

        // 4. Handle the Category List
        if (type === "Category") {
            const { category } = req.body;
            const categoryItems = await Promise.all(
                category.map(async (item: any) => {
                    return {
                        title: item.title
                    };
                })
            );
            await createLayoutService({ type: "Category", category: categoryItems });
        }

        res.status(200).json({
            success: true,
            message: "Layout created successfully",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Edit Layout
export const editLayout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;

        const allowedTypes = ['Banner', 'FAQ', 'Category'];
        if (!allowedTypes.includes(type)) {
            return next(new ErrorHandler('Not a valid Type, it should be Banner, FAQ, Category', 400))
        }

        // 1. Handle the Banner Image Update
        if (type === "Banner") {
            const bannerData: any = await LayoutModel.findOne({ type: "Banner" });
            if (!bannerData) {
                return next(new ErrorHandler("Banner layout not found", 404));
            }

            const { image, title, subTitle } = req.body;

            let imageInfo = bannerData.banner.image;

            // Only destroy if there is an existing public_id
            if (image && !image.startsWith("https")) {
                if (bannerData.banner.image.public_id) {
                    await cloudinary.v2.uploader.destroy(bannerData.banner.image.public_id);
                }
                const myCloud = await cloudinary.v2.uploader.upload(image, {
                    folder: "layout",
                });
                imageInfo = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                }
            }

            // This is the NEW data we want to save
            const banner = {
                type: "Banner",
                banner: {
                    image: imageInfo,
                    title,
                    subTitle,
                },
            };

            // Pass the ID and the new banner data
            await updateLayoutService(bannerData._id, banner);
        }

        // 2. Handle the FAQ Question List Update
        if (type === "FAQ") {
            const faqData = await LayoutModel.findOne({ type: "FAQ" });
            if (!faqData) return next(new ErrorHandler("FAQ layout not found", 404));

            const { faq } = req.body;
            const faqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    };
                })
            );

            // Pass the ID and the newly mapped FAQs
            await updateLayoutService(faqData._id, { type: "FAQ", faq: faqItems });
        }

        // 3. Handle the Category List Update
        if (type === "Category") {
            const categoryData = await LayoutModel.findOne({ type: "Category" });
            if (!categoryData) return next(new ErrorHandler("Category layout not found", 404));

            const { category } = req.body;
            const categoryItems = await Promise.all(
                category.map(async (item: any) => {
                    return {
                        title: item.title
                    };
                })
            );

            await updateLayoutService(categoryData._id, { type: "Category", category: categoryItems });
        }

        res.status(200).json({
            success: true,
            message: "Layout updated successfully", // Changed to 'updated'
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const getLayoutByType = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.params;

        const Layout = await LayoutModel.findOne({ type })

        if (!Layout) {
            return next(new ErrorHandler(`${type} layout not found`, 404))
        }

        res.status(200).json({
            success: true,
            Layout
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})