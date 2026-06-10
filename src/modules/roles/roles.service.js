import { ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { rolesModel } from './roles.model.js'
import { v7 as uuidv7 } from 'uuid'

class RolesServices {
  async lists() {
    return await rolesModel.lists()
  }

  /**
   * Tạo vai trò mới
   */
  async create(data) {
    const { roleCode, roleName, description, status } = data

    // 1. Kiểm tra trùng mã vai trò
    const codeExisted = await rolesModel.findByField(Number(roleCode), 'roleCode')
    if (codeExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'Mã vai trò (roleCode) này đã tồn tại!')
    }

    // 2. Kiểm tra trùng tên vai trò
    const nameExisted = await rolesModel.findByField(roleName.trim(), 'roleName')
    if (nameExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'Tên vai trò (roleName) này đã tồn tại!')
    }

    // 3. Kiểm tra enum status
    if (status) {
      CHECK_ENUM(status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Trạng thái status không hợp lệ!')
    }

    const createData = {
      id: uuidv7(),
      roleCode: Number(roleCode),
      roleName: roleName.trim(),
      description: description || null,
      status: status || 'ENABLE'
    }

    return await rolesModel.create(createData)
  }

  /**
   * Cập nhật vai trò
   */
  async update(data) {
    const { id, ...payload } = data

    // 1. Kiểm tra tồn tại
    const existing = await rolesModel.findByUnique(id, 'id')
    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Vai trò không tồn tại hoặc đã bị xóa!')
    }

    // 2. Kiểm tra trùng mã vai trò
    if (payload.roleCode !== undefined) {
      const codeExisted = await rolesModel.findByField(Number(payload.roleCode), 'roleCode')
      if (codeExisted && codeExisted.id !== id) {
        throw new ApiError(StatusCodes.CONFLICT, 'Mã vai trò (roleCode) này đã tồn tại!')
      }
      payload.roleCode = Number(payload.roleCode)
    }

    // 3. Kiểm tra trùng tên vai trò
    if (payload.roleName) {
      const trimmedName = payload.roleName.trim()
      if (!trimmedName) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên vai trò không được để trống!')
      }

      const nameExisted = await rolesModel.findByField(trimmedName, 'roleName')
      if (nameExisted && nameExisted.id !== id) {
        throw new ApiError(StatusCodes.CONFLICT, 'Tên vai trò (roleName) này đã tồn tại!')
      }
      payload.roleName = trimmedName
    }

    // 4. Kiểm tra enum status
    if (payload.status !== undefined) {
      CHECK_ENUM(payload.status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Trạng thái status không hợp lệ. Cho phép: ${ALLOWED_STATUS.join(', ')}`)
    }

    // 5. Chuẩn hóa dữ liệu cập nhật
    const updateData = {}
    if (payload.roleCode !== undefined) updateData.roleCode = payload.roleCode
    if (payload.roleName !== undefined) updateData.roleName = payload.roleName
    if (payload.description !== undefined) updateData.description = payload.description
    if (payload.status !== undefined) updateData.status = payload.status

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không có dữ liệu gì để cập nhật!')
    }

    return await rolesModel.updateById(id, updateData)
  }

  /**
   * Xóa mềm vai trò
   */
  async delete(id) {
    const existing = await rolesModel.findByUnique(id, 'id')
    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Vai trò không tồn tại hoặc đã bị xóa!')
    }

    return await rolesModel.updateById(id, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
  }
}

export const rolesServices = new RolesServices()
