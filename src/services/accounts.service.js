import { createHash } from 'crypto'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { accountsModel } from '../models/accounts.model.js'

const hashPassword = (raw) => createHash('sha256').update(raw).digest('hex')

class AccountsService {
  /**
   * Create a new account
   */
  async create(data) {
    if (!data.ACCOUNT_CODE || !data.ACCOUNT_CODE.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ACCOUNT_CODE is required!')
    }
    if (!data.PASSWORD || !data.PASSWORD.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'PASSWORD is required!')
    }

    const existing = await accountsModel.findByCode(data.ACCOUNT_CODE.trim())
    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, 'ACCOUNT_CODE already exists!')
    }

    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    return await accountsModel.create({
      ACCOUNT_CODE: data.ACCOUNT_CODE.trim(),
      PASSWORD: hashPassword(data.PASSWORD.trim()),
      STATUS: data.STATUS ?? 'ENABLE',
      EMPLOYEE_ID: data.EMPLOYEE_ID ? Number(data.EMPLOYEE_ID) : null
    })
  }

  /**
   * Update an account (code, status, employee link)
   */
  async update(ACCOUNT_ID, data) {
    const existing = await accountsModel.findById(ACCOUNT_ID)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    if (data.ACCOUNT_CODE) {
      const trimmed = data.ACCOUNT_CODE.trim()
      const codeExists = await accountsModel.findByCode(trimmed)
      if (codeExists && codeExists.ACCOUNT_ID !== ACCOUNT_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'ACCOUNT_CODE already taken by another account!')
      }
      data.ACCOUNT_CODE = trimmed
    }

    if (data.STATUS) {
      CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')
    }

    const updatePayload = {
      ...(data.ACCOUNT_CODE && { ACCOUNT_CODE: data.ACCOUNT_CODE }),
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
      PASSWORD: hashPassword(newPassword.trim()),
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
