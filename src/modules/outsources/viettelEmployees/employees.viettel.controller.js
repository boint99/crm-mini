import { CreatedResponse, SuccessResponse } from '../../../utils/SuccessResponse.js'
import { employeesViettelServices } from './employees.viettel.service.js'


class EmployeesViettelController {
  // list
  async lists(req, res, next) {
    try {
      const result = await employeesViettelServices.Lists()
      new SuccessResponse({
        res: res,
        data: result,
        message: 'OK'
      })
    } catch (error) { next(error) }
  }
  // create
  async create(req, res, next) {
    try {
      const result = await employeesViettelServices.create(req.body)
      new CreatedResponse({
        res: res,
        data: result,
        message: 'Ok'
      })
    } catch (error) { next(error) }
  }

  // Update by Id
  async update(req, res, next) {
    try {
      const data = req.body
      await employeesViettelServices.update(data)
      new SuccessResponse({
        res: res,
        message: 'Ok'
      })
    } catch (error) { next(error) }
  }

  // delete by id
  async delete(req, res, next) {
    try {
      const { id } = req.params

      await employeesViettelServices.delete(id)
      new SuccessResponse({
        res: res,
        message: 'Ok'
      })
    } catch (error) { next(error) }
  }
}

export const employeesViettelController = new EmployeesViettelController()
