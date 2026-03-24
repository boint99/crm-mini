import { CreatedResponse, SuccessResponse } from '../utils/SuccessResponse.js'
import { employeesServices } from '../services/employees.service.js'
import { employeesModel } from '../models/employees.model.js'


class EmployeesController {
  // list
  async lists(req, res, next) {
    try {
      const result = await employeesModel.lists()
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
      const result = await employeesServices.create(req.body)
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
      await employeesServices.update(data)
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

      await employeesServices.delete(id)
      new SuccessResponse({
        res: res,
        message: 'Employee deleted successfully.'
      })
    } catch (error) { next(error) }
  }
}

export const employeesController = new EmployeesController()
