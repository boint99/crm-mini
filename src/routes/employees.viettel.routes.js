import express from 'express'
import EmployeesValidate from '../validates/empolyees.validate.js'
import { employeesViettelController } from '../controllers/employees.viettel.controller.js'

const Router = express.Router()

// GET - /api/viettel-employees/lists
Router.get('/lists' , employeesViettelController.lists)

// POST /api/viettel-employees
Router.post('/', EmployeesValidate.create, employeesViettelController.create)

// Update PUT /api/viettel-employees
// Note: add EMPLOYEE_Code in body to update
Router.put('/', EmployeesValidate.update, employeesViettelController.update)

// DELETE /api/viettel-employees/:id
// NOTE: id: EMPLOYEE_ID
Router.delete('/:id', EmployeesValidate.delete, employeesViettelController.delete)

export const employeesViettelRoutes = Router