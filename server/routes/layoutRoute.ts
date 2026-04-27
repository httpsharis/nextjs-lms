import { createLayout, editLayout, getLayoutByType } from '../Controllers/layoutController'
import { isAuthenticated, isAuthorized } from '../middlewares/auth'
import express from 'express'

const layoutRouter = express.Router()

layoutRouter.post('/create-layout', isAuthenticated, isAuthorized('admin'), createLayout)
layoutRouter.put('/edit-layout', isAuthenticated, isAuthorized('admin'), editLayout)
layoutRouter.get('/get-layout/:type', getLayoutByType)

export default layoutRouter