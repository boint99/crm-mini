import express from 'express'
import { orgUnitsController } from '../controllers/org.units.controller.js'
import OrgUnitsValidate from '../validates/org.units.validate.js'

const Router = express.Router()

// GET - /api/company
Router.get('/lists', orgUnitsController.lists)

// GET /api/v1/org-units/tree
Router.get('/tree', orgUnitsController.buildTree)
// POST /api/org-units
Router.post('/', OrgUnitsValidate.create, orgUnitsController.create)

// Update PUT /api/org-units
// Note: add UNIT_NAME
Router.put('/', OrgUnitsValidate.update, orgUnitsController.update)

// DELETE /api/org-units/:id
// NOTE: id: ORG_UNIT_ID
Router.delete('/:id', OrgUnitsValidate.delete, orgUnitsController.delete)

export const orgUnitsRoutes = Router

// GET /api/v1/org-units/lists
// Mục đích: trả flat list (giữ tương thích cũ).
// GET /api/v1/org-units/tree
// Mục đích: trả dữ liệu nested tree cho UI.
// GET /api/v1/org-units/:id
// Mục đích: chi tiết 1 node.
// GET /api/v1/org-units/:id/children
// Mục đích: lấy node con trực tiếp.
// POST /api/v1/org-units
// Mục đích: tạo node mới (có thể có PARENT_UNIT_ID).
// PATCH /api/v1/org-units/:id
// Mục đích: cập nhật thông tin node.
// PATCH /api/v1/org-units/:id/move
// Mục đích: đổi parent để kéo thả tree.
// DELETE /api/v1/org-units/:id
// Mục đích: xóa node nếu không còn children, employees, branches.