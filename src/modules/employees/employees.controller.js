import { CreatedResponse, SuccessResponse } from '../../utils/SuccessResponse.js'
import { employeesServices } from './employees.service.js'


class EmployeesController {
  // list
  async lists(req, res, next) {
    try {
      const result = await employeesServices.lists(req.query)
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
      const result = await employeesServices.create(req.body)
      new CreatedResponse({
        res: res,
        data: result,
        message: 'OK'
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
        message: 'OK'
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
        message: 'OK'
      })
    } catch (error) { next(error) }
  }

  // import preview
  async importPreview(req, res, next) {
    try {
      const result = await employeesServices.importPreview(req.body)
      new SuccessResponse({
        res: res,
        data: result,
        message: 'OK'
      })
    } catch (error) { next(error) }
  }

  // import confirm
  async importConfirm(req, res, next) {
    try {
      const result = await employeesServices.importConfirm(req.body)
      new SuccessResponse({
        res: res,
        data: result,
        message: 'OK'
      })
    } catch (error) { next(error) }
  }
}

export const employeesController = new EmployeesController()
