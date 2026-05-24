import { ALLOWED_EMAIL_DOMAINS, ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import ServiceCore from '../../service/service.core.js'
import ValidateCores from '../../validates/index.js'
import { employeesViettelModel } from './employees.viettel.model.js'

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
      ValidateCores.validateEmail(data.VIETTEL_EMAIL, 'Viettel email is invalid!.')
      ValidateCores.validateEmailDomain(
        data.VIETTEL_EMAIL, ALLOWED_EMAIL_DOMAINS,
        'Viettel email domain is not allowed!.'
      )
      const isExistedEmail = await employeesViettelModel.findByName(data.VIETTEL_EMAIL.trim())
      if (isExistedEmail) {
        throw new ApiError(StatusCodes.CONFLICT, 'This Viettel email is already taken!')
      }

    }

    // 2. Check existence
    const isExisted = await employeesViettelModel.findByName(data.VIETTEL_CODE.trim())
    if (isExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This Viettel code is already taken!')
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    await ServiceCore.CheckFindbyId(data.EMPLOYEE_ID, employeesViettelModel, 'EMPLOYEE_ID', 'Employee ID is invalid!')


    return await employeesViettelModel.create(data)
  }

  /**
   * Update Employee VIETTEL details
   */
  async update(data) {
    const { VIETTEL_ID, ...payload } = data
    const idToNumber = Number(VIETTEL_ID)
    if (isNaN(idToNumber) || idToNumber <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Viettel ID must be a valid number!')
    }

    // 1. Verify existence
    const checkId = await employeesViettelModel.findById(idToNumber)
    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
    }

    // 2. Logic check for Viettel Code
    if (payload.VIETTEL_CODE) {
      const trimmedCode = payload.VIETTEL_CODE.trim()
      if (!trimmedCode) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The Viettel code cannot be left blank!')
      }

      const isExisted = await employeesViettelModel.findByName(trimmedCode)

      if (isExisted && isExisted.VIETTEL_ID !== idToNumber) {
        throw new ApiError(StatusCodes.CONFLICT, 'This Viettel code is already taken by another employee!')
      }
      payload.VIETTEL_CODE = trimmedCode
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)

    // FK checks
    if (payload.EMPLOYEE_ID) {
      await ServiceCore.CheckFindbyId(payload.EMPLOYEE_ID, employeesViettelModel, 'EMPLOYEE_ID', 'Employee ID is invalid!')
    }
    return await employeesViettelModel.updateById(idToNumber, payload)
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
