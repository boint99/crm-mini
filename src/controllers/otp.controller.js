import { otpService } from '../services/opt.service.js'
import { SuccessResponse } from '../utils/SuccessResponse.js'

class OtpController {
  static async generateOtp(req, res, next) {
    try {
      const otp = await otpService.generateOtp(req.body)
      new SuccessResponse({ res, data: otp, message: 'OTP generated successfully.' })
    }
    catch (error) { next(error) }
  }
}
export const otpController =  OtpController
