import { StatusCodes } from 'http-status-codes'

class PrismaErrorHandler {
  static handle(err) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    let message = 'Đã xảy ra lỗi cơ sở dữ liệu. Vui lòng liên hệ quản trị viên.'

    if (err.name === 'PrismaClientValidationError') {
      statusCode = StatusCodes.BAD_REQUEST
      message = 'Internal Server Error'
    } else if (err.code === 'P2025') {
      statusCode = StatusCodes.NOT_FOUND
      message = 'Internal Server Error'
    } else if (err.code === 'P2002') {
      statusCode = StatusCodes.CONFLICT
      message = 'Internal Server Error'
    } else if (err.code) {
      statusCode = StatusCodes.BAD_REQUEST
      message = 'Internal Server Error'
    }

    return { statusCode, message }
  }
}

// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  let message = err.message || 'Internal Server Error'
  console.error('Error caught in errorMiddleware:', err)

  // Nhận diện lỗi Prisma
  const isPrismaError =
    (err.name && err.name.startsWith('Prisma')) ||
    (err.code && typeof err.code === 'string' && err.code.startsWith('P'))

  if (isPrismaError) {
    const prismaError = PrismaErrorHandler.handle(err)
    statusCode = prismaError.statusCode
    message = prismaError.message
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}
