import ApiError from './ApiError.js'

export const ALLOWED_STATUS = ['ENABLE', 'DISABLED']

export const ALLOWED_EMAIL_DOMAINS = [
  // 'company.com',
  // 'gmail.com'
]

export const WHITELIST_DOMAINS = [
  // 'http://192.168.1.234:3000',
  // 'http://192.168.1.234:3001'
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
