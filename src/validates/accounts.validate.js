import ValidateCores from '../core/validate.core.js'
import { ALLOWED_STATUS } from '../utils/constants.js'

class AccountsValidate extends ValidateCores {
  static create(req, res, next) {
    try {
      const data = req.body
      this.validateStringLength(data.ACCOUNT_CODE, 3, 'ACCOUNT_CODE must be at least 3 characters!')
      this.validateStringLength(data.PASSWORD, 6, 'PASSWORD must be at least 6 characters!')
      this.validateEnum(data.STATUS, ALLOWED_STATUS)
      next()
    } catch (error) { next(error) }
  }

  static update(req, res, next) {
    try {
      const data = req.body
      this.validateId(data.ACCOUNT_ID, 'Invalid ACCOUNT_ID.')
      if (data.ACCOUNT_CODE !== undefined) {
        this.validateStringLength(data.ACCOUNT_CODE, 3, 'ACCOUNT_CODE must be at least 3 characters!')
      }
      if (data.STATUS !== undefined) {
        this.validateEnum(data.STATUS, ALLOWED_STATUS)
      }
      next()
    } catch (error) { next(error) }
  }

  static resetPassword(req, res, next) {
    try {
      const data = req.body
      this.validateId(data.ACCOUNT_ID, 'Invalid ACCOUNT_ID.')
      this.validateStringLength(data.PASSWORD, 6, 'New PASSWORD must be at least 6 characters!')
      next()
    } catch (error) { next(error) }
  }

  static delete(req, res, next) {
    try {
      const { id } = req.params
      this.validateId(id, 'ACCOUNT_ID is required!')
      next()
    } catch (error) { next(error) }
  }
}

export default AccountsValidate
