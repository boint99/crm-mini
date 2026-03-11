import { StatusCodes } from 'http-status-codes'
import { divisionService } from '../services/division.service.js'
import { divisionModel } from '../models/division.model.js'

export const divisionController = {
  create: async (req, res, next) => {
    try {
      const data = req.body

      const result = await divisionService.create(data)

      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Create a successful divisions',
        data: result
      })
    } catch (error) {
      next(error)
    }},
  // controller get all company
  list: async (req, res, next) =>  {
    try {
      const result = await divisionModel.listAll()

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Get the complete list of successful divisions.',
        data: result
      })
    } catch (error) {
      next(error)
    }
  },
  update: async (req, res, next) => {
    try {
      const  data = req.body

      const result = await divisionService.update(data)

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Updating a successful division.',
        data: result
      })
    } catch (error) {
      next(error)
    }},
  delete: async (req, res, next) => {
    try {
      await divisionService.delete(req.body)

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Delete a successful division.'
      })
    } catch (error) {
      next(error)
    }}
}
