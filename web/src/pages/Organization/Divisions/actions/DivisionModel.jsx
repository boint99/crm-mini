import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const emptyDivision = {
  DIVISION_ID: null,
  DIVISION_CODE: "",
  DIVISION_NAME: "",
  COMPANY_ID: "",
  STATUS: "ENABLE",
};

const normalizeDivision = (division) => {
  if (!division) return emptyDivision;
  return {
    DIVISION_ID: division.DIVISION_ID ?? null,
    DIVISION_CODE: division.DIVISION_CODE ?? "",
    DIVISION_NAME: division.DIVISION_NAME ?? "",
    COMPANY_ID: division.COMPANY_ID ?? "",
    STATUS: division.STATUS ?? "ENABLE",
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

function DivisionModel({
  open,
  onClose,
  onSubmit,
  mode = "create",
  initialValues = null,
}) {
  const [values, setValues] = useState(emptyDivision);
  const [touched, setTouched] = useState({});
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  useEffect(() => {
    if (!open) return;
    setValues(normalizeDivision(initialValues));
    setTouched({});
  }, [initialValues, open]);

  const errors = useMemo(() => {
    if (isDelete) return {};
    const next = {};
    if (!values.DIVISION_CODE.trim())
      next.DIVISION_CODE = "Vui lòng nhập mã phòng ban";
    if (!values.DIVISION_NAME.trim())
      next.DIVISION_NAME = "Vui lòng nhập tên phòng ban";
    if (!values.STATUS) next.STATUS = "Vui lòng chọn trạng thái";
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
      onSubmit?.(Number(values.DIVISION_ID));
      return;
    }

    setTouched({
      DIVISION_CODE: true,
      DIVISION_NAME: true,
      STATUS: true,
    });
    if (!canSubmit) return;

    const payload = {
      ...(isEdit && values.DIVISION_ID
        ? { DIVISION_ID: Number(values.DIVISION_ID) }
        : {}),
      DIVISION_NAME: values.DIVISION_NAME.trim(),
      COMPANY_ID: values.COMPANY_ID ? Number(values.COMPANY_ID) : null,
      STATUS: values.STATUS,
    };

    if (!isEdit) {
      payload.DIVISION_CODE = values.DIVISION_CODE.trim();
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
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200">
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isDelete ? "Xóa khối" : isEdit ? "Cập nhật khối" : "Thêm khối"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {isDelete ? (
                  "Bạn có chắc muốn xóa khối này không?"
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Mã khối *">
                <input
                  value={values.DIVISION_CODE}
                  onChange={setField("DIVISION_CODE")}
                  onBlur={markTouched("DIVISION_CODE")}
                  disabled={isEdit || isDelete}
                  className={[
                    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none text-gray-900",
                    isEdit || isDelete
                      ? "disabled-input"
                      : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                  ].join(" ")}
                  placeholder="VD: DIV001"
                />
                {touched.DIVISION_CODE && errors.DIVISION_CODE ? (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.DIVISION_CODE}
                  </p>
                ) : null}
              </Field>

              <Field label="Trạng thái *">
                <select
                  value={values.STATUS}
                  onChange={setField("STATUS")}
                  onBlur={markTouched("STATUS")}
                  disabled={isDelete}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 ${isDelete ? "disabled-input" : ""}`}
                >
                  <option value="ENABLE">ENABLE (Hoạt động)</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
                {touched.STATUS && errors.STATUS ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.STATUS}</p>
                ) : null}
              </Field>

              <Field label="Tên khối *">
                <input
                  value={values.DIVISION_NAME}
                  onChange={setField("DIVISION_NAME")}
                  onBlur={markTouched("DIVISION_NAME")}
                  disabled={isDelete}
                  placeholder="VD: Khối Kỹ thuật"
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 ${isDelete ? "disabled-input" : ""}`}
                />
                {touched.DIVISION_NAME && errors.DIVISION_NAME ? (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.DIVISION_NAME}
                  </p>
                ) : null}
              </Field>

              <Field label="Mã công ty">
                <input
                  inputMode="numeric"
                  value={values.COMPANY_ID}
                  onChange={setField("COMPANY_ID")}
                  disabled={isDelete}
                  placeholder="VD: 1"
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 ${isDelete ? "disabled-input" : ""}`}
                />
              </Field>
            </div>

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
                  "inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm cursor-pointer",
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

export default DivisionModel;
