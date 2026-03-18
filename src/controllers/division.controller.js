import { divisionService } from '../services/division.service.js'
import { divisionModel } from '../models/division.model.js'
import { CreatedResponse, SuccessResponse } from '../utils/SuccessResponse.js'


class DivisionController {
  //  get list
  async lists(req, res, next) {
    try {
      const result = await divisionModel.lists()
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Get the complete list of successful Division.'
      })
    } catch (error) { next(error) }
  }
  // create
  async create(req, res, next) {
    try {

      const result = await divisionService.create(req.body)
      new CreatedResponse({
        res: res,
        data: result,
        message: 'Created a successful division'
      })
    } catch (error) { next(error) }
  }

  // Update by Id
  async update(req, res, next) {
    try {
      const data = req.body
      console.log('🚀 ~ DivisionController ~ update ~ data:', data)
      await divisionService.update(data)
      new SuccessResponse({
        res: res,
        // data: result,
        message: 'Updating a successful division.'
      })
    } catch (error) { next(error) }
  }

  // delete by id
  async delete(req, res, next) {
    try {
      const { DIVISION_ID } = req.body

      await divisionService.delete(DIVISION_ID)
      new SuccessResponse({
        res: res,
        message: 'Complete the deletion of a division.'
      })
    } catch (error) { next(error) }
  }
}

export const divisionController = new DivisionController()
