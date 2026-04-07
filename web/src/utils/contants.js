export const ROOT_DOMAIN = 'http://localhost:8017/api'

export const dispatchAsync = async (dispatch, action, options = {}) => {
    const { onSuccess, onError, successMessage, errorMessage } = options;

    try {
      const result = await dispatch(action).unwrap();

      if (successMessage) console.log(successMessage);
      if (onSuccess) onSuccess(result);

      return result;
    } catch (error) {
      console.error(errorMessage || error);
      if (onError) onError(error);
      throw error;
    }
  };


export const formatDateTime = (isoString) => {
  if (!isoString) return ''

  const date = new Date(isoString)

  const pad = (n) => n.toString().padStart(2, '0')

  const day = pad(date.getDate())
  const month = pad(date.getMonth() + 1)
  const year = date.getFullYear()

  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export const CUSTOM_MESSAGES = {
  get: {
    pending: "Đang tải danh sách...",
    success: "Lấy danh sách thành công!",
    error: "Không thể tải danh sách!",
  },
  create: {
    pending: "Đang thêm...",
    success: "Thêm thành công!",
    error: "Thêm thất bại!",
  },
  update: {
    pending: "Đang cập nhật...",
    success: "Cập nhật thành công!",
    error: "Cập nhật thất bại!",
  },
  delete: {
    pending: "Đang xóa...",
    success: "Xóa thành công!",
    error: "Xóa thất bại!",
  },
};


export const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 50,
  },
  content: {
    top: "10%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translateX(-50%)",
    padding: 0,
    border: "none",
    borderRadius: "0.75rem",
    maxWidth: "520px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
  },
};