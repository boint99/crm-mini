import express from 'express'
import { ipsController } from '../controllers/ips.controller.js'
import { ipsValidate } from '../validates/ips.validate.js'


const Router = express.Router()

// GET - /api/networks/ipaddress/all
// Note: /api/networks/ipaddress?vlan_id=
Router.get('/ipaddress/', ipsValidate.lists, ipsController.lists)

// POST /api/networks/ipaddress/create
Router.post('/ipaddress/create', ipsValidate.create, ipsController.create)

// Update PUT /api/networks/ipaddress/update
Router.put('/ipaddress/update', ipsValidate.update, ipsController.update)

// DELETE /api/networks/ipaddress/delete/:id
// NOTE: id: IP_ADDRESS_ID
Router.delete('/ipaddress/delete/:id',  ipsValidate.delete, ipsController.delete)

export const ipsRoutes = Router