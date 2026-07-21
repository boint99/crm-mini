import express from 'express'
import { branchesController } from './branch.controller.js'
import BranchesValidate from './branch.validate.js'

const Router = express.Router()

// GET /api/branches
Router.get('/', branchesController.lists)

// POST /api/branches
Router.post('/', BranchesValidate.create, branchesController.create)

// PUT /api/branches/:id
Router.put('/:id', BranchesValidate.update, branchesController.update)

// DELETE /api/branches/:id
Router.delete('/:id', BranchesValidate.delete, branchesController.delete)

export const branchesRoutes = Router

