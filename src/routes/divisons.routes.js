import { divisionController } from '../controllers/division.controller.js'
import express from 'express'
import DivisionValidate from '../validates/division.validate.js'

const Router = express.Router()

// GET - /api/division/lists
Router.get('/lists', divisionController.lists)

// POST /api/division
Router.post('/', DivisionValidate.create.bind(DivisionValidate), divisionController.create)

// update PUT /api/divisions/
// Note: add DIVISION_ID
Router.put('/', DivisionValidate.update.bind(DivisionValidate), divisionController.update)

// DELETE /api/divisions/:id
// Note: add DIVISION_ID
Router.delete('/:id', DivisionValidate.delete.bind(DivisionValidate), divisionController.delete)

export const divisionsRoutes = Router
