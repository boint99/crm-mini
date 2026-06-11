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

// GET - Lấy danh sách các quyền hạn đã gán cho vai trò này
Router.get('/:id/permissions', RolesValidate.getPermissions, rolesController.getPermissions)

// POST - Cập nhật danh sách các quyền hạn cho vai trò này
Router.post('/:id/permissions', RolesValidate.assignPermissions, rolesController.assignPermissions)

export const rolesRoutes = Router
