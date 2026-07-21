import express from 'express'
import organizationValidate from './organization.validate.js'
import { organizationController } from './organization.controller.js'

const Router = express.Router()

// GET /api/organizations
Router.get('/', organizationController.lists)

// POST /api/organizations
Router.post('/', organizationValidate.create.bind(organizationValidate), organizationController.create)

// PUT /api/organizations/:id
Router.put('/:id', organizationValidate.update.bind(organizationValidate), organizationController.update)

// DELETE /api/organizations/:id
Router.delete('/:id', organizationValidate.delete.bind(organizationValidate), organizationController.delete)

export const organizationRoutes = Router

