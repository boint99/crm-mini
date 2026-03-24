
import { ALLOWED_STATUS } from '../utils/constants.js'
import ValidateCore from '../core/validate.core.js'

class PositionsValidate extends ValidateCore {
  // Validate create position
  static create(req, res, next) {
    try {
      const data = req.body
      PositionsValidate.validateStringLength(data.POSITION_NAME, 3, 'POSITION_NAME is required!')
      PositionsValidate.validateEnum(data.STATUS, ALLOWED_STATUS)
      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate update position
  static update(req, res, next) {
    try {
      const data = req.body
      PositionsValidate.validateId(data.POSITION_ID, 'POSITION_ID is required!.')

      if (data.POSITION_NAME !== undefined) {
        PositionsValidate.validateStringLength(data.POSITION_NAME, 3, 'POSITION_NAME must be 3 characters or more!')
      }
      if (data.STATUS !== undefined) {
        PositionsValidate.validateEnum(data.STATUS, ALLOWED_STATUS)
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
      PositionsValidate.validateId(id, 'POSITION_ID is required!.')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default PositionsValidate