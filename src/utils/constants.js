import ApiError from './ApiError.js'

export const ALLOWED_STATUS = ['ENABLE', 'DISABLED']

export const ALLOWED_STATUS_NETWORK = ['AVAILABLE', 'ASSIGNED', 'ACTIVE', 'INACTIVE', 'DISABLED', 'CONFLICT']

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


export const saltRoundsPassword = 10

export const accountDTO = (acc) => ({
  ACCOUNT_ID: acc.ACCOUNT_ID,
  ACCOUNT_NAME: acc.ACCOUNT_NAME,
  STATUS: acc.STATUS,
  IS_LOGIN: acc.IS_LOGIN,
  LOGIN: acc.LOGIN,
  DESCRIPTION: acc.DESCRIPTION ?? null,
  CREATED_AT: acc.CREATED_AT,
  UPDATED_AT: acc.UPDATED_AT,
  EMPLOYEE: acc.EMPLOYEE ?? null
})

export const removeDomain = (email) => {
  return email.split('@')[0]
}