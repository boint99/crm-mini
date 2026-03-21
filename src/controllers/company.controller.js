import { companyService } from '../services/company.service.js'
import { companyModel } from '../models/company.model.js'
import { CreatedResponse, SuccessResponse } from '../utils/SuccessResponse.js'

class CompanyController {
  //  get list
  async getList(req, res, next) {
    try {
      const result = await companyModel.listAll()

      new SuccessResponse({
        res: res,
        data: result,
        message: 'Get the complete list of successful companies.'
      })
    } catch (error) { next(error) }
  }
  // create
  async create(req, res, next) {
    try {

      const result = await companyService.create(req.body)
      new CreatedResponse({
        res: res,
        data: result,
        message: 'Create a successful company'
      })
    } catch (error) { next(error) }
  }

  // Update by Id
  async update(req, res, next) {
    try {
      const { COMPANY_ID } = req.body

      const result = await companyService.update(Number(COMPANY_ID), req.body)
      new SuccessResponse({
        res: res,
        data: result,
        message: 'Updating a successful company.'
      })
    } catch (error) { next(error) }
  }

  // delete by id
  async delete(req, res, next) {
    try {
      const { id } = req.params
      await companyService.delete(id)
      new SuccessResponse({
        res: res,
        message: 'Complete the deletion of a company.'
      })
    } catch (error) { next(error) }
  }
}

export const companyController = new CompanyController()