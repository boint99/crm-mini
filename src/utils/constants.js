import ApiError from './ApiError.js'

export const ALLOWED_STATUS = ['ENABLE', 'DISABLED']

export const ALLOWED_STATUS_NETWORK = ['AVAILABLE', 'ASSIGNED', 'ACTIVE', 'INACTIVE', 'DISABLED', 'CONFLICT']

export const ALLOWED_EMAIL_DOMAINS = [
  'vienthongact.vn',
  'actes.vn',
  'actids.vn'
]

export const WHITELIST_DOMAINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'https://it-heodesk.vienthongact.vn',
  'http://it-heodesk.vienthongact.vn'
]

/**
 * Validates if a value exists within a permitted list of constants (Enum).
 * @param {string|number} value - The value to be checked (e.g., payload.STATUS).
 * @param {Array<string|number>} allowedArray - An array of valid values (e.g., ['ENABLE', 'DISABLE']).
 * @param {number} code - The HTTP status code to return if validation fails.
 * @param {string} message - The custom error message.
 * @throws {ApiError} Throws an ApiError if the value is provided but not in the allowed list.
 */
export function CHECK_ENUM (value, allowedArray, code, message) {
  if (value && !allowedArray.includes(value)) {
    throw new ApiError(code, message)
  }
}


export const saltRoundsPassword = 10

export const removeDomain = (email) => {
  return email.split('@')[0]
}
