
import { ALLOWED_STATUS } from '../utils/constants.js'
import BaseValidates from './BaseValidates.js'

class companyValidate extends BaseValidates {
  // Validate create company
  static create(req, res, next) {
    try {
      const data = req.body
      this.validateStringLength(data.COMPANY_NAME, 5, 'COMPANY_NAME is required!')
      this.validateEnum(data.STATUS, ALLOWED_STATUS)
      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate update company
  static update(req, res, next) {
    try {
      const data = req.body
      this.validateId(data.COMPANY_ID, 'Invalid Company ID.')

      if (data.COMPANY_NAME !== undefined) {
        this.validateStringLength(data.COMPANY_NAME, 5, 'COMPANY_NAME must be 5 characters or more!')
      }
      if (data.STATUS !== undefined) {
        this.validateEnum(data.STATUS, ALLOWED_STATUS)
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate delete company
  static delete(req, res, next) {
    try {
      const { id } = req.params
      this.validateId(id, 'COMPANY_ID is required!.')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default companyValidate