import { ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { branchesModel } from '../models/branch.model.js'

class BranchesServices {
  /**
   * Create a new branch
   */
  async create(data) {
    // 1. Check required fields
    if (!data.BRANCH_NAME || !data.BRANCH_NAME.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The name cannot be left blank!')
    }
    if (!data.BRANCH_CODE || !data.BRANCH_CODE.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The branch code cannot be left blank!')
    }
    // 2. Check unique BRANCH_CODE
    const codeExists = await branchesModel.findByCode(data.BRANCH_CODE.trim())
    if (codeExists) {
      throw new ApiError(StatusCodes.CONFLICT, 'This branch code is already taken!')
    }
    // 3. Check unique BRANCH_NAME
    const isNameExisted = await branchesModel.findByName(data.BRANCH_NAME.trim())
    if (isNameExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken!')
    }
    // 4. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    return await branchesModel.create(data)
  }

  /**
   * Update Branch details
   */
  async update(data) {
    const { BRANCH_ID, ...payload } = data

    // 1. Verify existence
    const checkId = await branchesModel.findById(BRANCH_ID)
    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Branch is not found!')
    }

    // 2. Logic check for Branch Name
    if (payload.BRANCH_NAME) {
      const trimmedName = payload.BRANCH_NAME.trim()
      if (!trimmedName) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The Branch name cannot be left blank!')
      }

      const isExisted = await branchesModel.findByName(trimmedName)

      if (isExisted && isExisted.BRANCH_ID !== BRANCH_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken by another Branch!')
      }
      payload.BRANCH_NAME = trimmedName
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)

    return await branchesModel.updateById(BRANCH_ID, payload)
  }

  /**
   * Delete a branch
   */
  async delete(id) {
    const idToNumber = Number(id)

    if (isNaN(idToNumber) || idToNumber <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Branch id is required!')
    }

    const existing = await branchesModel.findById(idToNumber)

    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Branch is not found!')
    }

    return await branchesModel.deleteById(idToNumber)
  }
}

// Export an instance of the class
export const branchesServices = new BranchesServices()