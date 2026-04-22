import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { saltRoundsPassword } from '../utils/constants.js'
import { accountsModel } from '../models/accounts.model.js'
import { employeesModel } from '../models/employees.model.js'
import bcrypt from 'bcrypt'
import Serializer from '../utils/Serializer.js'

class AccountsService {

  // ==================== COMMON ====================

  async _getAccountOrThrow(id) {
    const account = await accountsModel.findByUnique(id)
    if (!account) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    return account
  }

  async _checkDuplicateName(name, excludeId = null) {
    const existing = await accountsModel.findByUnique(name, 'ACCOUNT_NAME')

    if (existing && existing.ACCOUNT_ID !== excludeId) {
      throw new ApiError(StatusCodes.CONFLICT, 'ACCOUNT_NAME already exists!')
    }
  }

  _buildPayload(data) {
    return {
      ACCOUNT_NAME: data.ACCOUNT_NAME.trim(),
      STATUS: data.STATUS,
      EMPLOYEE_ID: data.EMPLOYEE_ID ? Number(data.EMPLOYEE_ID) : null,
      LOGIN: data.LOGIN ?? 0,
      IS_LOGIN: data.IS_LOGIN ?? false,
      DESCRIPTION: data.DESCRIPTION?.trim() || null
    }
  }

  // Get list of accounts
  async lists() {
    return await Serializer.sanitize(await accountsModel.lists())
  }

  async create(data) {
    await this._checkDuplicateName(data.ACCOUNT_NAME.trim())

    const payload = this._buildPayload(data)

    payload.PASSWORD = await bcrypt.hash(data.PASSWORD.trim(), saltRoundsPassword)

    return await accountsModel.create(payload)
  }

  // Update account info (except ACCOUNT_NAME and PASSWORD)
  async update(dataUpdate) {
    const { ACCOUNT_ID, ...payload } = dataUpdate

    await this._getAccountOrThrow(ACCOUNT_ID)

    delete payload.ACCOUNT_NAME

    // if (payload.EMPLOYEE_ID !== null && payload.EMPLOYEE_ID !== undefined) {
    //   const emp = await employeesModel.findByUnique(payload.EMPLOYEE_ID)
    //   if (!emp) {
    //     throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee not found!')
    //   }
    // }


    return await Serializer.sanitize(accountsModel.updateById(ACCOUNT_ID, payload))
  }

  // Reset password and set IS_LOGIN to false, LOGIN to 0
  async resetPassword(ACCOUNT_ID, newPassword) {
    const account = await this._getAccountOrThrow(ACCOUNT_ID)

    return await Serializer.sanitize(await accountsModel.updateById(account.ACCOUNT_ID, {
      PASSWORD: await bcrypt.hash(newPassword.trim(), saltRoundsPassword),
      IS_LOGIN: false,
      LOGIN: 0
    })), ['PASSWORD']

  }

  // Soft delete account by id
  async delete(ACCOUNT_ID) {
    const account = await this._getAccountOrThrow(ACCOUNT_ID)

    return await accountsModel.softDeleteById(account.ACCOUNT_ID)
  }
}

export const accountsService = new AccountsService()