import { CreatedResponse, SuccessResponse } from '../../utils/SuccessResponse.js'
import { permissionsServices } from './permissions.service.js'

class PermissionsController {
  // Lấy danh sách tất cả các quyền
  async lists(req, res, next) {
    try {
      const result = await permissionsServices.lists(req.query)
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Lấy danh sách quyền thành công.'
      })
    } catch (error) {
      next(error)
    }
  }

  // Thêm mới một quyền
  async create(req, res, next) {
    try {
      const result = await permissionsServices.create(req.body)
      new CreatedResponse({
        res: res,
        data: result,
        message: 'Thêm mới quyền thành công.'
      })
    } catch (error) {
      next(error)
    }
  }

  // Cập nhật thông tin quyền
  async update(req, res, next) {
    try {
      const result = await permissionsServices.update(req.body)
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Cập nhật thông tin quyền thành công.'
      })
    } catch (error) {
      next(error)
    }
  }

  // Xóa mềm quyền
  async delete(req, res, next) {
    try {
      const { id } = req.params
      await permissionsServices.delete(id)
      new SuccessResponse({
        res: res,
        message: 'Xóa quyền thành công.'
      })
    } catch (error) {
      next(error)
    }
  }
}

export const permissionsController = new PermissionsController()
