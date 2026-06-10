import express from 'express'
import { accountRolesController } from './accountRoles.controller.js'
import AccountRolesValidate from './accountRoles.validate.js'

const Router = express.Router()

// GET - Lấy danh sách gán vai trò - tài khoản
Router.get('/', accountRolesController.lists)

// POST - Gán vai trò cho tài khoản
Router.post('/assign', AccountRolesValidate.assign, accountRolesController.assign)

// DELETE - Thu hồi vai trò khỏi tài khoản
Router.delete('/revoke/:id', AccountRolesValidate.revoke, accountRolesController.revoke)

export const accountRolesRoutes = Router
