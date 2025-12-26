import { Request, Response, NextFunction } from "express"

export const catchAsyncError = (theFunc: any) => (res: Response, req: Request, next: NextFunction) => {
    Promise
        .resolve(theFunc(res, req, next))
        .catch(next)
}