import express from 'express'
import { permissionsController } from './permissions.controller.js'
import PermissionsValidate from './permissions.validate.js'

const Router = express.Router()

// GET - Lấy danh sách các quyền
Router.get('/', permissionsController.lists)

// POST - Tạo mới một quyền
Router.post('/create', PermissionsValidate.create, permissionsController.create)

// PUT - Cập nhật một quyền
Router.put('/update', PermissionsValidate.update, permissionsController.update)

// DELETE - Xóa mềm một quyền
Router.delete('/delete/:id', PermissionsValidate.delete, permissionsController.delete)

export const permissionsRoutes = Router
