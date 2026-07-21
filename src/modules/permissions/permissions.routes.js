import express from 'express'
import { permissionsController } from './permissions.controller.js'
import PermissionsValidate from './permissions.validate.js'

const Router = express.Router()

// GET /api/permissions
Router.get('/', permissionsController.lists)

// POST /api/permissions
Router.post('/', PermissionsValidate.create, permissionsController.create)

// PUT /api/permissions/:id
Router.put('/:id', PermissionsValidate.update, permissionsController.update)

// DELETE /api/permissions/:id
Router.delete('/:id', PermissionsValidate.delete, permissionsController.delete)

export const permissionsRoutes = Router

