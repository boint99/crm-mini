import { ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { companyModel } from './company.model.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { v7 as uuidv7 } from 'uuid'

class CompanyService {
  // =========================
  // check data
  // =========================

  static checkRequiredFields(data) {
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Data is required!')
    }

    if (!data.companyName?.trim()) {
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

    if (data.companyName) {
      checks.push(
        companyModel.findByName(data.companyName).then((res) => {
          if (res && res.id !== excludeId) {
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
      companyName: data.companyName.trim(),
      status: data.status || 'ENABLE'
    }
  }

  static normalizeUpdateData(data) {
    const updateData = {}

    if (data.companyName !== undefined) {
      const name = data.companyName.trim()
      if (!name) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Company name cannot be empty!')
      }
      updateData.companyName = name
    }

    if (data.STATUS !== undefined) {
      updateData.status = data.STATUS
    }

    return updateData
  }

  async lists() {
    return await companyModel.lists()
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
    CompanyService.checkEnumStatus(normalized.status)

    // 4. Check unique
    await CompanyService.checkUniqueFields(normalized)

    // 5. Create
    const newCompany = {
      id: uuidv7(),
      ...normalized
    }

    return await companyModel.create(newCompany)
  }

  async update(data) {
    const { id, ...payload } = data

    const findCompany = await companyModel.findByUnique(id, 'id')
    console.log('🚀 ~ CompanyService ~ update ~ findCompany:', findCompany)

    const companyId = findCompany?.companyId || null

    if (!findCompany || findCompany.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
    }

    // 2. Normalize update data
    const updateData = CompanyService.normalizeUpdateData(payload)

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No data to update!')
    }

    // 3. Check enum
    CompanyService.checkEnumStatus(updateData.status)

    // 4. Check unique fields
    await CompanyService.checkUniqueFields(updateData)

    // 5. Update
    return await companyModel.updateById(companyId, updateData)
  }

  async delete(id) {
    // 1. Check tồn tại
    const findCompany = await companyModel.findByUnique(id, 'id')

    if (!findCompany || findCompany.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
    }

    // 2. Soft delete
    return await companyModel.updateById(findCompany.companyId, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
  }
}

export const companyService = new CompanyService()
