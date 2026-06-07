/**
 * Set a cookie in the browser
 * @param {string} name - Name of the cookie
 * @param {string} value - Value of the cookie
 * @param {number} days - Expiration time in days (defaults to 7)
 */
export const setCookie = (name, value, days = 7) => {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `; expires=${date.toUTCString()}`
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`
}

/**
 * Get a cookie value by name
 * @param {string} name - Name of the cookie
 * @returns {string} Value of the cookie, or empty string if not found
 */
export const getCookie = (name) => {
  const nameEQ = `${name}=`
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length))
  }
  return ''
}

/**
 * Delete a cookie by name
 * @param {string} name - Name of the cookie to delete
 */
export const deleteCookie = (name) => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
}
