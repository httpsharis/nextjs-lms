import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../Utils/ErrorHandler';
import { catchAsyncError } from '../middlewares/catchAsyncErrors';
import { AuthenticatedRequest } from '../@types/index';
import LayoutModel from '../Models/layoutModel';
import cloudinary from 'cloudinary';
import { createLayoutService } from '../Services/layoutService';

export const createLayout = catchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body

        const isTypeExist = await LayoutModel.findOne({ type })
        if (isTypeExist) {
            return next(new ErrorHandler(`${type} already exist`, 400))
        }

        if (type === "Banner") {
            const { image, title, subTitle } = req.body
            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: "layout",
            })

            const banner = {
                type: "Banner",
                banner: {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    },
                    title,
                    subTitle,
                }
            }
            await createLayoutService(banner)
        }

        res.status(200).json({
            success: true,
            message: "Layout created successfully!"
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})