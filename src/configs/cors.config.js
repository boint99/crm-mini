import { StatusCodes } from 'http-status-codes'
import { WHITELIST_DOMAINS } from '../utils/constants.js'
import ApiError from '../utils/ApiError.js'

export const corsOptions = {
  origin: function (origin, callback) {
    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) return callback(null, true)

    if (!origin) return callback(null, true)

    if (origin.startsWith('http://192.168')) {
      return callback(null, true)
    }

    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    // ❌ Reject
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