import { ALLOWED_STATUS } from '../../../utils/constants.js'
import ValidateCore from '../../../validates/index.js'

class ViettelBranchValidate extends ValidateCore {
  // Validate create
  static create(req, res, next) {
    try {
      const data = req.body
      ViettelBranchValidate.validateRequiredString(data.viettelBranchCode, 'Viettel branch code is required!')

      if (data.status !== undefined) {
        ViettelBranchValidate.validateEnum(data.status, ALLOWED_STATUS)
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate update
  static update(req, res, next) {
    try {
      const data = req.body
      ViettelBranchValidate.validateIdUuid(data.id, 'ID is required!')

      if (data.status !== undefined) {
        ViettelBranchValidate.validateEnum(data.status, ALLOWED_STATUS)
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate delete
  static delete(req, res, next) {
    try {
      const { id } = req.params
      ViettelBranchValidate.validateIdUuid(id, 'ID is required!')
      next()
    } catch (error) {
      next(error)
    }
  }
}

export default ViettelBranchValidate
