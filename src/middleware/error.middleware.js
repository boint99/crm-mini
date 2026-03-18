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
  const { statusCode, message } = PrismaErrorHandler.handle(err)

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}