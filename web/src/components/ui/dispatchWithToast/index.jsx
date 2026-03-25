import { toast } from 'react-toastify'

const resolveToastError = (data, fallback) => {
  if (typeof data === 'string') return data
  if (data?.message) return data.message
  return fallback
}

export const dispatchWithToast = async ({
  dispatch,
  action,
  payload,
  messages = {}
}) => {
  const {
    pending = 'Đang xử lý...',
    success = 'Thành công',
    error = 'Thất bại'
  } = messages

  try {
    return await toast.promise(
      dispatch(action(payload)).unwrap(),
      {
        pending,
        success,
        error: {
          render({ data }) {
            return resolveToastError(data, error)
          }
        }
      }
    )
  } catch (err) {
    throw err
  }
}