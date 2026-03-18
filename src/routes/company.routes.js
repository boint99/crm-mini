import express from 'express'
import companyValidate from '../validates/company.validate.js'
import { companyController } from '../controllers/company.controller.js'

const Router = express.Router()

// GET - /api/company
Router.get('/lists', companyController.getList)

// POST /api/company
Router.post('/', companyValidate.create.bind(companyValidate), companyController.create)

// Update PUT /api/company/
// Note: add COMPANY_ID
Router.put('/', companyValidate.update.bind(companyValidate), companyController.update)

// DELETE /api/company/
// Note: add COMPANY_ID
Router.delete('/', companyValidate.delete.bind(companyValidate), companyController.delete)

export const companyRoutes = Router