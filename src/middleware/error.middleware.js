import { StatusCodes } from 'http-status-codes'

class PrismaErrorHandler {
  static handle(err) {
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    let message = err.message || 'Internal Server Error'

    if (err.code === 'P2025') {
      statusCode = StatusCodes.NOT_FOUND
      message = 'The requested record was not found.'
    }

    if (err.code === 'P2002') {
      statusCode = StatusCodes.CONFLICT
      message = `Duplicate field: ${err.meta?.target?.join(', ')}`
    }

    return { statusCode, message }
  }
}

// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  let message = err.message || 'Internal Server Error'
  console.error('Error caught in errorMiddleware:', err)

  // Nếu là lỗi Prisma thì map qua PrismaErrorHandler
  if (err.code && err.code.startsWith('P')) {
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
