import { CreatedResponse, SuccessResponse } from '../../utils/SuccessResponse.js'
import { accountRolesServices } from './accountRoles.service.js'

class AccountRolesController {
  // Lấy danh sách liên kết vai trò - tài khoản
  async lists(req, res, next) {
    try {
      const result = await accountRolesServices.lists()
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Lấy danh sách tài khoản - vai trò thành công.'
      })
    } catch (error) {
      next(error)
    }
  }

  // Gán vai trò cho tài khoản
  async assign(req, res, next) {
    try {
      const result = await accountRolesServices.assign(req.body)
      new CreatedResponse({
        res: res,
        data: result,
        message: 'Gán vai trò thành công.'
      })
    } catch (error) {
      next(error)
    }
  }

  // Thu hồi vai trò khỏi tài khoản
  async revoke(req, res, next) {
    try {
      const { id } = req.params
      await accountRolesServices.revoke(id)
      new SuccessResponse({
        res: res,
        message: 'Thu hồi vai trò thành công.'
      })
    } catch (error) {
      next(error)
    }
  }
}

export const accountRolesController = new AccountRolesController()
