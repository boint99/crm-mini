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
      const { refreshToken, ...data } = result

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })

      new SuccessResponse({ res, data, message: 'Login successful.' })
    } catch (error) { next(error) }
  }

  // POST /api/auth/refresh-token
  static async refreshToken(req, res, next) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken
      const result = await authService.refreshToken({ refreshToken: token })
      new SuccessResponse({ res, data: result, message: 'Token refreshed successfully.' })
    } catch (error) { next(error) }
  }

  // POST /api/auth/logout (protected)
  static async logout(req, res, next) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken
      const result = await authService.logout({ refreshToken: token })

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })

      new SuccessResponse({ res, data: result, message: 'Logged out successfully.' })
    } catch (error) { next(error) }
  }

  // POST /api/auth/logout-all (protected)
  static async logoutAll(req, res, next) {
    try {
      const result = await authService.logoutAll(req.user.userId)

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })

      new SuccessResponse({ res, data: result, message: 'Logged out from all devices.' })
    } catch (error) { next(error) }
  }

  static async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body)
      new SuccessResponse({ res, data: result, message: 'Password reset successfully.' })
    } catch (error) { next(error) }
  }

  // POST /api/auth/setup-superadmin
  static async setupSuperAdmin(req, res, next) {
    try {
      const result = await authService.setupSuperAdmin(req.body)
      new CreatedResponse({ res, data: result, message: 'Superadmin account created successfully.' })
    } catch (error) { next(error) }
  }
}

export const authController = AuthController
