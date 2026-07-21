import express from 'express'
import { employeesController } from './employees.controller.js'
import EmployeesValidate from './employees.validate.js'
import { validateImportFile } from '../../middleware/fileValidation.middleware.js'

const Router = express.Router()

// GET /api/employees
Router.get('/', employeesController.lists)

// POST /api/employees
Router.post('/', EmployeesValidate.create, employeesController.create)

// Action routes (non-CRUD)
Router.post('/import-preview', validateImportFile, employeesController.importPreview)
Router.post('/import-confirm', employeesController.importConfirm)

// PUT /api/employees/:id
Router.put('/:id', EmployeesValidate.update, employeesController.update)

// DELETE /api/employees/:id
Router.delete('/:id', EmployeesValidate.delete, employeesController.delete)

export const employeesRoutes = Router

