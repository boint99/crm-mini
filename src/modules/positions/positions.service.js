import { ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { positionsModel } from './postisions.model.js'
import { v7 as uuidv7 } from 'uuid'
import { PRISMA } from '../../configs/db.config.js'

class PositionsServices {

  async lists(params = {}) {
    const { companyId } = params
    const query = {}
    if (companyId) {
      query.companyId = companyId
    }
    return await positionsModel.lists(query)
  }

  /**
   * Create a new position
   */
  async create(data) {
    const { positionName, level, status, companyId } = data
    // 1. Check required fields
    if (!positionName || !positionName.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The name cannot be left blank!')
    }

    // 2. Resolve company FK
    let companyIdDb = null
    if (companyId) {
      const company = await PRISMA.cOMPANY.findUnique({
        where: { id: companyId }
      })
      if (!company || company.deletedAt) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
      }
      companyIdDb = company.companyId
    }

    // 3. Kiểm tra tên chức vụ trong công ty (bao gồm cả soft-deleted)
    const existingIncDeleted = await PRISMA.pOSITIONS.findFirst({
      where: {
        positionName: positionName.trim(),
        companyId: companyIdDb
      }
    })

    if (existingIncDeleted) {
      if (existingIncDeleted.deletedAt) {
        // Đã soft-delete → khôi phục lại
        return await PRISMA.pOSITIONS.update({
          where: { positionId: existingIncDeleted.positionId },
          data: {
            deletedAt: null,
            status: status || 'ENABLE',
            positionName: positionName.trim(),
            level: level || existingIncDeleted.level,
            companyId: companyIdDb
          }
        })
      }
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken in this company!')
    }

    // 4. Check status enum
    CHECK_ENUM(status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    const createData = {
      id: uuidv7(),
      positionName: positionName.trim(),
      level: level || '',
      companyId: companyIdDb,
      status: status || 'ENABLE'
    }
    return await positionsModel.create(createData)
  }

  /**
   * Update Position details
   */
  async update(data) {
    const { id, companyId, ...payload } = data

    // 1. Verify existence
    const existing = await positionsModel.findByUnique(id, 'id')
    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Position is not found!')
    }

    let companyIdDb = undefined
    if (companyId !== undefined) {
      if (companyId) {
        const company = await PRISMA.cOMPANY.findUnique({
          where: { id: companyId }
        })
        if (!company || company.deletedAt) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
        }
        companyIdDb = company.companyId
      } else {
        companyIdDb = null
      }
    }

    // 2. Logic check for Position Name within same company
    const checkName = payload.positionName !== undefined ? payload.positionName.trim() : existing.positionName
    const checkCompanyId = companyIdDb !== undefined ? companyIdDb : existing.companyId

    if (payload.positionName !== undefined) {
      if (!checkName) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The Position name cannot be left blank!')
      }
    }

    if (payload.positionName !== undefined || companyIdDb !== undefined) {
      const isExisted = await PRISMA.pOSITIONS.findFirst({
        where: {
          positionName: checkName,
          companyId: checkCompanyId,
          deletedAt: null
        }
      })
      if (isExisted && isExisted.id !== id) {
        throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken in this company!')
      }
    }

    // 3. Check status enum
    if (payload.status !== undefined) {
      CHECK_ENUM(payload.status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)
    }

    // 4. Normalize update data
    const updateData = {}
    if (payload.positionName !== undefined) updateData.positionName = checkName
    if (payload.level !== undefined) updateData.level = payload.level
    if (payload.status !== undefined) updateData.status = payload.status
    if (companyIdDb !== undefined) updateData.companyId = companyIdDb

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No data to update!')
    }

    return await positionsModel.updateById(id, updateData)
  }

  /**
   * Delete a position
   */
  async delete(id) {
    const existing = await positionsModel.findByUnique(id, 'id')

    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Position is not found!')
    }

    return await positionsModel.updateById(id, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
  }
}

// Export an instance of the class
export const positionsServices = new PositionsServices()
