import express from 'express'
import { orgUnitsController } from '../controllers/org.units.controller.js'
import OrgUnitsValidate from '../validates/org.units.validate.js'

const Router = express.Router()

// GET - /api/company
Router.get('/lists', orgUnitsController.lists)

// POST /api/org-units
Router.post('/', OrgUnitsValidate.create, orgUnitsController.create)

// Update PUT /api/org-units
// Note: add UNIT_NAME
Router.put('/', OrgUnitsValidate.update, orgUnitsController.update)

// DELETE /api/org-units/:id
// NOTE: id: ORG_UNIT_ID
Router.delete('/:id', OrgUnitsValidate.delete, orgUnitsController.delete)

export const orgUnitsRoutes = Router