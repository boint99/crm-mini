import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import ip from 'ip'
import { validate, version } from 'uuid'

class ValidateCores {
  static validateIdUuid(id, message = 'Invalid ID (UUIDv7 required)') {
    if (!id || typeof id !== 'string' || !validate(id) || version(id) !== 7) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message)
    }
  }
  // Check Id
  static validateId(id, message) {
    if (id) {
      if (typeof id !== 'string') {
        throw new ApiError(StatusCodes.BAD_REQUEST, message)
      }
    }
  }

  static  validateCreate (id, message = 'Invalid') {
    if (!id || isNaN(id)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message)
    }
  }

  //Check the minimum level of the chain.
  static validateStringLength(value, min = 3, message) {
    if (value !== undefined && value.trim().length < min) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message)
    }
  }

  // Check if the value is in the allowed list.
  static validateEnum(value, allowedValues, message = 'Invalid status value.') {
    if (value && !allowedValues.includes(value)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message)
    }
  }

  // Check email syntax.
  static validateEmail(email, message = 'EMAIL is invalid!.') {
    if (email === undefined || email === null || email === '') return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(email).trim())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message)
    }
  }

  // Check if email domain is in allowed list. Skip when list is empty.
  static validateEmailDomain(email, allowedDomains = [], message = 'EMAIL domain is not allowed!.') {
    if (email === undefined || email === null || email === '') return
    if (!Array.isArray(allowedDomains) || allowedDomains.length === 0) return

    const parts = String(email).trim().split('@')
    const domain = parts.length === 2 ? parts[1].toLowerCase() : ''
    const normalizedAllowedDomains = allowedDomains.map(item => String(item).toLowerCase())

    if (!domain || !normalizedAllowedDomains.includes(domain)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message)
    }
  }

  static parseSubnet(network) {
    try {
      const subnet = ip.cidrSubnet(String(network).trim())
      return subnet?.subnetMaskLength ? subnet : null
    } catch {
      return null
    }
  }

  static normalizeSubnet(subnetOrNetwork) {
    if (!subnetOrNetwork) return null

    if (typeof subnetOrNetwork === 'string') {
      return this.parseSubnet(subnetOrNetwork)
    }

    if (typeof subnetOrNetwork.contains === 'function') {
      return subnetOrNetwork
    }

    if (subnetOrNetwork.networkAddress && subnetOrNetwork.subnetMask) {
      return this.parseSubnet(`${subnetOrNetwork.networkAddress}/${subnetOrNetwork.subnetMask}`)
    }

    return null
  }

  static validateRequiredString(value, message) {
    if (value === undefined || value === null || !String(value).trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, message)
    }
  }

  static validateGatewayInSubnet(gateway, subnetOrNetwork) {
    const trimmedGateway = String(gateway).trim()
    const subnet = this.normalizeSubnet(subnetOrNetwork)

    if (!subnet) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Network must be a valid CIDR!')
    }

    if (!ip.isV4Format(trimmedGateway)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Default gateway must be a valid IPv4 address!')
    }

    if (!subnet.contains(trimmedGateway)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Default gateway must be within network range!')
    }

    if (
      trimmedGateway === subnet.networkAddress ||
      trimmedGateway === subnet.broadcastAddress
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Default gateway cannot be network/broadcast address!')
    }
  }
}

export default ValidateCores