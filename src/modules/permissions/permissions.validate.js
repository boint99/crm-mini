import { ALLOWED_STATUS } from '../../utils/constants.js'
import ValidateCore from '../../validates/index.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'

class PermissionsValidate extends ValidateCore {
  static create(req, res, next) {
    try {
      const data = req.body
      PermissionsValidate.validateRequiredString(data.perName, 'perName is required!')
      PermissionsValidate.validateStringLength(data.perName, 3, 'perName must be 3 characters or more!')
      
      PermissionsValidate.validateRequiredString(data.perCode, 'perCode is required!')
      PermissionsValidate.validateStringLength(data.perCode, 3, 'perCode must be 3 characters or more!')

      if (data.status !== undefined) {
        PermissionsValidate.validateEnum(data.status, ALLOWED_STATUS)
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  static update(req, res, next) {
    try {
      const data = req.body
      PermissionsValidate.validateIdUuid(data.id, 'Permission ID (UUIDv7) is required!')

      if (data.perName !== undefined) {
        PermissionsValidate.validateStringLength(data.perName, 3, 'perName must be 3 characters or more!')
      }

      if (data.perCode !== undefined) {
        PermissionsValidate.validateRequiredString(data.perCode, 'perCode cannot be empty!')
        PermissionsValidate.validateStringLength(data.perCode, 3, 'perCode must be 3 characters or more!')
      }

      if (data.status !== undefined) {
        PermissionsValidate.validateEnum(data.status, ALLOWED_STATUS)
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  static delete(req, res, next) {
    try {
      const { id } = req.params
      PermissionsValidate.validateIdUuid(id, 'Permission ID (UUIDv7) is required!')
      next()
    } catch (error) {
      next(error)
    }
  }
}

export default PermissionsValidate
