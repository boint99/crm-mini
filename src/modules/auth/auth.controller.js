import { authService } from './auth.services.js'
import { CreatedResponse } from '../../utils/SuccessResponse.js'
import { SuccessResponse } from '../../utils/SuccessResponse.js'

class AuthController {
  // POST /api/auth/register
  static async register(req, res, next) {
    try {
      const result = await authService.register(req.body)
      new CreatedResponse({ res, data: result, message: 'Account registered successfully.' })
    } catch (error) { next(error) }
  }

  // POST /api/auth/login
  static async login(req, res, next) {
    try {
      const result = await authService.login(req.body)
      new SuccessResponse({ res, data: result, message: 'Login successful.' })
    } catch (error) { next(error) }
  }

  // POST /api/auth/refresh-token
  static async refreshToken(req, res, next) {
    try {
      const result = await authService.refreshToken(req.body)
      new SuccessResponse({ res, data: result, message: 'Token refreshed successfully.' })
    } catch (error) { next(error) }
  }

  // POST /api/auth/logout (protected)
  static async logout(req, res, next) {
    try {
      const result = await authService.logout(req.body)
      new SuccessResponse({ res, data: result, message: 'Logged out successfully.' })
    } catch (error) { next(error) }
  }

  // POST /api/auth/logout-all (protected)
  static async logoutAll(req, res, next) {
    try {
      const result = await authService.logoutAll(req.user.userId)
      new SuccessResponse({ res, data: result, message: 'Logged out from all devices.' })
    } catch (error) { next(error) }
  }
}

export const authController = AuthController
