import express from 'express'
import companyValidate from './company.validate.js'
import { companyController } from './company.controller.js'

const Router = express.Router()

// GET /api/companies
Router.get('/', companyController.lists)

// POST /api/companies
Router.post('/', companyValidate.create.bind(companyValidate), companyController.create)

// PUT /api/companies/:id
Router.put('/:id', companyValidate.update.bind(companyValidate), companyController.update)

// DELETE /api/companies/:id
Router.delete('/:id', companyValidate.delete.bind(companyValidate), companyController.delete)

export const companyRoutes = Router

