import express from 'express'
import { activateUser, getUserInfo, loginUser, logoutUser, registerUser, socialAuth, updateAccessToken } from '../Controllers/userController'
import { registerLimiter } from '../Controllers/userController';
import { isAuthenticated } from '../middlewares/auth';

const UserRouter = express.Router();

UserRouter.post('/register', registerLimiter, registerUser)
UserRouter.post('/activate-user', activateUser)

UserRouter.post('/login', loginUser)
UserRouter.get('/logout', isAuthenticated, logoutUser)
UserRouter.get('/refresh-token', updateAccessToken)
UserRouter.get('/me', isAuthenticated, getUserInfo)
UserRouter.post('/social-auth', socialAuth)

export default UserRouter;