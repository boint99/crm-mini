import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { saltRoundsPassword } from '../../utils/constants.js'
import { accountsModel } from './accounts.model.js'
import bcrypt from 'bcrypt'
import Serializer from '../../utils/Serializer.js'

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
    return {
      accountName: data.accountName.trim(),
      status: data.status,
      employeeId: data.employeeId ? Number(data.employeeId) : null,
      login: data.login ?? 0,
      isLogin: data.isLogin ?? false,
      description: data.description?.trim() || null
    }
  }

  // Get list of accounts
  async lists() {
    return Serializer.sanitize(await accountsModel.lists(), ['password', 'deletedAt'])
  }

  async create(data) {
    await this._checkDuplicateName(data.accountName.trim())

    const payload = this._buildPayload(data)

    payload.password = await bcrypt.hash(data.password.trim(), saltRoundsPassword)

    return await accountsModel.create(payload)
  }

  // Update account info (except accountName and password)
  async update(dataUpdate) {
    const { accountId, ...payload } = dataUpdate

    await this._getAccountOrThrow(accountId)

    delete payload.accountName

    return Serializer.sanitize(await accountsModel.updateById(accountId, payload), ['password', 'deletedAt'])
  }

  // Reset password and set isLogin to false, login to 0
  async resetPassword(accountId, newPassword) {
    const account = await this._getAccountOrThrow(accountId)

    return Serializer.sanitize(await accountsModel.updateById(account.accountId, {
      password: await bcrypt.hash(newPassword.trim(), saltRoundsPassword),
      isLogin: false,
      login: 0
    }), ['password', 'deletedAt'])
  }

  // Soft delete account by id
  async delete(accountId) {
    const account = await this._getAccountOrThrow(accountId)

    return await accountsModel.softDeleteById(account.accountId)
  }
}

export const accountsService = new AccountsService()
