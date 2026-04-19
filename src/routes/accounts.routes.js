import express from 'express'
import AccountsValidate from '../validates/accounts.validate.js'
import { accountsController } from '../controllers/accounts.controller.js'

const Router = express.Router()

// GET /api/accounts/lists
Router.get('/lists', accountsController.lists)

// POST /api/accounts/create
Router.post('/create', AccountsValidate.create.bind(AccountsValidate), accountsController.create)

// PUT /api/accounts/update
Router.put('/update', AccountsValidate.update.bind(AccountsValidate), accountsController.update)

// PATCH /api/accounts/reset-password
Router.patch('/reset-password', AccountsValidate.resetPassword.bind(AccountsValidate), accountsController.resetPassword)

// DELETE /api/accounts/:id
Router.delete('/:id', AccountsValidate.delete.bind(AccountsValidate), accountsController.delete)

export const accountsRoutes = Router
