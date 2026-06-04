import { StatusCodes } from 'http-status-codes'
import { verifyAccessToken } from '../../utils/jwt.js'

/**
 * Middleware xác thực JWT Access Token
 * Kiểm tra Authorization header: Bearer <token>
 * Gán req.user = { userId, accountName } nếu hợp lệ
 */
export const authMiddleware = (req, res, next) => {
  try {
    // ===== TRÍCH XUẤT TOKEN =====
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Token không được cung cấp hoặc định dạng không hợp lệ',
        code: 'MISSING_TOKEN'
      })
    }

    const token = authHeader.substring(7) // Bỏ "Bearer " (7 ký tự)

    // ===== VERIFY TOKEN =====
    let decoded
    try {
      decoded = verifyAccessToken(token)
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Token đã hết hạn',
          code: 'TOKEN_EXPIRED'
        })
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Token không hợp lệ',
          code: 'INVALID_TOKEN'
        })
      }
      throw error
    }

    // ===== KIỂM TRA TOKEN TYPE =====
    if (decoded.type !== 'access') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Token type không hợp lệ',
        code: 'INVALID_TOKEN_TYPE'
      })
    }

    // ===== GÁN USER DATA VÀO REQUEST =====
    req.user = {
      userId: decoded.id,
      email: decoded.email
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Lỗi server khi xác thực',
      code: 'SERVER_ERROR'
    })
  }
}
