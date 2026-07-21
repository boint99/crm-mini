import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config({ override: true })

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

function parseExpiresIn(val) {
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (trimmed.toLowerCase().endsWith('p')) {
      return trimmed.slice(0, -1) + 'm'
    }
    return trimmed
  }
  return val
}

const JWT_EXPIRES_IN = parseExpiresIn(process.env.JWT_ACCESS_EXPIRES_IN)
const JWT_REFRESH_EXPIRES_IN = parseExpiresIn(process.env.JWT_REFRESH_EXPIRES_IN)

/**
 * Ký Access Token
 * @param {Object} payload - { userId, accountName, ... }
 * @returns {string} JWT access token
 */
export function signAccessToken(payload) {
  return jwt.sign({ ...payload, type: 'access' }, JWT_ACCESS_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Verify Access Token
 * @param {string} token
 * @returns {Object} decoded payload
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET)
}

/**
 * Ký Refresh Token
 * @param {Object} payload - { userId }
 * @returns {string} JWT refresh token
 */
export function signRefreshToken(payload) {
  return jwt.sign({ ...payload, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN })
}

/**
 * Verify Refresh Token
 * @param {string} token
 * @returns {Object} decoded payload
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET)
}

/**
 * Decode token mà không verify (để lấy expiration)
 * @param {string} token
 * @returns {Object} decoded payload
 */
export function decodeToken(token) {
  return jwt.decode(token)
}
