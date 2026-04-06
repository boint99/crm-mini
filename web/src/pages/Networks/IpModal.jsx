import { customStyles } from "@/utils/contants";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function IpModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  data,
  vlanId,
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
          HOST: data.HOST,
          DEVICE_TYPE: data.DEVICE_TYPE || "",
          EMPLOYEE_CODE: data.EMPLOYEE?.EMPLOYEE_CODE || "",
          STATUS: data.STATUS || "ACTIVE",
        });
      } else if (mode === "create") {
        reset({
          HOST: "",
          DEVICE_TYPE: "",
          EMPLOYEE_CODE: "",
          STATUS: "ACTIVE",
        });
      }
    }
  }, [isOpen, mode, data, reset]);

  const handleFormSubmit = (formData) => {
    if (mode === "delete") {
      onSubmit(data.IP_ID);
      return;
    }
    const payload = {
      ...formData,
      VLAN_ID: vlanId,
      EMPLOYEE_CODE: formData.EMPLOYEE_CODE?.trim() || null,
    };
    if (mode === "edit") {
      payload.IP_ID = data.IP_ID;
    }
    onSubmit(payload);
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
              Are you sure you want to delete this IP?
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete IP{" "}
            <span className="font-semibold">{data?.HOST}</span>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleFormSubmit()}
              className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 cursor-pointer"
            >
              Delete
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
            {mode === "edit" ? "Edit IP" : "Add IP"}
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
            <label className={labelClass}>IP Address</label>
            <input
              type="text"
              placeholder="VD: 192.168.10.5"
              className={inputClass}
              {...register("HOST", { required: "Required" })}
            />
            {errors.HOST && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.HOST.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Device Type</label>
            <input
              type="text"
              placeholder="Eg: Desktop, Laptop, Printer..."
              className={inputClass}
              {...register("DEVICE_TYPE")}
            />
          </div>

          <div>
            <label className={labelClass}>Employee Code</label>
            <input
              type="text"
              placeholder="Eg: EMP001"
              className={inputClass}
              {...register("EMPLOYEE_CODE")}
            />
          </div>

          <div>
            <label className={labelClass}>Status</label>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {mode === "edit" ? "Update IP" : "Add IP"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
