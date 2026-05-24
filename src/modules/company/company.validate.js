import ValidateCores from '../../validates/index.js'
import { ALLOWED_STATUS } from '../../utils/constants.js'

class companyValidate extends ValidateCores {
  // Validate create company
  static create(req, res, next) {
    try {
      const data = req.body
      this.validateStringLength(data.companyName, 5, 'Company name is required!')
      this.validateEnum(data.status, ALLOWED_STATUS)
      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate update company
  static async update(req, res, next) {
    try {
      const { id, companyName, status } = req.body

      await  this.validateIdUuid(id, 'Id is required!')

      if (companyName !== undefined) {
        this.validateStringLength(companyName, 5, 'Company name must be 5 characters or more!')
      }
      if (status !== undefined) {
        this.validateEnum(status, ALLOWED_STATUS)
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
      await  this.validateIdUuid(id, 'Id is required!')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default companyValidate
