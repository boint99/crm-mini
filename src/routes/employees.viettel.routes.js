import express from 'express'
import { employeesViettelController } from '../controllers/employees.viettel.controller.js'
import EmployeesViettelValidate from '../validates/empolyees.viettel.validate.js'

const Router = express.Router()

// GET - /api/viettel-employees/lists
Router.get('/lists' , employeesViettelController.lists)

// POST /api/viettel-employees
Router.post('/', EmployeesViettelValidate.create, employeesViettelController.create)

// Update PUT /api/viettel-employees
// Note: add EMPLOYEE_Code in body to update
Router.put('/', EmployeesViettelValidate.update, employeesViettelController.update)

// DELETE /api/viettel-employees/:id
// NOTE: id: EMPLOYEE_ID
Router.delete('/:id', EmployeesViettelValidate.delete, employeesViettelController.delete)

export const employeesViettelRoutes = Router