import { Request, Response, NextFunction } from "express"

// Higher Order Function - Taking and Returning the Function as an argument.
export function catchAsyncError(theFunc: any) {
    return function (req: Request, res: Response, next: NextFunction) {
        Promise
            .resolve(theFunc(req, res, next))
            .catch(next)
    }
}

// @desc This also explain the concept of currying, closure, function composition and HOF
// @Closures: Inner Function remembers outer scope.
// @Currying: fn(a)(b)(c) instead of fn(a, b, c)
// @FunctionComposition: Combining small functions into bigger ones.