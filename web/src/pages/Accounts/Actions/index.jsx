import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-modal";
import { X } from "lucide-react";
import {
  createAccount,
  updateAccount,
  deleteAccount,
  resetAccountPassword,
} from "@/redux/slice/accountsSlice";
import { getEmployees } from "@/redux/slice/employeesSlice";
import { useAppDispatch } from "@/hook/useAppDispatch";
import { customStyles } from "@/utils/contants";
import { dispatchWithToast } from "@/components/ui/dispatchWithToast";

const defaultValues = {
  ACCOUNT_NAME: "",
  PASSWORD: "",
  STATUS: "ENABLE",
  EMPLOYEE_ID: "",
  DESCRIPTION: "",
  LOGIN: "false",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none";
const inputReadOnlyClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 bg-gray-50 cursor-not-allowed outline-none";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

function ActionModal({ open, onClose, action, item }) {
  const dispatch = useDispatch();
  const dispatchAsync = useAppDispatch();

  const employeeItems = useSelector((state) => state.employees?.items || []);

  useEffect(() => {
    if (open && employeeItems.length === 0) {
      dispatchAsync(getEmployees());
    }
  }, [open]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ defaultValues, mode: "onTouched" });

  useEffect(() => {
    if (!open) return;
    if (action === "create") {
      reset(defaultValues);
    } else {
      reset({
        ACCOUNT_NAME: item?.ACCOUNT_NAME ?? "",
        PASSWORD: "",
        STATUS: item?.STATUS ?? "ENABLE",
        EMPLOYEE_ID: item?.EMPLOYEE_ID ? String(item.EMPLOYEE_ID) : "",
        DESCRIPTION: item?.DESCRIPTION ?? "",
      });
    }
  }, [open, action, item, reset]);

  const handleFormSubmit = async (data) => {
    if (action === "delete") {
      await dispatchWithToast({
        dispatch,
        action: deleteAccount,
        payload: item.ACCOUNT_ID,
        messages: { success: "Xóa tài khoản thành công!" },
      });
      onClose?.();
      return;
    }

    if (action === "create") {
      await dispatchWithToast({
        dispatch,
        action: createAccount,
        payload: {
          ACCOUNT_NAME: data.ACCOUNT_NAME.trim(),
          PASSWORD: data.PASSWORD.trim(),
          STATUS: data.STATUS,
          EMPLOYEE_ID: data.EMPLOYEE_ID ? Number(data.EMPLOYEE_ID) : null,
          DESCRIPTION: data.DESCRIPTION?.trim() || null,
          LOGIN: data.LOGIN === "true",
        },
        messages: { success: "Tạo tài khoản thành công!" },
      });
    } else if (action === "edit") {
      await dispatchWithToast({
        dispatch,
        action: updateAccount,
        payload: {
          ACCOUNT_ID: item.ACCOUNT_ID,
          STATUS: data.STATUS,
          EMPLOYEE_ID: data.EMPLOYEE_ID ? Number(data.EMPLOYEE_ID) : null,
          DESCRIPTION: data.DESCRIPTION?.trim() || null,
          LOGIN: data.LOGIN === "true",
        },
        messages: { success: "Cập nhật tài khoản thành công!" },
      });
    } else if (action === "reset-password") {
      await dispatchWithToast({
        dispatch,
        action: resetAccountPassword,
        payload: {
          ACCOUNT_ID: item.ACCOUNT_ID,
          PASSWORD: data.PASSWORD.trim(),
        },
        messages: { success: "Đặt lại mật khẩu thành công!" },
      });
    }

    onClose?.();
  };

  const isDelete = action === "delete";
  const isResetPwd = action === "reset-password";
  const isCreate = action === "create";

  if (isDelete) {
    return (
      <Modal
        isOpen={open}
        onRequestClose={onClose}
        style={customStyles}
        ariaHideApp={false}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Xác nhận xóa tài khoản
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Bạn có chắc muốn xóa tài khoản{" "}
            <span className="font-semibold">"{item?.ACCOUNT_NAME}"</span>? Thao
            tác này không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={() => handleFormSubmit()}
              className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 cursor-pointer"
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={open}
      onRequestClose={onClose}
      style={customStyles}
      ariaHideApp={false}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            {isResetPwd
              ? "Đặt lại mật khẩu"
              : isCreate
                ? "Thêm tài khoản"
                : "Chỉnh sửa tài khoản"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* ACCOUNT_NAME */}
            <div>
              <label className={labelClass}>
                Tên đăng nhập {isCreate && "*"}
              </label>
              {isCreate ? (
                <>
                  <input
                    type="text"
                    placeholder="VD: admin, nhanvien01"
                    className={inputClass}
                    {...register("ACCOUNT_NAME", {
                      required: "Vui lòng nhập tên đăng nhập",
                      validate: (v) =>
                        !!v.trim() || "Vui lòng nhập tên đăng nhập",
                    })}
                  />
                  {errors.ACCOUNT_NAME && (
                    <p className="mt-1 text-xs text-rose-500">
                      {errors.ACCOUNT_NAME.message}
                    </p>
                  )}
                </>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={item?.ACCOUNT_NAME ?? ""}
                  className={inputReadOnlyClass}
                />
              )}
            </div>

            {/* PASSWORD — chỉ hiện khi create hoặc reset-password */}
            {(isCreate || isResetPwd) && (
              <div>
                <label className={labelClass}>
                  {isResetPwd ? "Mật khẩu mới *" : "Mật khẩu *"}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputClass}
                  {...register("PASSWORD", {
                    required: "Vui lòng nhập mật khẩu",
                    minLength: { value: 6, message: "Tối thiểu 6 ký tự" },
                  })}
                />
                {errors.PASSWORD && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.PASSWORD.message}
                  </p>
                )}
              </div>
            )}

            {/* STATUS — ẩn khi reset-password */}
            {!isResetPwd && (
              <div>
                <label className={labelClass}>Trạng thái *</label>
                <select
                  className={inputClass}
                  {...register("STATUS", { required: true })}
                >
                  <option value="ENABLE">ENABLE (Hoạt động)</option>
                  <option value="DISABLED">DISABLED (Ngừng hoạt động)</option>
                </select>
              </div>
            )}

            {/* EMPLOYEE_ID — ẩn khi reset-password */}
            {!isResetPwd && (
              <div>
                <label className={labelClass}>MaNV</label>
                <select className={inputClass} {...register("EMPLOYEE_ID")}>
                  <option value="">-- Chọn --</option>
                  {employeeItems.map((emp) => (
                    <option key={emp.EMPLOYEE_ID} value={emp.EMPLOYEE_ID}>
                      {emp.FIRST_NAME} {emp.LAST_NAME} ({emp.EMPLOYEE_CODE})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className={labelClass}>Đăng nhập</label>
              <select
                className={inputClass}
                {...register("LOGIN", { required: true })}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>

          {/* DESCRIPTION — ẩn khi reset-password */}
          {!isResetPwd && (
            <div>
              <label className={labelClass}>Mô tả</label>
              <textarea
                rows={3}
                placeholder="Ghi chú về tài khoản..."
                className={`${inputClass} resize-none`}
                {...register("DESCRIPTION")}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={[
                "px-4 py-2 text-sm font-medium text-white rounded-lg",
                isValid
                  ? "bg-primary hover:opacity-95 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed",
              ].join(" ")}
            >
              {isResetPwd ? "Đặt lại mật khẩu" : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default ActionModal;
