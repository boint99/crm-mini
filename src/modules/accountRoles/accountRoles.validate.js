import ValidateCore from '../../validates/index.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'

class AccountRolesValidate extends ValidateCore {
  static assign(req, res, next) {
    try {
      const data = req.body
      if (data.accountId === undefined || data.accountId === null || isNaN(Number(data.accountId))) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'accountId is required and must be a valid number!')
      }

      if (data.roleId === undefined || data.roleId === null || isNaN(Number(data.roleId))) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'roleId is required and must be a valid number!')
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  static revoke(req, res, next) {
    try {
      const { id } = req.params
      AccountRolesValidate.validateIdUuid(id, 'Account-Role assignment ID (UUIDv7) is required!')
      next()
    } catch (error) {
      next(error)
    }
  }
}

export default AccountRolesValidate
