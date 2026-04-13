
class OtpService {
  static async generateOtp(data) {
    return { otp: Math.floor(100000 + Math.random() * 900000).toString() }
  }

}

export const otpService = OtpService