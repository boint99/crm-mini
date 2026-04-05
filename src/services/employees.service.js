import { ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { employeesModel } from '../models/employees.model.js'
import { positionsModel } from '../models/postisions.model.js'
import { employeesViettelModel } from '../models/employees.viettel.model.js'
import { orgUnitsModel } from '../models/org.units.model.js'
import ServiceCore from '../core/service.core.js'

class EmployeesServices {
  /**
   * Shared validation: EMPLOYEE_CODE, EMAIL, STATUS, FK (POSITION_ID, VIETTEL_ID)
   * @param {object} data - payload to validate
   * @param {number|null} excludeId - EMPLOYEE_ID to exclude when checking code uniqueness (for update)
   */
  async checked(data, excludeId = null) {
    // 1. EMPLOYEE_CODE
    if (data.EMPLOYEE_CODE !== undefined) {
      const code = data.EMPLOYEE_CODE.trim()
      if (!code) throw new ApiError(StatusCodes.BAD_REQUEST, 'The employee code cannot be left blank!')
      if (code.length !== 6) throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee code must be 6 characters!')
      const existed = await employeesModel.findByCode(code)
      if (existed && existed.EMPLOYEE_ID !== excludeId) {
        throw new ApiError(StatusCodes.CONFLICT, 'This employee code is already taken!')
      }
      data.EMPLOYEE_CODE = code
    }

    // 2. EMAIL
    if (data.EMAIL) {
      const existedEmail = await employeesModel.findbyField(data.EMAIL, 'EMAIL')
      if (existedEmail && existedEmail.EMPLOYEE_ID !== excludeId) {
        throw new ApiError(StatusCodes.CONFLICT, 'This email is already taken!')
      }
    }

    // 3. STATUS
    if (data.STATUS !== undefined) {
      CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed: ${ALLOWED_STATUS.join(', ')}`)
    }

    // 4. FK: POSITION_ID
    if (data.POSITION_ID) {
      await ServiceCore.CheckFindbyId(
        data.POSITION_ID,
        positionsModel,
        'Position ID',
        'Position ID is invalid!'
      )
    }

    // 5. FK: VIETTEL_ID
    if (data.VIETTEL_ID) {
      await ServiceCore.CheckFindbyId(
        data.VIETTEL_ID,
        employeesViettelModel,
        'Viettel ID',
        'Viettel ID is invalid!'
      )
    }
    // 6. FK: ORG_UNIT_ID
    if (data.ORG_UNIT_ID) {
      await ServiceCore.CheckFindbyId(
        data.ORG_UNIT_ID,
        orgUnitsModel,
        'ORG_UNIT_ID',
        'ORG_UNIT_ID is invalid!'
      )
    }
  }

  /**
   * Create a new employee
   */
  async lists(query) {
    const { status } = query
    if (status) {
      CHECK_ENUM(status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status.')
    }
    return await employeesModel.listQuery(status)
  }

  async create(data) {
    if (!data.EMPLOYEE_CODE) throw new ApiError(StatusCodes.BAD_REQUEST, 'The employee code cannot be left blank!')
    if (!data.STATUS) throw new ApiError(StatusCodes.BAD_REQUEST, 'Status is required!')
    await this.checked(data)

    return await employeesModel.create(data)
  }

  /**
   * Update Employee details
   */
  async update(data) {
    const { EMPLOYEE_ID, ...payload } = data

    const existing = await employeesModel.findById(EMPLOYEE_ID)
    if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')

    await this.checked(payload, EMPLOYEE_ID)

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