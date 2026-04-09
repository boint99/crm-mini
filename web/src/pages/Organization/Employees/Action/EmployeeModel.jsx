import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const emptyEmployee = {
  EMPLOYEE_ID: null,
  EMPLOYEE_CODE: "",
  FIRST_NAME: "",
  LAST_NAME: "",
  PHONE: "",
  EMAIL: "",
  BIRTH_DATE: "",
  ORG_UNIT_ID: "",
  VIETTEL_CODE: "",
  POSITION_ID: "",
  STATUS: "ENABLE",
};

const normalizeEmployee = (employee) => {
  if (!employee) return emptyEmployee;

  return {
    EMPLOYEE_ID: employee.EMPLOYEE_ID ?? null,
    EMPLOYEE_CODE: employee.EMPLOYEE_CODE ?? "",
    FIRST_NAME: employee.FIRST_NAME ?? "",
    LAST_NAME: employee.LAST_NAME ?? "",
    PHONE: employee.PHONE ?? "",
    EMAIL: employee.EMAIL ?? "",
    BIRTH_DATE: employee.BIRTH_DATE
      ? String(employee.BIRTH_DATE).slice(0, 10)
      : "",
    ORG_UNIT_ID: employee.ORG_UNIT?.ORG_UNIT_ID ?? employee.UNIT_ID ?? "",
    VIETTEL_CODE: employee.VIETTEL?.VIETTEL_CODE ?? "",
    POSITION_ID: employee.POSITION?.POSITION_ID ?? employee.POSITION_ID ?? "",
    STATUS: employee.STATUS ?? "ENABLE",
  };
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-900">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function EmployeeModel({
  open,
  onClose,
  onSubmit,
  mode = "create",
  initialValues = null,
}) {
  const [values, setValues] = useState(emptyEmployee);
  const [touched, setTouched] = useState({});
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  useEffect(() => {
    if (!open) return;

    setValues(normalizeEmployee(initialValues));
    setTouched({});
  }, [initialValues, open]);

  const errors = useMemo(() => {
    if (isDelete) return {};

    const next = {};
    if (!values.EMPLOYEE_CODE.trim())
      next.EMPLOYEE_CODE = "Vui lòng nhập mã nhân viên";
    if (
      values.EMPLOYEE_CODE.trim() &&
      values.EMPLOYEE_CODE.trim().length !== 6
    ) {
      next.EMPLOYEE_CODE = "Mã nhân viên phải đúng 6 ký tự";
    }
    if (!values.FIRST_NAME.trim()) next.FIRST_NAME = "Vui lòng nhập họ";
    if (!values.LAST_NAME.trim()) next.LAST_NAME = "Vui lòng nhập tên";
    if (!values.STATUS) next.STATUS = "Vui lòng chọn trạng thái";
    if (values.EMAIL && !/^\S+@\S+\.\S+$/.test(values.EMAIL))
      next.EMAIL = "Email không hợp lệ";
    return next;
  }, [isDelete, values]);

  const canSubmit = Object.keys(errors).length === 0;

  if (!open) return null;

  const setField = (key) => (e) => {
    const val = e?.target?.value;
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const markTouched = (key) => () =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isDelete) {
      onSubmit?.(Number(values.EMPLOYEE_ID));
      return;
    }

    setTouched({
      EMPLOYEE_CODE: true,
      FIRST_NAME: true,
      LAST_NAME: true,
      EMAIL: true,
      STATUS: true,
    });
    if (!canSubmit) return;

    const payload = {
      ...(isEdit && values.EMPLOYEE_ID
        ? { EMPLOYEE_ID: Number(values.EMPLOYEE_ID) }
        : {}),
      FIRST_NAME: values.FIRST_NAME.trim(),
      LAST_NAME: values.LAST_NAME.trim(),
      ORG_UNIT_ID: values.ORG_UNIT_ID ? Number(values.ORG_UNIT_ID) : null,
      ...(values.VIETTEL_CODE?.trim()
        ? { VIETTEL_CODE: values.VIETTEL_CODE.trim() }
        : {}),
      POSITION_ID: values.POSITION_ID ? Number(values.POSITION_ID) : null,
      BIRTH_DATE: values.BIRTH_DATE || null,
      STATUS: values.STATUS,
      PHONE: values.PHONE?.trim() || null,
      EMAIL: values.EMAIL?.trim() || null,
    };

    if (!isEdit) {
      payload.EMPLOYEE_CODE = values.EMPLOYEE_CODE.trim();
    }

    onSubmit?.(payload);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-gray-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-200">
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isDelete
                  ? "Xóa nhân viên"
                  : isEdit
                    ? "Cập nhật nhân viên"
                    : "Thêm nhân viên"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {isDelete ? (
                  "Bạn có chắc muốn xóa nhân viên này không?"
                ) : (
                  <>
                    Nhập thông tin theo dữ liệu được cung cấp. Các trường có dấu
                    * là bắt buộc.
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 cursor-pointer"
              aria-label="Đóng"
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-5 py-4">
            {isDelete ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                <p className="font-semibold">Thông tin sẽ bị xóa:</p>
                <div className="mt-3 space-y-2">
                  <p>
                    <span className="font-medium">Mã nhân viên:</span>{" "}
                    {values.EMPLOYEE_CODE || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Họ tên:</span>{" "}
                    {[values.FIRST_NAME, values.LAST_NAME]
                      .filter(Boolean)
                      .join(" ") || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {values.EMAIL || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Trạng thái:</span>{" "}
                    {values.STATUS || "-"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Mã nhân viên (MaNV) *">
                  <input
                    value={values.EMPLOYEE_CODE}
                    onChange={setField("EMPLOYEE_CODE")}
                    onBlur={markTouched("EMPLOYEE_CODE")}
                    disabled={isEdit}
                    className={[
                      "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none text-gray-900",
                      isEdit
                        ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                        : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                    ].join(" ")}
                    placeholder="VD: EMP123"
                  />
                  {touched.EMPLOYEE_CODE && errors.EMPLOYEE_CODE ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.EMPLOYEE_CODE}
                    </p>
                  ) : null}
                </Field>

                <Field label="Trạng thái (STATUS) *">
                  <select
                    value={values.STATUS}
                    onChange={setField("STATUS")}
                    onBlur={markTouched("STATUS")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                  >
                    <option value="ENABLE">ENABLE (Hoạt động)</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                  {touched.STATUS && errors.STATUS ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.STATUS}
                    </p>
                  ) : null}
                </Field>

                <Field label="Họ (First Name) *">
                  <input
                    value={values.FIRST_NAME}
                    onChange={setField("FIRST_NAME")}
                    onBlur={markTouched("FIRST_NAME")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                    placeholder="VD: Nguyễn"
                  />
                  {touched.FIRST_NAME && errors.FIRST_NAME ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.FIRST_NAME}
                    </p>
                  ) : null}
                </Field>

                <Field label="Tên (Last Name) *">
                  <input
                    value={values.LAST_NAME}
                    onChange={setField("LAST_NAME")}
                    onBlur={markTouched("LAST_NAME")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                    placeholder="VD: Văn A"
                  />
                  {touched.LAST_NAME && errors.LAST_NAME ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.LAST_NAME}
                    </p>
                  ) : null}
                </Field>

                <Field label="Ngày sinh (Birth Date)">
                  <input
                    type="date"
                    value={values.BIRTH_DATE}
                    onChange={setField("BIRTH_DATE")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                  />
                </Field>

                <Field label="Số điện thoại (Phone)">
                  <input
                    value={values.PHONE}
                    onChange={setField("PHONE")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                    placeholder="VD: 0901234567"
                  />
                </Field>

                <Field label="Email (Email)">
                  <input
                    value={values.EMAIL}
                    onChange={setField("EMAIL")}
                    onBlur={markTouched("EMAIL")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                    placeholder="VD: a.nguyen@company.com"
                  />
                  {touched.EMAIL && errors.EMAIL ? (
                    <p className="mt-1 text-xs text-rose-600">{errors.EMAIL}</p>
                  ) : null}
                </Field>

                <Field label="Đơn vị (Unit)">
                  <input
                    inputMode="numeric"
                    value={values.ORG_UNIT_ID}
                    onChange={setField("ORG_UNIT_ID")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                    placeholder="VD: 1"
                  />
                </Field>

                <Field label="Mã Viettel">
                  <input
                    value={values.VIETTEL_CODE}
                    onChange={setField("VIETTEL_CODE")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                    placeholder="VD: VT001"
                  />
                </Field>

                <Field label="Chức vụ (Position)">
                  <input
                    inputMode="numeric"
                    value={values.POSITION_ID}
                    onChange={setField("POSITION_ID")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                    placeholder="VD: 3"
                  />
                </Field>
              </div>
            )}

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
                disabled={!isDelete && !canSubmit}
                className={[
                  "inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm",
                  isDelete
                    ? "bg-rose-600 hover:bg-rose-700"
                    : canSubmit
                      ? "bg-primary hover:opacity-95 cursor-pointer"
                      : "bg-gray-300 cursor-not-allowed",
                ].join(" ")}
              >
                {isDelete ? "Xác nhận xóa" : isEdit ? "Cập nhật" : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EmployeeModel;
