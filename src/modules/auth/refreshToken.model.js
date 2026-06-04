import ModelCore from '../../model/index.js'

class RefreshTokenModel extends ModelCore {
  constructor() {
    super('rEFRESH_TOKENS', 'tokenId')
  }

  /**
   * Lưu refresh token vào database
   * @param {number} accountId
   * @param {string} token
   * @param {Date} expiresAt
   * @returns {Object}
   */
  async createRefreshToken(accountId, token, expiresAt) {
    return await super.CREATE({
      token,
      accountId: Number(accountId),
      expiresAt,
      isRevoked: false
    })
  }

  /**
   * Tìm refresh token theo token string (chưa bị revoke)
   * @param {string} token
   * @returns {Object|null}
   */
  async findByToken(token) {
    return await super.FINDBYFIELD_WHERE({
      token,
      isRevoked: false
    })
  }

  /**
   * Kiểm tra token có hợp lệ không (chưa hết hạn và chưa revoke)
   * @param {string} token
   * @returns {boolean}
   */
  async isTokenValid(token) {
    const record = await super.FINDBYFIELD_WHERE({
      token,
      isRevoked: false,
      expiresAt: { gt: new Date() }
    })
    return !!record
  }

  /**
   * Revoke refresh token (logout single device)
   * @param {string} token
   * @returns {Object|null}
   */
  async revokeToken(token) {
    const record = await this.findByToken(token)
    if (!record) return null

    return await super.UPDATE(record.tokenId, 'tokenId', {
      isRevoked: true
    })
  }

  /**
   * Revoke tất cả tokens của account (logout all devices)
   * @param {number} accountId
   * @returns {number} - Số tokens bị revoke
   */
  async revokeAllAccountTokens(accountId) {
    const { PRISMA } = await import('../../configs/db.config.js')
    const result = await PRISMA.rEFRESH_TOKENS.updateMany({
      where: {
        accountId: Number(accountId),
        isRevoked: false
      },
      data: {
        isRevoked: true
      }
    })
    return result.count
  }

  /**
   * Xóa refresh tokens đã hết hạn (cleanup job)
   * @returns {number} - Số records bị xóa
   */
  async deleteExpiredTokens() {
    const { PRISMA } = await import('../../configs/db.config.js')
    const result = await PRISMA.rEFRESH_TOKENS.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    })
    return result.count
  }
}

export const refreshTokenModel = new RefreshTokenModel()
