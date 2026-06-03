
import { ALLOWED_EMAIL_DOMAINS, ALLOWED_STATUS } from '../../utils/constants.js'
import ValidateCore from '../../validates/index.js'
import ValidateCores from '../../validates/index.js'

class EmployeesViettelValidate extends ValidateCore {
  // Validate create employee
  static create(req, res, next) {
    try {
      const data = req.body
      ValidateCores.validateStringLength(
        data.viettelCode, 6,
        'Viettel code must be 6 characters or more!'
      )

      ValidateCores.validateEnum(data.STATUS, ALLOWED_STATUS)

      if (data.employeeCode !== undefined && data.employeeCode !== null) {
        ValidateCores.validateId(data.employeeCode, 'Employee ID is invalid!.')
      }

      if (data.viettelEmail) {
        ValidateCores.validateEmail(data.viettelEmail, 'Viettel email is invalid!.')
        ValidateCores.validateEmailDomain(
          data.viettelEmail, ALLOWED_EMAIL_DOMAINS,
          'Viettel email domain is not allowed!.'
        )
      }

      if (data.employeeCode) {
        ValidateCores.validateId(data.employeeCode, 'Employee code is invalid!.')
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
      ValidateCores.validateIdUuid(data.id, 'Id is required!.')

      if (data.viettelCode !== undefined) {
        ValidateCores.validateStringLength(data.viettelCode, 6, 'Viettel code must be 6 characters or more!')
      }
      if (data.status !== undefined) {
        ValidateCores.validateEnum(data.status, ALLOWED_STATUS)
      }
      if (data.viettelEmail) {
        ValidateCores.validateEmail(data.viettelEmail, 'Viettel email is invalid!.')
        ValidateCores.validateEmailDomain(data.viettelEmail, ALLOWED_EMAIL_DOMAINS, 'Viettel email domain is not allowed!.')
      }

      if (data.viettelBranchId) {
        ValidateCores.validateIdUuid(data.viettelBranchId, 'Viettel branch ID is invalid!.')
      }

      if (data.employeeCode) {
        ValidateCores.validateId(data.employeeCode, 'Employee code is invalid!.')
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
