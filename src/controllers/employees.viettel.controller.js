import { CreatedResponse, SuccessResponse } from '../utils/SuccessResponse.js'
import { employeesViettelModel } from '../models/employees.viettel.model.js'
import { employeesViettelServices } from '../services/employees.viettel.service.js'


class EmployeesViettelController {
  // list
  async lists(req, res, next) {
    try {
      const result = await employeesViettelModel.lists()
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Employees fetched successfully.'
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
        message: 'Employee created successfully.'
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
        message: 'Employee updated successfully.'
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
        message: 'Employee deleted successfully.'
      })
    } catch (error) { next(error) }
  }
}

export const employeesViettelController = new EmployeesViettelController()
