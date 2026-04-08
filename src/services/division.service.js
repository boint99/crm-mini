import { ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { divisionModel } from '../models/division.model.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { companyModel } from '../models/company.model.js'

class DivisionService {
  /**
   * Create a new division
   */
  async create(data) {
    // 1. Check required fields
    if (!data.DIVISION_NAME || !data.DIVISION_NAME.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The division name cannot be left blank!')
    }
    if (!data.DIVISION_CODE || !data.DIVISION_CODE.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The division code cannot be left blank!')
    }

    // 2. Check unique DIVISION_CODE
    const codeExists = await divisionModel.findByCode(data.DIVISION_CODE.trim())
    if (codeExists) {
      throw new ApiError(StatusCodes.CONFLICT, 'This division code is already taken!')
    }

    // 3. Check unique DIVISION_NAME
    const isExisted = await divisionModel.findByName(data.DIVISION_NAME.trim())
    if (isExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken!')
    }

    // 4. check forgen key
    if (data.COMPANY_ID) {
      const CheckforgenKey = await companyModel.findById(data.COMPANY_ID)
      if (!CheckforgenKey) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The specified company does not exist!')
      }
    }
    // 5. Check status enum
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

    // 3. check forgen key
    if (data.COMPANY_ID) {
      const CheckforgenKey = await companyModel.findById(data.COMPANY_ID)
      if (!CheckforgenKey) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The specified company does not exist!')
      }
    }
    // 4. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status')

    return await divisionModel.updateById(DIVISION_ID, payload)
  }

  /**
   * Delete a division
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

    const linkedCompany = await companyModel.findById(idToNumber, 'COMPANY_ID')
    if (linkedCompany) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot delete division linked to a company!')
    }
    return await divisionModel.deleteById(idToNumber)
  }
}

// Export an instance of the class
export const divisionService = new DivisionService()