import ValidateCores from '../core/validate.core.js'
import ip from 'ip'
import ApiError from '../utils/ApiError.js'
import { ALLOWED_STATUS_NETWORK } from '../utils/constants.js'

class VlansValidate {

  // ================= CREATE =================
  static create(req, res, next) {
    try {
      const { VLAN_CODE, VLAN_NAME, NETWORK, DEFAULT_GATEWAY, STATUS } = req.body

      ValidateCores.validateId(VLAN_CODE, 'Vlan code is required and must be a number!')
      ValidateCores.validateString(VLAN_NAME, 'Vlan name is required and must be a string!')

      if (!NETWORK) {
        throw new ApiError('Network is required (e.g. 192.168.1.0/24)')
      }

      const subnet = ip.cidrSubnet(NETWORK.trim())
      if (!subnet || !subnet.subnetMaskLength) {
        throw new ApiError('Network must be a valid CIDR')
      }

      if (!DEFAULT_GATEWAY) {
        throw new ApiError('Default gateway is required')
      }

      if (!ip.isV4Format(DEFAULT_GATEWAY.trim())) {
        throw new ApiError('Default gateway must be a valid IP')
      }

      if (!subnet.contains(DEFAULT_GATEWAY.trim())) {
        throw new ApiError('Default gateway must be within network range!')
      }

      if (
        DEFAULT_GATEWAY.trim() === subnet.networkAddress ||
        DEFAULT_GATEWAY.trim() === subnet.broadcastAddress
      ) {
        throw new ApiError('Default gateway cannot be network/broadcast address!')
      }

      ValidateCores.validateEnum(STATUS, ALLOWED_STATUS_NETWORK)

      next()
    } catch (error) {
      next(error)
    }
  }

  // ================= UPDATE =================
  static update(req, res, next) {
    try {
      const { VLAN_ID, VLAN_CODE, VLAN_NAME, NETWORK, DEFAULT_GATEWAY, STATUS } = req.body

      ValidateCores.validateId(VLAN_ID, 'Vlan ID is required!')

      // Validate optional fields
      if (VLAN_CODE !== undefined) {
        ValidateCores.validateId(VLAN_CODE, 'Vlan code must be a number!')
      }

      if (VLAN_NAME !== undefined) {
        ValidateCores.validateStringLength(VLAN_NAME, 'Vlan name must be a string!')
      }

      let subnet = null

      if (NETWORK !== undefined) {
        subnet = ip.cidrSubnet(NETWORK.trim())
        if (!subnet || !subnet.subnetMaskLength) {
          throw new ApiError('Network must be a valid CIDR')
        }
      }

      if (DEFAULT_GATEWAY !== undefined) {
        if (!ip.isV4Format(DEFAULT_GATEWAY.trim())) {
          throw new ApiError('Default gateway must be a valid IP')
        }

        // Nếu có NETWORK thì check cùng subnet
        if (NETWORK !== undefined) {
          if (!subnet.contains(DEFAULT_GATEWAY.trim())) {
            throw new ApiError('Default gateway must be within network range!')
          }

          if (
            DEFAULT_GATEWAY.trim() === subnet.networkAddress ||
            DEFAULT_GATEWAY.trim() === subnet.broadcastAddress
          ) {
            throw new ApiError('Default gateway cannot be network/broadcast address!')
          }
        }
      }

      ValidateCores.validateEnum(STATUS, ALLOWED_STATUS_NETWORK)

      next()
    } catch (error) {
      next(error)
    }
  }

  // ================= DELETE =================
  static delete(req, res, next) {
    try {
      const { id } = req.params

      ValidateCores.validateId(id, 'Vlan ID is required!')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export const vlansValidate = VlansValidate