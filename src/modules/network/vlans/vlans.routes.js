import express from 'express'
import { vlansController } from './vlans.controller.js'
import { vlansValidate } from './vlans.validate.js'

const Router = express.Router()

// GET /api/vlans
Router.get('/', vlansController.lists)

// POST /api/vlans
Router.post('/', vlansValidate.create, vlansController.create)

// PUT /api/vlans/:id
Router.put('/:id', vlansValidate.update, vlansController.update)

// DELETE /api/vlans/:id
Router.delete('/:id', vlansValidate.delete, vlansController.delete)

export const vlansRoutes = Router

