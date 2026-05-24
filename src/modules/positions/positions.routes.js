import express from 'express'
import { positionsController } from './positions.controller.js'
import PositionsValidate from './positons.validate.js'

const Router = express.Router()

// GET - /api/positions
Router.get('/' , positionsController.lists)

// POST /api/positions
Router.post('/create', PositionsValidate.create, positionsController.create)

// Update PUT /api/positions
// Note: add POSITION_NAME
Router.put('/update', PositionsValidate.update, positionsController.update)

// DELETE /api/positions/:id
// NOTE: id: POSITION_ID
Router.delete('/delete/:id', PositionsValidate.delete, positionsController.delete)

export const positionsRoutes = Router
