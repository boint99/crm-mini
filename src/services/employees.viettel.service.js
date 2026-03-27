import { ALLOWED_EMAIL_DOMAINS, ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import FkValidator from '../core/fk.validator.core.js'
import ValidateCores from '../core/validate.core.js'
import { employeesViettelModel } from '../models/employees.viettel.model.js'

class EmployeesViettelServices {
  /**
   * Create a new employee
   */
  async create(data) {
    // 1. Check required fields
    if (!data.VIETTEL_CODE || !data.VIETTEL_CODE.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The Viettel code cannot be left blank!')
    }
    // check Viettel code length must be 6 characters
    if (data.VIETTEL_CODE.trim().length !== 6) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Viettel code must be 6 characters!')
    }

    // check email syntax
    if (data.VIETTEL_EMAIL) {
      ValidateCores.validateEmail(data.VIETTEL_EMAIL)
      ValidateCores.validateEmailDomain(data.VIETTEL_EMAIL, ALLOWED_EMAIL_DOMAINS)
    }

    // 2. Check existence
    const isExisted = await employeesViettelModel.findByName(data.VIETTEL_CODE.trim())
    if (isExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This Viettel code is already taken!')
    }

    // 2. Check existence email
    const isExistedEmail = await employeesViettelModel.findByName(data.VIETTEL_EMAIL.trim())
    if (isExistedEmail) {
      throw new ApiError(StatusCodes.CONFLICT, 'This Viettel email is already taken!')
    }
    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    await FkValidator.validate(data.EMPLOYEE_ID, employeesViettelModel, 'EMPLOYEE_ID', 'Employee ID is invalid!')


    return await employeesViettelModel.create(data)
  }

  /**
   * Update Employee VIETTEL details
   */
  async update(data) {
    const { VIETTEL_ID, ...payload } = data

    // 1. Verify existence
    const checkId = await employeesViettelModel.findById(VIETTEL_ID)
    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
    }

    // 2. Logic check for Employee Code
    if (payload.EMPLOYEE_CODE) {
      const trimmedCode = payload.EMPLOYEE_CODE.trim()
      if (!trimmedCode) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The employee code cannot be left blank!')
      }

      const isExisted = await employeesViettelModel.findByName(trimmedCode)

      if (isExisted && isExisted.VIETTEL_ID !== VIETTEL_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'This employee code is already taken by another employee!')
      }
      payload.EMPLOYEE_CODE = trimmedCode
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)

    // FK checks
    if (payload.EMPLOYEE_ID) {
      await FkValidator.validate(payload.EMPLOYEE_ID, employeesViettelModel, 'EMPLOYEE_ID', 'Employee ID is invalid!')
    }
    return await employeesViettelModel.updateById(VIETTEL_ID, payload)
  }

  /**
   * Delete an employee
   */
  async delete(id) {
    const idToNumber = Number(id)

    if (isNaN(idToNumber) || idToNumber <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee id is required!')
    }

    const existing = await employeesViettelModel.findById(idToNumber)

    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
    }

    return await employeesViettelModel.deleteById(idToNumber)
  }
}

// Export an instance of the class
export const employeesViettelServices = new EmployeesViettelServices()