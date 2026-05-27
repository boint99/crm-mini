import { CreatedResponse, SuccessResponse } from '../../../utils/SuccessResponse.js'
import { vlansService } from './vlans.service.js'


class VlansController {
  //  get list
  async lists(req, res, next) {
    try {
      const result = await vlansService.lists(req.query)
      new SuccessResponse({
        res: res,
        data: result,
        message: 'OK.'
      })
    } catch (error) { next(error) }
  }
  // create
  async create(req, res, next) {
    try {
      const result = await vlansService.create(req.body)
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
      await vlansService.update(data)
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
      console.log('🚀 ~ VlansController ~ delete ~ id:', id)

      await vlansService.delete(id)
      new SuccessResponse({
        res: res,
        message: 'OK'
      })
    } catch (error) { next(error) }
  }
}

export const vlansController = new VlansController()
