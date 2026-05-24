import { ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { employeesModel } from './employees.model.js'
import { positionsModel } from '../positions/postisions.model.js'
import { employeesViettelModel } from '../outsources/employees.viettel.model.js'
import { organizationModel } from '../organization/organization.model.js'
import ServiceCore from '../../service/service.core.js'
import { accountsModel } from '../accounts/accounts.model.js'
import { PRISMA } from '../../configs/db.config.js'

class EmployeesServices {
  /**
   * Shared validation: EMPLOYEE_CODE, EMAIL, STATUS, FK (POSITION_ID, VIETTEL_ID)
   * @param {object} data - payload to validate
   * @param {number|null} excludeId - EMPLOYEE_ID to exclude when checking code uniqueness (for update)
   */
  async checked(data, excludeId = null) {

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
        organizationModel,
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
    const { IS_ACCOUNT, ...payload } = data
    if (!payload.STATUS) throw new ApiError(StatusCodes.BAD_REQUEST, 'Status is required!')
    await this.checked(payload)


    let emailToAccount = null
    if (IS_ACCOUNT === true) {
      emailToAccount = payload.EMAIL?.includes('@') ? payload.EMAIL.split('@')[0] : null
      if (!emailToAccount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'A valid EMAIL is required to create an account!')
      }
    }

    return await PRISMA.$transaction(async (tx) => {
      let viettelId = payload.VIETTEL_ID ?? null

      if (IS_ACCOUNT === true) {
        await tx['aCCOUNTS'].create({
          data: { accountName: emailToAccount, isLogin: true }
        })
      }

      const prismaPayload = {
        firstName: payload.FIRST_NAME,
        lastName: payload.LAST_NAME,
        phone: payload.PHONE,
        email: payload.EMAIL ? payload.EMAIL.toLowerCase() : undefined,
        birthDate: payload.BIRTH_DATE ? new Date(payload.BIRTH_DATE) : undefined,
        status: payload.STATUS || 'ENABLE',
        unitId: payload.ORG_UNIT_ID ? Number(payload.ORG_UNIT_ID) : undefined,
        positionId: payload.POSITION_ID ? Number(payload.POSITION_ID) : undefined,
        viettelId: viettelId ? Number(viettelId) : undefined
      }

      const createdEmp = await tx['eMPLOYEES'].create({
        data: prismaPayload
      })

      return employeesModel._mapToUpper(createdEmp)
    })
  }

  /**
   * Update Employee details
   */
  async update(data) {
    const { EMPLOYEE_ID, IS_ACCOUNT, ...payload } = data
    const idToNumber = Number(EMPLOYEE_ID)
    if (isNaN(idToNumber) || idToNumber <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee ID is invalid!')
    }

    const existing = await employeesModel.findById(idToNumber)
    if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')


    await this.checked(payload, idToNumber)

    if (IS_ACCOUNT === true) {
      await this.createAccount(IS_ACCOUNT, data.EMAIL)
    }
    return await employeesModel.updateById(idToNumber, payload)
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
