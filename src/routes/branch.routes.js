import express from 'express'
import { branchesController } from '../controllers/branch.controller.js'
import BranchesValidate from '../validates/branch.validate.js'

const Router = express.Router()

// GET - /api/branches
Router.get('/lists' ,branchesController.lists)

// POST /api/branches
Router.post('/', BranchesValidate.create, branchesController.create)

// Update PUT /api/branches
// Note: add BRANCH_NAME
Router.put('/', BranchesValidate.update, branchesController.update)

// DELETE /api/branches/:id
// NOTE: id: BRANCH_ID
Router.delete('/:id', BranchesValidate.delete, branchesController.delete)

export const branchesRoutes = Router