import { organizationService } from './organization.service.js'
import { CreatedResponse, SuccessResponse } from '../../utils/SuccessResponse.js'
import Serializer from '../../utils/Serializer.js'

class OrganizationController {
  async lists(req, res, next) {
    try {
      const result = await organizationService.lists(req.query)

      const sanitizedResult = await Serializer.sanitize(result, ['orgUnitId', 'deletedAt'])
      new SuccessResponse({
        res: res,
        data: sanitizedResult,
        message: 'OK'
      })
    } catch (error) { next(error) }
  }

  async create(req, res, next) {
    try {
      const result = await organizationService.create(req.body)
      new CreatedResponse({
        res: res,
        data: result,
        message: 'OK'
      })
    } catch (error) { next(error) }
  }

  async update(req, res, next) {
    try {
      await organizationService.update(req.body)
      new SuccessResponse({
        res: res,
        data: [],
        message: 'OK'
      })
    } catch (error) { next(error) }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params
      await organizationService.delete(id)
      new SuccessResponse({
        res: res,
        message: 'OK',
        data: []
      })
    } catch (error) { next(error) }
  }
}

export const organizationController = new OrganizationController()
