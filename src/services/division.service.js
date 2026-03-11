import { ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { divisionModel } from '../models/division.model.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

export const divisionService = {
  // Create division
  create: async (data) => {
    // check empty
    if (!data.DIVISION_NAME) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The division name cannot be left blank!')
    }
    // check existed
    const isExisted = await divisionModel.findByName(data.DIVISION_NAME)

    if (isExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken, please enter a different name!')
    }

    CHECK_ENUM(
      data.STATUS,
      ALLOWED_STATUS,
      StatusCodes.BAD_REQUEST,
      'Invalid status: Must be ENABLE or DISABLE'
    )

    return await divisionModel.create(data)
  },
  // PUT UPDATE
  update: async (data) => {
    let { DIVISION_ID, ...payload } = data
    const idToFind = Number(DIVISION_ID)

    if (!idToFind) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Division ID is required!')
    }

    const checkId = await divisionModel.findById(idToFind)

    if (!checkId) throw new ApiError(StatusCodes.NOT_FOUND, 'Division not found!')

    CHECK_ENUM(
      payload.STATUS,
      ALLOWED_STATUS,
      StatusCodes.BAD_REQUEST,
      'Invalid status: Must be ENABLE or DISABLE'
    )

    return await divisionModel.updateById(idToFind,payload)

  },
  // DELETE
  delete: async (data) => {
    const id = data.DIVISION_ID
    const checkId = await divisionModel.findById(id)

    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Division ID is required!')
    }

    return await divisionModel.deleteById(id)
  }
}