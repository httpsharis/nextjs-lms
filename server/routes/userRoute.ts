import express from 'express';
import {
    registerUser,
    activateUser,
    loginUser,
    logoutUser,
    updateAccessToken,
    getUserInfo,
    socialAuth,
    updateUserInfo,
    registerLimiter,
    updateUserPassword,
    updateProfilePicture
} from '../Controllers/userController';
import { isAuthenticated } from '../middlewares/auth';

/**
 * USER ROUTES CONFIGURATION
 * -------------------------
 * Logic:
 * - Public: Auth initialization (Register/Login/Refresh).
 * - Private: Profile management (Requires valid Access Token).
 * - Middleware: registerLimiter prevents brute-force on signups.
 */
const UserRouter = express.Router();

// --- Public Routes ---
UserRouter.post('/register', registerLimiter, registerUser);
UserRouter.post('/activate-user', activateUser);
UserRouter.post('/login', loginUser);
UserRouter.post('/social-auth', socialAuth);
UserRouter.get('/refresh-token', updateAccessToken);

// --- Protected Routes (Require Login) ---
// Logic: We group these because they all require the 'isAuthenticated' guard
UserRouter.get('/me', isAuthenticated, getUserInfo);
UserRouter.get('/logout', isAuthenticated, logoutUser);
UserRouter.put('/update-user-info', isAuthenticated, updateUserInfo);
UserRouter.put('/update-password', isAuthenticated, updateUserPassword)
UserRouter.put('/update-user-avatar', isAuthenticated, updateProfilePicture)

export default UserRouter;