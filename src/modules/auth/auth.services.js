import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../utils/ApiError.js'
import { accountsModel } from '../accounts/accounts.model.js'
import { employeesModel } from '../employees/employees.model.js'
import { saltRoundsPassword } from '../../utils/constants.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken, decodeToken } from '../../utils/jwt.js'
import Serializer from '../../utils/Serializer.js'
import { refreshTokenModel } from './refreshToken.model.js'
import { PRISMA } from '../../configs/db.config.js'
import { otpModel } from '../otp/otp.model.js'
import { v7 as uuidv7 } from 'uuid'

class AuthService {
  _validateRegister(data) {
    const { firstName, lastName, email, password, confirmPassword } = data

    if (!firstName?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'First name is required!')
    }

    if (!lastName?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Last name is required!')
    }

    if (!email?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is required!')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid email format!')
    }

    if (!password?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is required!')
    }

    if (!confirmPassword?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Confirm password is required!')
    }

    if (password !== confirmPassword) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Password not match!')
    }

    if (password.length < 8) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Password must be >= 8 chars!')
    }

    return {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim()
    }
  }

  // ================= CHECK DB =================
  async _ensureEmailNotExists(email) {
    const existingEmployee = await employeesModel.findByField(email, 'email')
    if (existingEmployee) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already registered!')
    }

    // accountName lưu email đầy đủ
    const existingAccount = await accountsModel.findByUnique(email, 'accountName')
    if (existingAccount) {
      throw new ApiError(StatusCodes.CONFLICT, 'Account already registered!')
    }
  }

  // ================= REGISTER =================
  async register(data) {
    const { email, password, user_name, empolyeeCode, is_login, otp } = data

    // 1. Verify OTP
    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = String(otp).trim()

    const checkOtp = await otpModel.model.findFirst({
      where: {
        email: cleanEmail,
        otpCode: cleanOtp,
        otpType: 'REGISTER',
        expiredAt: { gt: new Date() }
      }
    })

    if (!checkOtp) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP is invalid or has expired!')
    }

    // Delete the verified OTP
    await otpModel.model.deleteMany({
      where: {
        email: cleanEmail,
        otpType: 'REGISTER'
      }
    })

    // 2. Check duplicate email
    await this._ensureEmailNotExists(cleanEmail)

    // 3. Resolve employee link if employeeCode or email matches
    let employeeId = null
    let matchedEmployee = null

    if (empolyeeCode?.trim()) {
      matchedEmployee = await employeesModel.findByField(empolyeeCode.trim(), 'employeeCode')
    }
    if (!matchedEmployee) {
      matchedEmployee = await employeesModel.findByField(cleanEmail, 'email')
    }

    if (matchedEmployee) {
      employeeId = matchedEmployee.employeeId
    }

    // 4. Create account - save full email as accountName
    const account = await PRISMA.aCCOUNTS.create({
      data: {
        id: uuidv7(),
        accountName: cleanEmail,
        password: await bcrypt.hash(password.trim(), saltRoundsPassword),
        employeeId: employeeId,
        isLogin: is_login !== undefined ? is_login : true,
        status: 'ENABLE',
        login: 0,
        description: `Registered: ${user_name?.trim()}`
      }
    })

    // 5. Generate and save tokens
    const companyId = matchedEmployee?.orgUnit?.company?.id || null
    const tokenPayload = {
      id: account.accountId,
      email: account.accountName,
      companyId: companyId
    }
    const accessToken = signAccessToken(tokenPayload)
    const refreshToken = signRefreshToken({ id: account.accountId })

    const decodedRefresh = decodeToken(refreshToken)
    const expiresAt = new Date(decodedRefresh.exp * 1000)

    await refreshTokenModel.createRefreshToken(
      account.accountId,
      refreshToken,
      expiresAt
    )

    return {
      accessToken,
      refreshToken,
      id: account.accountId,
      username: cleanEmail.split('@')[0],
      email: account.accountName
    }
  }

  // ================= LOGIN =================
  async login(data) {
    const { email, password } = data

    if (!email?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is required!')
    }

    if (!password?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is required!')
    }

    const accountEmail = email.trim().toLowerCase()

    // Tìm account bằng email (accountName = email đầy đủ) kèm theo quan hệ để lấy companyId (UUID)
    const account = await PRISMA.aCCOUNTS.findFirst({
      where: { accountName: accountEmail },
      include: {
        employee: {
          include: {
            orgUnit: {
              include: {
                company: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!account) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password!')
    }

    if (account.status !== 'ENABLE') {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Account is not active!')
    }

    if (!account.isLogin) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Account is not activated!')
    }

    const isMatch = await bcrypt.compare(password.trim(), account.password)
    if (!isMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password!')
    }

    // ===== TẠO ACCESS TOKEN =====
    let companyId = account.employee?.orgUnit?.company?.id || null

    // Tự động liên kết tài khoản và nhân viên nếu chưa được liên kết trong DB nhưng trùng Email
    if (!account.employeeId) {
      const matchedEmployee = await PRISMA.eMPLOYEES.findFirst({
        where: { email: account.accountName, deletedAt: null },
        include: {
          orgUnit: {
            include: {
              company: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      })
      if (matchedEmployee) {
        companyId = matchedEmployee.orgUnit?.company?.id || null
        await PRISMA.aCCOUNTS.update({
          where: { accountId: account.accountId },
          data: { employeeId: matchedEmployee.employeeId }
        })
      }
    }

    const tokenPayload = {
      id: account.accountId,
      email: account.accountName,
      companyId: companyId
    }
    const accessToken = signAccessToken(tokenPayload)

    // ===== TẠO REFRESH TOKEN =====
    const refreshToken = signRefreshToken({ id: account.accountId })

    // ===== LƯU REFRESH TOKEN VÀO DATABASE =====
    const decodedRefresh = decodeToken(refreshToken)
    const expiresAt = new Date(decodedRefresh.exp * 1000)

    await refreshTokenModel.createRefreshToken(
      account.accountId,
      refreshToken,
      expiresAt
    )

    return {
      accessToken,
      refreshToken,
      id: account.accountId,
      username: account.accountName.split('@')[0],
      email: account.accountName
    }
  }

  // ================= REFRESH TOKEN =================
  async refreshToken(data) {
    const { refreshToken } = data

    if (!refreshToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Refresh token is required!')
    }

    // ===== VERIFY REFRESH TOKEN =====
    let decoded
    try {
      decoded = verifyRefreshToken(refreshToken)
    } catch {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token is invalid or expired!')
    }

    // ===== KIỂM TRA TOKEN CÓ TRONG DATABASE KHÔNG =====
    const isValid = await refreshTokenModel.isTokenValid(refreshToken)
    if (!isValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token has been revoked or expired!')
    }

    // ===== LẤY THÔNG TIN ACCOUNT =====
    const account = await PRISMA.aCCOUNTS.findFirst({
      where: { accountId: Number(decoded.id) },
      include: {
        employee: {
          include: {
            orgUnit: {
              include: {
                company: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        }
      }
    })
    if (!account) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    if (account.status !== 'ENABLE') {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Account is not active!')
    }

    if (!account.isLogin) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Account is not activated!')
    }

    // ===== TẠO ACCESS TOKEN MỚI =====
    let companyId = account.employee?.orgUnit?.company?.id || null

    // Tự động liên kết tài khoản và nhân viên nếu chưa được liên kết trong DB nhưng trùng Email
    if (!account.employeeId) {
      const matchedEmployee = await PRISMA.eMPLOYEES.findFirst({
        where: { email: account.accountName, deletedAt: null },
        include: {
          orgUnit: {
            include: {
              company: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      })
      if (matchedEmployee) {
        companyId = matchedEmployee.orgUnit?.company?.id || null
        await PRISMA.aCCOUNTS.update({
          where: { accountId: account.accountId },
          data: { employeeId: matchedEmployee.employeeId }
        })
      }
    }

    const newAccessToken = signAccessToken({
      id: account.accountId,
      email: account.accountName,
      companyId: companyId
    })

    return {
      accessToken: newAccessToken
    }
  }

  // ================= LOGOUT (single device) =================
  async logout(data) {
    const { refreshToken } = data

    if (!refreshToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Refresh token is required!')
    }

    const revoked = await refreshTokenModel.revokeToken(refreshToken)
    if (!revoked) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot revoke token!')
    }

    return { message: 'Logged out successfully' }
  }

  // ================= LOGOUT ALL (all devices) =================
  async logoutAll(accountId) {
    const revokedCount = await refreshTokenModel.revokeAllAccountTokens(accountId)

    return {
      message: `Logged out from ${revokedCount} device(s)`,
      revokedDevices: revokedCount
    }
  }

  async forgotPassword(data) {
    const { email, otp, newPassword, reNewPassword, action = null } = data

    let _email = email
    const checkOtp = await otpModel.findByField(otp, 'otpCode')

    if (!checkOtp) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'OTP not found!')
    }
    if (checkOtp.email !== email) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'OTP is invalid!')
    }
    const account = await accountsModel.findByUnique(_email, 'accountName')
    if (!account) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    if (checkOtp.expiredAt < new Date()) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'OTP has expired!')
    }
    if (newPassword !== reNewPassword) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Passwords do not match!')
    }

    if (action === checkOtp.otpType) {
      const hashedPassword = await bcrypt.hash(newPassword, saltRoundsPassword)
      const result = await accountsModel.updateById(account.accountId, {
        accountName: account.accountName,
        password: hashedPassword
      }, 'accountId')
      return result
    } else {
      return false
    }
  }
  // ================= SETUP SUPERADMIN =================
  async setupSuperAdmin(data) {
    const { email, password } = data

    if (!email?.trim() || !password?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email and Password are required!')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid email format!')
    }

    if (password.trim().length < 8) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Password must be >= 8 chars!')
    }

    // Check if account ID = 1 already exists
    const existingSuperAdmin = await accountsModel.findByUnique(1, 'accountId')

    if (existingSuperAdmin) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Superadmin account already exists!')
    }

    const cleanEmail = email.trim().toLowerCase()
    const duplicateAccount = await PRISMA.aCCOUNTS.findFirst({
      where: { accountName: cleanEmail }
    })
    if (duplicateAccount) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already registered!')
    }

    const hashedPassword = await bcrypt.hash(password.trim(), saltRoundsPassword)

    // Ensure ADMIN_ROLE exists
    const adminRole = await PRISMA.rOLES.upsert({
      where: { roleId: 1 },
      update: {},
      create: {
        roleId: 1,
        roleCode: 'ADMIN_ROLE',
        roleName: 'ADMIN_ROLE',
        description: 'Quyền quản trị tối cao của hệ thống (Bypass check)',
        status: 'ENABLE'
      }
    })

    // Create Super Admin Account
    const superAdmin = await PRISMA.aCCOUNTS.create({
      data: {
        accountId: 1,
        accountName: cleanEmail,
        password: hashedPassword,
        isLogin: true,
        status: 'ENABLE',
        description: 'Tài khoản Super Admin mặc định'
      }
    })

    // Assign Role
    await PRISMA.aCCOUNT_ROLES.create({
      data: {
        accountId: superAdmin.accountId,
        roleId: adminRole.roleId
      }
    })

    return {
      accountId: superAdmin.accountId,
      accountName: superAdmin.accountName,
      role: adminRole.roleName
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    const account = await PRISMA.aCCOUNTS.findFirst({
      where: { accountId: Number(userId), deletedAt: null }
    })
    if (!account) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    const isMatch = await bcrypt.compare(oldPassword.trim(), account.password)
    if (!isMatch) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Current password is incorrect!')
    }
    if (newPassword.trim().length < 8) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'New password must be >= 8 characters!')
    }
    const hashedPassword = await bcrypt.hash(newPassword.trim(), saltRoundsPassword)
    await PRISMA.aCCOUNTS.update({
      where: { accountId: account.accountId },
      data: { password: hashedPassword }
    })
    await refreshTokenModel.revokeAllAccountTokens(account.accountId)
    return { success: true }
  }

  async getProfile(userId) {
    const profile = await PRISMA.aCCOUNTS.findFirst({
      where: { accountId: Number(userId), deletedAt: null },
      include: {
        employee: {
          include: {
            orgUnit: {
              include: {
                company: true,
                branch: true
              }
            },
            position: true
          }
        },
        accountRoles: {
          where: { deletedAt: null },
          include: { role: true }
        }
      }
    })
    if (!profile) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Profile not found!')
    }
    delete profile.password
    return profile
  }

  async updateProfile(userId, profileData) {
    const { firstName, lastName, phone, avatar, notificationSettings } = profileData
    const account = await PRISMA.aCCOUNTS.findFirst({
      where: { accountId: Number(userId), deletedAt: null }
    })
    if (!account) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    
    await PRISMA.$transaction(async (tx) => {
      // Update account fields
      await tx.aCCOUNTS.update({
        where: { accountId: account.accountId },
        data: {
          avatar: avatar || null,
          notificationSettings: notificationSettings || undefined
        }
      })

      // Update employee fields if linked
      if (account.employeeId) {
        await tx.eMPLOYEES.update({
          where: { employeeId: account.employeeId },
          data: {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phone: phone || null
          }
        })
      }
    })

    return this.getProfile(userId)
  }
}

export const authService = new AuthService()
