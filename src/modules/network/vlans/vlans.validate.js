import ValidateCores from '../../../validates/index.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../utils/ApiError.js'
import { ALLOWED_STATUS_NETWORK, CHECK_ENUM } from '../../../utils/constants.js'
import { vlansModel } from './vlans.model.js'

class VlansValidate {
  static async List(req, res, next) {
    try {
      const query = req.query

      // 1. Validate query params
      const allowedFields = ['status', 'vlanId', 'search', 'all']
      const invalidKeys = Object.keys(query).filter(
        key => !allowedFields.includes(key)
      )

      if (invalidKeys.length > 0) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Invalid!'
        )
      }

      // 2. Validate status
      if (query.status) {
        const status = query.status.toUpperCase()
        const allowedStatus = ['ACTIVE', 'INACTIVE']
        CHECK_ENUM(status, allowedStatus, StatusCodes.BAD_REQUEST, 'Invalid status!')
        query.status = status
      }

      // 3. Validate vlanId
      if (query.vlanId) {
        const vlanCode = Number(query.vlanId)
        if (isNaN(vlanCode)) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'vlanId must be a number'
          )
        }
        query.vlanId = vlanCode
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  // ================= CREATE =================
  static async create(req, res, next) {
    try {
      const { vlanId, vlanName, network, defaultGateway, status } = req.body
      ValidateCores.validateIdNumber(vlanId, 'Vlan ID is required!')
      ValidateCores.validateRequiredString(vlanName, 'Vlan name is required!')
      ValidateCores.validateRequiredString(network, 'Network is required (e.g. 192.168.1.0/24)!')
      ValidateCores.validateRequiredString(defaultGateway, 'Default gateway is required!')

      const subnet = ValidateCores.parseSubnet(network)
      if (!subnet) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Network must be a valid CIDR!')
      }

      ValidateCores.validateGatewayInSubnet(defaultGateway, subnet)
      ValidateCores.validateEnum(status, ALLOWED_STATUS_NETWORK)

      next()
    } catch (error) {
      next(error)
    }
  }

  // ================= UPDATE =================
  static async update(req, res, next) {
    try {
      const { vlanId, vlanName, network, defaultGateway, status } = req.body

      ValidateCores.validateId(vlanId, 'Vlan ID is required!')

      // Validate optional fields
      if (vlanName !== undefined) {
        ValidateCores.validateRequiredString(vlanName, 'Vlan name must not be empty!')
      }

      let subnet = null
      let finalNetwork = network

      if (network !== undefined) {
        ValidateCores.validateRequiredString(network, 'Network must not be empty!')

        subnet = ValidateCores.parseSubnet(network)
        if (!subnet) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Network must be a valid CIDR!')
        }
      }

      if (defaultGateway !== undefined) {
        ValidateCores.validateRequiredString(defaultGateway, 'Default gateway must not be empty!')

        if (!subnet) {
          const existingVlan = await vlansModel.findByUnique(vlanId, 'vlanId')
          finalNetwork = existingVlan?.network
          subnet = finalNetwork ? ValidateCores.parseSubnet(finalNetwork) : null
        }

        if (!subnet || !finalNetwork) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot validate default gateway without a valid network!')
        }

        ValidateCores.validateGatewayInSubnet(defaultGateway, subnet)
      }

      ValidateCores.validateEnum(status, ALLOWED_STATUS_NETWORK)

      next()
    } catch (error) {
      next(error)
    }
  }

  // ================= DELETE =================
  static async delete(req, res, next) {
    try {
      const { id } = req.params
      ValidateCores.validateId(id, 'Id is required!')
      next()
    } catch (error) {
      next(error)
    }
  }
}

export const vlansValidate = VlansValidate
