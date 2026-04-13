import express from 'express'
import { companyRoutes } from './company.routes.js'
import { divisionsRoutes } from './divisons.routes.js'
import { orgUnitsRoutes } from './org.units.routes.js'
import { branchesRoutes } from './branch.routes.js'
import { positionsRoutes } from './positions.routes.js'
import { employeesRoutes } from './empolyees.routes.js'
import { employeesViettelRoutes } from './employees.viettel.routes.js'
import { vlansRoutes } from './vlans.routes.js'
import { ipsRoutes } from './ips.routes.js'
import { accountsRoutes } from './accounts.routes.js'
import { otpRoutes } from './otp.routes.js'

const Router = express.Router()

// check api v1 status
Router.get('/status', (req, res) => {
  res.status(200).json({ message: 'APIs are ready to use.' })
})

Router.use('/company', companyRoutes)

Router.use('/divisions', divisionsRoutes)

Router.use('/org-units', orgUnitsRoutes)


Router.use('/branches', branchesRoutes)

Router.use('/positions', positionsRoutes)

Router.use('/employees', employeesRoutes)

Router.use('/viettel-employees', employeesViettelRoutes)

Router.use('/networks', vlansRoutes)

Router.use('/networks', ipsRoutes)

Router.use('/accounts', accountsRoutes)

Router.use('/otp', otpRoutes)

export const APIs_Routes = Router
