import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { accountsModel } from '../models/accounts.model.js'
import { employeesModel } from '../models/employees.model.js'
import { removeDomain, saltRoundsPassword } from '../utils/constants.js'

class AuthService {
  // ================= VALIDATE + NORMALIZE =================
  _validateAndNormalize(data) {
    const { FIRST_NAME, LAST_NAME, EMAIL, PASSWORD, RE_PASSWORD } = data

    if (!FIRST_NAME?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'First name is required!')
    }

    if (!LAST_NAME?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Last name is required!')
    }

    if (!EMAIL?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is required!')
    }

    if (!PASSWORD?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is required!')
    }

    if (!RE_PASSWORD?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Confirm password is required!')
    }

    if (PASSWORD !== RE_PASSWORD) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Password not match!')
    }

    if (PASSWORD.length < 8) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Password must be >= 8 chars!')
    }

    return {
      FIRST_NAME: FIRST_NAME.trim(),
      LAST_NAME: LAST_NAME.trim(),
      EMAIL: EMAIL.trim().toLowerCase(),
      PASSWORD: PASSWORD.trim()
    }
  }

  // ================= CHECK DB =================
  async _ensureEmailNotExists(email) {
    const existingEmployee = await employeesModel.findbyField(email, 'EMAIL')
    if (existingEmployee) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already registered!')
    }

    const existingAccount = await accountsModel.findByUnique(email, 'ACCOUNT_NAME')
    if (existingAccount) {
      throw new ApiError(StatusCodes.CONFLICT, 'Account already exists!')
    }
  }

  // ================= MAIN LOGIC =================
  async register(data) {
    // 1. Validate + normalize
    const cleanData = this._validateAndNormalize(data)
    const emailRemovedDomain = removeDomain(cleanData.EMAIL)

    // 2. Check duplicate (business rule)
    await this._ensureEmailNotExists(cleanData.EMAIL)

    // 4. Create account
    const account = await accountsModel.create({
      ACCOUNT_NAME: emailRemovedDomain,
      PASSWORD: await bcrypt.hash(cleanData.PASSWORD, saltRoundsPassword),
      EMPLOYEE_ID: null,
      LOGIN: 0,
      IS_LOGIN: false
    })

    return account
  }
}

export const authService = new AuthService()