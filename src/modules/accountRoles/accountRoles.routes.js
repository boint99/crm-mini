import express from 'express'
import { accountRolesController } from './accountRoles.controller.js'
import AccountRolesValidate from './accountRoles.validate.js'

const Router = express.Router()

// GET /api/account-roles
Router.get('/', accountRolesController.lists)

// POST /api/account-roles
Router.post('/', AccountRolesValidate.assign, accountRolesController.assign)

// DELETE /api/account-roles/:id
Router.delete('/:id', AccountRolesValidate.revoke, accountRolesController.revoke)

export const accountRolesRoutes = Router

