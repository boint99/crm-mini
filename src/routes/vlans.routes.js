import express from 'express'
import { vlansController } from '../controllers/vlans.controller.js'
import { vlansValidate } from '../validates/vlans.validate.js'

const Router = express.Router()

// GET - /api/vlans/lists
Router.get('/vlan/lists', vlansController.lists)

// // POST /api/vlans
Router.post('/vlan/create', vlansValidate.create, vlansController.create)

// Update PUT /api/vlans
Router.put('/vlan/update', vlansValidate.update, vlansController.update)

// DELETE /api/vlans/:id
// NOTE: id: VLAN_ID
Router.delete('/vlan/delete/:id', vlansValidate.delete, vlansController.delete)

export const vlansRoutes = Router