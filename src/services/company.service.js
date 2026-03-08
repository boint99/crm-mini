import { ALLOWED_STATUS } from '../utils/constants.js'
import { companyModel } from '../models/company.model.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

export const companyService = {
  createNew: async (data) => {
    // check empty COMPANY_NAME
    if (!data.COMPANY_NAME) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The company name cannot be left blank!')
    }
    // check COMPANY_NAME existed
    const isExisted = await companyModel.findByName(data.COMPANY_NAME)

    if (isExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken, please enter a different name!')
    }

    if (data.STATUS && !ALLOWED_STATUS.includes(data.STATUS)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid status!')
    }

    return await companyModel.create(data)
  },
  // PUT UPDATE COMPANY
  update: async (id, data) => {

    const checkId = await companyModel.findById(id)

    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
    }

    // check Name
    if (data.COMPANY_NAME) {
      const trimmedName = data.COMPANY_NAME.trim()
      if (trimmedName === '') {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The company name cannot be left blank!')
      }

      // check duplicate
      const isExisted = await companyModel.findByName(trimmedName)

      if (isExisted && isExisted.COMPANY_ID !== id) {
        throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken by another company!')
      }
      data.COMPANY_NAME = trimmedName
    }

    // Check ENUM Status
    if (data.STATUS && !ALLOWED_STATUS.includes(data.STATUS)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`
      )
    }

    return await companyModel.updateById(id, data)
  },
  // DELETE  COMPANY
  delete: async (id) => {
    const checkId = await companyModel.findById(id)

    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
    }

    return await companyModel.deleteById(id)
  }
}