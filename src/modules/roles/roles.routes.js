import express from 'express'
import { rolesController } from './roles.controller.js'
import RolesValidate from './roles.validate.js'

const Router = express.Router()

// GET - Lấy danh sách các vai trò
Router.get('/', rolesController.lists)

// POST - Tạo vai trò mới
Router.post('/create', RolesValidate.create, rolesController.create)

// PUT - Cập nhật thông tin vai trò
Router.put('/update', RolesValidate.update, rolesController.update)

// DELETE - Xóa mềm một vai trò
Router.delete('/delete/:id', RolesValidate.delete, rolesController.delete)

export const rolesRoutes = Router
