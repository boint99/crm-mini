import { ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { positionsModel } from '../models/postisions.model.js'

class PositionsServices {
  /**
   * Create a new position
   */
  async create(data) {
    // 1. Check required fields
    if (!data.POSITION_NAME || !data.POSITION_NAME.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The name cannot be left blank!')
    }

    // // 2. Check existence
    const isExisted = await positionsModel.findByName(data.POSITION_NAME)

    if (isExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken!')
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    return await positionsModel.create(data)
  }

  /**
   * Update Position details
   */
  async update(data) {
    const { POSITION_ID, ...payload } = data

    // 1. Verify existence
    const checkId = await positionsModel.findById(POSITION_ID)
    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Position is not found!')
    }

    // 2. Logic check for Position Name
    if (payload.POSITION_NAME) {
      const trimmedName = payload.POSITION_NAME.trim()
      if (!trimmedName) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The Position name cannot be left blank!')
      }

      const isExisted = await positionsModel.findByName(trimmedName)

      if (isExisted && isExisted.POSITION_ID !== POSITION_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken by another Position!')
      }
      payload.POSITION_NAME = trimmedName
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)

    return await positionsModel.updateById(POSITION_ID, payload)
  }

  /**
   * Delete a position
   */
  async delete(id) {
    const idToNumber = Number(id)

    if (isNaN(idToNumber) || idToNumber <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Position id is required!')
    }

    const existing = await positionsModel.findById(idToNumber)

    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Position is not found!')
    }

    return await positionsModel.deleteById(idToNumber)
  }
}

// Export an instance of the class
export const positionsServices = new PositionsServices()