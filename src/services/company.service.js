import { ALLOWED_STATUS } from '../utils/constants.js'
import { companyModel } from '../models/company.model.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { CHECK_ENUM } from '../utils/constants.js'

class CompanyService {
  /**
   * Create a new company
   */
  async create(data) {
    // 1. Check required fields
    if (!data.COMPANY_NAME) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The company name cannot be left blank!')
    }

    // 2. Check existence
    const isExisted = await companyModel.findByName(data.COMPANY_NAME)
    if (isExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken!')
    }

    // 3. Check status enum (Using the shared helper)
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    return await companyModel.create(data)
  }

  /**
   * Update company details
   */
  async update(COMPANY_ID, data) {
    // 1. Verify existence
    const checkId = await companyModel.findById(COMPANY_ID)
    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
    }

    // 2. Logic check for Company Name
    if (data.COMPANY_NAME) {
      const trimmedName = data.COMPANY_NAME.trim()
      if (!trimmedName) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The company name cannot be left blank!')
      }

      const isExisted = await companyModel.findByName(trimmedName)
      // Nếu tên đã tồn tại và không phải là của chính nó (tránh trùng tên công ty khác)
      if (isExisted && isExisted.COMPANY_ID !== COMPANY_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken by another company!')
      }
      data.COMPANY_NAME = trimmedName
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)

    return await companyModel.updateById(COMPANY_ID, data)
  }

  /**
   * Delete a company
   */
  async delete(COMPANY_ID) {
    const idToNumber = Number(COMPANY_ID)

    if (isNaN(idToNumber) || idToNumber <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'COMPANY_ID is required!')
    }

    const existingCompany = await companyModel.findById(idToNumber)

    if (!existingCompany) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
    }

    return await companyModel.deleteById(idToNumber)
  }
}

// Export an instance of the class
export const companyService = new CompanyService()