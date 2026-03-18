import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

class BaseValidates {
  // Check Id
  static validateId(id, message) {
    if (!id || Number.isNaN(Number(id))) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message)
    }
  }
  static  validateCreate (id, message = 'Invalid') {
    if (!id || isNaN(id)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message)
    }
  }
  //Check the minimum level of the chain.
  static validateStringLength(value, min = 5, message) {
    if (value !== undefined && value.trim().length < min) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message)
    }
  }

  // Check if the value is in the allowed list.
  static validateEnum(value, allowedValues, message = 'Invalid status value.') {
    if (value && !allowedValues.includes(value)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message)
    }
  }
}

export default BaseValidates