import { ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { organizationModel } from './organization.model.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { v7 as uuidv7 } from 'uuid'
import { companyModel } from '../company/company.model.js'
import { branchesModel } from '../branch/branch.model.js'
import { employeesModel } from '../employees/employees.model.js'

class OrganizationService {
  static checkRequiredFields(data) {
    if (!data) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Data is required!')
    }
    if (!data.orgUnitCode?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The unit code is required!')
    }
    if (!data.unitName?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The unit name is required!')
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

    if (data.unitName) {
      checks.push(
        organizationModel.findByField(data.unitName, 'unitName').then((res) => {
          if (res && res.id !== excludeId) {
            throw new ApiError(StatusCodes.CONFLICT, 'Unit name already exists!')
          }
        })
      )
    }

    if (data.orgUnitCode) {
      checks.push(
        organizationModel.findByUnique(data.orgUnitCode, 'orgUnitCode').then((res) => {
          if (res && res.id !== excludeId) {
            throw new ApiError(StatusCodes.CONFLICT, 'Unit code already exists!')
          }
        })
      )
    }

    await Promise.all(checks)
  }

  static normalizeCreateData(data) {
    return {
      orgUnitCode: data.orgUnitCode?.trim(),
      unitName: data.unitName?.trim(),
      unitType: data.unitType?.trim() || null,
      status: data.status || 'ENABLE'
    }
  }

  static normalizeUpdateData(data) {
    const updateData = {}

    if (data.orgUnitCode !== undefined) {
      const code = data.orgUnitCode?.trim()
      if (!code) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Unit code cannot be empty!')
      }
      updateData.orgUnitCode = code
    }

    if (data.unitName !== undefined) {
      const name = data.unitName?.trim()
      if (!name) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Unit name cannot be empty!')
      }
      updateData.unitName = name
    }

    if (data.unitType !== undefined) {
      updateData.unitType = data.unitType?.trim() || null
    }

    if (data.status !== undefined) {
      updateData.status = data.status
    }

    return updateData
  }

  async lists(option) {
    const { branchid, companyid, tree } = option || {}
    let query = {}

    if (companyid) {
      const findCompany = await companyModel.findByUnique(companyid, 'id')
      if (!findCompany || findCompany.deletedAt) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
      }
      if (findCompany.status !== 'ENABLE') {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Company is not ENABLE!')
      }
      if (findCompany.id !== companyid) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Company is not match!')
      }
      query.companyId = findCompany.companyId || null
    }
    if (branchid) {
      const findBranch = await branchesModel.findByUnique(branchid, 'id')
      if (!findBranch || findBranch.deletedAt) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Branch not found!')
      }
      if (findBranch.status !== 'ENABLE') {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Branch is not ENABLE!')
      }
      if (findBranch.id !== branchid) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Branch is not match!')
      }
      query.branchId = findBranch.branchId || null
    }

    const list = await organizationModel.lists(query)

    if (tree !== undefined) {
      const map = {}
      const roots = []

      // First pass: put all items in the map with a children array
      list.forEach((item) => {
        map[item.orgUnitId] = { ...item, children: [] }
      })

      // Second pass: link parent/children
      list.forEach((item) => {
        const mappedItem = map[item.orgUnitId]
        const parentId = item.parentUnitId

        if (parentId && map[parentId]) {
          map[parentId].children.push(mappedItem)
        } else {
          roots.push(mappedItem)
        }
      })

      return roots
    }

    return list
  }

  async create(data) {
    // 1. Check required fields
    OrganizationService.checkRequiredFields(data)

    // 2. Normalize basic fields
    const normalized = OrganizationService.normalizeCreateData(data)

    // 3. Check status enum
    OrganizationService.checkEnumStatus(normalized.status)

    // 4. Kiểm tra orgUnitCode đã tồn tại chưa (bao gồm cả soft-deleted)
    const existingByCode = await organizationModel.findByUnique(normalized.orgUnitCode, 'orgUnitCode', true)

    if (existingByCode) {
      if (existingByCode.deletedAt) {
        // Đã soft-delete → khôi phục
        // Vẫn resolve FK để cập nhật
        let companyId = existingByCode.companyId
        if (data.companyId) {
          const findCompany = await companyModel.findByUnique(data.companyId, 'id')
          if (!findCompany || findCompany.deletedAt) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
          }
          companyId = findCompany.companyId
        }

        let branchId = existingByCode.branchId
        if (data.branchId) {
          const findBranch = await branchesModel.findByUnique(data.branchId, 'id')
          if (!findBranch || findBranch.deletedAt) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Branch not found!')
          }
          branchId = findBranch.branchId
        }

        let parentUnitId = existingByCode.parentUnitId
        if (data.parentUnitId) {
          const findParent = await organizationModel.findByUnique(data.parentUnitId, 'id')
          if (!findParent || findParent.deletedAt) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Parent unit not found!')
          }
          parentUnitId = findParent.orgUnitId
        }

        return await organizationModel.updateById(existingByCode.orgUnitId, {
          deletedAt: null,
          status: normalized.status || 'ENABLE',
          unitName: normalized.unitName,
          unitType: normalized.unitType ?? existingByCode.unitType,
          companyId,
          branchId,
          parentUnitId
        })
      }
      // Đang tồn tại → báo lỗi trùng
      throw new ApiError(StatusCodes.CONFLICT, 'Unit code already exists!')
    }

    // 5. Resolve foreign keys (normal create)
    let companyId = null
    if (data.companyId) {
      const findCompany = await companyModel.findByUnique(data.companyId, 'id')
      if (!findCompany || findCompany.deletedAt) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
      }
      companyId = findCompany.companyId
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Company ID is required!')
    }

    let branchId = null
    if (data.branchId) {
      const findBranch = await branchesModel.findByUnique(data.branchId, 'id')
      if (!findBranch || findBranch.deletedAt) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Branch not found!')
      }
      branchId = findBranch.branchId
    }

    let parentUnitId = null
    if (data.parentUnitId) {
      const findParent = await organizationModel.findByUnique(data.parentUnitId, 'id')
      if (!findParent || findParent.deletedAt) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Parent unit not found!')
      }
      parentUnitId = findParent.orgUnitId
    }

    const payload = {
      id: uuidv7(),
      ...normalized,
      companyId,
      branchId,
      parentUnitId
    }

    return await organizationModel.create(payload)
  }

  async update(data) {
    const { id, ...payload } = data

    const findOrg = await organizationModel.findByUnique(id, 'id')
    if (!findOrg || findOrg.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found!')
    }

    const orgUnitId = findOrg.orgUnitId

    const updateData = OrganizationService.normalizeUpdateData(payload)

    if (payload.companyId !== undefined) {
      if (payload.companyId === null) {
        updateData.companyId = null
      } else {
        const findCompany = await companyModel.findByUnique(payload.companyId, 'id')
        if (!findCompany || findCompany.deletedAt) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
        }
        updateData.companyId = findCompany.companyId
      }
    }

    if (payload.branchId !== undefined) {
      if (payload.branchId === null) {
        updateData.branchId = null
      } else {
        const findBranch = await branchesModel.findByUnique(payload.branchId, 'id')
        if (!findBranch || findBranch.deletedAt) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Branch not found!')
        }
        updateData.branchId = findBranch.branchId
      }
    }

    if (payload.parentUnitId !== undefined) {
      if (payload.parentUnitId === null) {
        updateData.parentUnitId = null
      } else {
        if (payload.parentUnitId === id) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'An organization cannot be its own parent!')
        }
        const findParent = await organizationModel.findByUnique(payload.parentUnitId, 'id')
        if (!findParent || findParent.deletedAt) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Parent unit not found!')
        }
        updateData.parentUnitId = findParent.orgUnitId
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No data to update!')
    }

    OrganizationService.checkEnumStatus(updateData.status)

    delete updateData.orgUnitCode
    await OrganizationService.checkUniqueFields(updateData, id)

    return await organizationModel.updateById(orgUnitId, updateData)
  }

  async delete(id) {
    const findOrg = await organizationModel.findByUnique(id, 'id')

    if (!findOrg || findOrg.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Organization not found!')
    }

    const employeeCount = await employeesModel.model.count({
      where: { unitId: findOrg.orgUnitId, deletedAt: null }
    })
    if (employeeCount > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Cannot delete department because there are active employees linked to it!'
      )
    }

    const childCount = await organizationModel.model.count({
      where: { parentUnitId: findOrg.orgUnitId, deletedAt: null }
    })
    if (childCount > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Cannot delete department because there are active child departments linked to it!'
      )
    }

    return await organizationModel.updateById(findOrg.orgUnitId, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
  }
}

export const organizationService = new OrganizationService()
