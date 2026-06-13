import { customStyles } from "@/utils/contants";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";

export default function CompanyModel({
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

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && data) {
        reset({
          companyName: data.companyName || "",
          status: data.status || "ENABLE",
        });
      } else if (mode === "create") {
        reset({
          companyName: "",
          status: "ENABLE",
        });
      }
    }
  }, [isOpen, mode, data, reset]);

  const handleFormSubmit = (formData) => {
    if (mode === "delete") {
      onSubmit?.(data?.id || data?.companyId);
      return;
    }
    const payload = {
      companyName: formData.companyName.trim(),
      status: formData.status,
    };
    if (mode === "edit" && data) {
      payload.id = data.id;
      payload.companyId = data.companyId;
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
              Xác nhận xóa công ty
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Bạn có chắc muốn xóa công ty{" "}
            <span className="font-semibold">{data?.companyName}</span>? Thao tác này
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
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none";
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
            {mode === "edit" ? "Chỉnh sửa công ty" : "Thêm công ty mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Tên công ty *</label>
            <input
              type="text"
              placeholder="VD: Công ty ABC"
              className={inputClass}
              {...register("companyName", {
                required: "Vui lòng nhập tên công ty",
                validate: (v) => !!v.trim() || "Vui lòng nhập tên công ty",
              })}
            />
            {errors.companyName && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Trạng thái *</label>
            <select className={inputClass} {...register("status")}>
              <option value="ENABLE">ENABLE (Hoạt động)</option>
              <option value="DISABLED">DISABLED</option>
            </select>
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
              {mode === "edit" ? "Cập nhật" : "Tạo công ty"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
