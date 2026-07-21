import { authService } from './auth.services.js'
import { CreatedResponse } from '../../utils/SuccessResponse.js'
import { SuccessResponse } from '../../utils/SuccessResponse.js'
import { environments } from '../../configs/env.config.js'
import { parseExpiresToMs } from '../../utils/jwt.js'

class AuthController {
  // POST /api/auth/register
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body)
      new CreatedResponse({ res, data: result, message: 'Account registered successfully.' })
    } catch (error) { next(error) }
  }

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body)
      const { refreshToken, ...data } = result

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: environments.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: parseExpiresToMs(environments.JWT_REFRESH_EXPIRES_IN)
      })

      new SuccessResponse({ res, data, message: 'Login successful.' })
    } catch (error) { next(error) }
  }

  // POST /api/auth/refresh-token
  async refreshToken(req, res, next) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken
      const result = await authService.refreshToken({ refreshToken: token })
      new SuccessResponse({ res, data: result, message: 'Token refreshed successfully.' })
    } catch (error) { next(error) }
  }

  // POST /api/auth/logout (protected)
  async logout(req, res, next) {
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
  async logoutAll(req, res, next) {
    try {
      await authService.logoutAll(req.user.userId)

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })

      new SuccessResponse({ res, data: [], message: 'Logged out from all devices.' })
    } catch (error) { next(error) }
  }

  async forgotPassword(req, res, next) {
    try {
      await authService.forgotPassword(req.body)
      new SuccessResponse({ res, message: 'Password reset successfully.' })
    } catch (error) { next(error) }
  }

  // POST /api/auth/setup-superadmin
  async setupSuperAdmin(req, res, next) {
    try {
      const result = await authService.setupSuperAdmin(req.body)
      new CreatedResponse({ res, data: result, message: 'Superadmin account created successfully.' })
    } catch (error) { next(error) }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.userId
      const { oldPassword, newPassword } = req.body
      await authService.changePassword(userId, oldPassword, newPassword)
      new SuccessResponse({ res, message: 'Password updated successfully. Please log in again.' })
    } catch (error) { next(error) }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.userId
      const data = await authService.getProfile(userId)
      new SuccessResponse({ res, data, message: 'Get profile successfully.' })
    } catch (error) { next(error) }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.userId
      const data = await authService.updateProfile(userId, req.body)
      new SuccessResponse({ res, data, message: 'Profile updated successfully.' })
    } catch (error) { next(error) }
  }
}

export const authController = new AuthController()
