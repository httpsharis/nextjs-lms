import express from 'express'
import { activateUser, registerUser } from '../Controllers/userController'
import { registerLimiter } from '../Controllers/userController';

const UserRouter = express.Router();

UserRouter.post('/register', registerLimiter, registerUser)
UserRouter.post('/activate-user', activateUser)

export default UserRouter;