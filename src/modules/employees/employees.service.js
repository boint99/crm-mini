import { ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { employeesModel } from './employees.model.js'
import { positionsModel } from '../positions/postisions.model.js'
import { organizationModel } from '../organization/organization.model.js'
import { PRISMA } from '../../configs/db.config.js'

class EmployeesServices {
  /**
   * Shared validation: employeeCode, email, status, FK (positionId, viettelId, unitId)
   * @param {object} data - payload to validate
   * @param {string|null} excludeId - employee UUID to exclude when checking uniqueness
   */
  async checked(data, excludeId = null) {
    // 1. employeeCode
    if (data.employeeCode) {
      const existedCode = await employeesModel.findByField(data.employeeCode, 'employeeCode')
      if (existedCode && existedCode.id !== excludeId) {
        throw new ApiError(StatusCodes.CONFLICT, 'This employee code is already taken!')
      }
    }

    // 2. email
    if (data.email) {
      const existedEmail = await employeesModel.findByField(data.email, 'email')
      if (existedEmail && existedEmail.id !== excludeId) {
        throw new ApiError(StatusCodes.CONFLICT, 'This email is already taken!')
      }
    }

    // 3. status
    if (data.status !== undefined) {
      CHECK_ENUM(data.status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed: ${ALLOWED_STATUS.join(', ')}`)
    }

    // // 4. FK: positionId
    // if (data.positionId) {
    //   await ServiceCore.CheckFindbyId(
    //     data.positionId,
    //     positionsModel,
    //     'Position ID',
    //     'Position ID is invalid!'
    //   )
    // }



    // // 6. FK: unitId
    // if (data.unitId) {
    //   await ServiceCore.CheckFindbyId(
    //     data.unitId,
    //     organizationModel,
    //     'Unit ID',
    //     'Unit ID is invalid!'
    //   )
    // }
  }

  /**
   * Get list of employees
   * - Nếu không gửi companyId → trả mảng rỗng (tránh nhầm lẫn giữa các công ty)
   * - Hỗ trợ search theo employeeCode, firstName, lastName, email
   * - Hỗ trợ filter theo companyId, unitId, branchId, status
   */
  async lists(data) {
    const {
      status, info, search,
      unitId, unitid,
      companyId, companyid,
      branchId, branchid
    } = data

    const resolvedCompanyId = companyId || companyid

    const queryStatus = status ? status.toUpperCase() : undefined

    if (queryStatus) {
      CHECK_ENUM(queryStatus, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status.')
    }

    // Nếu có info → tìm chính xác 1 employee (giữ logic cũ)
    if (info !== undefined && info !== null && info !== '') {
      const isUuid = typeof info === 'string' && info.length === 36 && info.includes('-')
      const isNumber = !isNaN(Number(info))

      let existing
      if (isUuid) {
        existing = await employeesModel.findByUnique(info, 'id')
      } else if (isNumber) {
        existing = await employeesModel.findByUnique(Number(info), 'employeeId')
      } else {
        existing = await employeesModel.findByUnique(info, 'employeeCode')
      }

      if (!existing) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
      }
    }

    return await employeesModel.listQuery(
      queryStatus,
      info,
      unitId || unitid,
      resolvedCompanyId,
      branchId || branchid,
      search
    )
  }

  /**
   * Create a new employee
   */
  async create(data) {
    const { isAccount: rawIsAccount, ...payload } = data
    const isAccount = rawIsAccount === true || rawIsAccount === 'true'
    if (!payload.status) throw new ApiError(StatusCodes.BAD_REQUEST, 'Status is required!')
    await this.checked(payload)

    let emailToAccount = null
    if (isAccount === true) {
      emailToAccount = payload.email ? payload.email.toLowerCase() : null
      if (!emailToAccount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'A valid EMAIL is required to create an account!')
      }
    }

    let unitId = null

    if (payload.unitId) {
      const findUnit = await organizationModel.findByUnique(payload.unitId, 'id')
      if (!findUnit || findUnit.deletedAt) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Unit not found!')
      }
      unitId = findUnit.orgUnitId
    }

    let positionId = null

    if (payload.positionId) {
      const findPosition = await positionsModel.findByUnique(payload.positionId, 'id')
      if (!findPosition || findPosition.deletedAt) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Position not found!')
      }
      positionId = findPosition.positionId
    }

    const prismaPayload = {
      employeeCode: payload.employeeCode,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone || null,
      email: payload.email ? payload.email.toLowerCase() : null,
      birthDate: payload.birthDate ? new Date(payload.birthDate) : null,
      status: payload.status || 'ENABLE',
      isAccount: isAccount || false,
      unitId: unitId,
      positionId: positionId,
      description: payload.description || null
    }

    return await PRISMA.$transaction(async (tx) => {
      const createdEmp = await tx.eMPLOYEES.create({
        data: prismaPayload
      })

      if (isAccount === true) {
        const existingAccount = await tx.aCCOUNTS.findUnique({
          where: { accountName: emailToAccount }
        })
        if (existingAccount) {
          throw new ApiError(StatusCodes.CONFLICT, `Account name "${emailToAccount}" is already taken!`)
        }

        await tx.aCCOUNTS.create({
          data: {
            accountName: emailToAccount,
            isLogin: true,
            employeeId: createdEmp.employeeId
          }
        })
      }

      return createdEmp
    })
  }

  /**
   * Update Employee details
   */
  async update(data) {
    const { id, isAccount, ...payload } = data

    // 1. Verify existence
    const existing = await employeesModel.findByUnique(id, 'id')
    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
    }

    // 2. Validate input and unique checks
    await this.checked(payload, id)

    let unitId = undefined
    if (payload.unitId !== undefined) {
      if (payload.unitId) {
        const findUnit = await organizationModel.findByUnique(payload.unitId, 'id')
        if (!findUnit || findUnit.deletedAt) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Unit not found!')
        }
        unitId = findUnit.orgUnitId
      } else {
        unitId = null
      }
    }

    let positionId = undefined
    if (payload.positionId !== undefined) {
      if (payload.positionId) {
        const findPosition = await positionsModel.findByUnique(payload.positionId, 'id')
        if (!findPosition || findPosition.deletedAt) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Position not found!')
        }
        positionId = findPosition.positionId
      } else {
        positionId = null
      }
    }

    // 4. Normalize update data
    const updateData = {}
    if (payload.employeeCode !== undefined) updateData.employeeCode = payload.employeeCode
    if (payload.firstName !== undefined) updateData.firstName = payload.firstName
    if (payload.lastName !== undefined) updateData.lastName = payload.lastName
    if (payload.phone !== undefined) updateData.phone = payload.phone || null
    if (payload.email !== undefined) updateData.email = payload.email ? payload.email.toLowerCase() : null
    if (payload.birthDate !== undefined) updateData.birthDate = payload.birthDate ? new Date(payload.birthDate) : null
    if (payload.status !== undefined) updateData.status = payload.status
    if (payload.isAccount !== undefined) updateData.isAccount = payload.isAccount
    if (unitId !== undefined) updateData.unitId = unitId
    if (positionId !== undefined) updateData.positionId = positionId
    if (payload.description !== undefined) updateData.description = payload.description || null

    return await PRISMA.$transaction(async (tx) => {
      // 3. Handle account creation if isAccount is true
      if (isAccount === true && !existing.isAccount) {
        const emailToAccount = payload.email ? payload.email.toLowerCase() : existing.email ? existing.email.toLowerCase() : null
        if (!emailToAccount) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'A valid EMAIL is required to create an account!')
        }

        const existingAccount = await tx.aCCOUNTS.findUnique({
          where: { accountName: emailToAccount }
        })
        if (existingAccount) {
          throw new ApiError(StatusCodes.CONFLICT, `Account name "${emailToAccount}" is already taken!`)
        }

        await tx.aCCOUNTS.create({
          data: {
            accountName: emailToAccount,
            isLogin: true,
            employeeId: existing.employeeId
          }
        })
        updateData.isAccount = true
      }

      if (Object.keys(updateData).length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'No data to update!')
      }

      return await tx.eMPLOYEES.update({
        where: { id },
        data: updateData
      })
    })
  }

  /**
   * Delete an employee
   */
  async delete(id) {
    const existing = await employeesModel.findByUnique(id, 'id')

    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
    }

    return await employeesModel.updateById(id, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
  }
}

// Export an instance of the class
export const employeesServices = new EmployeesServices()
