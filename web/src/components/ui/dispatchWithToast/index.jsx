import { toast } from 'react-toastify'

export const dispatchWithToast = async ({
  dispatch,
  action,
  payload,
  messages
}) => {
  let toastId = null
  if (messages?.pending) {
    toastId = toast.loading(messages.pending)
  }

  try {
    const res = await dispatch(action(payload)).unwrap()
    if (toastId) {
      toast.update(toastId, {
        render: messages?.success || 'Thực hiện thành công!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      })
    } else if (messages?.success) {
      toast.success(messages.success)
    }
    return res
  } catch (err) {
    const is403 = err?.response?.status === 403 || err?.status === 403 || err?.statusCode === 403

    if (toastId) {
      if (is403) {
        toast.dismiss(toastId)
      } else {
        toast.update(toastId, {
          render: messages?.error || err?.message || 'Đã xảy ra lỗi!',
          type: 'error',
          isLoading: false,
          autoClose: 3000
        })
      }
    } else if (!is403 && messages?.error) {
      toast.error(messages.error)
    }

    throw err
  }
}
