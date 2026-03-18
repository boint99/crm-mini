import { ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { divisionModel } from '../models/division.model.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

// export const divisionService = {
//   // Create division
//   create: async (data) => {
//     // check empty
//     if (!data.DIVISION_NAME) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, 'The division name cannot be left blank!')
//     }
//     // check existed
//     const isExisted = await divisionModel.findByName(data.DIVISION_NAME)

//     if (isExisted) {
//       throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken, please enter a different name!')
//     }

//     CHECK_ENUM(
//       data.STATUS,
//       ALLOWED_STATUS,
//       StatusCodes.BAD_REQUEST,
//       'Invalid status: Must be ENABLE or DISABLE'
//     )

//     return await divisionModel.create(data)
//   },
//   // PUT UPDATE
//   update: async (data) => {
//     let { DIVISION_ID, ...payload } = data
//     const idToFind = Number(DIVISION_ID)

//     if (!idToFind) {
//       throw new ApiError(StatusCodes.BAD_REQUEST, 'Division ID is required!')
//     }

//     const checkId = await divisionModel.findById(idToFind)

//     if (!checkId) throw new ApiError(StatusCodes.NOT_FOUND, 'Division not found!')

//     CHECK_ENUM(
//       payload.STATUS,
//       ALLOWED_STATUS,
//       StatusCodes.BAD_REQUEST,
//       'Invalid status: Must be ENABLE or DISABLE'
//     )

//     return await divisionModel.updateById(idToFind,payload)

//   },
//   // DELETE
//   delete: async (data) => {
//     const id = data.DIVISION_ID
//     const checkId = await divisionModel.findById(id)

//     if (!checkId) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'Division ID is required!')
//     }

//     return await divisionModel.deleteById(id)
//   }
// }

class DivisionService {
  /**
   * Create a new division
   */
  async create(data) {
    // 1. Check required fields
    if (!data.DIVISION_NAME) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The division name cannot be left blank!')
    }

    // 2. Check existence
    const isExisted = await divisionModel.findByName(data.DIVISION_NAME)

    if (isExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken!')
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    return await divisionModel.create(data)
  }

  /**
   * Update division details
   */
  async update(data) {
    const { DIVISION_ID, ...payload } = data

    // 1. Verify existence
    const checkId = await divisionModel.findById(DIVISION_ID)
    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Division not found!')
    }

    // 2. Logic check for division Name
    if (payload.DIVISION_NAME) {
      const trimmedName = payload.DIVISION_NAME.trim()
      if (!trimmedName) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The division name cannot be left blank!')
      }

      const isExisted = await divisionModel.findByName(trimmedName)

      if (isExisted && isExisted.DIVISION_ID !== DIVISION_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken by another division!')
      }
      payload.DIVISION_NAME = trimmedName
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)

    return await divisionModel.updateById(DIVISION_ID, payload)
  }

  /**
   * Delete a company
   */
  async delete(DIVISION_ID) {
    const idToNumber = Number(DIVISION_ID)

    if (isNaN(idToNumber) || idToNumber <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'DIVISION_ID is required!')
    }

    const existing = await divisionModel.findById(idToNumber)

    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Division not found!')
    }

    return await divisionModel.deleteById(idToNumber)
  }
}

// Export an instance of the class
export const divisionService = new DivisionService()