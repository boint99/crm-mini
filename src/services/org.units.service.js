import { ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { orgUnitsModel } from '../models/org.units.model.js'

class OrgUnitsServices {
  /**
   * Create a new org.units
   */
  async create(data) {
    // 1. Check required fields
    if (!data.UNIT_NAME) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The name cannot be left blank!')
    }

    // 2. Check existence
    const isExisted = await orgUnitsModel.findByName(data.UNIT_NAME)

    if (isExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken!')
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    return await orgUnitsModel.create(data)
  }

  /**
   * Update Org unit details
   */
  async update(data) {
    const { ORG_UNIT_ID, ...payload } = data

    // 1. Verify existence
    const checkId = await orgUnitsModel.findById(ORG_UNIT_ID)
    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Org unit is not found!')
    }

    // 2. Logic check for Org unit Name
    if (payload.UNIT_NAME) {
      const trimmedName = payload.UNIT_NAME.trim()
      if (!trimmedName) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The Org unit name cannot be left blank!')
      }

      const isExisted = await orgUnitsModel.findByName(trimmedName)

      if (isExisted && isExisted.ORG_UNIT_ID !== ORG_UNIT_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken by another Org unit!')
      }
      payload.UNIT_NAME = trimmedName
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)

    return await orgUnitsModel.updateById(ORG_UNIT_ID, payload)
  }

  /**
   * Delete a company
   */
  async delete(id) {
    const idToNumber = Number(id)

    if (isNaN(idToNumber) || idToNumber <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Org units id is required!')
    }

    const existing = await orgUnitsModel.findById(idToNumber)

    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Org units is not found!')
    }

    return await orgUnitsModel.deleteById(idToNumber)
  }
}

// Export an instance of the class
export const orgUnitsServices = new OrgUnitsServices()