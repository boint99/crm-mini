import { ALLOWED_STATUS } from '../utils/constants.js'
import { companyModel } from '../models/company.model.js'
import { StatusCodes } from 'http-status-codes'

export const companyService = {
  createNew: async (data) => {
    // check empty COMPANY_NAME
    if (!data.COMPANY_NAME) {
      const err = new Error('The company name cannot be left blank!')
      err.statusCode = StatusCodes.BAD_REQUEST
      throw err
    }
    // check COMPANY_NAME existed
    const isExisted = await companyModel.findByName(data.COMPANY_NAME)

    if (isExisted) {
      const err = new Error('This name is already taken, please enter a different name !')
      err.statusCode = StatusCodes.CONFLICT
      throw err
    }

    if (data.STATUS && !ALLOWED_STATUS.includes(data.STATUS)) {
      const error = new Error('Invalid status.')
      error.statusCode = StatusCodes.BAD_REQUEST
      throw error
    }

    return await companyModel.create(data)
  },
  // PUT UPDATE COMPANY
  update: async (id, data) => {

    const checkId = await companyModel.findById(id)

    if (!checkId) {
      const err = new Error('Company not found!')
      err.statusCode = StatusCodes.NOT_FOUND
      throw err
    }

    // check Name
    if (data.COMPANY_NAME) {
      const trimmedName = data.COMPANY_NAME.trim()
      if (trimmedName === '') {
        const err = new Error('The company name cannot be left blank!')
        err.statusCode = StatusCodes.BAD_REQUEST
        throw err
      }

      // check duplicate
      const isExisted = await companyModel.findByName(trimmedName)

      if (isExisted && isExisted.COMPANY_ID !== id) {
        const err = new Error('This name is already taken by another company!')
        err.statusCode = StatusCodes.CONFLICT
        throw err
      }
      data.COMPANY_NAME = trimmedName
    }

    // Check ENUM Status
    if (data.STATUS && !ALLOWED_STATUS.includes(data.STATUS)) {
      const error = new Error(`Invalid status. Only accept: ${ALLOWED_STATUS.join(', ')}`)
      error.statusCode = StatusCodes.BAD_REQUEST
      throw error
    }


    return await companyModel.updateById(id, data)
  },
  // DELETE  COMPANY
  delete: async (id) => {
    const checkId = await companyModel.findById(id)

    if (!checkId) {
      const err = new Error('Company not found!')
      err.statusCode = StatusCodes.NOT_FOUND
      throw err
    }

    return await companyModel.deleteById(id)
  }
}