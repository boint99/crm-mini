import express from 'express'
import { viettelBranchController } from './viettelBranch.controller.js'
import ViettelBranchValidate from './viettelBranch.validate.js'

const Router = express.Router()

// GET - /api/viettel-branches/lists
Router.get('/lists', viettelBranchController.lists)

// POST /api/viettel-branches/create
Router.post('/create', ViettelBranchValidate.create, viettelBranchController.create)

// PUT /api/viettel-branches/update
Router.put('/update', ViettelBranchValidate.update, viettelBranchController.update)

// DELETE /api/viettel-branches/:id
Router.delete('/:id', ViettelBranchValidate.delete, viettelBranchController.delete)

export const viettelBranchRoutes = Router
