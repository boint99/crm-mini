import ValidateCores from '../core/validate.core.js'
import { ALLOWED_STATUS } from '../utils/constants.js'

class AccountsValidate extends ValidateCores {
  static async register(req, _res, next) {
    try {
      const data = req.body
      await  this.validateStringLength(data.FIRST_NAME, 1, 'First name is required!')
      await  this.validateStringLength(data.LAST_NAME, 1, 'Last name is required!')
      await  this.validateEmail(data.EMAIL)
      await  this.validateStringLength(data.PASSWORD, 8, 'Password is required!')
      await  this.validateStringLength(data.RE_PASSWORD, 8, 'Confirm password is required!')
      await  this.validateStringLength(data.PASSWORD, 8, 'Password must be at least 8 characters!')
      await this.PASSWORD === data.RE_PASSWORD || this.throwError('Password not match!')
      next()
    } catch (error) { next(error) }
  }

  static async create(req, _res, next) {
    try {
      const data = req.body
      await  this.validateStringLength(data.ACCOUNT_CODE, 3, 'Account code must be at least 3 characters!')
      await  this.validateStringLength(data.PASSWORD, 8, 'Password must be at least 8 characters!')
      await  this.validateEnum(data.STATUS, ALLOWED_STATUS)
      next()
    } catch (error) { next(error) }
  }

  static async update(req, _res, next) {
    try {
      const data = req.body
      await  this.validateId(data.ACCOUNT_ID, 'Invalid ACCOUNT_ID.')
      if (data.ACCOUNT_CODE !== undefined) {
        await  this.validateStringLength(data.ACCOUNT_CODE, 3, 'Account code must be at least 3 characters!')
      }
      if (data.STATUS !== undefined) {
        await  this.validateEnum(data.STATUS, ALLOWED_STATUS)
      }
      next()
    } catch (error) { next(error) }
  }

  static async resetPassword(req, _res, next) {
    try {
      const data = req.body
      await  this.validateId(data.ACCOUNT_ID, 'Invalid ACCOUNT_ID.')
      await  this.validateStringLength(data.PASSWORD, 8, 'New PASSWORD must be at least 8 characters!')
      next()
    } catch (error) { next(error) }
  }

  static async delete(req, _res, next) {
    try {
      const { id } = req.params
      await  this.validateId(id, 'ACCOUNT_ID is required!')
      next()
    } catch (error) { next(error) }
  }
}

export default AccountsValidate
