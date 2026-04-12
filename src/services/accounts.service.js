import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { accountDTO, ALLOWED_STATUS, CHECK_ENUM, saltRoundsPassword } from '../utils/constants.js'
import { accountsModel } from '../models/accounts.model.js'
import bcrypt from 'bcrypt'


class AccountsService {

  async lists() {
    const result = await accountsModel.lists()

    return result.map(accountDTO)
  }
  /**
   * Create a new account
   */
  async create(data) {
    if (!data.ACCOUNT_NAME || !data.ACCOUNT_NAME.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ACCOUNT_NAME is required!')
    }
    if (!data.PASSWORD || !data.PASSWORD.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'PASSWORD is required!')
    }

    const existing = await accountsModel.findByUnique(data.ACCOUNT_NAME.trim(), 'ACCOUNT_NAME')

    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, 'ACCOUNT_NAME already exists!')
    }

    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    const createData = {
      ACCOUNT_NAME: data.ACCOUNT_NAME.trim(),
      PASSWORD: await bcrypt.hash(data.PASSWORD.trim(), saltRoundsPassword),
      STATUS: data.STATUS ?? 'ENABLE',
      EMPLOYEE_ID: data.EMPLOYEE_ID ? Number(data.EMPLOYEE_ID) : null,
      LOGIN: data.LOGIN ?? 0,
      IS_LOGIN: data.IS_LOGIN ?? false,
      DESCRIPTION: data.DESCRIPTION?.trim() || null
    }
    return await accountsModel.create(createData)
  }

  /**
   * Update an account (name, status, employee link)
   */
  async update(ACCOUNT_ID, data) {

    delete data.ACCOUNT_NAME

    const existing = await accountsModel.findById(ACCOUNT_ID)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    if (data.ACCOUNT_NAME) {
      const trimmed = data.ACCOUNT_NAME.trim()
      const nameExists = await accountsModel.findByUnique(trimmed, 'ACCOUNT_NAME')
      if (nameExists && nameExists.ACCOUNT_ID !== ACCOUNT_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'ACCOUNT_NAME already taken by another account!')
      }
      data.ACCOUNT_NAME = trimmed
    }

    if (data.STATUS) {
      CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')
    }

    const updatePayload = {
      ...(data.ACCOUNT_NAME && { ACCOUNT_NAME: data.ACCOUNT_NAME }),
      ...(data.STATUS && { STATUS: data.STATUS }),
      ...('EMPLOYEE_ID' in data && { EMPLOYEE_ID: data.EMPLOYEE_ID ? Number(data.EMPLOYEE_ID) : null })
    }

    return await accountsModel.updateById(ACCOUNT_ID, updatePayload)
  }

  /**
   * Reset password for an account
   */
  async resetPassword(ACCOUNT_ID, newPassword) {
    if (!newPassword || !newPassword.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'New password is required!')
    }

    const existing = await accountsModel.findById(ACCOUNT_ID)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    return await accountsModel.updateById(ACCOUNT_ID, {
      PASSWORD: await bcrypt.hash(newPassword.trim(), saltRoundsPassword),
      IS_LOGIN: false,
      LOGIN: 0
    })
  }

  /**
   * Delete an account
   */
  async delete(ACCOUNT_ID) {
    const idNum = Number(ACCOUNT_ID)
    if (isNaN(idNum) || idNum <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ACCOUNT_ID is required!')
    }

    const existing = await accountsModel.findById(idNum)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    return await accountsModel.deleteById(idNum)
  }
}

export const accountsService = new AccountsService()
