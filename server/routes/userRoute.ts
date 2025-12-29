import express from 'express'
import { registerUser } from '../Controllers/userController'

const UserRouter = express.Router();

UserRouter.post('/register', registerUser)

export default UserRouter;