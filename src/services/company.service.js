import { ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { companyModel } from '../models/company.model.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { v7 as uuidv7 } from 'uuid'

class CompanyService {
  // =========================
  // check data
  // =========================

  static checkRequiredFields(data) {
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Data is required!')
    }

    if (!data.COMPANY_CODE?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The company code is required!')
    }

    if (!data.COMPANY_NAME?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The company name is required!')
    }
  }

  static checkEnumStatus(status) {
    if (status !== undefined) {
      CHECK_ENUM(
        status,
        ALLOWED_STATUS,
        StatusCodes.BAD_REQUEST,
        'Invalid status!}'
      )
    }
  }

  static async checkUniqueFields(data, excludeId = null) {
    const checks = []

    if (data.COMPANY_CODE) {
      checks.push(
        companyModel.findByCode(data.COMPANY_CODE).then((res) => {
          if (res && res.ID !== excludeId) {
            throw new ApiError(StatusCodes.CONFLICT, 'Company code already exists!')
          }
        })
      )
    }

    if (data.COMPANY_NAME) {
      checks.push(
        companyModel.findByName(data.COMPANY_NAME).then((res) => {
          if (res && res.ID !== excludeId) {
            throw new ApiError(StatusCodes.CONFLICT, 'Company name already exists!')
          }
        })
      )
    }

    await Promise.all(checks)
  }

  // =========================
  // NORMALIZE DATA
  // =========================

  static normalizeCreateData(data) {
    return {
      COMPANY_CODE: data.COMPANY_CODE.trim(),
      COMPANY_NAME: data.COMPANY_NAME.trim(),
      STATUS: data.STATUS || 'ACTIVE'
    }
  }

  static normalizeUpdateData(data) {
    const updateData = {}

    if (data.COMPANY_CODE !== undefined) {
      const code = data.COMPANY_CODE.trim()
      if (!code) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Company code cannot be empty!')
      }
      updateData.COMPANY_CODE = code
    }

    if (data.COMPANY_NAME !== undefined) {
      const name = data.COMPANY_NAME.trim()
      if (!name) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Company name cannot be empty!')
      }
      updateData.COMPANY_NAME = name
    }

    if (data.STATUS !== undefined) {
      updateData.STATUS = data.STATUS
    }

    return updateData
  }

  // =========================
  // BUSINESS LOGIC
  // =========================

  async create(data) {
    // 1. Check required
    CompanyService.checkRequiredFields(data)

    // 2. Normalize
    const normalized = CompanyService.normalizeCreateData(data)

    // 3. Check enum
    CompanyService.checkEnumStatus(normalized.STATUS)

    // 4. Check unique
    await CompanyService.checkUniqueFields(normalized)

    // 5. Create
    const newCompany = {
      ID: uuidv7(),
      ...normalized
    }

    return await companyModel.create(newCompany)
  }

  async update(data) {
    const { ID, ...payload } = data

    const findCompany = await companyModel.findByUnique(ID, 'ID')
    console.log('🚀 ~ CompanyService ~ update ~ findCompany:', findCompany)

    const companyId = findCompany.COMPANY_ID || null

    if (!findCompany || findCompany.DELETED_AT) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
    }

    // 2. Normalize update data
    const updateData = await CompanyService.normalizeUpdateData(payload)

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No data to update!')
    }

    // 3. Check enum
    CompanyService.checkEnumStatus(updateData.STATUS)

    // 4. Check unique fields
    await CompanyService.checkRequiredFields(updateData, companyId)

    // 5. Update
    return await companyModel.update(companyId, updateData)
  }

  async delete(ID) {
    // 1. Check tồn tại
    const findCompany = await companyModel.findByUnique(ID, 'ID')

    if (!findCompany || findCompany.DELETED_AT) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
    }

    // 2. Soft delete
    return await companyModel.update(findCompany.COMPANY_ID, {
      DELETED_AT: new Date(),
      STATUS: 'DISABLED'
    })
  }
}

export const companyService = new CompanyService()