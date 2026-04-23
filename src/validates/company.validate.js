
import ValidateCores from '../core/validate.core.js'
import { ALLOWED_STATUS } from '../utils/constants.js'

class companyValidate extends ValidateCores {
  // Validate create company
  static create(req, res, next) {
    try {
      const data = req.body
      this.validateStringLength(data.COMPANY_NAME, 5, 'COMPANY_NAME is required!')
      this.validateStringLength(data.COMPANY_CODE, 2, 'COMPANY_CODE is required!')
      this.validateEnum(data.STATUS, ALLOWED_STATUS)
      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate update company
  static async update(req, res, next) {
    try {
      const data = req.body

      await  this.validateIdUuid(data.ID, 'Company ID is required!')

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
  static async delete(req, res, next) {
    try {
      const { id } = req.params
      await  this.validateIdUuid(id, 'Company ID is required!')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default companyValidate