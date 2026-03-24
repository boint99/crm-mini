import express from 'express'
import { positionsController } from '../controllers/positions.controller.js'
import PositionsValidate from '../validates/positons.validate.js'

const Router = express.Router()

// GET - /api/positions
Router.get('/lists' , positionsController.lists)

// POST /api/positions
Router.post('/', PositionsValidate.create, positionsController.create)

// Update PUT /api/positions
// Note: add POSITION_NAME
Router.put('/', PositionsValidate.update, positionsController.update)

// DELETE /api/positions/:id
// NOTE: id: POSITION_ID
Router.delete('/:id', PositionsValidate.delete, positionsController.delete)

export const positionsRoutes = Router