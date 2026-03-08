import { StatusCodes } from 'http-status-codes'
import { companyService } from '../services/company.service.js'
import { companyModel } from '../models/company.model.js'

export const companyController = {
  createNew: async (req, res, next) => {
    try {
      const data = req.body

      const result = await companyService.createNew(data)

      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Create a successful company',
        data: result
      })
    } catch (error) {
      next(error)
    }},
  // controller get all company
  getList: async (req, res, next) =>  {
    try {
      const result = await companyModel.listCompany()

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Get the complete list of successful companies.',
        data: result
      })
    } catch (error) {
      next(error)
    }
  },
  update: async (req, res, next) => {
    try {
      const id = Number(req.params.id)
      const data = req.body

      const result = await companyService.update(id,data)

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Updating a successful company.',
        data: result
      })
    } catch (error) {
      next(error)
    }},
  delete: async (req, res, next) => {
    try {
      const id = Number(req.params.id)

      await companyService.delete(id)

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Delete a successful company.'
      })
    } catch (error) {
      next(error)
    }}
}
