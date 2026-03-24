
import { ALLOWED_STATUS } from '../utils/constants.js'
import BaseValidates from './BaseValidates.js'

class OrgUnitsValidate extends BaseValidates {
  // Validate create branch
  static create(req, res, next) {
    try {
      const data = req.body
      OrgUnitsValidate.validateStringLength(data.BRANCH_NAME, 3, 'BRANCH_NAME is required!')
      OrgUnitsValidate.validateEnum(data.STATUS, ALLOWED_STATUS)
      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate update branch
  static update(req, res, next) {
    try {
      const data = req.body
      OrgUnitsValidate.validateId(data.BRANCH_ID, 'BRANCH_ID is required!.')

      if (data.BRANCH_NAME !== undefined) {
        OrgUnitsValidate.validateStringLength(data.BRANCH_NAME, 3, 'BRANCH_NAME must be 3 characters or more!')
      }
      if (data.STATUS !== undefined) {
        OrgUnitsValidate.validateEnum(data.STATUS, ALLOWED_STATUS)
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
      OrgUnitsValidate.validateId(id, 'BRANCH_ID is required!.')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default OrgUnitsValidate