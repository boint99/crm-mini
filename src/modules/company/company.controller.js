import { companyService } from './company.service.js'
import { CreatedResponse, SuccessResponse } from '../../utils/SuccessResponse.js'
import Serializer from '../../utils/Serializer.js'

class CompanyController {
  async lists(req, res, next) {
    try {
      const result = await companyService.lists()

      const sanitizedResult = await Serializer.sanitize(result, ['companyId', 'deletedAt'])
      new SuccessResponse({
        res: res,
        data: sanitizedResult,
        message: 'OK.'
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
        message: 'OK.'
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
        message: 'OK.'
      })
    } catch (error) { next(error) }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.params
      await companyService.delete(id)
      new SuccessResponse({
        res: res,
        message: 'OK.',
        data: []
      })
    } catch (error) { next(error) }
  }
}

export const companyController = new CompanyController()
