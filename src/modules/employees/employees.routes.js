import express from 'express'
import { employeesController } from './employees.controller.js'
import EmployeesValidate from './employees.validate.js'

const Router = express.Router()

// GET - /api/employees
// Note: add query param status to filter by status
// Example: /api/employees?status=active?info=1
Router.get('/' , employeesController.lists)

// POST /api/employees
Router.post('/create', EmployeesValidate.create, employeesController.create)
Router.post('/import-preview', employeesController.importPreview)
Router.post('/import-confirm', employeesController.importConfirm)

// Update PUT /api/employees
// Note: add EMPLOYEE_NAME
Router.put('/update', EmployeesValidate.update, employeesController.update)

// DELETE /api/employees/:id
// NOTE: id: EMPLOYEE_ID
Router.delete('/delete/:id', EmployeesValidate.delete, employeesController.delete)

export const employeesRoutes = Router
