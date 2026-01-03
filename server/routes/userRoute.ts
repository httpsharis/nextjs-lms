import express from 'express'
import { activateUser, loginUser, logoutUser, registerUser } from '../Controllers/userController'
import { registerLimiter } from '../Controllers/userController';
import { isAuthenticated } from '../middlewares/auth';

const UserRouter = express.Router();

UserRouter.post('/register', registerLimiter, registerUser)
UserRouter.post('/activate-user', activateUser)

UserRouter.post('/login', loginUser)
UserRouter.get('/logout', isAuthenticated, logoutUser)

export default UserRouter;