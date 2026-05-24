import ValidateCores from '../../validates/index.js'
import { ALLOWED_STATUS } from '../../utils/constants.js'

class organizationValidate extends ValidateCores {
  static create(req, res, next) {
    try {
      const data = req.body
      this.validateStringLength(data.unitName, 2, 'unitName is required and must be at least 2 characters!')

      if (data.status) {
        this.validateEnum(data.status, ALLOWED_STATUS)
      }
      next()
    } catch (error) {
      next(error)
    }
  }

  static async update(req, res, next) {
    try {
      const data = req.body

      await this.validateIdUuid(data.id, 'Organization ID (uuid) is required!')

      if (data.unitName !== undefined) {
        this.validateStringLength(data.unitName, 2, 'unitName must be 2 characters or more!')
      }
      if (data.status !== undefined) {
        this.validateEnum(data.status, ALLOWED_STATUS)
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params
      await this.validateIdUuid(id, 'Organization ID (uuid) is required!')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default organizationValidate
