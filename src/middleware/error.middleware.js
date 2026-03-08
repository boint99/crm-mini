import { StatusCodes } from 'http-status-codes'
import 'dotenv/config'

export const errorMiddleware = (err, req, res) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  let message = err.message || 'Internal Server Error'

  if (err.code === 'P2025') {
    statusCode = StatusCodes.NOT_FOUND
    message = 'The requested record was not found.'
  }

  if (err.code === 'P2002') {
    statusCode = StatusCodes.CONFLICT
    message = `Duplicate field value: ${err.meta?.target?.join(', ')}. Please use another value.`
  }

  if (err.name === 'PrismaClientValidationError') {
    statusCode = StatusCodes.BAD_REQUEST
    message = 'Invalid data format or missing required fields.'
  }

  const response = {
    success: false,
    message: message,
    stack: process.env.NODE_ENV ? err.stack : undefined
  }

  res.status(statusCode).json(response)
}
