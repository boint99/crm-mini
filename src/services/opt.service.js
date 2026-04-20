import { otpModel } from '../models/otp.model.js'
import { emailTemplate } from '../template/email.template.js'

class OtpService {
  static async generateOtp(data) {
    const { EMAIL } = data
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const title = 'Your OTP Code'
    const subject = 'Your OTP Code'
    const expiryMinutes = 5
    const expiredAt = new Date(Date.now() + expiryMinutes * 60 * 1000)
    const otpType = 'REGISTER'

    // send email using existing emailTemplate (which internally calls sendMail)
    const mailResult = await emailTemplate({
      to: EMAIL,
      subject,
      title,
      body: `Your OTP code is: <b>${otp}</b>. It will expire in ${expiryMinutes} minutes.`,
      buttonText: null,
      buttonUrl: null
    })

    if (!mailResult || mailResult.success === false) {
      const errMsg = mailResult && mailResult.error ? mailResult.error : 'unknown error'
      throw new Error('Failed to send OTP email: ' + errMsg)
    }

    const generateOtp = {
      OTP_CODE: otp,
      OTP_TYPE: otpType,
      EMAIL: EMAIL,
      EXPIRED_AT: expiredAt
    }

    const result = await otpModel.generateOtp(generateOtp)
    return result
  }

}

export const otpService = OtpService