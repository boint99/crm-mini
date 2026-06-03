import { CreatedResponse, SuccessResponse } from '../../../utils/SuccessResponse.js'
import { viettelBranchServices } from './viettelBranch.service.js'

class ViettelBranchController {
  // list
  async lists(req, res, next) {
    try {
      const result = await viettelBranchServices.lists()
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
      const result = await viettelBranchServices.create(req.body)
      new CreatedResponse({
        res: res,
        data: result,
        message: 'Ok'
      })
    } catch (error) { next(error) }
  }

  // update
  async update(req, res, next) {
    try {
      const data = req.body
      await viettelBranchServices.update(data)
      new SuccessResponse({
        res: res,
        message: 'Ok'
      })
    } catch (error) { next(error) }
  }

  // delete
  async delete(req, res, next) {
    try {
      const { id } = req.params
      await viettelBranchServices.delete(id)
      new SuccessResponse({
        res: res,
        message: 'Ok'
      })
    } catch (error) { next(error) }
  }
}

export const viettelBranchController = new ViettelBranchController()
