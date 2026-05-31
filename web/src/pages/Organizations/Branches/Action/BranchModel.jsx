import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const emptyBranch = {
  BRANCH_ID: null,
  BRANCH_NAME: "",
  BRANCH_CODE: "",
  LOCATION: "",
  STATUS: "ENABLE",
};

const normalizeBranch = (branch) => {
  if (!branch) return emptyBranch;

  return {
    BRANCH_ID: branch.BRANCH_ID ?? null,
    BRANCH_NAME: branch.BRANCH_NAME ?? "",
    BRANCH_CODE: branch.BRANCH_CODE ?? "",
    LOCATION: branch.LOCATION ?? "",
    STATUS: branch.STATUS ?? "ENABLE",
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

function BranchModel({
  open,
  onClose,
  onSubmit,
  mode = "create",
  initialValues = null,
}) {
  const [values, setValues] = useState(emptyBranch);
  const [touched, setTouched] = useState({});
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  useEffect(() => {
    if (!open) return;

    setValues(normalizeBranch(initialValues));
    setTouched({});
  }, [initialValues, open]);

  const errors = useMemo(() => {
    if (isDelete) return {};

    const next = {};
    if (!values.BRANCH_NAME.trim())
      next.BRANCH_NAME = "Vui lòng nhập tên chi nhánh";
    if (!values.BRANCH_CODE.trim())
      next.BRANCH_CODE = "Vui lòng nhập tên viết tắt";
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
      onSubmit?.(Number(values.BRANCH_ID));
      return;
    }

    setTouched({ BRANCH_NAME: true, BRANCH_CODE: true, STATUS: true });
    if (!canSubmit) return;

    const payload = {
      ...(isEdit && values.BRANCH_ID
        ? { BRANCH_ID: Number(values.BRANCH_ID) }
        : {}),
      BRANCH_NAME: values.BRANCH_NAME.trim(),
      BRANCH_CODE: values.BRANCH_CODE.trim(),
      LOCATION: values.LOCATION?.trim() || null,
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
                  ? "Xóa chi nhánh"
                  : isEdit
                    ? "Cập nhật chi nhánh"
                    : "Thêm chi nhánh"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {isDelete ? (
                  "Bạn có chắc muốn xóa chi nhánh này không?"
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
                    <span className="font-medium">Tên chi nhánh:</span>{" "}
                    {values.BRANCH_NAME || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Địa điểm:</span>{" "}
                    {values.LOCATION || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Trạng thái:</span>{" "}
                    {values.STATUS || "-"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Tên chi nhánh *">
                  <input
                    value={values.BRANCH_NAME}
                    onChange={setField("BRANCH_NAME")}
                    onBlur={markTouched("BRANCH_NAME")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                    placeholder="VD: Chi nhánh Tp.HCM"
                  />
                  {touched.BRANCH_NAME && errors.BRANCH_NAME ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.BRANCH_NAME}
                    </p>
                  ) : null}
                </Field>
                <Field label="Tên viết tắt *">
                  <input
                    value={values.BRANCH_CODE}
                    onChange={setField("BRANCH_CODE")}
                    onBlur={markTouched("BRANCH_CODE")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                    placeholder="VD: CN-HCM"
                  />
                  {touched.BRANCH_CODE && errors.BRANCH_CODE ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.BRANCH_CODE}
                    </p>
                  ) : null}
                </Field>

                <Field label="Trạng thái *">
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
                <Field label="Địa điểm ">
                  <input
                    value={values.LOCATION}
                    onChange={setField("LOCATION")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                    placeholder="VD: 123 Đường ABC, Tp.HCM"
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

export default BranchModel;
