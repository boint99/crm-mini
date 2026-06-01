import { customStyles } from "@/utils/contants";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";

export default function ViettelModel({
  open,
  isOpen = open,
  onClose,
  onSubmit,
  mode = "create",
  initialValues,
  data = initialValues,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const isEdit = mode === "edit";

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && data) {
        reset({
          VIETTEL_CODE: data.VIETTEL_CODE || "",
          VIETTEL_EMAIL: data.VIETTEL_EMAIL || "",
          EMPLOYEE_ID: data.EMPLOYEE_ID || "",
          STATUS: data.STATUS || "ENABLE",
        });
      } else if (mode === "create") {
        reset({
          VIETTEL_CODE: "",
          VIETTEL_EMAIL: "",
          EMPLOYEE_ID: "",
          STATUS: "ENABLE",
        });
      }
    }
  }, [isOpen, mode, data, reset]);

  const handleFormSubmit = (formData) => {
    if (mode === "delete") {
      onSubmit?.(Number(data?.VIETTEL_ID));
      return;
    }

    const payload = {
      VIETTEL_CODE: formData.VIETTEL_CODE.trim(),
      VIETTEL_EMAIL: formData.VIETTEL_EMAIL?.trim() || null,
      EMPLOYEE_ID: formData.EMPLOYEE_ID ? Number(formData.EMPLOYEE_ID) : null,
      STATUS: formData.STATUS,
    };

    if (isEdit && data?.VIETTEL_ID) {
      payload.VIETTEL_ID = Number(data.VIETTEL_ID);
    }

    onSubmit?.(payload);
  };

  if (mode === "delete") {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        style={customStyles}
        ariaHideApp={false}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Xác nhận xóa nhân viên Viettel
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Bạn có chắc muốn xóa nhân viên Viettel với mã{" "}
            <span className="font-semibold">{data?.VIETTEL_CODE}</span>? Thao tác này
            không thể hoàn tác.
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

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      ariaHideApp={false}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Chỉnh sửa nhân viên Viettel" : "Thêm nhân viên Viettel mới"}
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
            <div>
              <label className={labelClass}>Mã Viettel (VIETTEL_CODE) *</label>
              <input
                type="text"
                placeholder="VD: VT0001"
                disabled={isEdit}
                className={inputClass}
                {...register("VIETTEL_CODE", {
                  required: "Bắt buộc",
                  validate: (v) =>
                    v.trim().length === 6 || "Mã Viettel phải đúng 6 ký tự",
                })}
              />
              {errors.VIETTEL_CODE && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.VIETTEL_CODE.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Trạng thái (STATUS) *</label>
              <select className={inputClass} {...register("STATUS")}>
                <option value="ENABLE">ENABLE (Hoạt động)</option>
                <option value="DISABLED">DISABLED</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Email Viettel (VIETTEL_EMAIL)</label>
            <input
              type="text"
              placeholder="VD: user@viettel.com.vn"
              className={inputClass}
              {...register("VIETTEL_EMAIL", {
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Email không hợp lệ",
                },
              })}
            />
            {errors.VIETTEL_EMAIL && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.VIETTEL_EMAIL.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Mã nhân viên (EMPLOYEE_ID)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="VD: 1"
              className={inputClass}
              {...register("EMPLOYEE_ID")}
            />
          </div>

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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
