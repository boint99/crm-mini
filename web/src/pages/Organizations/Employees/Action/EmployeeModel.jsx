import { customStyles } from "@/utils/contants";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";

const modalStyles = {
  ...customStyles,
  content: {
    ...customStyles.content,
    maxWidth: "672px",
  },
};

export default function EmployeeModel({
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
          employeeCode: data.employeeCode || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          email: data.email || "",
          birthDate: data.birthDate ? String(data.birthDate).slice(0, 10) : "",
          unitId: data.unitId || "",
          viettelCode: data.viettelCode || "",
          positionId: data.positionId || "",
          status: data.status || "ENABLE",
        });
      } else if (mode === "create") {
        reset({
          employeeCode: "",
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          birthDate: "",
          unitId: "",
          viettelCode: "",
          positionId: "",
          status: "ENABLE",
        });
      }
    }
  }, [isOpen, mode, data, reset]);

  const handleFormSubmit = (formData) => {
    if (mode === "delete") {
      onSubmit?.(data?.id || data?.employeeId);
      return;
    }

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      unitId: formData.unitId ? Number(formData.unitId) : null,
      positionId: formData.positionId ? Number(formData.positionId) : null,
      birthDate: formData.birthDate || null,
      status: formData.status,
      phone: formData.phone?.trim() || null,
      email: formData.email?.trim() || null,
    };

    if (formData.viettelCode?.trim()) {
      payload.viettelCode = formData.viettelCode.trim();
    }

    if (isEdit && data) {
      if (data.id) payload.id = data.id;
      if (data.employeeId) payload.employeeId = Number(data.employeeId);
    } else {
      payload.employeeCode = formData.employeeCode.trim();
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
              Xác nhận xóa nhân viên
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Bạn có chắc muốn xóa nhân viên{" "}
            <span className="font-semibold">
              {[data?.firstName, data?.lastName].filter(Boolean).join(" ")}
            </span>{" "}
            ({data?.employeeCode})? Thao tác này không thể hoàn tác.
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
      style={modalStyles}
      ariaHideApp={false}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Mã nhân viên (MaNV) *</label>
              <input
                type="text"
                placeholder="VD: EMP123"
                disabled={isEdit}
                className={inputClass}
                {...register("employeeCode", {
                  required: "Bắt buộc",
                  validate: (v) =>
                    v.trim().length === 6 || "Mã nhân viên phải đúng 6 ký tự",
                })}
              />
              {errors.employeeCode && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.employeeCode.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Trạng thái (STATUS) *</label>
              <select className={inputClass} {...register("status")}>
                <option value="ENABLE">ENABLE (Hoạt động)</option>
                <option value="DISABLED">DISABLED</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Họ (First Name) *</label>
              <input
                type="text"
                placeholder="VD: Nguyễn"
                className={inputClass}
                {...register("firstName", { required: "Bắt buộc" })}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Tên (Last Name) *</label>
              <input
                type="text"
                placeholder="VD: Văn A"
                className={inputClass}
                {...register("lastName", { required: "Bắt buộc" })}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Ngày sinh (Birth Date)</label>
              <input type="date" className={inputClass} {...register("birthDate")} />
            </div>

            <div>
              <label className={labelClass}>Số điện thoại (Phone)</label>
              <input
                type="text"
                placeholder="VD: 0901234567"
                className={inputClass}
                {...register("phone")}
              />
            </div>

            <div>
              <label className={labelClass}>Email (Email)</label>
              <input
                type="text"
                placeholder="VD: a.nguyen@company.com"
                className={inputClass}
                {...register("email", {
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Email không hợp lệ",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Đơn vị (Unit)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="VD: 1"
                className={inputClass}
                {...register("unitId")}
              />
            </div>

            <div>
              <label className={labelClass}>Mã Viettel</label>
              <input
                type="text"
                placeholder="VD: VT001"
                className={inputClass}
                {...register("viettelCode")}
              />
            </div>

            <div>
              <label className={labelClass}>Chức vụ (Position)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="VD: 3"
                className={inputClass}
                {...register("positionId")}
              />
            </div>
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
              {isEdit ? "Cập nhật" : "Tạo nhân viên"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
