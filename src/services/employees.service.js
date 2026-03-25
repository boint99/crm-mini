import { ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { employeesModel } from '../models/employees.model.js'
import { positionsModel } from '../models/postisions.model.js'

class EmployeesServices {
  /**
   * Create a new employee
   */
  async create(data) {
    // 1. Check required fields
    if (!data.EMPLOYEE_CODE || !data.EMPLOYEE_CODE.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The name cannot be left blank!')
    }

    // // 2. Check existence
    const isExisted = await employeesModel.findByName(data.EMPLOYEE_CODE.trim())

    if (isExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken!')
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    if (data.POSITION_ID !== undefined && data.POSITION_ID !== null) {
      const position = await positionsModel.findById(Number(data.POSITION_ID))
      if (!position) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Position is not found!')
      }
    }

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
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The Employee code cannot be left blank!')
      }

      const isExisted = await employeesModel.findByName(trimmedCode)

      if (isExisted && isExisted.EMPLOYEE_ID !== EMPLOYEE_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'This code is already taken by another Employee!')
      }
      payload.EMPLOYEE_CODE = trimmedCode
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)

    if (payload.POSITION_ID !== undefined && payload.POSITION_ID !== null) {
      const position = await positionsModel.findById(Number(payload.POSITION_ID))
      if (!position) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Position is not found!')
      }
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