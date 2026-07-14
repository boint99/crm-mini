import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'

export const validateImportFile = (req, res, next) => {
  const { csvText, fileName } = req.body

  if (!csvText) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'Nội dung tệp tin là bắt buộc!'))
  }

  // 1. Kiểm tra extension của file (nếu có truyền lên từ client)
  if (fileName) {
    const ext = fileName.split('.').pop().toLowerCase()
    if (ext !== 'csv' && ext !== 'xlsx') {
      return next(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          'Định dạng file không hợp lệ! Hệ thống chỉ chấp nhận tệp .csv hoặc .xlsx.'
        )
      )
    }
  }

  // 2. Ngăn chặn file nhị phân (binary/strange files) bằng cách kiểm tra mã chữ ký hoặc ký tự null (\x00)
  // ZIP header của file Excel (.xlsx) là 'PK\x03\x04'
  if (
    csvText.includes('\x00') ||
    csvText.startsWith('PK\x03\x04') ||
    csvText.substring(0, 4) === 'PK\x03\x04'
  ) {
    if (fileName && fileName.toLowerCase().endsWith('.xlsx')) {
      return next(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          'Hệ thống hiện tại mới hỗ trợ xử lý tệp CSV. Vui lòng chuyển đổi tệp Excel (.xlsx) sang định dạng CSV trước khi nhập!'
        )
      )
    }
    return next(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        'Phát hiện tệp tin nhị phân không hợp lệ! Hệ thống chỉ chấp nhận file .csv và .xlsx dạng văn bản.'
      )
    )
  }

  next()
}
