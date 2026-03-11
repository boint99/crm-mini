import express from 'express'
import { companyRoutes } from './company.routes.js'
import { divisionsRoutes } from './divisons.routes.js'

const Router = express.Router()

// check api v1 status
Router.get('/status', (req, res) => {
  res.status(200).json({ message: 'APIs are ready to use.' })
})

Router.use('/companies', companyRoutes)

Router.use('/division', divisionsRoutes)

export const APIs_Routes = Router
