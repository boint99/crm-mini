import { ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { companyModel } from './company.model.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { v7 as uuidv7 } from 'uuid'
import { organizationModel } from '../organization/organization.model.js'
import { PRISMA } from '../../configs/db.config.js'

class CompanyService {
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
        companyModel.findByField(data.companyName, 'companyName').then((res) => {
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

    // 4. Kiểm tra xem tên công ty đã tồn tại chưa (bao gồm cả đã soft-delete)
    const existingIncDeleted = await PRISMA.cOMPANY.findFirst({
      where: { companyName: normalized.companyName }
    })

    if (existingIncDeleted) {
      if (existingIncDeleted.deletedAt) {
        // Đã bị soft-delete → khôi phục lại
        return await companyModel.updateById(existingIncDeleted.companyId, {
          deletedAt: null,
          status: normalized.status || 'ENABLE',
          companyName: normalized.companyName
        })
      }
      // Đang tồn tại → báo lỗi trùng
      throw new ApiError(StatusCodes.CONFLICT, 'Company name already exists!')
    }

    // 5. Tạo mới
    const newCompany = {
      id: uuidv7(),
      ...normalized
    }

    return await companyModel.create(newCompany)
  }

  async update(data) {
    const { id, ...payload } = data

    const findCompany = await companyModel.findByUnique(id, 'id')

    const companyId = findCompany?.companyId || null

    if (!findCompany || findCompany.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
    }

    // 2. Normalize update data
    const updateData = CompanyService.normalizeUpdateData(payload.companyName)

    // 3. Check enum
    CompanyService.checkEnumStatus(updateData.status)

    // 4. Check unique fields
    await CompanyService.checkUniqueFields(updateData)

    // 5. Update
    return await companyModel.updateById(companyId, updateData)
  }

  async delete(id) {
    const findCompany = await companyModel.findByUnique(id, 'id')

    if (!findCompany || findCompany.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
    }

    const companyKey = await organizationModel.findByField(findCompany.companyId, 'companyId')

    if (companyKey) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Company has organization!')
    }

    // 2. Soft delete
    return await companyModel.updateById(findCompany.companyId, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
  }
}

export const companyService = new CompanyService()
