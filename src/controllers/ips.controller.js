import { CreatedResponse, SuccessResponse } from '../utils/SuccessResponse.js'
import { ipsService } from '../services/ips.service.js'


class IpsController {
  //  get list
  async lists(req, res, next) {
    try {
      const result = await ipsService.ipqueryBuilder(req.query).lists()
      new SuccessResponse({
        res: res,
        data: result,
        message: 'IP addresses fetched successfully.'
      })
    } catch (error) { next(error) }
  }
  // create
  async create(req, res, next) {
    try {
      const result = await ipsService.create(req.body)
      new CreatedResponse({
        res: res,
        data: result,
        message: 'IP address created successfully.'
      })
    } catch (error) { next(error) }
  }
  // Update by Id
  async update(req, res, next) {
    try {
      const data = req.body
      await ipsService.update(data)
      new SuccessResponse({
        res: res,
        message: 'IP address updated successfully.'
      })
    } catch (error) { next(error) }
  }

  // delete by id
  async delete(req, res, next) {
    try {
      const { id } = req.params

      await ipsService.delete(id)
      new SuccessResponse({
        res: res,
        message: 'IP address deleted successfully.'
      })
    } catch (error) { next(error) }
  }
}

export const ipsController = new IpsController()
