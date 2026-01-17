/**
 * CUSTOM ERROR CLASS
 * ------------------
 * A helper class to create error objects with specific HTTP status codes.
 * * Why? The default Error class only takes a "message". 
 * We need a "statusCode" (like 404 or 500) so the frontend knows what went wrong.
 * * @extends Error - Inherits the message and stack trace from Node's built-in Error.
 */
export default class ErrorHandler extends Error {

    statusCode: Number;

    /**
     * Creates a new ErrorHandler instance.
     * @param message - The human-readable error message (e.g., "User not found").
     * @param statusCode - The HTTP status code (e.g., 404).
     */
    constructor(message: string, statusCode: Number) {
        // 1. Call the parent (Error) to handle the message
        super(message);
        
        // 2. Add our custom property
        this.statusCode = statusCode;

        /**
         * 3. Capture the Stack Trace
         * This creates a detailed map of where the error happened in the code.
         * It helps us debug without including this constructor in the path.
         */
        Error.captureStackTrace(this, this.constructor);
    }
}