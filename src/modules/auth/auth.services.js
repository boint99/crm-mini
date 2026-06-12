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
    const existingEmployee = await employeesModel.findbyField(email, 'EMAIL')
    if (existingEmployee) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already registered!')
    }

    // accountName lưu email đầy đủ
    const existingAccount = await accountsModel.findByUnique(email, 'accountName')
    if (existingAccount) {
      throw new ApiError(StatusCodes.CONFLICT, 'Account already exists!')
    }
  }

  // ================= REGISTER =================
  async register(data) {
    // 1. Validate + normalize
    const cleanData = this._validateRegister(data)

    // 2. Check duplicate
    await this._ensureEmailNotExists(cleanData.email)

    // 3. Create account — lưu email đầy đủ làm accountName
    const account = await accountsModel.create({
      accountName: cleanData.email,
      password: await bcrypt.hash(cleanData.password, saltRoundsPassword),
      employeeId: null,
      login: 0,
      isLogin: false
    })

    return account
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
    const companyId = account.employee?.orgUnit?.company?.id || null
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

    // ===== TRẢ VỀ RESPONSE =====
    const safeAccount = Serializer.sanitize(account, ['password', 'deletedAt'])

    return {
      ...safeAccount,
      accessToken,
      refreshToken
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
    } catch (error) {
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
    const companyId = account.employee?.orgUnit?.company?.id || null
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
    const existingSuperAdmin = await PRISMA.aCCOUNTS.findFirst({
      where: { accountId: 1 }
    })

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
}

export const authService = new AuthService()
