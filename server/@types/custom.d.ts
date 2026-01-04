declare global {
    namespace Express {
        interface Request {
            user?: import('../Models/userModel').IUser;
        }
    }
}

export { };