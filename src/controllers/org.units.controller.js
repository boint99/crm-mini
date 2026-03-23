import { CreatedResponse, SuccessResponse } from '../utils/SuccessResponse.js'
import { orgUnitsServices } from '../services/org.units.service.js'
import { orgUnitsModel } from '../models/org.units.model.js'


class OrgUnitsController {
  //  get list
  async lists(req, res, next) {
    try {
      const result = await orgUnitsModel.lists()
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Org units fetched successfully.'
      })
    } catch (error) { next(error) }
  }
  // create
  async create(req, res, next) {
    try {
      console.log('RUN')
      const result = await orgUnitsServices.create(req.body)
      new CreatedResponse({
        res: res,
        data: result,
        message: 'Org unit created successfully.'
      })
    } catch (error) { next(error) }
  }

  // Update by Id
  async update(req, res, next) {
    try {
      const data = req.body
      await orgUnitsServices.update(data)
      new SuccessResponse({
        res: res,
        message: 'Org unit updated successfully.'
      })
    } catch (error) { next(error) }
  }

  // delete by id
  async delete(req, res, next) {
    try {
      const { id } = req.params

      await orgUnitsServices.delete(id)
      new SuccessResponse({
        res: res,
        message: 'Org unit deleted successfully.'
      })
    } catch (error) { next(error) }
  }
}

export const orgUnitsController = new OrgUnitsController()
