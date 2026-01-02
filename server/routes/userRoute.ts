import express from 'express'
import { activateUser, loginUser, registerUser } from '../Controllers/userController'
import { registerLimiter } from '../Controllers/userController';

const UserRouter = express.Router();

UserRouter.post('/register', registerLimiter, registerUser)
UserRouter.post('/activate-user', activateUser)

UserRouter.post('/login', loginUser)

export default UserRouter;