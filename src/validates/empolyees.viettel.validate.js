
import { ALLOWED_EMAIL_DOMAINS, ALLOWED_STATUS } from '../utils/constants.js'
import ValidateCore from '../core/validate.core.js'
import ValidateCores from '../core/validate.core.js'

class EmployeesViettelValidate extends ValidateCore {
  // Validate create employee
  static create(req, res, next) {
    try {
      const data = req.body
      ValidateCores.validateStringLength(
        data.VIETTEL_CODE, 6,
        'Viettel code must be 6 characters or more!'
      )

      ValidateCores.validateEnum(data.STATUS, ALLOWED_STATUS)

      if (data.EMPLOYEE_ID !== undefined && data.EMPLOYEE_ID !== null) {
        ValidateCores.validateId(data.EMPLOYEE_ID, 'Employee ID is invalid!.')
      }

      if (data.VIETTEL_EMAIL) {
        ValidateCores.validateEmail(data.VIETTEL_EMAIL, 'Viettel email is invalid!.')
        ValidateCores.validateEmailDomain(
          data.VIETTEL_EMAIL, ALLOWED_EMAIL_DOMAINS,
          'Viettel email domain is not allowed!.'
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
      ValidateCores.validateId(data.VIETTEL_ID, 'Viettel ID is required!.')

      if (data.VIETTEL_CODE !== undefined) {
        ValidateCores.validateStringLength(data.VIETTEL_CODE, 6, 'Viettel code must be 6 characters or more!')
      }
      if (data.STATUS !== undefined) {
        ValidateCores.validateEnum(data.STATUS, ALLOWED_STATUS)
      }
      if (data.VIETTEL_ID !== undefined && data.VIETTEL_ID !== null) {
        ValidateCores.validateId(data.VIETTEL_ID, 'Viettel ID is invalid!.')
      }
      if (data.VIETTEL_EMAIL) {
        ValidateCores.validateEmail(data.VIETTEL_EMAIL, 'Viettel email is invalid!.')
        ValidateCores.validateEmailDomain(data.VIETTEL_EMAIL, ALLOWED_EMAIL_DOMAINS, 'Viettel email domain is not allowed!.')
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
      ValidateCores.validateId(id, 'Viettel ID is required!.')

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default EmployeesViettelValidate