import { ALLOWED_EMAIL_DOMAINS, ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import ValidateCores from '../../validates/index.js'
import { employeesViettelModel } from './employees.viettel.model.js'
import { employeesModel } from '../employees/employees.model.js'
import { viettelBranchModel } from './viettelBranch/viettelBranch.model.js'

class EmployeesViettelServices {

  static async _checkData(viettelCode, viettelEmail, employeeCode = null, excludeViettelId = null) {
    // validate required
    if (!viettelCode || !viettelCode.trim()) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Viettel code is required!'
      )
    }

    if (!viettelEmail || !viettelEmail.trim()) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Viettel email is required!'
      )
    }

    ValidateCores.validateEmail(viettelEmail, 'Viettel email is invalid!')
    ValidateCores.validateEmailDomain(
      viettelEmail,
      ALLOWED_EMAIL_DOMAINS,
      'Viettel email domain is not allowed!'
    )

    // check duplicate viettel code
    const checkViettelCode = await employeesViettelModel.findByName(viettelCode, 'viettelCode')
    if (checkViettelCode && checkViettelCode.viettelId !== excludeViettelId) {
      throw new ApiError(StatusCodes.CONFLICT, 'This Viettel code is already taken!')
    }

    // check duplicate viettel email
    const checkViettelEmail = await employeesViettelModel.findByName(viettelEmail, 'viettelEmail')
    if (checkViettelEmail && checkViettelEmail.viettelId !== excludeViettelId) {
      throw new ApiError(StatusCodes.CONFLICT, 'This Viettel email is already taken!')
    }

    // check employee
    let findEmployee = null
    if (employeeCode) {
      findEmployee = await employeesModel.findByUnique(employeeCode, 'employeeCode')
      if (!findEmployee) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee not found!')
      }

      // Check if employee is already linked to a Viettel account
      const existingLink = await employeesViettelModel.findByField(findEmployee.employeeId, 'employeeId')
      if (existingLink && existingLink.viettelId !== excludeViettelId) {
        throw new ApiError(StatusCodes.CONFLICT, 'This employee is already linked to another Viettel account!')
      }
    }

    return findEmployee
  }

  async Lists() {
    return await employeesViettelModel.lists()
  }

  /**
   * Create a new employee viettel
   */
  async create(data) {
    const viettelCode = (data.viettelCode || '').trim()
    const viettelEmail = (data.viettelEmail || '').trim()
    const employeeCode = data.employeeCode
    const viettelPosition = data.viettelPosition || null
    const viettelBranchId = data.viettelBranchId || null
    const status = data.status || 'ENABLE'

    // employeeCode is required to link
    if (!employeeCode) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee code is required!')
    }

    const findEmployee = await EmployeesViettelServices._checkData(
      viettelCode,
      viettelEmail,
      employeeCode
    )

    // check status enum
    CHECK_ENUM(status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    const newRecord = await employeesViettelModel.create({
      viettelCode,
      viettelEmail,
      viettelPosition,
      viettelBranchId: viettelBranchId ? Number(viettelBranchId) : null,
      employeeId: findEmployee.employeeId,
      status
    })

    return newRecord
  }

  /**
   * Update Employee VIETTEL details
   */
  async update(data) {
    const { id, viettelCode, viettelEmail, viettelPosition, viettelBranchId, employeeCode, status } = data

    // 1. Verify existence using uuid_v7 'id'
    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ID is required!')
    }
    const checkRecord = await employeesViettelModel.findByUnique(id, 'id')
    if (!checkRecord) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
    }
    const viettelId = checkRecord.viettelId

    const payload = {}

    // 2. Logic check for Viettel Code
    if (viettelCode !== undefined) {
      const trimmedCode = String(viettelCode).trim()
      if (!trimmedCode) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The Viettel code cannot be left blank!')
      }

      const isExisted = await employeesViettelModel.findByName(trimmedCode, 'viettelCode')
      if (isExisted && isExisted.viettelId !== viettelId) {
        throw new ApiError(StatusCodes.CONFLICT, 'This Viettel code is already taken by another employee!')
      }
      payload.viettelCode = trimmedCode
    }

    // 3. Logic check for Viettel Email
    if (viettelEmail !== undefined) {
      const trimmedEmail = String(viettelEmail).trim()
      if (trimmedEmail) {
        ValidateCores.validateEmail(trimmedEmail, 'Viettel email is invalid!')
        ValidateCores.validateEmailDomain(trimmedEmail, ALLOWED_EMAIL_DOMAINS, 'Viettel email domain is not allowed!')

        const isExistedEmail = await employeesViettelModel.findByName(trimmedEmail, 'viettelEmail')
        if (isExistedEmail && isExistedEmail.viettelId !== viettelId) {
          throw new ApiError(StatusCodes.CONFLICT, 'This Viettel email is already taken by another employee!')
        }
        payload.viettelEmail = trimmedEmail
      } else {
        payload.viettelEmail = null
      }
    }

    // 4. Check viettelPosition
    if (viettelPosition !== undefined) {
      payload.viettelPosition = viettelPosition || null
    }

    // 5. Check viettelBranchId
    // if (viettelBranchId !== undefined) {
    //   payload.viettelBranchId = viettelBranchId ? Number(viettelBranchId) : null
    // }

    if (viettelBranchId !== undefined) {
      console.log(viettelBranchId)
      const findBranch = await viettelBranchModel.findByUnique(viettelBranchId, 'id')
      if (!findBranch) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Branch not found!')
      }
      payload.viettelBranchId = findBranch.viettelBranchId
    }


    // 6. Check status enum
    if (status !== undefined) {
      CHECK_ENUM(status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)
      payload.status = status
    }

    // 7. Handle Employee Link Update if employeeCode is passed
    if (employeeCode !== undefined) {
      if (employeeCode) {
        const findEmployee = await employeesModel.findByUnique(employeeCode, 'employeeCode')
        if (!findEmployee) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee not found!')
        }

        // Check if this employee is already linked to another Viettel record
        const existingLink = await employeesViettelModel.findByField(findEmployee.employeeId, 'employeeId')
        if (existingLink && existingLink.viettelId !== viettelId) {
          throw new ApiError(StatusCodes.CONFLICT, 'This employee is already linked to another Viettel account!')
        }

        payload.employeeId = findEmployee.employeeId
      }
    }

    if (Object.keys(payload).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No data to update!')
    }

    // 8. Update Viettel record
    return await employeesViettelModel.updateById(viettelId, payload)
  }

  /**
   * Delete an employee
   */
  async delete(id) {
    // 1. Find record by uuid_v7 'id'
    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ID is required!')
    }
    const existing = await employeesViettelModel.findByUnique(id, 'id')
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
    }

    return await employeesViettelModel.deleteById(existing.viettelId)
  }
}

// Export an instance of the class
export const employeesViettelServices = new EmployeesViettelServices()
