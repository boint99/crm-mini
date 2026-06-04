import jwt from 'jsonwebtoken'
import 'dotenv/config'

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change_this_secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change_this_refresh_secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

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
