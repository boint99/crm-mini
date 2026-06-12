import { customStyles } from "@/utils/contants";
import { X } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";
import { positionsAPI } from "@/api/positionsAPI";
import { departmentsAPI } from "@/api/departmentsAPI";

const modalStyles = {
  ...customStyles,
  content: {
    ...customStyles.content,
    maxWidth: "672px",
    overflow: "visible",
  },
};

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  inputClass,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((opt) =>
      opt.label?.toLowerCase().includes(query)
    );
  }, [options, search]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className={`${inputClass} flex items-center justify-between bg-white text-left`}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {selectedOption ? (selectedOption.cleanLabel || selectedOption.label) : placeholder}
        </span>
        <svg
          className="ml-2 h-4 w-4 text-gray-400 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1 text-sm text-gray-700">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 hover:bg-slate-100 cursor-pointer ${
                    opt.value === value ? "bg-blue-50 text-blue-600 font-medium" : ""
                  }`}
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-xs text-gray-400 italic">
                Không tìm thấy kết quả
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

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
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const isEdit = mode === "edit";

  useEffect(() => {
    register("unitId");
    register("positionId");
  }, [register]);

  const unitId = watch("unitId");
  const positionId = watch("positionId");

  const [units, setUnits] = useState([]);
  const [positions, setPositions] = useState([]);

  const unitOptions = useMemo(() => {
    if (!units || units.length === 0) return [];

    // Loại bỏ trùng lặp nếu API trả về các phần tử trùng lặp
    const uniqueUnitsMap = {};
    units.forEach((u) => {
      if (u && u.id) {
        uniqueUnitsMap[u.id] = u;
      }
    });
    const uniqueUnits = Object.values(uniqueUnitsMap);

    const map = {};
    uniqueUnits.forEach((unit) => {
      map[unit.id] = { ...unit, children: [] };
    });

    const roots = [];
    uniqueUnits.forEach((unit) => {
      const mapped = map[unit.id];
      const parentId = unit.parentUnit?.id;
      if (parentId && map[parentId]) {
        map[parentId].children.push(mapped);
      } else {
        roots.push(mapped);
      }
    });

    const options = [];
    const traverse = (node, depth = 0) => {
      const indent = "\u00A0\u00A0".repeat(depth);
      const prefix = depth > 0 ? `${indent}↳ ` : "";

      let extra = "";
      if (node.company?.companyName && depth === 0) {
        extra = ` (${node.company.companyName})`;
      } else if (node.branch?.branchName && depth === 0) {
        extra = ` (${node.branch.branchName})`;
      }

      options.push({
        value: node.id,
        label: `${prefix}${node.unitName}`,
        cleanLabel: `${node.unitName}`
      });

      if (node.children) {
        node.children.forEach((child) => traverse(child, depth + 1));
      }
    };

    roots.forEach((root) => traverse(root, 0));
    return options;
  }, [units]);

  useEffect(() => {
    if (isOpen) {
      departmentsAPI
        .getLists()
        .then((res) => {
          setUnits(res.data || []);
        })
        .catch((err) => console.error("Failed to load units:", err));

      positionsAPI
        .getLists()
        .then((res) => {
          setPositions(res.data || []);
        })
        .catch((err) => console.error("Failed to load positions:", err));
    }
  }, [isOpen]);

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
          unitId: data.orgUnit?.id || data.unitId || "",
          viettelCode: data.viettelCode || "",
          positionId: data.position?.id || data.positionId || "",
          status: data.status || "ENABLE",
          description: data.description || "",
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
          description: "",
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
      unitId: formData.unitId || null,
      positionId: formData.positionId || null,
      birthDate: formData.birthDate || null,
      status: formData.status,
      phone: formData.phone?.trim() || null,
      email: formData.email?.trim() || null,
      description: formData.description?.trim() || null,
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
              <label className={labelClass}>Mã nhân viên*</label>
              <input
                type="text"
                placeholder="VD: EMP123"
                disabled={isEdit}
                className={inputClass}
                {...register("employeeCode", {
                  required: "Bắt buộc",
                  validate: (v) =>
                    v.trim().length >= 6 || "Mã nhân viên phải đúng 6 ký tự",
                })}
              />
              {errors.employeeCode && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.employeeCode.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Họ*</label>
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
              <label className={labelClass}>Tên*</label>
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
              <label className={labelClass}>Số điện thoại</label>
              <input
                type="text"
                placeholder="VD: 0901234567"
                className={inputClass}
                {...register("phone")}
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
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
              <label className={labelClass}>Đơn vị/phòng ban</label>
              <SearchableSelect
                options={unitOptions}
                value={unitId}
                onChange={(val) => setValue("unitId", val)}
                placeholder="Chọn đơn vị"
                inputClass={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Chức vụ</label>
              <SearchableSelect
                options={positions.map((pos) => ({
                  value: pos.id || "",
                  label: pos.positionName || "",
                }))}
                value={positionId}
                onChange={(val) => setValue("positionId", val)}
                placeholder="Chọn chức vụ"
                inputClass={inputClass}
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
              <label className={labelClass}>Trạng thái (STATUS) *</label>
              <select className={inputClass} {...register("status")}>
                <option value="ENABLE">ENABLE (Hoạt động)</option>
                <option value="DISABLED">DISABLED</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Mô tả</label>
              <textarea
                placeholder="Nhập mô tả nhân viên..."
                rows={3}
                className={inputClass}
                {...register("description")}
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
