
import { ALLOWED_STATUS } from '../utils/constants.js'
import ValidateCore from '../core/validate.core.js'

class EmployeesValidate extends ValidateCore {
  // Validate create employee
  static create(req, res, next) {
    try {
      const data = req.body
      EmployeesValidate.validateStringLength(data.EMPLOYEE_CODE, 3, 'EMPLOYEE_CODE is required!')
      EmployeesValidate.validateEnum(data.STATUS, ALLOWED_STATUS)
      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate update employee
  static update(req, res, next) {
    try {
      const data = req.body
      EmployeesValidate.validateId(data.EMPLOYEE_ID, 'EMPLOYEE_ID is required!.')

      if (data.EMPLOYEE_CODE !== undefined) {
        EmployeesValidate.validateStringLength(data.EMPLOYEE_CODE, 3, 'EMPLOYEE_CODE must be 3 characters or more!')
      }
      if (data.STATUS !== undefined) {
        EmployeesValidate.validateEnum(data.STATUS, ALLOWED_STATUS)
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate delete employee
  static delete(req, res, next) {
    try {
      const { id } = req.params
      EmployeesValidate.validateId(id, 'EMPLOYEE_ID is required!.')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default EmployeesValidate