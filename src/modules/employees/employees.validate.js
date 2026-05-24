import { ALLOWED_EMAIL_DOMAINS, ALLOWED_STATUS } from '../../utils/constants.js'
import ValidateCore from '../../validates/index.js'

class EmployeesValidate extends ValidateCore {
  // Validate create employee
  static create(req, res, next) {
    try {
      const data = req.body

      EmployeesValidate.validateRequiredString(data.employeeCode, 'Employee code is required!')
      EmployeesValidate.validateRequiredString(data.firstName, 'First name is required!')
      EmployeesValidate.validateRequiredString(data.lastName, 'Last name is required!')
      EmployeesValidate.validateEnum(data.status, ALLOWED_STATUS)

      if (data.positionId !== undefined && data.positionId !== null) {
        EmployeesValidate.validateId(data.positionId, 'Position ID is invalid!')
      }

      if (data.email) {
        EmployeesValidate.validateEmail(data.email, 'Email is invalid!')
        EmployeesValidate.validateEmailDomain(
          data.email,
          ALLOWED_EMAIL_DOMAINS,
          'Email domain is not allowed!'
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
      EmployeesValidate.validateIdUuid(data.id, 'Employee ID (UUID) is required!')

      if (data.employeeCode !== undefined) {
        EmployeesValidate.validateRequiredString(data.employeeCode, 'Employee code cannot be empty!')
      }
      if (data.status !== undefined) {
        EmployeesValidate.validateEnum(data.status, ALLOWED_STATUS)
      }
      if (data.positionId !== undefined && data.positionId !== null) {
        EmployeesValidate.validateId(data.positionId, 'Position ID is invalid!')
      }
      if (data.email) {
        EmployeesValidate.validateEmail(data.email, 'Email is invalid!')
        EmployeesValidate.validateEmailDomain(data.email, ALLOWED_EMAIL_DOMAINS, 'Email domain is not allowed!')
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
      EmployeesValidate.validateIdUuid(id, 'Employee ID (UUID) is required!')
      next()
    } catch (error) {
      next(error)
    }
  }
}

export default EmployeesValidate
