import express from 'express'
import { vlansController } from '../controllers/vlans.controller.js'

const Router = express.Router()

// GET - /api/vlans/lists
Router.get('/vlan/all', vlansController.lists)

// // POST /api/vlans
Router.post('/vlan/create', vlansController.create)

// Update PUT /api/vlans
// Note: add VLAN_NAME
Router.put('/vlan/update', vlansController.update)

// DELETE /api/vlans/:id
// NOTE: id: VLAN_ID
Router.delete('/vlan/delete/:id', vlansController.delete)

export const vlansRoutes = Router