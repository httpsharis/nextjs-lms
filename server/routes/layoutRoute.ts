import { createLayout } from '../Controllers/layoutController'
import { isAuthenticated, isAuthorized } from '../middlewares/auth'
import express from 'express'

const layoutRouter = express.Router()

layoutRouter.post('/create-layout', isAuthenticated, isAuthorized('admin'), createLayout)

export default layoutRouter