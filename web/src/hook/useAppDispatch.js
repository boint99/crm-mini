
import { dispatchAsync } from "@/utils/contants";
import { useDispatch } from "react-redux";

export const useAppDispatch = () => {
  const dispatch = useDispatch();

  return (action, options) =>
    dispatchAsync(dispatch, action, options);
};