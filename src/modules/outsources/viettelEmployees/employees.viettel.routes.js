import express from 'express'
import { employeesViettelController } from './employees.viettel.controller.js'
import EmployeesViettelValidate from './empolyees.viettel.validate.js'

const Router = express.Router()

// GET /api/viettel-employees
Router.get('/', employeesViettelController.lists)

// POST /api/viettel-employees
Router.post('/', EmployeesViettelValidate.create, employeesViettelController.create)

// PUT /api/viettel-employees/:id
Router.put('/:id', EmployeesViettelValidate.update, employeesViettelController.update)

// DELETE /api/viettel-employees/:id
Router.delete('/:id', EmployeesViettelValidate.delete, employeesViettelController.delete)

export const employeesViettelRoutes = Router

