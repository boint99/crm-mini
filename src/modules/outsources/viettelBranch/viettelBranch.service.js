import { ALLOWED_STATUS, CHECK_ENUM } from '../../../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../utils/ApiError.js'
import { viettelBranchModel } from './viettelBranch.model.js'

class ViettelBranchServices {

  /**
   * Get list of viettel branches
   */
  async lists() {
    return await viettelBranchModel.lists()
  }

  /**
   * Create a new viettel branch
   */
  async create(data) {
    const { viettelBranchCode, viettelBranchName, status } = data

    // Validate required fields
    if (!viettelBranchCode || !viettelBranchCode.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Viettel branch code is required!')
    }

    // Check status enum
    const branchStatus = status || 'ENABLE'
    CHECK_ENUM(branchStatus, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed: ${ALLOWED_STATUS.join(', ')}`)

    // Check duplicate branch code
    const existedCode = await viettelBranchModel.findByField(viettelBranchCode.trim(), 'viettelBranchCode')
    if (existedCode) {
      throw new ApiError(StatusCodes.CONFLICT, 'This Viettel branch code is already taken!')
    }

    return await viettelBranchModel.create({
      viettelBranchCode: viettelBranchCode.trim(),
      viettelBranchName: viettelBranchName ? viettelBranchName.trim() : null,
      status: branchStatus
    })
  }

  /**
   * Update viettel branch
   */
  async update(data) {
    const { id, viettelBranchCode, viettelBranchName, status } = data

    // 1. Verify existence
    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ID is required!')
    }

    const existing = await viettelBranchModel.findByUnique(id, 'id')
    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Viettel branch not found!')
    }

    const payload = {}

    // 2. Check viettelBranchCode
    if (viettelBranchCode !== undefined) {
      const trimmedCode = String(viettelBranchCode).trim()
      if (!trimmedCode) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Viettel branch code cannot be empty!')
      }

      const existedCode = await viettelBranchModel.findByField(trimmedCode, 'viettelBranchCode')
      if (existedCode && existedCode.id !== id) {
        throw new ApiError(StatusCodes.CONFLICT, 'This Viettel branch code is already taken!')
      }
      payload.viettelBranchCode = trimmedCode
    }

    // 3. Check viettelBranchName
    if (viettelBranchName !== undefined) {
      payload.viettelBranchName = viettelBranchName ? viettelBranchName.trim() : null
    }

    // 4. Check status enum
    if (status !== undefined) {
      CHECK_ENUM(status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed: ${ALLOWED_STATUS.join(', ')}`)
      payload.status = status
    }

    if (Object.keys(payload).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No data to update!')
    }

    return await viettelBranchModel.updateById(id, payload)
  }

  /**
   * Soft delete viettel branch
   */
  async delete(id) {
    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ID is required!')
    }

    const existing = await viettelBranchModel.findByUnique(id, 'id')
    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Viettel branch not found!')
    }

    return await viettelBranchModel.updateById(id, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
  }
}

export const viettelBranchServices = new ViettelBranchServices()
