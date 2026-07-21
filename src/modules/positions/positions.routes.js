import express from 'express'
import { positionsController } from './positions.controller.js'
import PositionsValidate from './positons.validate.js'
import { validateImportFile } from '../../middleware/fileValidation.middleware.js'

const Router = express.Router()

// GET /api/positions
Router.get('/', positionsController.lists)

// POST /api/positions
Router.post('/', PositionsValidate.create, positionsController.create)

// Action routes (non-CRUD)
Router.post('/import-preview', validateImportFile, positionsController.importPreview)
Router.post('/import-confirm', positionsController.importConfirm)

// PUT /api/positions/:id
Router.put('/:id', PositionsValidate.update, positionsController.update)

// DELETE /api/positions/:id
Router.delete('/:id', PositionsValidate.delete, positionsController.delete)

export const positionsRoutes = Router

