import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  createAccount,
  updateAccount,
  deleteAccount,
  resetAccountPassword,
} from "@/redux/slice/accountsSlice";
import { getEmployees } from "@/redux/slice/employeesSlice";
import { useAppDispatch } from "@/hook/useAppDispatch";
import { toast } from "react-toastify";
import { dispatchWithToast } from "@/components/ui/dispatchWithToast";

const defaultValues = {
  ACCOUNT_CODE: "",
  PASSWORD: "",
  STATUS: "ENABLE",
  EMPLOYEE_ID: "",
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-900">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

const ACTION_LABEL = {
  create: "Thêm tài khoản",
  edit: "Chỉnh sửa tài khoản",
  "reset-password": "Đặt lại mật khẩu",
  delete: "Xóa tài khoản",
};

function ActionModal({ open, onClose, action, item }) {
  const dispatch = useDispatch();
  const dispatchAsync = useAppDispatch();

  // Load employees for the dropdown
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
    if (action === "edit" && item) {
      reset({
        ACCOUNT_CODE: item.ACCOUNT_CODE ?? "",
        PASSWORD: "",
        STATUS: item.STATUS ?? "ENABLE",
        EMPLOYEE_ID: item.EMPLOYEE_ID ?? "",
      });
    } else if (action === "delete" || action === "reset-password") {
      reset({
        ACCOUNT_CODE: item?.ACCOUNT_CODE ?? "",
        PASSWORD: "",
        STATUS: item?.STATUS ?? "ENABLE",
        EMPLOYEE_ID: item?.EMPLOYEE_ID ?? "",
      });
    } else {
      reset(defaultValues);
    }
  }, [open, action, item, reset]);

  const onValid = async (data) => {
    try {
      if (action === "create") {
        await dispatchWithToast({
          dispatch,
          action: createAccount,
          payload: {
            ACCOUNT_CODE: data.ACCOUNT_CODE.trim(),
            PASSWORD: data.PASSWORD.trim(),
            STATUS: data.STATUS,
            EMPLOYEE_ID: data.EMPLOYEE_ID ? Number(data.EMPLOYEE_ID) : null,
          },
          messages: { success: "Tạo tài khoản thành công!" },
        });
      } else if (action === "edit") {
        await dispatchWithToast({
          dispatch,
          action: updateAccount,
          payload: {
            ACCOUNT_ID: item.ACCOUNT_ID,
            ACCOUNT_CODE: data.ACCOUNT_CODE.trim(),
            STATUS: data.STATUS,
            EMPLOYEE_ID: data.EMPLOYEE_ID ? Number(data.EMPLOYEE_ID) : null,
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
      } else if (action === "delete") {
        await dispatchWithToast({
          dispatch,
          action: deleteAccount,
          payload: item.ACCOUNT_ID,
          messages: { success: "Xóa tài khoản thành công!" },
        });
      }
      onClose?.();
    } catch (error) {
      toast.error(error || "Có lỗi xảy ra.");
    }
  };

  if (!open) return null;

  const isDelete = action === "delete";
  const isResetPwd = action === "reset-password";

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-gray-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-200">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {ACTION_LABEL[action]}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {isDelete
                  ? `Bạn có chắc muốn xóa tài khoản "${item?.ACCOUNT_CODE}" không?`
                  : isResetPwd
                    ? `Nhập mật khẩu mới cho tài khoản "${item?.ACCOUNT_CODE}"`
                    : "Nhập thông tin tài khoản hệ thống."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onValid)} className="px-5 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* ACCOUNT_CODE - hidden on reset-password */}
              {!isResetPwd && (
                <Field label="Tên đăng nhập *">
                  <input
                    {...register("ACCOUNT_CODE", {
                      required: "Vui lòng nhập tên đăng nhập",
                      validate: (v) =>
                        !!v.trim() || "Vui lòng nhập tên đăng nhập",
                    })}
                    readOnly={isDelete}
                    className={[
                      "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none text-gray-900",
                      isDelete
                        ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                        : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                    ].join(" ")}
                    placeholder="VD: admin, nhanvien01"
                  />
                  {errors.ACCOUNT_CODE && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.ACCOUNT_CODE.message}
                    </p>
                  )}
                </Field>
              )}

              {/* PASSWORD - only on create & reset-password */}
              {(action === "create" || isResetPwd) && (
                <Field label={isResetPwd ? "Mật khẩu mới *" : "Mật khẩu *"}>
                  <input
                    type="password"
                    {...register("PASSWORD", {
                      required: "Vui lòng nhập mật khẩu",
                      minLength: {
                        value: 6,
                        message: "Mật khẩu tối thiểu 6 ký tự",
                      },
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="••••••••"
                  />
                  {errors.PASSWORD && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.PASSWORD.message}
                    </p>
                  )}
                </Field>
              )}

              {/* STATUS - hidden on reset-password */}
              {!isResetPwd && (
                <Field label="Trạng thái *">
                  <select
                    {...register("STATUS", {
                      required: "Vui lòng chọn trạng thái",
                    })}
                    disabled={isDelete}
                    className={[
                      "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none text-gray-900",
                      isDelete
                        ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                        : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                    ].join(" ")}
                  >
                    <option value="ENABLE">ENABLE (Hoạt động)</option>
                    <option value="DISABLED">DISABLED (Ngừng hoạt động)</option>
                  </select>
                  {errors.STATUS && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.STATUS.message}
                    </p>
                  )}
                </Field>
              )}

              {/* EMPLOYEE_ID - hidden on reset-password & delete */}
              {!isDelete && !isResetPwd && (
                <Field label="Nhân viên liên kết">
                  <select
                    {...register("EMPLOYEE_ID")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">-- Không liên kết --</option>
                    {employeeItems.map((emp) => (
                      <option key={emp.EMPLOYEE_ID} value={emp.EMPLOYEE_ID}>
                        {emp.NAME} ({emp.EMPLOYEE_CODE})
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!isDelete && !isValid}
                className={[
                  "inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm",
                  isDelete
                    ? "bg-rose-600 hover:bg-rose-700 cursor-pointer"
                    : isValid
                      ? "bg-primary hover:opacity-95 cursor-pointer"
                      : "bg-gray-300 cursor-not-allowed",
                ].join(" ")}
              >
                {isDelete
                  ? "Xác nhận xóa"
                  : isResetPwd
                    ? "Đặt lại mật khẩu"
                    : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ActionModal;
