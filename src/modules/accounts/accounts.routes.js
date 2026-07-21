import express from 'express'
import AccountsValidate from './accounts.validate.js'
import { accountsController } from './accounts.controller.js'

const Router = express.Router()

// GET /api/accounts
Router.get('/', accountsController.lists)

// POST /api/accounts
Router.post('/', AccountsValidate.create.bind(AccountsValidate), accountsController.create)

// PUT /api/accounts/:id
Router.put('/:id', AccountsValidate.update.bind(AccountsValidate), accountsController.update)

// PATCH /api/accounts/:id/reset-password (action route)
Router.patch('/:id/reset-password', AccountsValidate.resetPassword.bind(AccountsValidate), accountsController.resetPassword)

// DELETE /api/accounts/:id
Router.delete('/:id', AccountsValidate.delete.bind(AccountsValidate), accountsController.delete)

export const accountsRoutes = Router

