
import { ALLOWED_EMAIL_DOMAINS, ALLOWED_STATUS } from '../utils/constants.js'
import ValidateCore from '../core/validate.core.js'

class EmployeesValidate extends ValidateCore {
  // Validate create employee
  static create(req, res, next) {
    try {
      const data = req.body
      EmployeesValidate.validateStringLength(
        data.EMPLOYEE_CODE, 6,
        'Employee code must be 6 characters or more!'
      )

      EmployeesValidate.validateEnum(data.STATUS, ALLOWED_STATUS)

      if (data.POSITION_ID !== undefined && data.POSITION_ID !== null) {
        EmployeesValidate.validateId(data.POSITION_ID, 'Position ID is invalid!.')
      }

      if (data.EMAIL) {
        EmployeesValidate.validateEmail(data.EMAIL, 'Email is invalid!.')
        EmployeesValidate.validateEmailDomain(
          data.EMAIL, ALLOWED_EMAIL_DOMAINS,
          'Email domain is not allowed!.'
        )
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  // Validate update employee
  static update(req, res, next) {
    try {
      const data = req.body
      EmployeesValidate.validateId(data.EMPLOYEE_ID, 'Employee ID is required!.')

      if (data.EMPLOYEE_CODE !== undefined) {
        EmployeesValidate.validateStringLength(data.EMPLOYEE_CODE, 6, 'Employee code must be 6 characters or more!')
      }
      if (data.STATUS !== undefined) {
        EmployeesValidate.validateEnum(data.STATUS, ALLOWED_STATUS)
      }
      if (data.POSITION_ID !== undefined && data.POSITION_ID !== null) {
        EmployeesValidate.validateId(data.POSITION_ID, 'Position ID is invalid!.')
      }
      if (data.EMAIL) {
        EmployeesValidate.validateEmail(data.EMAIL, 'Email is invalid!.')
        EmployeesValidate.validateEmailDomain(data.EMAIL, ALLOWED_EMAIL_DOMAINS, 'Email domain is not allowed!.')
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
      EmployeesValidate.validateId(id, 'Employee ID is required!.')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default EmployeesValidate