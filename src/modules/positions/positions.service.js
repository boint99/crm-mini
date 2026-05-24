import { ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { positionsModel } from './postisions.model.js'
import { v7 as uuidv7 } from 'uuid'

class PositionsServices {

  async lists() {
    return await positionsModel.lists()
  }

  /**
   * Create a new position
   */
  async create(data) {
    const { positionName, level, status } = data
    // 1. Check required fields
    if (!positionName || !positionName.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The name cannot be left blank!')
    }

    // 2. Check existence
    const isExisted = await positionsModel.findByField(positionName.trim(), 'positionName')

    if (isExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken!')
    }

    // 3. Check status enum
    CHECK_ENUM(status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    const createData = {
      id: uuidv7(),
      positionName: positionName,
      level: level,
      status: status || 'ENABLE'
    }
    return await positionsModel.create(createData)
  }

  /**
   * Update Position details
   */
  async update(data) {
    const { id, ...payload } = data

    // 1. Verify existence
    const existing = await positionsModel.findByUnique(id, 'id')
    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Position is not found!')
    }

    // 2. Logic check for Position Name
    if (payload.positionName) {
      const trimmedName = payload.positionName.trim()
      if (!trimmedName) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The Position name cannot be left blank!')
      }

      const isExisted = await positionsModel.findByField(trimmedName, 'positionName')
      if (isExisted && isExisted.id !== id) {
        throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken!')
      }
      payload.positionName = trimmedName
    }

    // 3. Check status enum
    if (payload.status !== undefined) {
      CHECK_ENUM(payload.status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)
    }

    // 4. Normalize update data
    const updateData = {}
    if (payload.positionName !== undefined) updateData.positionName = payload.positionName
    if (payload.level !== undefined) updateData.level = payload.level
    if (payload.status !== undefined) updateData.status = payload.status

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
