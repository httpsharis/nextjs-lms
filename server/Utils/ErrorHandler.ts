// @Error: @Node default class
export default class ErrorHandler extends Error {

    statusCode: Number // Defined here because typescript thinks that On @messaged can be passed.
    constructor(message: string, statusCode: Number) {
        super(message);
        this.statusCode = statusCode;

        // @desc creates a new object that extends Error and carries a status code. 
        Error.captureStackTrace(this, this.constructor);
    }
}