import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { createCompany, updateCompany, deleteCompany } from "@/redux/slice";
import { toast } from "react-toastify";
import { dispatchWithToast } from "@/components/ui/dispatchWithToast";

const defaultValues = {
  COMPANY_NAME: "",
  STATUS: "ENABLE",
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
  create: "Thêm mới",
  edit: "Chỉnh sửa",
  delete: "Xóa",
};

function AcctionModal({ open, onClose, action, item }) {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ defaultValues, mode: "onTouched" });
  useEffect(() => {
    if (!open) return;
    if ((action === "edit" || action === "delete") && item) {
      reset({
        COMPANY_NAME: item.COMPANY_NAME ?? "",
        STATUS: item.STATUS ?? "ENABLE",
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
          action: createCompany,
          payload: {
            COMPANY_NAME: data.COMPANY_NAME.trim(),
            STATUS: data.STATUS,
          },
          messages: {
            success: "Thêm mới thành công!",
          },
        });
      } else if (action === "edit") {
        await dispatchWithToast({
          dispatch,
          action: updateCompany,
          payload: {
            COMPANY_ID: item.COMPANY_ID,
            COMPANY_NAME: data.COMPANY_NAME.trim(),
            STATUS: data.STATUS,
          },
          messages: {
            success: "Cập nhật thành công!",
          },
        });
      } else if (action === "delete") {
        await dispatchWithToast({
          dispatch,
          action: deleteCompany,
          payload: item.COMPANY_ID,
          messages: {
            success: "Xóa thành công!",
          },
        });
      }

      onClose?.();
    } catch (error) {
      toast.error(error || "Có lỗi xảy ra.");
    }
  };

  if (!open) return null;

  const isDelete = action === "delete";

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
                {isDelete ? (
                  "Bạn có chắc muốn xóa công ty này không?"
                ) : (
                  <>
                    {" "}
                    Nhập thông tin theo bảng{" "}
                    <span className="font-mono text-[12px]">COMPANY</span>.
                  </>
                )}
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
              <Field label="Tên công ty (COMPANY_NAME) *">
                <input
                  {...register("COMPANY_NAME", {
                    required: "Vui lòng nhập tên công ty",
                    validate: (v) => !!v.trim() || "Vui lòng nhập tên công ty",
                  })}
                  readOnly={isDelete}
                  className={[
                    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none text-gray-900",
                    isDelete
                      ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                      : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                  ].join(" ")}
                  placeholder="VD: Công ty ABC"
                />
                {errors.COMPANY_NAME && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.COMPANY_NAME.message}
                  </p>
                )}
              </Field>

              <Field label="Trạng thái (STATUS) *">
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
                  <option value="DISABLED">DISABLED</option>
                </select>
                {errors.STATUS && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.STATUS.message}
                  </p>
                )}
              </Field>
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
                {isDelete ? "Xác nhận xóa" : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AcctionModal;
