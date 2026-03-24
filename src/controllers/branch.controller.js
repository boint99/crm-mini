import { CreatedResponse, SuccessResponse } from '../utils/SuccessResponse.js'
import { branchesModel } from '../models/branch.model.js'
import { branchesServices } from '../services/branch.service.js'


class BranchesController {
  //  get list
  async lists(req, res, next) {
    try {
      const result = await branchesModel.lists()
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Branches fetched successfully.'
      })
    } catch (error) { next(error) }
  }
  // create
  async create(req, res, next) {
    try {
      const result = await branchesServices.create(req.body)
      new CreatedResponse({
        res: res,
        data: result,
        message: 'Branch created successfully.'
      })
    } catch (error) { next(error) }
  }

  // Update by Id
  async update(req, res, next) {
    try {
      const data = req.body
      await branchesServices.update(data)
      new SuccessResponse({
        res: res,
        message: 'Branch updated successfully.'
      })
    } catch (error) { next(error) }
  }

  // delete by id
  async delete(req, res, next) {
    try {
      const { id } = req.params

      await branchesServices.delete(id)
      new SuccessResponse({
        res: res,
        message: 'Branch deleted successfully.'
      })
    } catch (error) { next(error) }
  }
}

export const branchesController = new BranchesController()
