import express from 'express'
import { ipsController } from './ips.controller.js'
import { ipsValidate } from './ips.validate.js'

const Router = express.Router()

// GET /api/ip-addresses
Router.get('/', ipsController.lists)

// POST /api/ip-addresses
Router.post('/', ipsValidate.create, ipsController.create)

// PUT /api/ip-addresses/:id
Router.put('/:id', ipsValidate.update, ipsController.update)

// DELETE /api/ip-addresses/:id
Router.delete('/:id', ipsValidate.delete, ipsController.delete)

export const ipsRoutes = Router

