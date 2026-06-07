import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { saltRoundsPassword } from '../../utils/constants.js'
import { accountsModel } from './accounts.model.js'
import bcrypt from 'bcrypt'
import Serializer from '../../utils/Serializer.js'
import { v7 as uuidv7 } from 'uuid'
import { employeesModel } from '../employees/employees.model.js'
import { refreshTokenModel } from '../auth/refreshToken.model.js'
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

    const existingAccount = await accountsModel.findByField(employee.employeeId, 'employeeId')
    if (existingAccount && existingAccount.id !== currentAccountId) {
      throw new ApiError(StatusCodes.CONFLICT, 'Employee already has an account!')
    }

    return employee.employeeId
  }

  // Get list of accounts
  async lists() {
    return Serializer.sanitize(await accountsModel.lists(), ['password', 'deletedAt'])
  }

  async create(data) {
    await this._checkDuplicateName(data.accountName.trim())

    let employeeId = null
    if (data.employeeCode) {
      employeeId = await this._getEmployeeIdFromCode(data.employeeCode)
    }

    const payload = this._buildPayload({ ...data, employeeId })

    payload.password = await bcrypt.hash(data.password.trim(), saltRoundsPassword)

    return await accountsModel.create(payload)
  }

  // Update account info (except accountName and password)
  async update(dataUpdate) {
    const { id, ...payload } = dataUpdate

    await this._getAccountOrThrow(id)

    delete payload.accountName

    // convert employeeCode
    if (payload.employeeCode) {
      payload.employeeId = await this._getEmployeeIdFromCode(payload.employeeCode, id)
      delete payload.employeeCode
    } else if (payload.hasOwnProperty('employeeCode')) {
      payload.employeeId = null
      delete payload.employeeCode
    }

    if (typeof payload.login === 'boolean') {
      payload.isLogin = payload.login
      delete payload.login
    }

    const updatedAccount = await accountsModel.updateById(id, payload)
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
      isLogin: false,
      login: 0
    }), ['password', 'deletedAt'])
  }

  // Soft delete account by id
  async delete(id) {
    const account = await this._getAccountOrThrow(id)
    await refreshTokenModel.revokeAllAccountTokens(account.accountId)
    return await accountsModel.softDeleteById(account.accountId)
  }
}

export const accountsService = new AccountsService()
