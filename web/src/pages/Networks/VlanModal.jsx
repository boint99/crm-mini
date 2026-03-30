import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 50,
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    padding: 0,
    border: "none",
    borderRadius: "0.75rem",
    maxWidth: "520px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
  },
};

export default function VlanModal({ isOpen, onClose, onSubmit, mode, data }) {
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
          VLAN_CODE: data.VLAN_CODE,
          VLAN_NAME: data.VLAN_NAME,
          NETWORK: data.NETWORK,
          DEFAULT_GATEWAY: data.DEFAULT_GATEWAY,
          STATUS: data.STATUS || "ACTIVE",
        });
      } else if (mode === "create") {
        reset({
          VLAN_CODE: "",
          VLAN_NAME: "",
          NETWORK: "",
          DEFAULT_GATEWAY: "",
          STATUS: "ACTIVE",
        });
      }
    }
  }, [isOpen, mode, data, reset]);

  const handleFormSubmit = (formData) => {
    if (mode === "delete") {
      onSubmit(data.VLAN_ID);
      return;
    }
    const payload =
      mode === "edit"
        ? { ...formData, VLAN_ID: data.VLAN_ID, VLAN_CODE: Number(formData.VLAN_CODE) }
        : { ...formData, VLAN_CODE: Number(formData.VLAN_CODE) };
    onSubmit(payload);
  };

  if (mode === "delete") {
    return (
      <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles} ariaHideApp={false}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa VLAN</h3>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 cursor-pointer">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Bạn có chắc muốn xóa <span className="font-semibold">VLAN {data?.VLAN_CODE}</span> —{" "}
            <span className="font-medium">{data?.VLAN_NAME}</span>? Thao tác này không thể hoàn tác.
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
    <Modal isOpen={isOpen} onRequestClose={onClose} style={customStyles} ariaHideApp={false}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === "edit" ? "Chỉnh sửa VLAN" : "Thêm VLAN mới"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 cursor-pointer">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>VLAN Code</label>
              <input
                type="number"
                placeholder="VD: 10"
                className={inputClass}
                {...register("VLAN_CODE", { required: "Bắt buộc" })}
              />
              {errors.VLAN_CODE && (
                <p className="mt-1 text-xs text-rose-500">{errors.VLAN_CODE.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Tên VLAN</label>
              <input
                type="text"
                placeholder="VD: MANAGEMENT"
                className={inputClass}
                {...register("VLAN_NAME", { required: "Bắt buộc" })}
              />
              {errors.VLAN_NAME && (
                <p className="mt-1 text-xs text-rose-500">{errors.VLAN_NAME.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Network (CIDR)</label>
            <input
              type="text"
              placeholder="VD: 192.168.10.0/24"
              className={inputClass}
              {...register("NETWORK", { required: "Bắt buộc" })}
            />
            {errors.NETWORK && (
              <p className="mt-1 text-xs text-rose-500">{errors.NETWORK.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Default Gateway</label>
            <input
              type="text"
              placeholder="VD: 192.168.10.1"
              className={inputClass}
              {...register("DEFAULT_GATEWAY", { required: "Bắt buộc" })}
            />
            {errors.DEFAULT_GATEWAY && (
              <p className="mt-1 text-xs text-rose-500">{errors.DEFAULT_GATEWAY.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Trạng thái</label>
            <select className={inputClass} {...register("STATUS")}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
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
              {mode === "edit" ? "Cập nhật" : "Tạo VLAN"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
