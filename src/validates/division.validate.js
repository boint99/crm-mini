
import { ALLOWED_STATUS } from '../utils/constants.js'
import BaseValidates from './BaseValidates.js'

class DivisionValidate extends BaseValidates {
  // Validate create company
  static create(req, res, next) {
    try {
      const data = req.body
      this.validateStringLength(data.DIVISION_NAME, 5, 'DIVISION_NAME is required!')
      this.validateEnum(data.STATUS, ALLOWED_STATUS)
      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate update company
  static update(req, res, next) {
    try {
      const data = req.body
      this.validateId(data.DIVISION_NAME, 'DIVISION_ID is required!.')

      if (data.DIVISION_NAME !== undefined) {
        this.validateStringLength(data.DIVISION_NAME, 5, 'DIVISION_NAME must be 5 characters or more!')
      }
      if (data.STATUS !== undefined) {
        this.validateEnum(data.STATUS, ALLOWED_STATUS)
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate delete division
  static delete(req, res, next) {
    try {
      const { DIVISION_ID } = req.body
      this.validateId(DIVISION_ID, 'DIVISION_ID is required!.')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default DivisionValidate