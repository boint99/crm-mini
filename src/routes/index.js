import express from 'express'
import { companyRoutes } from './company.routes.js'
import { divisionsRoutes } from './divisons.routes.js'
import { orgUnitsRoutes } from './org.units.routes.js'

const Router = express.Router()

// check api v1 status
Router.get('/status', (req, res) => {
  res.status(200).json({ message: 'APIs are ready to use.' })
})

Router.use('/company', companyRoutes)

Router.use('/division', divisionsRoutes)

Router.use('/org-units', orgUnitsRoutes)

export const APIs_Routes = Router
