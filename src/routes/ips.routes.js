import express from 'express'
import { ipsController } from '../controllers/ips.controller.js'


const Router = express.Router()

// GET - /api/networks/ipaddress/all
Router.get('/ipaddress/all', ipsController.lists)

// POST /api/networks/ipaddress/create
Router.post('/ipaddress/create', ipsController.create)

// Update PUT /api/networks/ipaddress/update
Router.put('/ipaddress/update', ipsController.update)

// DELETE /api/networks/ipaddress/delete/:id
// NOTE: id: IP_ADDRESS_ID
Router.delete('/ipaddress/delete/:id',  ipsController.delete)

export const ipsRoutes = Router