import { companyService } from '../services/company.service.js'
import { companyModel } from '../models/company.model.js'
import { CreatedResponse, SuccessResponse } from '../utils/SuccessResponse.js'
import Serializer from '../utils/Serializer.js'

class CompanyController {
  //  get list
  async lists(req, res, next) {
    try {
      const result = await companyModel.listAll()

      const sanitizedResult = await  Serializer.sanitize(result, ['COMPANY_ID', 'DELETED_AT'])
      new SuccessResponse({
        res: res,
        data: sanitizedResult,
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
      await companyService.update(req.body)
      new SuccessResponse({
        res: res,
        data: [],
        message: 'Updating a successful company!'
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
        message: 'Complete the deletion of a company!',
        data: []
      })
    } catch (error) { next(error) }
  }
}

export const companyController = new CompanyController()