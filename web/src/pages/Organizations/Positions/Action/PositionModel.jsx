import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const emptyPosition = {
  POSITION_ID: null,
  POSITION_CODE: "",
  POSITION_NAME: "",
  LEVEL: "",
  STATUS: "ENABLE",
};

const normalizePosition = (position) => {
  if (!position) return emptyPosition;

  return {
    POSITION_ID: position.POSITION_ID ?? null,
    POSITION_CODE: position.POSITION_CODE ?? "",
    POSITION_NAME: position.POSITION_NAME ?? "",
    LEVEL: position.LEVEL ?? "",
    STATUS: position.STATUS ?? "ENABLE",
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

function PositionModel({
  open,
  onClose,
  onSubmit,
  mode = "create",
  initialValues = null,
}) {
  const [values, setValues] = useState(emptyPosition);
  const [touched, setTouched] = useState({});
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  useEffect(() => {
    if (!open) return;

    setValues(normalizePosition(initialValues));
    setTouched({});
  }, [initialValues, open]);

  const errors = useMemo(() => {
    if (isDelete) return {};

    const next = {};
    if (!values.POSITION_CODE.trim())
      next.POSITION_CODE = "Vui lòng nhập mã chức vụ";
    if (!values.POSITION_NAME.trim())
      next.POSITION_NAME = "Vui lòng nhập tên chức vụ";
    if (!values.LEVEL.trim()) next.LEVEL = "Vui lòng nhập cấp bậc";
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
      onSubmit?.(Number(values.POSITION_ID));
      return;
    }

    setTouched({
      POSITION_CODE: true,
      POSITION_NAME: true,
      LEVEL: true,
      STATUS: true,
    });
    if (!canSubmit) return;

    const payload = {
      ...(isEdit && values.POSITION_ID
        ? { POSITION_ID: Number(values.POSITION_ID) }
        : {}),
      POSITION_NAME: values.POSITION_NAME.trim(),
      LEVEL: values.LEVEL.trim(),
      STATUS: values.STATUS,
    };

    if (!isEdit) {
      payload.POSITION_CODE = values.POSITION_CODE.trim();
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
                {isDelete
                  ? "Xóa chức vụ"
                  : isEdit
                    ? "Cập nhật chức vụ"
                    : "Thêm chức vụ"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {isDelete ? (
                  "Bạn có chắc muốn xóa chức vụ này không?"
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
              <Field label="Mã chức vụ *">
                <input
                  value={values.POSITION_CODE}
                  onChange={setField("POSITION_CODE")}
                  onBlur={markTouched("POSITION_CODE")}
                  disabled={isEdit || isDelete}
                  className={[
                    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none text-gray-900",
                    isEdit || isDelete
                      ? "disabled-input"
                      : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                  ].join(" ")}
                  placeholder="VD: POS001"
                />
                {touched.POSITION_CODE && errors.POSITION_CODE ? (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.POSITION_CODE}
                  </p>
                ) : null}
              </Field>

              <Field label="Trạng thái *">
                <select
                  value={values.STATUS}
                  onChange={setField("STATUS")}
                  onBlur={markTouched("STATUS")}
                  disabled={isEdit || isDelete}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 ${isEdit || isDelete ? "disabled-input" : ""}`}
                >
                  <option value="ENABLE">ENABLE (Hoạt động)</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
                {touched.STATUS && errors.STATUS ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.STATUS}</p>
                ) : null}
              </Field>

              <Field label="Tên chức vụ *">
                <input
                  value={values.POSITION_NAME}
                  onChange={setField("POSITION_NAME")}
                  onBlur={markTouched("POSITION_NAME")}
                  disabled={isEdit || isDelete}
                  placeholder="VD: Trưởng phòng"
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 ${isEdit || isDelete ? "disabled-input" : ""}`}
                />
                {touched.POSITION_NAME && errors.POSITION_NAME ? (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.POSITION_NAME}
                  </p>
                ) : null}
              </Field>

              <Field label="Cấp bậc *">
                <input
                  value={values.LEVEL}
                  onChange={setField("LEVEL")}
                  onBlur={markTouched("LEVEL")}
                  disabled={isEdit || isDelete}
                  placeholder="VD: Senior"
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 ${isEdit || isDelete ? "disabled-input" : ""}`}
                />
                {touched.LEVEL && errors.LEVEL ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.LEVEL}</p>
                ) : null}
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

export default PositionModel;
