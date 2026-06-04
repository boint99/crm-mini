
import { useCallback } from "react";
import { dispatchAsync } from "@/utils/contants";
import { useDispatch } from "react-redux";

export const useAppDispatch = () => {
  const dispatch = useDispatch();

  return useCallback(
    (action, options) => dispatchAsync(dispatch, action, options),
    [dispatch]
  );
};