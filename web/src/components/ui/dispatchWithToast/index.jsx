import { toast } from 'react-toastify'

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
            return data || error
          }
        }
      }
    )
  } catch (err) {
    throw err
  }
}