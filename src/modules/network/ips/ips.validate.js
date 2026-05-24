import ValidateCores from '../../../validates/index.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../utils/ApiError.js'
import { ALLOWED_STATUS_NETWORK } from '../../../utils/constants.js'
import ip from 'ip'

class IpsValidate {
  // ================= COMMON =================
  static validateCommon(data) {
    const { host, vlanId, deviceType, employeeId, status } = data

    // VLAN
    ValidateCores.validateId(vlanId, 'ID is required!')
    if (!vlanId || isNaN(Number(vlanId))) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ID is invalid!')
    }

    // HOST (IP address)
    ValidateCores.validateRequiredString(host, 'Host is required!')
    const hostTrim = host.trim()

    if (!ip.isV4Format(hostTrim)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Host must be a valid IPv4 address!')
    }

    // DEVICE TYPE
    if (deviceType) {
      ValidateCores.validateStringLength(deviceType, 1, 'Device type must not be empty!')
    }

    // EMPLOYEE ID
    if (employeeId !== undefined && employeeId !== null) {
      if (isNaN(Number(employeeId))) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee ID must be a number!')
      }
    }

    // STATUS
    ValidateCores.validateEnum(status, ALLOWED_STATUS_NETWORK)

    return { host: hostTrim }
  }

  // ================= CREATE =================
  static async create(req, res, next) {
    try {
      IpsValidate.validateCommon(req.body)
      next()
    } catch (error) {
      next(error)
    }
  }

  // ================= UPDATE =================
  static async update(req, res, next) {
    try {
      const { id } = req.body
      ValidateCores.validateIdUuid(id, 'Id is required!')
      IpsValidate.validateCommon(req.body)
      next()
    } catch (error) {
      next(error)
    }
  }

  // ================= DELETE =================
  static async delete(req, res, next) {
    try {
      const { id } = req.params
      ValidateCores.validateIdUuid(id, 'Id is required!')
      next()
    } catch (error) {
      next(error)
    }
  }
}

export const ipsValidate = IpsValidate
