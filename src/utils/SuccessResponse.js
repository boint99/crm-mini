import { StatusCodes } from 'http-status-codes'

class SuccessResponse {
  constructor({
    res,
    message = 'Success',
    data = null,
    statusCode = StatusCodes.OK
  }) {
    const mappedData = Array.isArray(data)
      ? data.map((item, index) => ({ STT: index + 1, ...item }))
      : data
    return res.status(statusCode).json({
      success: true,
      message,
      data: mappedData
    })
  }
}

class CreatedResponse extends SuccessResponse {
  constructor({ res, message = 'Created!', data }) {
    super({ res, message, data, statusCode: StatusCodes.CREATED })
  }
}

export { SuccessResponse, CreatedResponse }