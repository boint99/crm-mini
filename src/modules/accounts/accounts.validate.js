import ValidateCores from '../../validates/index.js'
import { ALLOWED_STATUS } from '../../utils/constants.js'

class AccountsValidate extends ValidateCores {
  static async register(req, _res, next) {
    try {
      const data = req.body
      await  this.validateStringLength(data.firstName, 1, 'First name is required!')
      await  this.validateStringLength(data.lastName, 1, 'Last name is required!')
      await  this.validateEmail(data.accountName)
      await  this.validateStringLength(data.password, 8, 'Password is required!')
      await  this.validateStringLength(data.confirmPassword, 8, 'Confirm password is required!')
      await  this.validateStringLength(data.password, 8, 'Password must be at least 8 characters!')
      await data.password === data.confirmPassword || this.throwError('Password not match!')
      next()
    } catch (error) { next(error) }
  }

  static async create(req, _res, next) {
    try {
      const data = req.body

      await  this.validateStringLength(data.password, 8, 'Password must be at least 8 characters!')
      await  this.validateEnum(data.status, ALLOWED_STATUS)
      next()
    } catch (error) { next(error) }
  }

  static async update(req, _res, next) {
    try {
      const data = req.body
      await  this.validateIdUuid(data.id, 'Invalid ID.')

      if (data.status !== undefined) {
        await  this.validateEnum(data.status, ALLOWED_STATUS)
      }
      next()
    } catch (error) { next(error) }
  }

  static async resetPassword(req, _res, next) {
    try {
      const data = req.body
      await  this.validateIdUuid(data.id, 'Invalid ID.')
      await  this.validateStringLength(data.password, 8, 'New password must be at least 8 characters!')
      next()
    } catch (error) { next(error) }
  }

  static async delete(req, _res, next) {
    try {
      const { id } = req.params
      await  this.validateIdUuid(id, 'accountId is required!')
      next()
    } catch (error) { next(error) }
  }
}

export default AccountsValidate
