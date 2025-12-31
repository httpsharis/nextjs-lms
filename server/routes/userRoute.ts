import express from 'express'
import { registerUser } from '../Controllers/userController'
import { registerLimiter } from '../Controllers/userController';

const UserRouter = express.Router();

UserRouter.post('/register', registerLimiter, registerUser)

export default UserRouter;