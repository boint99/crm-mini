import { StatusCodes } from 'http-status-codes'

class PrismaErrorHandler {
  static handle(err) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    let message = err.message || 'Database error occurred'

    if (err.name === 'PrismaClientValidationError') {
      statusCode = StatusCodes.BAD_REQUEST
      message = 'Invalid query data'
    } else if (err.code === 'P2025') {
      statusCode = StatusCodes.NOT_FOUND
      message = 'Record not found'
    } else if (err.code === 'P2002') {
      statusCode = StatusCodes.CONFLICT
      message = 'Duplicate field value'
    } else if (typeof err.code === 'string' && err.code.startsWith('P2')) {
      statusCode = StatusCodes.BAD_REQUEST
      message = 'Database query error'
    } else {
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR
      message = 'Database connection error'
    }

    return { statusCode, message }
  }
}

export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  let message = err.message || 'Internal Server Error'
  console.error('Error caught in errorMiddleware:', err)

  // Nhận diện lỗi Prisma
  const isPrismaError =
    (err.name && typeof err.name === 'string' && err.name.startsWith('Prisma')) ||
    (err.code && typeof err.code === 'string' && err.code.startsWith('P'))

  if (isPrismaError) {
    const prismaError = PrismaErrorHandler.handle(err)
    statusCode = prismaError.statusCode
    message = err.message || prismaError.message
  }

  res.status(statusCode).json({
    success: false,
    message,
    code: err.code || undefined,
    stack: err.stack
  })
}
