import express from 'express'
import { activateUser, getUserInfo, loginUser, logoutUser, registerUser, updateAccessToken } from '../Controllers/userController'
import { registerLimiter } from '../Controllers/userController';
import { isAuthenticated } from '../middlewares/auth';

const UserRouter = express.Router();

UserRouter.post('/register', registerLimiter, registerUser)
UserRouter.post('/activate-user', activateUser)

UserRouter.post('/login', loginUser)
UserRouter.get('/logout', isAuthenticated, logoutUser)
UserRouter.get('/refresh-token', updateAccessToken)
UserRouter.get('/me', isAuthenticated, getUserInfo)

export default UserRouter;