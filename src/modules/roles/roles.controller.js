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
}

export const rolesController = new RolesController()
