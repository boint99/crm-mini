import { CreatedResponse, SuccessResponse } from '../../utils/SuccessResponse.js'
import { rolesServices } from './roles.service.js'

class RolesController {
  // Lấy danh sách tất cả các vai trò
  async lists(req, res, next) {
    try {
      const result = await rolesServices.lists()
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Lấy danh sách vai trò thành công.'
      })
    } catch (error) {
      next(error)
    }
  }

  // Thêm mới một vai trò
  async create(req, res, next) {
    try {
      const result = await rolesServices.create(req.body)
      new CreatedResponse({
        res: res,
        data: result,
        message: 'Tạo vai trò thành công.'
      })
    } catch (error) {
      next(error)
    }
  }

  // Cập nhật thông tin vai trò
  async update(req, res, next) {
    try {
      const result = await rolesServices.update(req.body)
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Cập nhật thông tin vai trò thành công.'
      })
    } catch (error) {
      next(error)
    }
  }

  // Xóa mềm vai trò
  async delete(req, res, next) {
    try {
      const { id } = req.params
      await rolesServices.delete(id)
      new SuccessResponse({
        res: res,
        message: 'Xóa vai trò thành công.'
      })
    } catch (error) {
      next(error)
    }
  }

  // Lấy danh sách các quyền hạn đã gán cho vai trò này
  async getPermissions(req, res, next) {
    try {
      const { id } = req.params
      const result = await rolesServices.getPermissions(id)
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Lấy danh sách quyền hạn của vai trò thành công.'
      })
    } catch (error) {
      next(error)
    }
  }

  // Cập nhật danh sách các quyền hạn cho vai trò này
  async assignPermissions(req, res, next) {
    try {
      const { id } = req.params
      const { perIds } = req.body
      const grantedBy = req.user.userId
      
      const result = await rolesServices.assignPermissions(id, perIds, grantedBy)
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Cập nhật phân quyền vai trò thành công.'
      })
    } catch (error) {
      next(error)
    }
  }
}

export const rolesController = new RolesController()
