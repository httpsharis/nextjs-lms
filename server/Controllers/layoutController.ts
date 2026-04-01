import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../Utils/ErrorHandler';
import { catchAsyncError } from '../middlewares/catchAsyncErrors';
import { AuthenticatedRequest } from '../@types/index';
import LayoutModel from '../Models/layoutModel';
import cloudinary from 'cloudinary';
import { createLayoutService } from '../Services/layoutService';

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