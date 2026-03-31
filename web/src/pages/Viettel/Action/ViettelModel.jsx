import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const emptyViettel = {
  VIETTEL_ID: null,
  VIETTEL_CODE: "",
  VIETTEL_EMAIL: "",
  EMPLOYEE_ID: "",
  STATUS: "ENABLE",
};

const normalizeViettel = (item) => {
  if (!item) return emptyViettel;

  return {
    VIETTEL_ID: item.VIETTEL_ID ?? null,
    VIETTEL_CODE: item.VIETTEL_CODE ?? "",
    VIETTEL_EMAIL: item.VIETTEL_EMAIL ?? "",
    EMPLOYEE_ID: item.EMPLOYEE_ID ?? "",
    STATUS: item.STATUS ?? "ENABLE",
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

function ViettelModel({
  open,
  onClose,
  onSubmit,
  mode = "create",
  initialValues = null,
}) {
  const [values, setValues] = useState(emptyViettel);
  const [touched, setTouched] = useState({});
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  useEffect(() => {
    if (!open) return;

    setValues(normalizeViettel(initialValues));
    setTouched({});
  }, [initialValues, open]);

  const errors = useMemo(() => {
    if (isDelete) return {};

    const next = {};
    if (!values.VIETTEL_CODE.trim())
      next.VIETTEL_CODE = "Vui lòng nhập mã Viettel";
    if (values.VIETTEL_CODE.trim() && values.VIETTEL_CODE.trim().length !== 6) {
      next.VIETTEL_CODE = "Mã Viettel phải đúng 6 ký tự";
    }
    if (!values.STATUS) next.STATUS = "Vui lòng chọn trạng thái";
    if (values.VIETTEL_EMAIL && !/^\S+@\S+\.\S+$/.test(values.VIETTEL_EMAIL))
      next.VIETTEL_EMAIL = "Email không hợp lệ";
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
      onSubmit?.(Number(values.VIETTEL_ID));
      return;
    }

    setTouched({
      VIETTEL_CODE: true,
      VIETTEL_EMAIL: true,
      STATUS: true,
    });
    if (!canSubmit) return;

    const payload = {
      ...(isEdit && values.VIETTEL_ID
        ? { VIETTEL_ID: Number(values.VIETTEL_ID) }
        : {}),
      VIETTEL_CODE: values.VIETTEL_CODE.trim(),
      VIETTEL_EMAIL: values.VIETTEL_EMAIL?.trim() || null,
      EMPLOYEE_ID: values.EMPLOYEE_ID ? Number(values.EMPLOYEE_ID) : null,
      STATUS: values.STATUS,
    };

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
                  ? "Xóa nhân viên Viettel"
                  : isEdit
                    ? "Cập nhật nhân viên Viettel"
                    : "Thêm nhân viên Viettel"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {isDelete ? (
                  "Bạn có chắc muốn xóa nhân viên Viettel này không?"
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
                    <span className="font-medium">Mã Viettel:</span>{" "}
                    {values.VIETTEL_CODE || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {values.VIETTEL_EMAIL || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Trạng thái:</span>{" "}
                    {values.STATUS || "-"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Mã Viettel (VIETTEL_CODE) *">
                  <input
                    value={values.VIETTEL_CODE}
                    onChange={setField("VIETTEL_CODE")}
                    onBlur={markTouched("VIETTEL_CODE")}
                    disabled={isEdit}
                    className={[
                      "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none text-gray-900",
                      isEdit
                        ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                        : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                    ].join(" ")}
                    placeholder="VD: VT0001"
                  />
                  {touched.VIETTEL_CODE && errors.VIETTEL_CODE ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.VIETTEL_CODE}
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

                <Field label="Email Viettel (VIETTEL_EMAIL)">
                  <input
                    value={values.VIETTEL_EMAIL}
                    onChange={setField("VIETTEL_EMAIL")}
                    onBlur={markTouched("VIETTEL_EMAIL")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                    placeholder="VD: user@viettel.com.vn"
                  />
                  {touched.VIETTEL_EMAIL && errors.VIETTEL_EMAIL ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.VIETTEL_EMAIL}
                    </p>
                  ) : null}
                </Field>

                <Field label="Mã nhân viên (EMPLOYEE_ID)">
                  <input
                    inputMode="numeric"
                    value={values.EMPLOYEE_ID}
                    onChange={setField("EMPLOYEE_ID")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                    placeholder="VD: 1"
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

export default ViettelModel;
