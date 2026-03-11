import { divisionController } from '../controllers/division.controller.js'
import express from 'express'

const Router = express.Router()

Router.get('/list', divisionController.list)
Router.post('/', divisionController.create)
Router.put('/', divisionController.update)
Router.delete('/', divisionController.delete)


export const divisionsRoutes = Router