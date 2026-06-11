import { ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { rolesModel } from './roles.model.js'
import { v7 as uuidv7 } from 'uuid'
import { PRISMA } from '../../configs/db.config.js'

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
    const codeExisted = await rolesModel.findByField(roleCode.trim(), 'roleCode')
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
      roleCode: roleCode.trim(),
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
      const trimmedCode = payload.roleCode.trim()
      if (!trimmedCode) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Mã vai trò không được để trống!')
      }
      const codeExisted = await rolesModel.findByField(trimmedCode, 'roleCode')
      if (codeExisted && codeExisted.id !== id) {
        throw new ApiError(StatusCodes.CONFLICT, 'Mã vai trò (roleCode) này đã tồn tại!')
      }
      payload.roleCode = trimmedCode
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

  /**
   * Lấy danh sách ID các quyền hạn của một vai trò
   */
  async getPermissions(roleUuid) {
    // 1. Kiểm tra vai trò tồn tại
    const role = await rolesModel.findByUnique(roleUuid, 'id')
    if (!role || role.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Vai trò không tồn tại hoặc đã bị xóa!')
    }

    // 2. Tìm danh sách liên kết ROLE_PERMISSIONS đang hoạt động
    const rolePermissions = await PRISMA.rOLE_PERMISSIONS.findMany({
      where: {
        roleId: role.roleId,
        deletedAt: null
      },
      select: {
        perId: true
      }
    })

    return rolePermissions.map(rp => rp.perId)
  }

  /**
   * Cập nhật (gán mới/thu hồi) quyền hạn cho vai trò
   */
  async assignPermissions(roleUuid, perIds, grantedBy) {
    // 1. Kiểm tra vai trò tồn tại
    const role = await rolesModel.findByUnique(roleUuid, 'id')
    if (!role || role.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Vai trò không tồn tại hoặc đã bị xóa!')
    }

    // 2. Lấy danh sách quyền hạn hiện tại của vai trò này (gồm cả đã xóa mềm để restore nếu cần)
    const existingRPs = await PRISMA.rOLE_PERMISSIONS.findMany({
      where: { roleId: role.roleId }
    })

    // Phân loại:
    // perIds: danh sách mới từ request [1, 2, 3]
    const dbPerIds = existingRPs.filter(rp => rp.deletedAt === null).map(rp => rp.perId)

    // Quyền cần thu hồi (có trong DB hoạt động nhưng không có trong danh sách mới)
    const perIdsToRevoke = dbPerIds.filter(id => !perIds.includes(id))

    // Quyền cần gán thêm (có trong danh sách mới nhưng không có trong DB hoạt động)
    const perIdsToAssign = perIds.filter(id => !dbPerIds.includes(id))

    // Thực thi transaction
    await PRISMA.$transaction(async (tx) => {
      // Thu hồi quyền (đánh dấu soft delete)
      if (perIdsToRevoke.length > 0) {
        await tx.rOLE_PERMISSIONS.updateMany({
          where: {
            roleId: role.roleId,
            perId: { in: perIdsToRevoke }
          },
          data: {
            deletedAt: new Date()
          }
        })
      }

      // Gán quyền mới
      for (const pId of perIdsToAssign) {
        // Kiểm tra xem đã từng có bản ghi chưa (để restore)
        const previouslyCreated = existingRPs.find(rp => rp.perId === pId)

        if (previouslyCreated) {
          // Restore bản ghi cũ
          await tx.rOLE_PERMISSIONS.update({
            where: { rpId: previouslyCreated.rpId },
            data: {
              deletedAt: null,
              revokedAt: null,
              grantedBy: Number(grantedBy)
            }
          })
        } else {
          // Reset sequence trước khi tạo mới để tránh xung đột autoincrement
          await tx.$executeRawUnsafe(
            'SELECT setval(pg_get_serial_sequence(\'"ROLE_PERMISSIONS"\', \'RP_ID\'), COALESCE(MAX("RP_ID"), 1)) FROM "ROLE_PERMISSIONS";'
          )

          // Tạo bản ghi mới hoàn toàn
          await tx.rOLE_PERMISSIONS.create({
            data: {
              id: uuidv7(),
              roleId: role.roleId,
              perId: pId,
              grantedBy: Number(grantedBy)
            }
          })
        }
      }
    })

    return { success: true }
  }
}

export const rolesServices = new RolesServices()
