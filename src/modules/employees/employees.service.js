import { ALLOWED_STATUS, CHECK_ENUM } from '../../utils/constants.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { employeesModel } from './employees.model.js'
import { positionsModel } from '../positions/postisions.model.js'
import { organizationModel } from '../organization/organization.model.js'
import { PRISMA } from '../../configs/db.config.js'

class EmployeesServices {

  // Trích xuất phần local (trước @) từ email
  _extractLocalPart(email) {
    if (!email || !email.includes('@')) return null
    return email.trim().toLowerCase().split('@')[0]
  }

  // Kiểm tra trùng lặp phần local của email
  async _checkDuplicateLocalEmail(email, excludeId = null) {
    const localPart = this._extractLocalPart(email)
    if (!localPart) return

    // Tìm tất cả nhân viên có email chứa phần local giống nhau (chưa bị xóa)
    const allEmployees = await PRISMA.eMPLOYEES.findMany({
      where: {
        email: { startsWith: `${localPart}@`, mode: 'insensitive' },
        deletedAt: null
      },
      select: { id: true, email: true, employeeCode: true, firstName: true, lastName: true }
    })

    // Loại bỏ chính nhân viên đang cập nhật (nếu có)
    const duplicates = allEmployees.filter(emp => emp.id !== excludeId)

    if (duplicates.length > 0) {
      const existingEmail = duplicates[0].email
      throw new ApiError(
        StatusCodes.CONFLICT,
        `Email đã tồn tại! Phần tên email "${localPart}" trùng với tài khoản "${existingEmail}" (${duplicates[0].firstName} ${duplicates[0].lastName}). Vui lòng sử dụng tên email khác.`
      )
    }
  }

  /**
   * Shared validation: employeeCode, email, status, FK (positionId, viettelId, unitId)
   * @param {object} data - payload to validate
   * @param {string|null} excludeId - employee UUID to exclude when checking uniqueness
   */
  async checked(data, excludeId = null) {
    // 1. employeeCode
    if (data.employeeCode) {
      const existedCode = await employeesModel.findByField(data.employeeCode, 'employeeCode')
      if (existedCode && existedCode.id !== excludeId) {
        throw new ApiError(StatusCodes.CONFLICT, 'This employee code is already taken!')
      }
    }

    // 2. email — kiểm tra trùng phần local (trước @)
    if (data.email) {
      await this._checkDuplicateLocalEmail(data.email, excludeId)
    }

    // 3. status
    if (data.status !== undefined) {
      CHECK_ENUM(data.status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed: ${ALLOWED_STATUS.join(', ')}`)
    }

    // // 4. FK: positionId
    // if (data.positionId) {
    //   await ServiceCore.CheckFindbyId(
    //     data.positionId,
    //     positionsModel,
    //     'Position ID',
    //     'Position ID is invalid!'
    //   )
    // }



    // // 6. FK: unitId
    // if (data.unitId) {
    //   await ServiceCore.CheckFindbyId(
    //     data.unitId,
    //     organizationModel,
    //     'Unit ID',
    //     'Unit ID is invalid!'
    //   )
    // }
  }

  /**
   * Get list of employees
   * - Nếu không gửi companyId → trả mảng rỗng (tránh nhầm lẫn giữa các công ty)
   * - Hỗ trợ search theo employeeCode, firstName, lastName, email
   * - Hỗ trợ filter theo companyId, unitId, branchId, status
   */
  async lists(data) {
    const {
      status, info, search, keyword,
      page, limit, limitVal, pageSize,
      unitId, unitid,
      companyId, companyid,
      branchId, branchid
    } = data

    const resolvedCompanyId = companyId || companyid
    const resolvedSearch = search || keyword
    const resolvedLimit = limit || limitVal || pageSize

    let queryStatus = status ? status.toUpperCase() : undefined
    if (queryStatus === 'DISABLE') queryStatus = 'DISABLED'

    if (queryStatus) {
      CHECK_ENUM(queryStatus, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, 'Invalid status.')
    }

    // Nếu có info → tìm chính xác 1 employee (giữ logic cũ)
    if (info !== undefined && info !== null && info !== '') {
      const isUuid = typeof info === 'string' && info.length === 36 && info.includes('-')
      const isNumber = !isNaN(Number(info))

      let existing
      if (isUuid) {
        existing = await employeesModel.findByUnique(info, 'id')
      } else if (isNumber) {
        existing = await employeesModel.findByUnique(Number(info), 'employeeId')
      } else {
        existing = await employeesModel.findByUnique(info, 'employeeCode')
      }

      if (!existing) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
      }
      return existing
    }

    return await employeesModel.listQuery(
      queryStatus,
      info,
      unitId || unitid,
      resolvedCompanyId,
      branchId || branchid,
      resolvedSearch,
      page,
      resolvedLimit
    )
  }

  /**
   * Create a new employee
   */
  async create(data) {
    const { isAccount: rawIsAccount, ...payload } = data
    const isAccount = rawIsAccount === true || rawIsAccount === 'true'
    if (!payload.status) throw new ApiError(StatusCodes.BAD_REQUEST, 'Status is required!')

    if (!payload.unitId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Đơn vị/phòng ban là bắt buộc để xác định vị trí thuộc công ty nào!')
    }

    const findUnit = await organizationModel.findByUnique(payload.unitId, 'id')
    if (!findUnit || findUnit.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Unit not found!')
    }

    if (!findUnit.companyId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Đơn vị/phòng ban đã chọn không thuộc bất kỳ công ty nào!')
    }

    const unitId = findUnit.orgUnitId

    let positionId = null
    if (payload.positionId) {
      const findPosition = await positionsModel.findByUnique(payload.positionId, 'id')
      if (!findPosition || findPosition.deletedAt) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Position not found!')
      }
      positionId = findPosition.positionId
    }

    // Kiểm tra employeeCode đã tồn tại chưa (bao gồm cả soft-deleted)
    if (payload.employeeCode) {
      const existingByCode = await PRISMA.eMPLOYEES.findFirst({
        where: { employeeCode: payload.employeeCode }
      })
      if (existingByCode) {
        if (existingByCode.deletedAt) {
          // Đã soft-delete → khôi phục lại
          return await PRISMA.$transaction(async (tx) => {
            const restored = await tx.eMPLOYEES.update({
              where: { employeeId: existingByCode.employeeId },
              data: {
                deletedAt: null,
                status: payload.status || 'ENABLE',
                firstName: payload.firstName || existingByCode.firstName,
                lastName: payload.lastName || existingByCode.lastName,
                phone: payload.phone ?? existingByCode.phone,
                email: payload.email ? payload.email.toLowerCase() : existingByCode.email,
                birthDate: payload.birthDate ? new Date(payload.birthDate) : existingByCode.birthDate,
                unitId,
                positionId,
                description: payload.description ?? existingByCode.description
              }
            })

            if (isAccount === true) {
              const emailToAccount = (payload.email || '').toLowerCase()
              if (!emailToAccount) {
                throw new ApiError(StatusCodes.BAD_REQUEST, 'A valid EMAIL is required to create an account!')
              }
              const existingAccount = await tx.aCCOUNTS.findFirst({
                where: { employeeId: restored.employeeId }
              })
              if (!existingAccount) {
                await tx.aCCOUNTS.create({
                  data: {
                    accountName: emailToAccount,
                    isLogin: true,
                    employeeId: restored.employeeId
                  }
                })
              }
            }

            return restored
          })
        }
        throw new ApiError(StatusCodes.CONFLICT, 'This employee code is already taken!')
      }
    }

    // Kiểm tra email đã tồn tại chưa — theo phần local (trước @)
    if (payload.email) {
      await this._checkDuplicateLocalEmail(payload.email)
    }

    // Kiểm tra status enum
    if (payload.status !== undefined) {
      CHECK_ENUM(payload.status, ALLOWED_STATUS, StatusCodes.BAD_REQUEST, `Invalid status. Allowed: ${ALLOWED_STATUS.join(', ')}`)
    }

    let emailToAccount = null
    if (isAccount === true) {
      emailToAccount = payload.email ? payload.email.toLowerCase() : null
      if (!emailToAccount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'A valid EMAIL is required to create an account!')
      }
    }

    const prismaPayload = {
      employeeCode: payload.employeeCode,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone || null,
      email: payload.email ? payload.email.toLowerCase() : null,
      birthDate: payload.birthDate ? new Date(payload.birthDate) : null,
      status: payload.status || 'ENABLE',
      isAccount: isAccount || false,
      unitId: unitId,
      positionId: positionId,
      description: payload.description || null
    }

    return await PRISMA.$transaction(async (tx) => {
      const createdEmp = await tx.eMPLOYEES.create({
        data: prismaPayload
      })

      if (isAccount === true) {
        const existingAccount = await tx.aCCOUNTS.findUnique({
          where: { accountName: emailToAccount }
        })
        if (existingAccount) {
          throw new ApiError(StatusCodes.CONFLICT, `Account name "${emailToAccount}" is already taken!`)
        }

        await tx.aCCOUNTS.create({
          data: {
            accountName: emailToAccount,
            isLogin: true,
            employeeId: createdEmp.employeeId
          }
        })
      }

      return createdEmp
    })
  }

  /**
   * Update Employee details
   */
  async update(data) {
    const { id, isAccount, ...payload } = data

    // 1. Verify existence
    const existing = await employeesModel.findByUnique(id, 'id')
    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
    }

    // 2. Validate input and unique checks
    await this.checked(payload, id)

    let unitId = undefined
    if (payload.unitId !== undefined) {
      if (!payload.unitId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Đơn vị/phòng ban là bắt buộc để xác định vị trí thuộc công ty nào!')
      }
      const findUnit = await organizationModel.findByUnique(payload.unitId, 'id')
      if (!findUnit || findUnit.deletedAt) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Unit not found!')
      }
      if (!findUnit.companyId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Đơn vị/phòng ban đã chọn không thuộc bất kỳ công ty nào!')
      }
      unitId = findUnit.orgUnitId
    }

    let positionId = undefined
    if (payload.positionId !== undefined) {
      if (payload.positionId) {
        const findPosition = await positionsModel.findByUnique(payload.positionId, 'id')
        if (!findPosition || findPosition.deletedAt) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Position not found!')
        }
        positionId = findPosition.positionId
      } else {
        positionId = null
      }
    }

    // 4. Normalize update data
    const updateData = {}
    if (payload.employeeCode !== undefined) updateData.employeeCode = payload.employeeCode
    if (payload.firstName !== undefined) updateData.firstName = payload.firstName
    if (payload.lastName !== undefined) updateData.lastName = payload.lastName
    if (payload.phone !== undefined) updateData.phone = payload.phone || null
    if (payload.email !== undefined) updateData.email = payload.email ? payload.email.toLowerCase() : null
    if (payload.birthDate !== undefined) updateData.birthDate = payload.birthDate ? new Date(payload.birthDate) : null
    if (payload.status !== undefined) updateData.status = payload.status
    if (payload.isAccount !== undefined) updateData.isAccount = payload.isAccount
    if (unitId !== undefined) updateData.unitId = unitId
    if (positionId !== undefined) updateData.positionId = positionId
    if (payload.description !== undefined) updateData.description = payload.description || null

    return await PRISMA.$transaction(async (tx) => {
      // 3. Handle account creation if isAccount is true
      if (isAccount === true && !existing.isAccount) {
        const emailToAccount = payload.email ? payload.email.toLowerCase() : existing.email ? existing.email.toLowerCase() : null
        if (!emailToAccount) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'A valid EMAIL is required to create an account!')
        }

        const existingAccount = await tx.aCCOUNTS.findUnique({
          where: { accountName: emailToAccount }
        })
        if (existingAccount) {
          throw new ApiError(StatusCodes.CONFLICT, `Account name "${emailToAccount}" is already taken!`)
        }

        await tx.aCCOUNTS.create({
          data: {
            accountName: emailToAccount,
            isLogin: true,
            employeeId: existing.employeeId
          }
        })
        updateData.isAccount = true
      }

      if (Object.keys(updateData).length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'No data to update!')
      }

      return await tx.eMPLOYEES.update({
        where: { id },
        data: updateData
      })
    })
  }

  /**
   * Delete an employee
   */
  async delete(id) {
    const existing = await employeesModel.findByUnique(id, 'id')

    if (!existing || existing.deletedAt) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee is not found!')
    }

    return await employeesModel.updateById(id, {
      deletedAt: new Date(),
      status: 'DISABLED'
    })
  }

  /**
   * Preview employee import from CSV data
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
    
    // Required headers: employeeCode, firstName, lastName, unitCode
    const required = ['employeecode', 'firstname', 'lastname', 'unitcode']
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

      // 1. employeeCode validation
      const employeeCode = rowData['employeecode']
      if (!employeeCode) {
        errors.push('Mã nhân viên là bắt buộc!')
      } else if (employeeCode.length < 6) {
        errors.push('Mã nhân viên phải tối thiểu 6 ký tự!')
      } else {
        const existed = await PRISMA.eMPLOYEES.findFirst({
          where: { employeeCode: employeeCode, deletedAt: null }
        })
        if (existed) {
          errors.push(`Mã nhân viên "${employeeCode}" đã tồn tại!`)
        }
      }

      // 2. firstName/lastName validation
      const firstName = rowData['firstname']
      const lastName = rowData['lastname']
      if (!firstName || !firstName.trim()) {
        errors.push('Họ nhân viên là bắt buộc!')
      }
      if (!lastName || !lastName.trim()) {
        errors.push('Tên nhân viên là bắt buộc!')
      }

      // 3. email validation
      const email = rowData['email']
      if (email && email.trim()) {
        const emailRegex = /^\S+@\S+\.\S+$/
        if (!emailRegex.test(email.trim())) {
          errors.push('Email không hợp lệ!')
        } else {
          const localPart = email.trim().toLowerCase().split('@')[0]
          const existedByLocal = await PRISMA.eMPLOYEES.findMany({
            where: {
              email: { startsWith: `${localPart}@`, mode: 'insensitive' },
              deletedAt: null
            },
            select: { email: true }
          })
          if (existedByLocal.length > 0) {
            errors.push(`Phần tên email "${localPart}" đã trùng với tài khoản "${existedByLocal[0].email}"!`)
          }
        }
      }

      // 4. unitCode validation
      const unitCode = rowData['unitcode']
      let unitRecord = null
      if (!unitCode || !unitCode.trim()) {
        errors.push('Mã đơn vị/phòng ban là bắt buộc!')
      } else {
        unitRecord = await PRISMA.oRG_UNITS.findFirst({
          where: { orgUnitCode: unitCode.trim(), deletedAt: null }
        })
        if (!unitRecord) {
          errors.push(`Mã đơn vị "${unitCode}" không tồn tại!`)
        } else if (!unitRecord.companyId) {
          errors.push(`Đơn vị "${unitCode}" không thuộc bất kỳ công ty nào!`)
        }
      }

      // 5. positionName validation
      const positionName = rowData['positionname']
      let positionRecord = null
      if (positionName && positionName.trim()) {
        positionRecord = await PRISMA.pOSITIONS.findFirst({
          where: { positionName: positionName.trim(), deletedAt: null }
        })
        if (!positionRecord) {
          errors.push(`Chức vụ "${positionName}" không tồn tại!`)
        }
      }

      // 6. birthDate validation
      const birthDateStr = rowData['birthdate']
      let formattedBirthDate = null
      if (birthDateStr && birthDateStr.trim()) {
        const d = new Date(birthDateStr.trim())
        if (isNaN(d.getTime())) {
          errors.push('Ngày sinh không đúng định dạng (VD: YYYY-MM-DD)!')
        } else {
          formattedBirthDate = birthDateStr.trim()
        }
      }

      const isValid = errors.length === 0
      if (isValid) validCount++
      else invalidCount++

      records.push({
        rowNumber: i + 1,
        employeeCode: employeeCode,
        firstName: firstName,
        lastName: lastName,
        email: email || null,
        phone: rowData['phone'] || null,
        birthDate: formattedBirthDate,
        unitCode: unitCode,
        positionName: positionName || null,
        status: rowData['status'] || 'ENABLE',
        description: rowData['description'] || null,
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
        // Resolve unitId
        const unit = await tx.oRG_UNITS.findFirst({
          where: { orgUnitCode: rec.unitCode, deletedAt: null }
        })
        if (!unit) continue

        // Resolve positionId if any
        let positionId = null
        if (rec.positionName) {
          const position = await tx.pOSITIONS.findFirst({
            where: { positionName: rec.positionName, deletedAt: null }
          })
          if (position) {
            positionId = position.positionId
          }
        }

        // Resolve birthDate safely
        let birthDateVal = null
        if (rec.birthDate) {
          const d = new Date(rec.birthDate)
          if (!isNaN(d.getTime())) {
            birthDateVal = d
          }
        }

        // Insert employee
        await tx.eMPLOYEES.create({
          data: {
            id: uuidv7(),
            employeeCode: rec.employeeCode,
            firstName: rec.firstName,
            lastName: rec.lastName,
            phone: rec.phone || null,
            email: rec.email ? rec.email.toLowerCase() : null,
            birthDate: birthDateVal,
            status: rec.status || 'ENABLE',
            unitId: unit.orgUnitId,
            positionId: positionId,
            description: rec.description || null,
            isAccount: false
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
export const employeesServices = new EmployeesServices()
