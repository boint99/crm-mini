import { otpModel } from './otp.model.js'
import { emailTemplate } from '../../template/email.template.js'
import { accountsModel } from '../accounts/accounts.model.js'
import ApiError from '../../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import { employeesModel } from '../employees/employees.model.js'

class OtpService {
  static async generateOtp(data) {
    const emailVal = (data.email || data.EMAIL || '').trim().toLowerCase()
    if (!emailVal) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is required!')
    }

    const actionVal = (data.action || data.acction || data.typeOtp || 'register').toLowerCase()
    let accountId = data.accountId || data.ACCOUNT_ID || null

    if (actionVal === 'forgot-password' || actionVal === 'forgotpassword' || actionVal === 'reset-password' || actionVal === 'reset_password') {
      const account = await accountsModel.findByUnique(emailVal, 'accountName')
      if (!account) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Email not found!')
      }
      if (!account.isLogin) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Email not activated!')
      }
      if (account.status !== 'ENABLE') {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Account is not active!')
      }
      accountId = account.accountId
    } else if (actionVal === 'register') {
      const account = await accountsModel.findByUnique(emailVal, 'accountName')
      if (account) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Email already exists!')
      }
      const existingEmployee = await employeesModel.findByField(emailVal, 'email')
      if (existingEmployee) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Email already exists!')
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const title = 'Your OTP Code'
    const subject = 'Your OTP Code'
    const expiryMinutes = 5
    const expiredAt = new Date(Date.now() + expiryMinutes * 60 * 1000)

    // Map input string types to valid database enum values (REGISTER, RESET_PASSWORD)
    let dbOtpType = 'REGISTER'
    if (actionVal === 'forgot-password' || actionVal === 'forgotpassword' || actionVal === 'reset-password' || actionVal === 'reset_password') {
      dbOtpType = 'RESET_PASSWORD'
    } else if (actionVal === 'register') {
      dbOtpType = 'REGISTER'
    }

    // send email using existing emailTemplate (which internally calls sendMail)
    const mailResult = await emailTemplate({
      to: emailVal,
      subject,
      title,
      body: `Your OTP code is: <b>${otp}</b>. It will expire in ${expiryMinutes} minutes.`,
      buttonText: null,
      buttonUrl: null
    })

    if (!mailResult || mailResult.success === false) {
      const errMsg = mailResult && mailResult.error ? mailResult.error : 'unknown error'
      throw new Error('Failed to send OTP email: ' + errMsg)
    }

    const generateOtp = {
      otpCode: otp,
      otpType: dbOtpType,
      email: emailVal,
      expiredAt: expiredAt,
      accountId: accountId ? Number(accountId) : null
    }

    const result = await otpModel.generateOtp(generateOtp)
    return result
  }

}

export const otpService = OtpService
