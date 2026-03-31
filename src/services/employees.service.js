import { ALLOWED_EMAIL_DOMAINS, ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { employeesModel } from '../models/employees.model.js'
import { positionsModel } from '../models/postisions.model.js'
import FkValidator from '../core/fk.validator.core.js'
import ValidateCores from '../core/validate.core.js'
import { employeesViettelModel } from '../models/employees.viettel.model.js'

class EmployeesServices {
  /**
   * Create a new employee
   */
  async create(data) {
    // 1. Check required fields
    if (!data.EMPLOYEE_CODE || !data.EMPLOYEE_CODE.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The employee code cannot be left blank!')
    }
    // 2. Check employee code length must be 6 characters
    if (data.EMPLOYEE_CODE.trim().length !== 6) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee code must be 6 characters!')
    }

    // 3. Check email syntax
    if (data.EMAIL) {
      ValidateCores.validateEmail(data.EMAIL)
      ValidateCores.validateEmailDomain(data.EMAIL, ALLOWED_EMAIL_DOMAINS)
    }

    // 4. FK checks
    if (data.POSITION_ID) {
      await FkValidator.validate(data.POSITION_ID, positionsModel)
    }

    if (data.VIETTEL_ID) {
      await FkValidator.validate(data.VIETTEL_ID, employeesViettelModel)
    }

    // 5. Check existence
    const isExisted = await employeesModel.findByCode(data.EMPLOYEE_CODE.trim())
    if (isExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This employee code is already taken!')
    }

    // 6. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    return await employeesModel.create(data)
  }

  /**
   * Update Employee details
   */
  async update(data) {
    const { EMPLOYEE_ID, ...payload } = data

    // 1. Verify existence
    const checkId = await employeesModel.findById(EMPLOYEE_ID)
    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
    }

    // 2. Logic check for Employee Code
    if (payload.EMPLOYEE_CODE) {
      const trimmedCode = payload.EMPLOYEE_CODE.trim()
      if (!trimmedCode) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The employee code cannot be left blank!')
      }

      const isExisted = await employeesModel.findByCode(trimmedCode)

      if (isExisted && isExisted.EMPLOYEE_ID !== EMPLOYEE_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'This employee code is already taken by another employee!')
      }
      payload.EMPLOYEE_CODE = trimmedCode
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)

    // FK checks
    if (payload.POSITION_ID) {
      await FkValidator.validate(payload.POSITION_ID, positionsModel, 'Position ID')
    }
    return await employeesModel.updateById(EMPLOYEE_ID, payload)
  }

  /**
   * Delete an employee
   */
  async delete(id) {
    const idToNumber = Number(id)

    if (isNaN(idToNumber) || idToNumber <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee id is required!')
    }

    const existing = await employeesModel.findById(idToNumber)

    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
    }

    return await employeesModel.deleteById(idToNumber)
  }
}

// Export an instance of the class
export const employeesServices = new EmployeesServices()