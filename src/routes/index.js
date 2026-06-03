import express from 'express'
import { companyRoutes } from '../modules/company/company.routes.js'
import { organizationRoutes } from '../modules/organization/organization.routes.js'
import { branchesRoutes } from '../modules/branch/branch.routes.js'
import { positionsRoutes } from '../modules/positions/positions.routes.js'
import { employeesRoutes } from '../modules/employees/employees.routes.js'
import { employeesViettelRoutes } from '../modules/outsources/employees.viettel.routes.js'
import { viettelBranchRoutes } from '../modules/outsources/viettelBranch/viettelBranch.routes.js'
import { vlansRoutes } from '../modules/network/vlans/vlans.routes.js'
import { ipsRoutes } from '../modules/network/ips/ips.routes.js'
import { accountsRoutes } from '../modules/accounts/accounts.routes.js'
import { otpRoutes } from '../modules/otp/otp.routes.js'
import { authRoutes } from '../modules/auth/auth.routes.js'

const Router = express.Router()

// check api v1 status
Router.get('/status', (req, res) => {
  res.status(200).json({ message: 'APIs are ready to use.' })
})

Router.use('/company', companyRoutes)

Router.use('/organizations', organizationRoutes)


Router.use('/branches', branchesRoutes)

Router.use('/positions', positionsRoutes)

Router.use('/employees', employeesRoutes)

Router.use('/viettel-employees', employeesViettelRoutes)

Router.use('/viettel-branches', viettelBranchRoutes)

Router.use('/networks', vlansRoutes)

Router.use('/networks', ipsRoutes)

Router.use('/accounts', accountsRoutes)

Router.use('/otp', otpRoutes)

Router.use('/auth', authRoutes)

export const APIs_Routes = Router
