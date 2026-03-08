import express from 'express'
import { companyController } from '../controllers/conpany.controller.js'

const Router = express.Router()

Router.get('/', companyController.getList)
Router.post('/', companyController.createNew)
Router.put('/:id', companyController.update)
Router.delete('/:id', companyController.delete)

export const companyRoutes = Router