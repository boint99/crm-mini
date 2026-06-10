import express from 'express'
import { companyRoutes } from '../modules/company/company.routes.js'
import { organizationRoutes } from '../modules/organization/organization.routes.js'
import { branchesRoutes } from '../modules/branch/branch.routes.js'
import { positionsRoutes } from '../modules/positions/positions.routes.js'
import { employeesRoutes } from '../modules/employees/employees.routes.js'
import { employeesViettelRoutes } from '../modules/outsources/viettelEmployees/employees.viettel.routes.js'
import { viettelBranchRoutes } from '../modules/outsources/viettelBranch/viettelBranch.routes.js'
import { vlansRoutes } from '../modules/network/vlans/vlans.routes.js'
import { ipsRoutes } from '../modules/network/ips/ips.routes.js'
import { accountsRoutes } from '../modules/accounts/accounts.routes.js'
import { otpRoutes } from '../modules/otp/otp.routes.js'
import { permissionsRoutes } from '../modules/permissions/permissions.routes.js'
import { rolesRoutes } from '../modules/roles/roles.routes.js'
import { accountRolesRoutes } from '../modules/accountRoles/accountRoles.routes.js'
import { authRoutes } from '../modules/auth/auth.routes.js'
import { authMiddleware } from '../modules/auth/auth.middleware.js'
import { dynamicPermissionMiddleware } from '../middleware/permission.middleware.js'

const Router = express.Router()

// check api v1 status
Router.get('/status', (req, res) => {
  res.status(200).json({ message: 'APIs are ready to use.' })
})

Router.use('/company', authMiddleware, dynamicPermissionMiddleware, companyRoutes)

Router.use('/organizations', authMiddleware, dynamicPermissionMiddleware, organizationRoutes)


Router.use('/branches', authMiddleware, dynamicPermissionMiddleware, branchesRoutes)

Router.use('/positions', authMiddleware, dynamicPermissionMiddleware, positionsRoutes)

Router.use('/employees', authMiddleware, dynamicPermissionMiddleware, employeesRoutes)

Router.use('/viettel-employees', authMiddleware, dynamicPermissionMiddleware, employeesViettelRoutes)

Router.use('/viettel-branches', authMiddleware, dynamicPermissionMiddleware, viettelBranchRoutes)

Router.use('/networks', authMiddleware, dynamicPermissionMiddleware, vlansRoutes)

Router.use('/networks', authMiddleware, dynamicPermissionMiddleware, ipsRoutes)

Router.use('/accounts', authMiddleware, dynamicPermissionMiddleware, accountsRoutes)

Router.use('/permissions', authMiddleware, dynamicPermissionMiddleware, permissionsRoutes)

Router.use('/roles', authMiddleware, dynamicPermissionMiddleware, rolesRoutes)

Router.use('/account-roles', authMiddleware, dynamicPermissionMiddleware, accountRolesRoutes)

Router.use('/otp', otpRoutes)

Router.use('/auth', authRoutes)

export const APIs_Routes = Router
