import { ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { branchesModel } from './branch.model.js'
import { v7 as uuidv7 } from 'uuid'
import { PRISMA } from '../../configs/db.config.js'

class BranchesServices {
  static checkRequiredFields(data) {
    console.log('🚀 ~ BranchesServices ~ checkRequiredFields ~ data:', data)
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Data is required!')
    }
    if (!data.branchCode?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The branch code cannot be left blank!')
    }
    if (!data.branchName?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The branch name cannot be left blank!')
    }
  }

  static checkEnumStatus(status) {
    if (status !== undefined) {
      CHECK_ENUM(
        status,
        ALLOWED_STATUS,
        StatusCodes.BAD_REQUEST,
        'Invalid status!'
      )
    }
  }

  static async checkUniqueFields(data, excludeId = null) {
    const checks = []

    if (data.branchCode) {
      checks.push(
        branchesModel.findByUnique(data.branchCode, 'branchCode').then((res) => {
          if (res && res.id !== excludeId) {
            throw new ApiError(StatusCodes.CONFLICT, 'This branch code is already taken!')
          }
        })
      )
    }

    if (data.branchName) {
      checks.push(
        branchesModel.findByName(data.branchName).then((res) => {
          if (res && res.id !== excludeId) {
            throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken!')
          }
        })
      )
    }

    await Promise.all(checks)
  }

  static normalizeCreateData(data) {
    return {
      branchCode: data.branchCode?.trim(),
      branchName: data.branchName?.trim(),
      location: data.location?.trim() || null,
      status: data.status || 'ENABLE'
    }
  }

  static normalizeUpdateData(data) {
    const updateData = {}

    if (data.branchCode !== undefined) {
      const code = data.branchCode?.trim()
      if (!code) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The branch code cannot be left blank!')
      }
      updateData.branchCode = code
    }

    if (data.branchName !== undefined) {
      const name = data.branchName?.trim()
      if (!name) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The branch name cannot be left blank!')
      }
      updateData.branchName = name
    }

    if (data.location !== undefined) {
      updateData.location = data.location?.trim() || null
    }

    if (data.status !== undefined) {
      updateData.status = data.status
    }

    return updateData
  }

  async lists() {
    return await branchesModel.lists()
  }

  async create(data) {
    // 1. Check required fields
    BranchesServices.checkRequiredFields(data)

    // 2. Normalize create data
    const normalized = BranchesServices.normalizeCreateData(data)

    // 3. Check status enum
    BranchesServices.checkEnumStatus(normalized.status)

    // 4. Kiểm tra branchCode đã tồn tại chưa (bao gồm cả soft-deleted)
    const existingByCode = await PRISMA.bRANCHES.findFirst({
      where: { branchCode: normalized.branchCode }
    })
    if (existingByCode) {
      if (existingByCode.deletedAt) {
        // Đã soft-delete → khôi phục, cập nhật thông tin mới
        return await PRISMA.bRANCHES.update({
          where: { branchId: existingByCode.branchId },
          data: {
            deletedAt: null,
            status: normalized.status || 'ENABLE',
            branchName: normalized.branchName,
            location: normalized.location ?? existingByCode.location
          }
        })
      }
      throw new ApiError(StatusCodes.CONFLICT, 'This branch code is already taken!')
    }

    // 5. Kiểm tra branchName đã tồn tại chưa (bao gồm cả soft-deleted)
    const existingByName = await PRISMA.bRANCHES.findFirst({
      where: { branchName: normalized.branchName }
    })
    if (existingByName) {
      if (existingByName.deletedAt) {
        return await PRISMA.bRANCHES.update({
          where: { branchId: existingByName.branchId },
          data: {
            deletedAt: null,
            status: normalized.status || 'ENABLE',
            branchCode: normalized.branchCode,
            location: normalized.location ?? existingByName.location
          }
        })
      }
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken!')
    }

    // 6. Build final payload & create
    const payload = {
      id: uuidv7(),
      ...normalized
    }

    return await branchesModel.create(payload)
  }

  async update(data) {
    console.log('🚀 ~ BranchesServices ~ update ~ data:', data)
    const { id, ...payload } = data

    // 1. Verify existence
    const findBranch = await branchesModel.findByUnique(id, 'id')
    if (!findBranch || findBranch.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Branch is not found!')
    }

    // 2. Normalize update data
    const updateData = BranchesServices.normalizeUpdateData(payload)

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No data to update!')
    }

    // 3. Check status enum
    BranchesServices.checkEnumStatus(updateData.status)

    // 4. Check uniqueness
    await BranchesServices.checkUniqueFields(updateData, id)

    // 5. Update
    return await branchesModel.updateById(id, updateData)
  }

  async delete(id) {
    const findBranch = await branchesModel.findByUnique(id, 'id')

    if (!findBranch || findBranch.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Branch not found!')
    }

    // Kiểm tra các phòng ban/đơn vị đang sử dụng chi nhánh này
    const orgUnitCount = await PRISMA.oRG_UNITS.count({
      where: { branchId: findBranch.branchId, deletedAt: null }
    })
    if (orgUnitCount > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        `Không thể xóa chi nhánh vì hiện có ${orgUnitCount} đơn vị/phòng ban đang liên kết với chi nhánh này!`
      )
    }

    return await branchesModel.updateById(id, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
  }
}

export const branchesServices = new BranchesServices()
