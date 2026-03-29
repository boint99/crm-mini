import ValidateCores from '../core/validate.core.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { ALLOWED_STATUS_NETWORK } from '../utils/constants.js'
import ip from 'ip'

class IpsValidate {

  // ================= COMMON =================
  static validateCommon(data) {
    const { HOST, VLAN_ID, DEVICE_TYPE, EMPLOYEE_ID, STATUS } = data

    // VLAN
    ValidateCores.validateId(VLAN_ID, 'Vlan ID is required and must be a number!')

    // HOST (IP address)
    ValidateCores.validateRequiredString(HOST, 'Host is required!')
    const host = HOST.trim()

    if (!ip.isV4Format(host)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Host must be a valid IPv4 address!')
    }

    // DEVICE TYPE
    if (DEVICE_TYPE) {
      ValidateCores.validateStringLength(DEVICE_TYPE, 1, 'Device type must not be empty!')
    }

    // EMPLOYEE
    if (EMPLOYEE_ID) {
      ValidateCores.validateId(EMPLOYEE_ID, 'Employee ID is not valid!')
    }

    // STATUS
    ValidateCores.validateEnum(STATUS, ALLOWED_STATUS_NETWORK)

    return { host }
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
      const { IP_ID } = req.body

      ValidateCores.validateId(IP_ID, 'IP ID is required!')

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
      ValidateCores.validateId(id, 'IP ID is required!')
      next()
    } catch (error) {
      next(error)
    }
  }
}

export const ipsValidate = IpsValidate