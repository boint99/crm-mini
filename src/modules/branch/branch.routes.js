import express from 'express'
import { branchesController } from './branch.controller.js'
import BranchesValidate from './branch.validate.js'

const Router = express.Router()

// GET - /api/branches
Router.get('/' ,branchesController.lists)

// POST /api/branches
Router.post('/create', BranchesValidate.create, branchesController.create)

// Update PUT /api/branches
// Note: add BRANCH_NAME
Router.put('/update', BranchesValidate.update, branchesController.update)

// DELETE /api/branches/:id
// NOTE: id: BRANCH_ID
Router.delete('/delete/:id', BranchesValidate.delete, branchesController.delete)

export const branchesRoutes = Router
