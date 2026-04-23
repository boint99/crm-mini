import express from 'express'
import companyValidate from '../validates/company.validate.js'
import { companyController } from '../controllers/company.controller.js'

const Router = express.Router()

// GET - /api/company
Router.get('/lists', companyController.lists)

// POST /api/company
Router.post('/create', companyValidate.create.bind(companyValidate), companyController.create)

// Update PUT /api/company/
// Note: add ID in body
Router.put('/update', companyValidate.update.bind(companyValidate), companyController.update)

// DELETE /api/company/
// Note: add delete in parameter
Router.delete('/:id', companyValidate.delete.bind(companyValidate), companyController.delete)

export const companyRoutes = Router