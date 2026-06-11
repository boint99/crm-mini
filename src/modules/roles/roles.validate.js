import { ALLOWED_STATUS } from '../../utils/constants.js'
import ValidateCore from '../../validates/index.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'

class RolesValidate extends ValidateCore {
  static create(req, res, next) {
    try {
      const data = req.body
      RolesValidate.validateRequiredString(data.roleName, 'roleName is required!')
      RolesValidate.validateStringLength(data.roleName, 3, 'roleName must be 3 characters or more!')

      RolesValidate.validateRequiredString(data.roleCode, 'roleCode is required!')
      RolesValidate.validateStringLength(data.roleCode, 3, 'roleCode must be 3 characters or more!')

      if (data.status !== undefined) {
        RolesValidate.validateEnum(data.status, ALLOWED_STATUS)
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  static update(req, res, next) {
    try {
      const data = req.body
      RolesValidate.validateIdUuid(data.id, 'Role ID (UUIDv7) is required!')

      if (data.roleName !== undefined) {
        RolesValidate.validateStringLength(data.roleName, 3, 'roleName must be 3 characters or more!')
      }

      if (data.roleCode !== undefined) {
        RolesValidate.validateRequiredString(data.roleCode, 'roleCode cannot be empty!')
        RolesValidate.validateStringLength(data.roleCode, 3, 'roleCode must be 3 characters or more!')
      }

      if (data.status !== undefined) {
        RolesValidate.validateEnum(data.status, ALLOWED_STATUS)
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  static delete(req, res, next) {
    try {
      const { id } = req.params
      RolesValidate.validateIdUuid(id, 'Role ID (UUIDv7) is required!')
      next()
    } catch (error) {
      next(error)
    }
  }

  static getPermissions(req, res, next) {
    try {
      const { id } = req.params
      RolesValidate.validateIdUuid(id, 'Role ID (UUIDv7) is required!')
      next()
    } catch (error) {
      next(error)
    }
  }

  static assignPermissions(req, res, next) {
    try {
      const { id } = req.params
      RolesValidate.validateIdUuid(id, 'Role ID (UUIDv7) is required!')
      
      const { perIds } = req.body
      if (!perIds || !Array.isArray(perIds)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Danh sách perIds phải là một mảng!')
      }

      for (const perId of perIds) {
        if (typeof perId !== 'number') {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'ID quyền hạn phải là kiểu số!')
        }
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default RolesValidate
