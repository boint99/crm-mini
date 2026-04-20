import { authService } from '../services/auth.services.js'
import { CreatedResponse } from '../utils/SuccessResponse.js'

class AuthController {
  // post /api/auth/register
  static async register(req, res, next) {
    try {
      const result = await authService.register(req.body)
      new CreatedResponse({ res, data: result, message: 'Account registered successfully.' })
    } catch (error) { next(error) }
  }

  static async login(req, res, next) {
    try {
      const result = await authService.login(req.body)
      new CreatedResponse({ res, data: result, message: 'Login successful.' })
    } catch (error) { next(error) }
  }
}
export const authController = AuthController
