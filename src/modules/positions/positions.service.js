import { ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { positionsModel } from './postisions.model.js'
import { v7 as uuidv7 } from 'uuid'
import { PRISMA } from '../../configs/db.config.js'

class PositionsServices {

  async lists(params = {}) {
    const { companyId } = params
    const query = {}
    if (companyId) {
      query.companyId = companyId
    }
    return await positionsModel.lists(query)
  }

  /**
   * Create a new position
   */
  async create(data) {
    const { positionName, level, status, companyId } = data
    // 1. Check required fields
    if (!positionName || !positionName.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The name cannot be left blank!')
    }

    // 2. Resolve company FK
    let companyIdDb = null
    if (companyId) {
      const company = await PRISMA.cOMPANY.findUnique({
        where: { id: companyId }
      })
      if (!company || company.deletedAt) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
      }
      companyIdDb = company.companyId
    }

    // 3. Kiểm tra tên chức vụ trong công ty (bao gồm cả soft-deleted)
    const existingIncDeleted = await PRISMA.pOSITIONS.findFirst({
      where: {
        positionName: positionName.trim(),
        companyId: companyIdDb
      }
    })

    if (existingIncDeleted) {
      if (existingIncDeleted.deletedAt) {
        // Đã soft-delete → khôi phục lại
        return await PRISMA.pOSITIONS.update({
          where: { positionId: existingIncDeleted.positionId },
          data: {
            deletedAt: null,
            status: status || 'ENABLE',
            positionName: positionName.trim(),
            level: level || existingIncDeleted.level,
            companyId: companyIdDb
          }
        })
      }
      throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken in this company!')
    }

    // 4. Check status enum
    CHECK_ENUM(status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status!')

    const createData = {
      id: uuidv7(),
      positionName: positionName.trim(),
      level: level || '',
      companyId: companyIdDb,
      status: status || 'ENABLE'
    }
    return await positionsModel.create(createData)
  }

  /**
   * Update Position details
   */
  async update(data) {
    const { id, companyId, ...payload } = data

    // 1. Verify existence
    const existing = await positionsModel.findByUnique(id, 'id')
    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Position is not found!')
    }

    let companyIdDb = undefined
    if (companyId !== undefined) {
      if (companyId) {
        const company = await PRISMA.cOMPANY.findUnique({
          where: { id: companyId }
        })
        if (!company || company.deletedAt) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found!')
        }
        companyIdDb = company.companyId
      } else {
        companyIdDb = null
      }
    }

    // 2. Logic check for Position Name within same company
    const checkName = payload.positionName !== undefined ? payload.positionName.trim() : existing.positionName
    const checkCompanyId = companyIdDb !== undefined ? companyIdDb : existing.companyId

    if (payload.positionName !== undefined) {
      if (!checkName) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'The Position name cannot be left blank!')
      }
    }

    if (payload.positionName !== undefined || companyIdDb !== undefined) {
      const isExisted = await PRISMA.pOSITIONS.findFirst({
        where: {
          positionName: checkName,
          companyId: checkCompanyId,
          deletedAt: null
        }
      })
      if (isExisted && isExisted.id !== id) {
        throw new ApiError(StatusCodes.CONFLICT, 'This name is already taken in this company!')
      }
    }

    // 3. Check status enum
    if (payload.status !== undefined) {
      CHECK_ENUM(payload.status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed values: ${ALLOWED_STATUS.join(', ')}`)
    }

    // 4. Normalize update data
    const updateData = {}
    if (payload.positionName !== undefined) updateData.positionName = checkName
    if (payload.level !== undefined) updateData.level = payload.level
    if (payload.status !== undefined) updateData.status = payload.status
    if (companyIdDb !== undefined) updateData.companyId = companyIdDb

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No data to update!')
    }

    return await positionsModel.updateById(id, updateData)
  }

  /**
   * Delete a position
   */
  async delete(id) {
    const existing = await positionsModel.findByUnique(id, 'id')

    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Position is not found!')
    }

    const employeeCount = await PRISMA.eMPLOYEES.count({
      where: { positionId: existing.positionId, deletedAt: null }
    })
    if (employeeCount > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        `Không thể xóa chức vụ này vì hiện có ${employeeCount} nhân sự đang liên kết với chức vụ này!`
      )
    }

    return await positionsModel.updateById(id, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
  }

  /**
   * Preview position import from CSV data
   */
  async importPreview(data) {
    const { csvText } = data
    if (!csvText || !csvText.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'CSV data is required!')
    }

    const lines = csvText.split(/\r?\n/).filter(line => line.trim())
    if (lines.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'CSV is empty!')
    }

    const parseCSVLine = (line) => {
      const result = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result.map(v => v.replace(/^["']|["']$/g, ''))
    }

    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase())
    
    // Required headers: positionName
    const required = ['positionname']
    const missing = required.filter(r => !headers.includes(r))
    if (missing.length > 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Missing required headers: ${missing.join(', ')}`)
    }

    const records = []
    let validCount = 0
    let invalidCount = 0

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      if (values.length < headers.length) continue

      const rowData = {}
      headers.forEach((header, idx) => {
        rowData[header] = values[idx] || null
      })

      const errors = []

      // 1. positionName validation
      const positionName = rowData['positionname']
      if (!positionName || !positionName.trim()) {
        errors.push('Tên chức vụ là bắt buộc!')
      }

      // 2. companyName validation (optional)
      const companyName = rowData['companyname']
      let companyRecord = null
      if (companyName && companyName.trim()) {
        companyRecord = await PRISMA.cOMPANY.findFirst({
          where: { companyName: companyName.trim(), deletedAt: null }
        })
        if (!companyRecord) {
          errors.push(`Công ty "${companyName}" không tồn tại hoặc đã ngừng hoạt động!`)
        }
      }

      // 3. duplicate positionName in company validation
      if (positionName && positionName.trim()) {
        const companyIdDb = companyRecord ? companyRecord.companyId : null
        const existed = await PRISMA.pOSITIONS.findFirst({
          where: {
            positionName: positionName.trim(),
            companyId: companyIdDb,
            deletedAt: null
          }
        })
        if (existed) {
          errors.push(`Chức vụ "${positionName}" đã tồn tại trong công ty ${companyName ? `"${companyName}"` : 'mặc định'}!`)
        }
      }

      // 4. status validation
      const status = rowData['status'] || 'ENABLE'
      if (status && status.trim() !== 'ENABLE' && status.trim() !== 'DISABLED') {
        errors.push('Trạng thái không hợp lệ! Chỉ chấp nhận ENABLE hoặc DISABLED.')
      }

      const isValid = errors.length === 0
      if (isValid) validCount++
      else invalidCount++

      records.push({
        rowNumber: i + 1,
        positionName: positionName ? positionName.trim() : null,
        level: rowData['level'] || '',
        companyName: companyName ? companyName.trim() : null,
        status: status.trim(),
        isValid,
        errors
      })
    }

    return {
      summary: {
        total: records.length,
        validCount,
        invalidCount
      },
      records
    }
  }

  /**
   * Confirm and import valid records into the database
   */
  async importConfirm(data) {
    const { records } = data
    if (!records || !Array.isArray(records) || records.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Records are required for confirmation!')
    }

    const { v7: uuidv7 } = await import('uuid')

    const imported = await PRISMA.$transaction(async (tx) => {
      let count = 0
      for (const rec of records) {
        let companyIdDb = null
        if (rec.companyName) {
          const company = await tx.cOMPANY.findFirst({
            where: { companyName: rec.companyName, deletedAt: null }
          })
          if (company) {
            companyIdDb = company.companyId
          }
        }

        // Insert position
        await tx.pOSITIONS.create({
          data: {
            id: uuidv7(),
            positionName: rec.positionName,
            level: rec.level || '',
            companyId: companyIdDb,
            status: rec.status || 'ENABLE'
          }
        })
        count++
      }
      return count
    })

    return { success: true, count: imported }
  }
}

// Export an instance of the class
export const positionsServices = new PositionsServices()
