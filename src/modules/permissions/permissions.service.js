import { ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { permissionsModel } from './permissions.model.js'
import { v7 as uuidv7 } from 'uuid'

class PermissionsServices {
  async lists() {
    return await permissionsModel.lists()
  }

  /**
   * Thêm mới một Quyền hạn
   */
  async create(data) {
    const { perCode, perName, apiPath, method, status, notes } = data

    // 1. Kiểm tra mã quyền duy nhất
    const codeExisted = await permissionsModel.findByField(Number(perCode), 'perCode')
    if (codeExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'Mã quyền (perCode) này đã tồn tại!')
    }

    // 2. Kiểm tra tên quyền duy nhất
    const nameExisted = await permissionsModel.findByField(perName.trim(), 'perName')
    if (nameExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'Tên quyền (perName) này đã tồn tại!')
    }

    // 3. Kiểm tra enum status
    if (status) {
      CHECK_ENUM(status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Trạng thái status không hợp lệ!')
    }

    const createData = {
      id: uuidv7(),
      perCode: Number(perCode),
      perName: perName.trim(),
      apiPath: apiPath ? apiPath.trim() : null,
      method: method ? method.trim().toUpperCase() : null,
      status: status || 'ENABLE',
      notes: notes || null
    }

    return await permissionsModel.create(createData)
  }

  /**
   * Cập nhật Quyền hạn
   */
  async update(data) {
    const { id, ...payload } = data

    // 1. Xác thực sự tồn tại
    const existing = await permissionsModel.findByUnique(id, 'id')
    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Quyền hạn không tồn tại hoặc đã bị xóa!')
    }

    // 2. Kiểm tra tính duy nhất nếu thay đổi mã quyền (perCode)
    if (payload.perCode !== undefined) {
      const codeExisted = await permissionsModel.findByField(Number(payload.perCode), 'perCode')
      if (codeExisted && codeExisted.id !== id) {
        throw new ApiError(StatusCodes.CONFLICT, 'Mã quyền (perCode) này đã tồn tại!')
      }
      payload.perCode = Number(payload.perCode)
    }

    // 3. Kiểm tra tính duy nhất nếu thay đổi tên quyền (perName)
    if (payload.perName) {
      const trimmedName = payload.perName.trim()
      if (!trimmedName) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên quyền không được để trống!')
      }

      const nameExisted = await permissionsModel.findByField(trimmedName, 'perName')
      if (nameExisted && nameExisted.id !== id) {
        throw new ApiError(StatusCodes.CONFLICT, 'Tên quyền (perName) này đã tồn tại!')
      }
      payload.perName = trimmedName
    }

    // 4. Kiểm tra enum status
    if (payload.status !== undefined) {
      CHECK_ENUM(payload.status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Trạng thái status không hợp lệ. Cho phép: ${ALLOWED_STATUS.join(', ')}`)
    }

    // 5. Chuẩn hóa dữ liệu cập nhật
    const updateData = {}
    if (payload.perCode !== undefined) updateData.perCode = payload.perCode
    if (payload.perName !== undefined) updateData.perName = payload.perName
    if (payload.apiPath !== undefined) updateData.apiPath = payload.apiPath ? payload.apiPath.trim() : null
    if (payload.method !== undefined) updateData.method = payload.method ? payload.method.trim().toUpperCase() : null
    if (payload.status !== undefined) updateData.status = payload.status
    if (payload.notes !== undefined) updateData.notes = payload.notes

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không có dữ liệu gì để cập nhật!')
    }

    return await permissionsModel.updateById(id, updateData)
  }

  /**
   * Xóa mềm Quyền hạn
   */
  async delete(id) {
    const existing = await permissionsModel.findByUnique(id, 'id')
    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Quyền hạn không tồn tại hoặc đã bị xóa!')
    }

    return await permissionsModel.updateById(id, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
  }
}

export const permissionsServices = new PermissionsServices()
