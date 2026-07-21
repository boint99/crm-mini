import express from 'express'
import { rolesController } from './roles.controller.js'
import RolesValidate from './roles.validate.js'

const Router = express.Router()

// GET /api/roles
Router.get('/', rolesController.lists)

// POST /api/roles
Router.post('/', RolesValidate.create, rolesController.create)

// PUT /api/roles/:id
Router.put('/:id', RolesValidate.update, rolesController.update)

// DELETE /api/roles/:id
Router.delete('/:id', RolesValidate.delete, rolesController.delete)

// Nested resource: permissions of a role
Router.get('/:id/permissions', RolesValidate.getPermissions, rolesController.getPermissions)
Router.post('/:id/permissions', RolesValidate.assignPermissions, rolesController.assignPermissions)

export const rolesRoutes = Router

