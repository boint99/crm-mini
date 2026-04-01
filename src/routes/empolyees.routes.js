import express from 'express'
import { employeesController } from '../controllers/employees.controller.js'
import EmployeesValidate from '../validates/empolyees.validate.js'

const Router = express.Router()

// GET - /api/employees
// Node: add query param status to filter by status
Router.get('/' , employeesController.lists)

// POST /api/employees
Router.post('/', EmployeesValidate.create, employeesController.create)

// Update PUT /api/employees
// Note: add EMPLOYEE_NAME
Router.put('/', EmployeesValidate.update, employeesController.update)

// DELETE /api/employees/:id
// NOTE: id: EMPLOYEE_ID
Router.delete('/:id', EmployeesValidate.delete, employeesController.delete)

export const employeesRoutes = Router