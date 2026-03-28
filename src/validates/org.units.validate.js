
import { ALLOWED_STATUS } from '../utils/constants.js'
import ValidateCore from '../core/validate.core.js'

class OrgUnitsValidate extends ValidateCore {
  // Validate create branch
  static create(req, res, next) {
    try {
      const data = req.body
      OrgUnitsValidate.validateStringLength(data.UNIT_NAME, 3, 'UNIT_NAME is required!')
      OrgUnitsValidate.validateStringLength(data.UNIT_CODE, 2, 'UNIT_CODE is required!')
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
      OrgUnitsValidate.validateId(data.ORG_UNIT_ID, 'ORG_UNIT_ID is required!.')

      if (data.UNIT_NAME !== undefined) {
        OrgUnitsValidate.validateStringLength(data.UNIT_NAME, 3, 'UNIT_NAME must be 3 characters or more!')
      }
      if (data.UNIT_CODE !== undefined) {
        OrgUnitsValidate.validateStringLength(data.UNIT_CODE, 2, 'UNIT_CODE must be 2 characters or more!')
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
      OrgUnitsValidate.validateId(id, 'ORG_UNIT_ID is required!.')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default OrgUnitsValidate