import { CreatedResponse, SuccessResponse } from '../utils/SuccessResponse.js'
import { vlansModel } from '../models/vlans.model.js'
import { vlansService } from '../services/vlans.service.js'


class VlansController {
  //  get list
  async lists(req, res, next) {
    try {
      const result = await vlansModel.lists()
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Vlans fetched successfully.'
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
        message: 'VLAN created successfully.'
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
        message: 'VLAN updated successfully.'
      })
    } catch (error) { next(error) }
  }

  // delete by id
  async delete(req, res, next) {
    try {
      const { id } = req.params

      await vlansService.delete(id)
      new SuccessResponse({
        res: res,
        message: 'VLAN deleted successfully.'
      })
    } catch (error) { next(error) }
  }
}

export const vlansController = new VlansController()
