import ValidateCores from '../core/validate.core.js'
import ip from 'ip'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { ALLOWED_STATUS_NETWORK } from '../utils/constants.js'
import { vlansModel } from '../models/vlans.model.js'

class VlansValidate {

  // ================= CREATE =================
  static async create(req, res, next) {
    try {
      const { VLAN_CODE, VLAN_NAME, NETWORK, DEFAULT_GATEWAY, STATUS } = req.body

      ValidateCores.validateId(VLAN_CODE, 'Vlan code is required and must be a number!')
      ValidateCores.validateRequiredString(VLAN_NAME, 'Vlan name is required!')
      ValidateCores.validateRequiredString(NETWORK, 'Network is required (e.g. 192.168.1.0/24)!')
      ValidateCores.validateRequiredString(DEFAULT_GATEWAY, 'Default gateway is required!')

      const subnet = ValidateCores.parseSubnet(NETWORK)
      if (!subnet) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Network must be a valid CIDR!')
      }

      ValidateCores.validateGatewayInSubnet(DEFAULT_GATEWAY, subnet)

      ValidateCores.validateEnum(STATUS, ALLOWED_STATUS_NETWORK)

      next()
    } catch (error) {
      next(error)
    }
  }

  // ================= UPDATE =================
  static async update(req, res, next) {
    try {
      const { VLAN_ID, VLAN_CODE, VLAN_NAME, NETWORK, DEFAULT_GATEWAY, STATUS } = req.body

      ValidateCores.validateId(VLAN_ID, 'Vlan ID is required!')

      // Validate optional fields
      if (VLAN_CODE !== undefined) {
        ValidateCores.validateId(VLAN_CODE, 'Vlan code must be a number!')
      }

      if (VLAN_NAME !== undefined) {
        ValidateCores.validateRequiredString(VLAN_NAME, 'Vlan name must not be empty!')
      }

      let subnet = null
      let finalNetwork = NETWORK

      if (NETWORK !== undefined) {
        ValidateCores.validateRequiredString(NETWORK, 'Network must not be empty!')

        subnet = ValidateCores.parseSubnet(NETWORK)
        if (!subnet) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Network must be a valid CIDR!')
        }
      }

      if (DEFAULT_GATEWAY !== undefined) {
        ValidateCores.validateRequiredString(DEFAULT_GATEWAY, 'Default gateway must not be empty!')

        if (!subnet) {
          const existingVlan = await vlansModel.findById(VLAN_ID)
          finalNetwork = existingVlan?.NETWORK
          subnet = finalNetwork ? ValidateCores.parseSubnet(finalNetwork) : null
        }

        if (!subnet || !finalNetwork) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot validate default gateway without a valid network!')
        }

        ValidateCores.validateGatewayInSubnet(DEFAULT_GATEWAY, subnet)
      }

      ValidateCores.validateEnum(STATUS, ALLOWED_STATUS_NETWORK)

      next()
    } catch (error) {
      next(error)
    }
  }

  // ================= DELETE =================
  static async delete(req, res, next) {
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