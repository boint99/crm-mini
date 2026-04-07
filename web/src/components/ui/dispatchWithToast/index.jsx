import { toast } from "react-toastify";

export const dispatchWithToast = async ({
  dispatch,
  action,
  payload,
  messages,
}) => {
  try {
    return await toast.promise(dispatch(action(payload)).unwrap(), {
      pending: messages?.pending,
      success: messages?.success,
      error: messages?.error,
    });
  } catch (err) {
    throw err;
  }
};
