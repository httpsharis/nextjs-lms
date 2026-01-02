import express from 'express'
import { activateUser, loginUser, logoutUser, registerUser } from '../Controllers/userController'
import { registerLimiter } from '../Controllers/userController';

const UserRouter = express.Router();

UserRouter.post('/register', registerLimiter, registerUser)
UserRouter.post('/activate-user', activateUser)

UserRouter.post('/login', loginUser)
UserRouter.get('/logout', logoutUser)

export default UserRouter;