import ValidateCores from '../../validates/index.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'

class AuthValidator extends ValidateCores {
  register(req, res, next) {
    try {
      const { firstName, lastName, email, password, confirmPassword } = req.body

      if (!firstName || !String(firstName).trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'First name is required!')
      }
      if (!lastName || !String(lastName).trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Last name is required!')
      }
      if (!email || !String(email).trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is required!')
      }

      ValidateCores.validateEmail(email, 'Invalid email format!')

      if (!password || !String(password).trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is required!')
      }
      const trimmedPassword = String(password).trim()
      if (trimmedPassword.length < 8) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Password must be >= 8 chars!')
      }

      if (confirmPassword !== undefined && confirmPassword !== password) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Confirm password does not match!')
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  login(req, res, next) {
    try {
      const { email, password } = req.body

      if (!email || !String(email).trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is required!')
      }
      if (!password || !String(password).trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is required!')
      }

      ValidateCores.validateEmail(email, 'Invalid email format!')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export const authValidator = new AuthValidator()
