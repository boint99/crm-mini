import { CreatedResponse, SuccessResponse } from '../../utils/SuccessResponse.js'
import { positionsServices } from './positions.service.js'


class PositionsController {
  //  get list
  async lists(req, res, next) {
    try {
      const result = await positionsServices.lists(req.query)
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
      const result = await positionsServices.create(req.body)
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
      await positionsServices.update(data)
      new SuccessResponse({
        res: res,
        message: 'OK'
      })
    } catch (error) { next(error) }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params

      await positionsServices.delete(id)
      new SuccessResponse({
        res: res,
        message: 'OK'
      })
    } catch (error) { next(error) }
  }

  // import preview
  async importPreview(req, res, next) {
    try {
      const result = await positionsServices.importPreview(req.body)
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
      const result = await positionsServices.importConfirm(req.body)
      new SuccessResponse({
        res: res,
        data: result,
        message: 'OK'
      })
    } catch (error) { next(error) }
  }
}

export const positionsController = new PositionsController()
