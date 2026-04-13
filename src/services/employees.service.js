import { ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { employeesModel } from '../models/employees.model.js'
import { positionsModel } from '../models/postisions.model.js'
import { employeesViettelModel } from '../models/employees.viettel.model.js'
import { orgUnitsModel } from '../models/org.units.model.js'
import ServiceCore from '../core/service.core.js'
import { accountsModel } from '../models/accounts.model.js'
import { PRISMA } from '../configs/db.config.js'

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

  async createAccount(IS_ACCOUNT, email) {
    if (IS_ACCOUNT === true) {
      const emailToAccount = email?.includes('@') ? email.split('@')[0] : null
      if (!emailToAccount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'A valid EMAIL is required to create an account!')
      }
      await accountsModel.create({
        ACCOUNT_NAME: emailToAccount,
        IS_LOGIN: true
      })
    }
  }
  /**
   * Create a new employee
   */
  async lists(data) {
    const { status, info } = data
    const queryStatus = status ? status.toUpperCase() : undefined
    const queryInfo = info !== undefined && info !== null && info !== '' ? Number(info) : undefined

    if (queryStatus) {
      CHECK_ENUM(queryStatus, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status.')
    }

    if (queryInfo !== undefined) {
      await ServiceCore.CheckFindbyId(queryInfo, employeesModel, 'Employee ID', 'Employee ID is invalid!')
    }

    return await employeesModel.listQuery(queryStatus, queryInfo)
  }

  async create(data) {
    const { VIETTEL_CODE, IS_ACCOUNT, ...payload } = data

    if (!payload.EMPLOYEE_CODE) throw new ApiError(StatusCodes.BAD_REQUEST, 'The employee code cannot be left blank!')
    if (!payload.STATUS) throw new ApiError(StatusCodes.BAD_REQUEST, 'Status is required!')
    await this.checked(payload)

    // Validate trước khi vào transaction
    if (VIETTEL_CODE) {
      const existedViettelCode = await employeesViettelModel.findbyField(VIETTEL_CODE, 'VIETTEL_CODE')
      if (existedViettelCode) {
        throw new ApiError(StatusCodes.CONFLICT, 'This Viettel code is already taken!')
      }
    }

    let emailToAccount = null
    if (IS_ACCOUNT === true) {
      emailToAccount = payload.EMAIL?.includes('@') ? payload.EMAIL.split('@')[0] : null
      if (!emailToAccount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'A valid EMAIL is required to create an account!')
      }
    }

    return await PRISMA.$transaction(async (tx) => {
      let viettelId = payload.VIETTEL_ID ?? null

      if (VIETTEL_CODE) {
        const newViettel = await tx['vIETTEL_EMPLOYEES'].create({ data: { VIETTEL_CODE } })
        viettelId = newViettel.VIETTEL_ID
      }

      if (IS_ACCOUNT === true) {
        await tx['ACCOUNTS'].create({
          data: { ACCOUNT_NAME: emailToAccount, IS_LOGIN: true }
        })
      }

      return await tx['EMPLOYEES'].create({
        data: { ...payload, VIETTEL_ID: viettelId }
      })
    })
  }

  /**
   * Update Employee details
   */
  async update(data) {
    let viettelRecord = null
    const { EMPLOYEE_ID, VIETTEL_CODE, IS_ACCOUNT, ...payload } = data

    const existing = await employeesModel.findById(EMPLOYEE_ID)
    if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')

    if (VIETTEL_CODE) {
      const existedViettelCode = await employeesViettelModel.findByName(VIETTEL_CODE, 'VIETTEL_CODE')
      if (existedViettelCode) {
        throw new ApiError(StatusCodes.CONFLICT, 'This Viettel code is already taken!')
      }

      const newViettel = await employeesViettelModel.create({
        VIETTEL_CODE
      })

      viettelRecord = newViettel
      payload.VIETTEL_ID = viettelRecord.VIETTEL_ID
    }

    await this.checked(payload, EMPLOYEE_ID)

    if (IS_ACCOUNT === true) {
      await this.createAccount(IS_ACCOUNT, data.EMAIL)
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