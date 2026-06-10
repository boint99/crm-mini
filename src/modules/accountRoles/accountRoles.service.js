import { PRISMA } from '../../configs/db.config.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { accountRolesModel } from './accountRoles.model.js'
import { v7 as uuidv7 } from 'uuid'

class AccountRolesServices {
  /**
   * Lấy danh sách tất cả các phân vai trò (bao gồm thông tin Account và Role)
   */
  async lists() {
    return await PRISMA.aCCOUNT_ROLES.findMany({
      where: { deletedAt: null },
      include: {
        account: {
          select: { accountId: true, accountName: true }
        },
        role: {
          select: { roleId: true, roleName: true, roleCode: true }
        }
      }
    })
  }

  /**
   * Gán vai trò cho tài khoản
   */
  async assign(data) {
    const { accountId, roleId } = data
    const targetAccountId = Number(accountId)
    const targetRoleId = Number(roleId)

    // 1. Kiểm tra tài khoản có tồn tại không
    const account = await PRISMA.aCCOUNTS.findFirst({
      where: { accountId: targetAccountId, deletedAt: null }
    })
    if (!account) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Tài khoản không tồn tại hoặc đã bị xóa!')
    }

    // 2. Kiểm tra vai trò có tồn tại không
    const role = await PRISMA.rOLES.findFirst({
      where: { roleId: targetRoleId, deletedAt: null }
    })
    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Vai trò không tồn tại hoặc đã bị xóa!')
    }

    // 3. Kiểm tra xem vai trò này đã được gán cho tài khoản chưa
    const existing = await PRISMA.aCCOUNT_ROLES.findFirst({
      where: {
        accountId: targetAccountId,
        roleId: targetRoleId
      }
    })

    if (existing) {
      // Nếu đã gán và chưa xóa
      if (existing.deletedAt === null) {
        throw new ApiError(StatusCodes.CONFLICT, 'Tài khoản này đã sở hữu vai trò này rồi!')
      }
      // Nếu trước đó đã bị xóa (soft delete), ta RESTORE lại
      return await accountRolesModel.updateById(existing.id, {
        deletedAt: null
      })
    }

    // 4. Nếu chưa từng gán, tạo liên kết mới
    // Đồng bộ sequence cho ACCOUNT_ROLES
    await PRISMA.$executeRawUnsafe('SELECT setval(pg_get_serial_sequence(\'"ACCOUNT_ROLES"\', \'AR_ID\'), COALESCE(MAX("AR_ID"), 1)) FROM "ACCOUNT_ROLES";')

    const createData = {
      id: uuidv7(),
      accountId: targetAccountId,
      roleId: targetRoleId
    }

    return await accountRolesModel.create(createData)
  }

  /**
   * Thu hồi vai trò khỏi tài khoản
   */
  async revoke(id) {
    const existing = await accountRolesModel.findByUnique(id, 'id')
    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Liên kết gán vai trò không tồn tại hoặc đã bị thu hồi!')
    }

    return await accountRolesModel.updateById(id, {
      deletedAt: new Date()
    })
  }
}

export const accountRolesServices = new AccountRolesServices()
