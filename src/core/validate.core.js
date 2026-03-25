import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

class ValidateCores {
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
  static validateStringLength(value, min = 3, message) {
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

  // Check email syntax.
  static validateEmail(email, message = 'EMAIL is invalid!.') {
    if (email === undefined || email === null || email === '') return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(email).trim())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message)
    }
  }

  // Check if email domain is in allowed list. Skip when list is empty.
  static validateEmailDomain(email, allowedDomains = [], message = 'EMAIL domain is not allowed!.') {
    if (email === undefined || email === null || email === '') return
    if (!Array.isArray(allowedDomains) || allowedDomains.length === 0) return

    const parts = String(email).trim().split('@')
    const domain = parts.length === 2 ? parts[1].toLowerCase() : ''
    const normalizedAllowedDomains = allowedDomains.map(item => String(item).toLowerCase())

    if (!domain || !normalizedAllowedDomains.includes(domain)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message)
    }
  }
}

export default ValidateCores