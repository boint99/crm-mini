import { CreatedResponse, SuccessResponse } from '../utils/SuccessResponse.js'
import { positionsModel } from '../models/postisions.model.js'
import { positionsServices } from '../services/positions.service.js'


class PositionsController {
  //  get list
  async lists(req, res, next) {
    try {
      const result = await positionsModel.lists()
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Positions fetched successfully.'
      })
    } catch (error) { next(error) }
  }
  // create
  async create(req, res, next) {
    try {
      const result = await positionsServices.create(req.body)
      new CreatedResponse({
        res: res,
        data: result,
        message: 'Position created successfully.'
      })
    } catch (error) { next(error) }
  }

  // Update by Id
  async update(req, res, next) {
    try {
      const data = req.body
      await positionsServices.update(data)
      new SuccessResponse({
        res: res,
        message: 'Position updated successfully.'
      })
    } catch (error) { next(error) }
  }

  // delete by id
  async delete(req, res, next) {
    try {
      const { id } = req.params

      await positionsServices.delete(id)
      new SuccessResponse({
        res: res,
        message: 'Position deleted successfully.'
      })
    } catch (error) { next(error) }
  }
}

export const positionsController = new PositionsController()
