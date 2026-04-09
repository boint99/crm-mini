import { ALLOWED_STATUS, CHECK_ENUM } from '../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { orgUnitsModel } from '../models/org.units.model.js'
import { employeesModel } from '../models/employees.model.js'
import { branchesModel } from '../models/branch.model.js'

class OrgUnitsServices {
  async buildTree() {
    return await orgUnitsModel.listTree()
  }
  /**
   * Create a new org.units
   */
  async create(data) {
    // 1. Check required fields
    if (!data.UNIT_NAME || !data.UNIT_NAME.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The name cannot be left blank!')
    }
    if (!data.UNIT_CODE || !data.UNIT_CODE.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The unit code cannot be left blank!')
    }

    // 2. Check unique UNIT_CODE
    const codeExists = await orgUnitsModel.findByCode(data.UNIT_CODE.trim())
    if (codeExists) {
      throw new ApiError(StatusCodes.CONFLICT, 'This unit code is already taken!')
    }

    // 3. Check existence
    const isExisted = await orgUnitsModel.findByName(data.UNIT_NAME.trim())

    if (isExisted) {
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken!')
    }

    // 4. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    if (data.BRANCH_ID) {
      const branch = await branchesModel.findById(Number(data.BRANCH_ID))
      if (!branch) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Branch ID is invalid!')
      }
    }

    return await orgUnitsModel.create(data)
  }

  /**
   * Update Org unit details
   */
  async update(data) {
    const { ORG_UNIT_ID, ...payload } = data

    // 1. Verify existence
    const checkId = await orgUnitsModel.findById(ORG_UNIT_ID)
    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Org unit is not found!')
    }

    // 2. Logic check for Org unit Name
    if (payload.UNIT_NAME) {
      const trimmedName = payload.UNIT_NAME.trim()
      if (!trimmedName) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The Org unit name cannot be left blank!')
      }

      const isExisted = await orgUnitsModel.findByName(trimmedName)

      if (isExisted && isExisted.ORG_UNIT_ID !== ORG_UNIT_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken by another Org unit!')
      }
      payload.UNIT_NAME = trimmedName
    }

    if (payload.UNIT_CODE !== undefined) {
      const trimmedCode = payload.UNIT_CODE.trim()
      if (!trimmedCode) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The unit code cannot be left blank!')
      }

      const codeExists = await orgUnitsModel.findByCode(trimmedCode)
      if (codeExists && codeExists.ORG_UNIT_ID !== ORG_UNIT_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'This unit code is already taken by another Org unit!')
      }
      payload.UNIT_CODE = trimmedCode
    }

    // 3. Check status enum
    CHECK_ENUM(data.STATUS, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)

    if (payload.BRANCH_ID !== undefined && payload.BRANCH_ID !== null) {
      const branch = await branchesModel.findById(Number(payload.BRANCH_ID))
      if (!branch) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Branch ID is invalid!')
      }
    }

    return await orgUnitsModel.updateById(ORG_UNIT_ID, payload)
  }

  /**
   * Delete a company
   */
  async delete(id) {
    const idToNumber = Number(id)

    if (isNaN(idToNumber) || idToNumber <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Org units id is required!')
    }

    const existing = await orgUnitsModel.findById(idToNumber)

    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Org units is not found!')
    }

    const hasChildren = await orgUnitsModel.findByField(idToNumber, 'PARENT_UNIT_ID')
    if (hasChildren) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Cannot delete Org unit: it still has child Org units!'
      )
    }

    const hasEmployees = await employeesModel.findbyField(idToNumber, 'UNIT_ID')
    if (hasEmployees) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Cannot delete Org unit: it is still referenced by employees!'
      )
    }

    return await orgUnitsModel.deleteById(idToNumber)
  }
}

// Export an instance of the class
export const orgUnitsServices = new OrgUnitsServices()