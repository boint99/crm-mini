import { StatusCodes } from 'http-status-codes'
import { WHITELIST_DOMAINS } from '../utils/constants.js'
import ApiError from '../utils/ApiError.js'

export const corsOptions = {
  origin: function (origin, callback) {
    // 1. Request không có origin (Postman, Same-Origin, Server-to-Server)
    if (!origin) return callback(null, true)

    // 2. Cho phép tất cả localhost (IPv4/IPv6), 127.0.0.1, IP mạng nội bộ và các Domain trong Whitelist
    const isAllowed =
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      WHITELIST_DOMAINS.some(domain => origin.startsWith(domain))

    if (isAllowed) {
      return callback(null, true)
    }

    // ❌ Chỉ từ chối trên Production khi Origin lạ không nằm trong danh sách
    return callback(
      new ApiError(
        StatusCodes.FORBIDDEN,
        `${origin} not allowed by our CORS Policy.`
      )
    )
  },

  credentials: true,
  optionsSuccessStatus: 200
}
