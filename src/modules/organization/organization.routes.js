import express from 'express'
import organizationValidate from './organization.validate.js'
import { organizationController } from './organization.controller.js'

const Router = express.Router()

// GET - /api/organizations
Router.get('/', organizationController.lists)

// POST /api/organizations/create
Router.post('/create', organizationValidate.create.bind(organizationValidate), organizationController.create)

// Update PUT /api/organizations/update
// Note: add id in body
Router.put('/update', organizationValidate.update.bind(organizationValidate), organizationController.update)

// DELETE /api/organizations/delete/:id
// Note: add id in parameter
Router.delete('/delete/:id', organizationValidate.delete.bind(organizationValidate), organizationController.delete)

export const organizationRoutes = Router
