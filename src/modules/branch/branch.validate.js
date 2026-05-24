
import { ALLOWED_STATUS } from '../../utils/constants.js'
import ValidateCore from '../../validates/index.js'

class BranchesValidate extends ValidateCore {
  // Validate create branch
  static create(req, res, next) {
    try {
      const data = req.body
      BranchesValidate.validateStringLength(data.branchCode, 2, 'Branch code is required!')
      BranchesValidate.validateStringLength(data.branchName, 3, 'Branch name is required!')

      BranchesValidate.validateEnum(data.status, ALLOWED_STATUS)
      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate update branch
  static update(req, res, next) {
    try {
      const data = req.body
      BranchesValidate.validateId(data.id, 'Branch ID is required!.')

      if (data.branchCode !== undefined) {
        BranchesValidate.validateStringLength(data.branchCode, 2, 'Branch code must be 2 characters or more!')
      }
      if (data.branchName !== undefined) {
        BranchesValidate.validateStringLength(data.branchName, 3, 'Branch name must be 3 characters or more!')
      }
      if (data.status !== undefined) {
        BranchesValidate.validateEnum(data.status, ALLOWED_STATUS)
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate delete branch
  static delete(req, res, next) {
    try {
      const { id } = req.params
      BranchesValidate.validateId(id, 'Branch ID is required!.')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default BranchesValidate
