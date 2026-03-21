import { StatusCodes } from 'http-status-codes'

class SuccessResponse {
  constructor({
    res,
    message = 'Success',
    data = [],
    statusCode = StatusCodes.OK
  }) {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data
    })
  }
}

class CreatedResponse extends SuccessResponse {
  constructor({ res, message = 'Created!', data }) {
    super({ res, message, data, statusCode: StatusCodes.CREATED })
  }
}

export { SuccessResponse, CreatedResponse }