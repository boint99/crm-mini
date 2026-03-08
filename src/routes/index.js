import { companyRoutes } from './company.routes.js'
import express from 'express'

const Router = express.Router()

// check api v1 status
Router.get('/status', (req, res) => {
  res.status(200).json({ message: 'APIs are ready to use.' })
})
Router.use('/companies', companyRoutes)


export const APIs_Routes = Router
