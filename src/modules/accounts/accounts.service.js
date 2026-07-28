import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { saltRoundsPassword } from '../../utils/constants.js'
import { accountsModel } from './accounts.model.js'
import bcrypt from 'bcrypt'
import Serializer from '../../utils/Serializer.js'
import { v7 as uuidv7 } from 'uuid'
import { employeesModel } from '../employees/employees.model.js'
import { refreshTokenModel } from '../auth/refreshToken.model.js'
import { PRISMA } from '../../configs/db.config.js'

class AccountsService {

  async _getAccountOrThrow(id) {
    const account = await accountsModel.findByUnique(id)
    if (!account) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    return account
  }

  async _checkDuplicateName(name, excludeId = null) {
    const existing = await accountsModel.findByUnique(name, 'accountName')

    if (existing && existing.accountId !== excludeId) {
      throw new ApiError(StatusCodes.CONFLICT, 'Account name already exists!')
    }
  }

  _buildPayload(data) {
    const isLoginVal = data.isLogin !== undefined ? data.isLogin : (typeof data.login === 'boolean' ? data.login : false)
    return {
      id: uuidv7(),
      accountName: data.accountName.trim(),
      status: data.status,
      employeeId: data.employeeId ? Number(data.employeeId) : null,
      isLogin: isLoginVal,
      description: data.description?.trim() || null
    }
  }

  async _getEmployeeIdFromCode(employeeCode, currentAccountId = null) {
    const employee = await employeesModel.findByUnique(employeeCode, 'employeeCode')

    if (!employee) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found!')
    }
    if (employee.status !== 'ENABLE') {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not active!')
    }
    if (employee.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
    }

    // Check if employee belongs to a company transitively via orgUnit
    if (!employee.unitId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhân viên này không thuộc phòng ban nào, do đó không xác định được công ty!')
    }

    const employeeUnit = await PRISMA.oRG_UNITS.findUnique({
      where: { orgUnitId: employee.unitId }
    })

    if (!employeeUnit || !employeeUnit.companyId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Phòng ban của nhân viên này không thuộc công ty nào!')
    }

    const existingAccount = await accountsModel.findByField(employee.employeeId, 'employeeId')
    if (existingAccount && existingAccount.id !== currentAccountId) {
      throw new ApiError(StatusCodes.CONFLICT, 'Employee already has an account!')
    }

    return employee.employeeId
  }

  // Get list of accounts
  async lists(params = {}) {
    const result = await accountsModel.lists(params)
    return {
      total: result.total,
      list: Serializer.sanitize(result.list, ['password', 'deletedAt'])
    }
  }

  async create(data) {
    await this._checkDuplicateName(data.accountName.trim())

    let employeeId = null
    if (data.employeeCode) {
      employeeId = await this._getEmployeeIdFromCode(data.employeeCode)
    }

    const payload = this._buildPayload({ ...data, employeeId })

    payload.password = await bcrypt.hash(data.password.trim(), saltRoundsPassword)

    const record = await accountsModel.create(payload)

    // Assign role if provided
    if (data.roleId) {
      const rId = Number(data.roleId)
      // Reset sequence
      await PRISMA.$executeRawUnsafe(
        'SELECT setval(pg_get_serial_sequence(\'"ACCOUNT_ROLES"\', \'AR_ID\'), COALESCE(MAX("AR_ID"), 1)) FROM "ACCOUNT_ROLES";'
      )
      // Create role mapping
      await PRISMA.aCCOUNT_ROLES.create({
        data: {
          id: uuidv7(),
          accountId: record.accountId,
          roleId: rId
        }
      })
    }

    // Fetch full account details including roles and employee info
    const fullAccount = await accountsModel.findByUnique(record.id)
    return Serializer.sanitize(fullAccount, ['password', 'deletedAt'])
  }

  // Update account info (except accountName and password)
  async update(dataUpdate) {
    const { id, roleId, ...payload } = dataUpdate

    const account = await this._getAccountOrThrow(id)

    delete payload.accountName

    // convert employeeCode
    if (payload.employeeCode) {
      payload.employeeId = await this._getEmployeeIdFromCode(payload.employeeCode, id)
      delete payload.employeeCode
    } else if (Object.prototype.hasOwnProperty.call(payload, 'employeeCode')) {
      payload.employeeId = null
      delete payload.employeeCode
    }

    if (typeof payload.login === 'boolean') {
      payload.isLogin = payload.login
      delete payload.login
    }

    // Bảo vệ tài khoản superadmin (accountId = 1) khỏi bị vô hiệu hóa hoặc tắt kích hoạt
    if (account.accountId === 1) {
      if (payload.status === 'DISABLED') {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Không thể vô hiệu hóa tài khoản Superadmin!')
      }
      if (payload.isLogin === false) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Không thể tắt kích hoạt đăng nhập của tài khoản Superadmin!')
      }
    }

    // Handle role updating if roleId is explicitly passed (even if undefined/null)
    if (roleId !== undefined) {
      const targetRoleId = roleId ? Number(roleId) : null

      const activeRoles = await PRISMA.aCCOUNT_ROLES.findMany({
        where: {
          accountId: account.accountId,
          deletedAt: null
        }
      })

      const currentRoleId = activeRoles.length > 0 ? activeRoles[0].roleId : null

      if (currentRoleId !== targetRoleId) {
        if (account.accountId === 1) {
          throw new ApiError(StatusCodes.FORBIDDEN, 'Không thể thay đổi hoặc gỡ bỏ vai trò của tài khoản Superadmin!')
        }

        // Soft-delete current active roles
        if (activeRoles.length > 0) {
          await PRISMA.aCCOUNT_ROLES.updateMany({
            where: {
              accountId: account.accountId,
              deletedAt: null
            },
            data: {
              deletedAt: new Date()
            }
          })
        }

        // Assign new role if provided
        if (targetRoleId !== null) {
          const existingMapping = await PRISMA.aCCOUNT_ROLES.findFirst({
            where: {
              accountId: account.accountId,
              roleId: targetRoleId
            }
          })

          if (existingMapping) {
            await PRISMA.aCCOUNT_ROLES.update({
              where: { arId: existingMapping.arId },
              data: { deletedAt: null }
            })
          } else {
            await PRISMA.$executeRawUnsafe(
              'SELECT setval(pg_get_serial_sequence(\'"ACCOUNT_ROLES"\', \'AR_ID\'), COALESCE(MAX("AR_ID"), 1)) FROM "ACCOUNT_ROLES";'
            )
            await PRISMA.aCCOUNT_ROLES.create({
              data: {
                id: uuidv7(),
                accountId: account.accountId,
                roleId: targetRoleId
              }
            })
          }
        }

        // Revoke tokens because roles/permissions changed
        await refreshTokenModel.revokeAllAccountTokens(account.accountId)
      }
    }

    await accountsModel.updateById(id, payload)
    const updatedAccount = await accountsModel.findByUnique(id)

    if (updatedAccount.status !== 'ENABLE' || !updatedAccount.isLogin) {
      await refreshTokenModel.revokeAllAccountTokens(updatedAccount.accountId)
    }

    return Serializer.sanitize(updatedAccount, ['password', 'deletedAt'])
  }

  // Reset password and set isLogin to false, login to 0
  async resetPassword(id, newPassword) {
    const account = await this._getAccountOrThrow(id)

    await refreshTokenModel.revokeAllAccountTokens(account.accountId)

    return Serializer.sanitize(await accountsModel.updateById(account.id, {
      password: await bcrypt.hash(newPassword.trim(), saltRoundsPassword),
      login: 0
    }), ['password', 'deletedAt'])
  }

  // Soft delete account by id
  async delete(id) {
    const account = await this._getAccountOrThrow(id)

    // Bảo vệ tài khoản superadmin (accountId = 1) khỏi bị xóa
    if (account.accountId === 1) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Không thể xóa tài khoản Superadmin!')
    }

    await refreshTokenModel.revokeAllAccountTokens(account.accountId)
    return await accountsModel.softDeleteById(account.accountId)
  }
}

export const accountsService = new AccountsService()
