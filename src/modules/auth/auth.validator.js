import ValidateCores from '../../validates/index.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'

class AuthValidator extends ValidateCores {
  register(req, res, next) {
    try {
      const { email, password, user_name, otp } = req.body

      // Validate required fields
      if (!email || !String(email).trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is required!')
      }
      if (!password || !String(password).trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is required!')
      }
      if (!user_name || !String(user_name).trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Username is required!')
      }
      if (!otp) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP is required!')
      }

      // Validate email format using base static validator
      ValidateCores.validateEmail(email, 'Invalid email format!')

      // Validate username length (6-50 chars as per auth.md)
      const trimmedUsername = String(user_name).trim()
      if (trimmedUsername.length < 6 || trimmedUsername.length > 50) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Username must be between 6 and 50 characters!')
      }

      // Validate password strength: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
      const trimmedPassword = String(password).trim()
      if (trimmedPassword.length < 8) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Password must be >= 8 chars!')
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/
      if (!passwordRegex.test(trimmedPassword)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Password must contain uppercase, lowercase, number, and special character!')
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
