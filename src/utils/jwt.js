import jwt from 'jsonwebtoken'
import { environments } from '../configs/env.config.js'

export function parseExpiresIn(val) {
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (trimmed.toLowerCase().endsWith('p')) {
      return trimmed.slice(0, -1) + 'm'
    }
    return trimmed
  }
  return val
}

export function parseExpiresToMs(expiresIn) {
  if (typeof expiresIn === 'number') return expiresIn
  if (!expiresIn || typeof expiresIn !== 'string') return 7 * 24 * 60 * 60 * 1000

  const match = expiresIn.trim().match(/^(\d+)([smhdpy])?$/i)
  if (!match) return 7 * 24 * 60 * 60 * 1000

  const value = parseInt(match[1], 10)
  const unit = (match[2] || 's').toLowerCase()

  switch (unit) {
  case 's': return value * 1000
  case 'm':
  case 'p': return value * 60 * 1000
  case 'h': return value * 60 * 60 * 1000
  case 'd': return value * 24 * 60 * 60 * 1000
  case 'y': return value * 365 * 24 * 60 * 60 * 1000
  default: return value * 1000
  }
}

const JWT_EXPIRES_IN = parseExpiresIn(environments.JWT_EXPIRES_IN)
const JWT_REFRESH_EXPIRES_IN = parseExpiresIn(environments.JWT_REFRESH_EXPIRES_IN)

/**
 * Ký Access Token
 * @param {Object} payload - { userId, accountName, ... }
 * @returns {string} JWT access token
 */
export function signAccessToken(payload) {
  return jwt.sign({ ...payload, type: 'access' }, environments.JWT_ACCESS_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Verify Access Token
 * @param {string} token
 * @returns {Object} decoded payload
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, environments.JWT_ACCESS_SECRET)
}

/**
 * Ký Refresh Token
 * @param {Object} payload - { userId }
 * @returns {string} JWT refresh token
 */
export function signRefreshToken(payload) {
  return jwt.sign({ ...payload, type: 'refresh' }, environments.JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN })
}

/**
 * Verify Refresh Token
 * @param {string} token
 * @returns {Object} decoded payload
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, environments.JWT_REFRESH_SECRET)
}

/**
 * Decode token mà không verify (để lấy expiration)
 * @param {string} token
 * @returns {Object} decoded payload
 */
export function decodeToken(token) {
  return jwt.decode(token)
}
