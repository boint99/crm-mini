import ModelCore from '../core/model.core.js'

class OtpModel extends ModelCore {
  constructor() {
    super('oTP_TOKENS', 'ID')
  }

  async generateOtp(data) {
    return await super.CREATE(data)
  }
}

export const otpModel = new OtpModel()
