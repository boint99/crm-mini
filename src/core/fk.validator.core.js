import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

class FkValidator {
  /**
   * Validate a foreign key field: check it is a positive integer and exists in the DB.
   * @param {*}      value      - raw value from payload (may be undefined / null / string / number)
   * @param {object} model      - a model instance that has a findById(id) method
   * @param {string} fieldLabel - human-readable name used in error messages (e.g. 'Position ID')
   * @param {string} [message] - custom error message
   */
  static async validate(value, model, fieldLabel, message = 'Invalid') {
    if (value === undefined || value === null) return

    const id = Number(value)
    if (isNaN(id) || id <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message )
    }

    const record = await model.FindById(id, fieldLabel)
    if (!record) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message )
    }
  }
}

export default FkValidator
