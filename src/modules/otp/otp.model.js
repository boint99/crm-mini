import ModelCore from '../../model/index.js'

class OtpModel extends ModelCore {
  constructor() {
    super('oTP_TOKENS', 'ID')
  }

  async generateOtp(data) {
    // Delete any existing OTP token for this email and type to prevent unique constraint violation
    await this.model.deleteMany({
      where: {
        email: data.email,
        otpType: data.otpType
      }
    })
    return await super.CREATE(data)
  }

  async findByField(value, field, includeDeleted = false) {
    return await super.FINDBYFIELD(value, field, includeDeleted)
  }

  async findByUnique(id, field = 'id', includeDeleted = false) {
    return await super.FINDBYUNIQUE(id, field, includeDeleted)
  }
}

export const otpModel = new OtpModel()
