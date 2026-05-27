import { ALLOWED_STATUS } from '../../utils/constants.js'
import ValidateCore from '../../validates/index.js'

class PositionsValidate extends ValidateCore {
  // Validate create position
  static create(req, res, next) {
    try {
      const data = req.body
      PositionsValidate.validateStringLength(data.positionName, 3, 'positionName is required!')

      PositionsValidate.validateEnum(data.status, ALLOWED_STATUS)
      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate update position
  static update(req, res, next) {
    try {
      const data = req.body
      PositionsValidate.validateIdUuid(data.id, 'Position ID is required!.')

      if (data.positionName !== undefined) {
        PositionsValidate.validateStringLength(data.positionName, 3, 'positionName must be 3 characters or more!')
      }

      if (data.status !== undefined) {
        PositionsValidate.validateEnum(data.status, ALLOWED_STATUS)
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate delete position
  static delete(req, res, next) {
    try {
      const { id } = req.params
      PositionsValidate.validateIdUuid(id, 'Position ID is required!.')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default PositionsValidate
