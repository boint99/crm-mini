import { useEffect, useMemo, useState } from 'react'

const emptyEmployee = {
  EMPLOYEE_CODE: '',
  FIRST_NAME: '',
  LAST_NAME: '',
  PHONE: '',
  EMAIL: '',
  BIRTH_DATE: '',
  UNIT_ID: '',
  VT_CODE: '',
  STATUS: 'ENABLE',
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-900">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  )
}

function AddEmployeeModal({ open, onClose, onSubmit }) {
  const [values, setValues] = useState(emptyEmployee)
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (!open) {
      setValues(emptyEmployee)
      setTouched({})
    }
  }, [open])

  const errors = useMemo(() => {
    const next = {}
    if (!values.EMPLOYEE_CODE.trim()) next.EMPLOYEE_CODE = 'Vui lòng nhập mã nhân viên'
    if (!values.FIRST_NAME.trim()) next.FIRST_NAME = 'Vui lòng nhập họ'
    if (!values.LAST_NAME.trim()) next.LAST_NAME = 'Vui lòng nhập tên'
    if (!values.BIRTH_DATE) next.BIRTH_DATE = 'Vui lòng chọn ngày sinh'
    if (!values.STATUS) next.STATUS = 'Vui lòng chọn trạng thái'
    if (values.EMAIL && !/^\S+@\S+\.\S+$/.test(values.EMAIL)) next.EMAIL = 'Email không hợp lệ'
    return next
  }, [values])

  const canSubmit = Object.keys(errors).length === 0

  if (!open) return null

  const setField = (key) => (e) => {
    const val = e?.target?.value
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  const markTouched = (key) => () => setTouched((prev) => ({ ...prev, [key]: true }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({
      EMPLOYEE_CODE: true,
      FIRST_NAME: true,
      LAST_NAME: true,
      EMAIL: true,
      BIRTH_DATE: true,
      STATUS: true,
    })
    if (!canSubmit) return

    const payload = {
      ...values,
      UNIT_ID: values.UNIT_ID ? Number(values.UNIT_ID) : null,
      VT_CODE: values.VT_CODE ? Number(values.VT_CODE) : null,
      PHONE: values.PHONE?.trim() || null,
      EMAIL: values.EMAIL?.trim() || null,
    }

    onSubmit?.(payload)
  }

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
              <h2 className="text-lg font-semibold text-gray-900">Thêm nhân viên</h2>
              <p className="mt-1 text-sm text-gray-600">
                Nhập thông tin theo bảng <span className="font-mono text-[12px]">EMPLOYEES</span>.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              aria-label="Đóng"
              title="Đóng"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-5 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Mã nhân viên (EMPLOYEE_CODE) *">
                <input
                  value={values.EMPLOYEE_CODE}
                  onChange={setField('EMPLOYEE_CODE')}
                  onBlur={markTouched('EMPLOYEE_CODE')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                  placeholder="VD: EMP123"
                />
                {touched.EMPLOYEE_CODE && errors.EMPLOYEE_CODE ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.EMPLOYEE_CODE}</p>
                ) : null}
              </Field>

              <Field label="Trạng thái (STATUS) *">
                <select
                  value={values.STATUS}
                  onChange={setField('STATUS')}
                  onBlur={markTouched('STATUS')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                >
                  <option value="ENABLE">ENABLE (Hoạt động)</option>
                  <option value="DISABLE">DISABLE</option>
                </select>
                {touched.STATUS && errors.STATUS ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.STATUS}</p>
                ) : null}
              </Field>

              <Field label="Họ (FIRST_NAME) *">
                <input
                  value={values.FIRST_NAME}
                  onChange={setField('FIRST_NAME')}
                  onBlur={markTouched('FIRST_NAME')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                  placeholder="VD: Nguyễn"
                />
                {touched.FIRST_NAME && errors.FIRST_NAME ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.FIRST_NAME}</p>
                ) : null}
              </Field>

              <Field label="Tên (LAST_NAME) *">
                <input
                  value={values.LAST_NAME}
                  onChange={setField('LAST_NAME')}
                  onBlur={markTouched('LAST_NAME')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                  placeholder="VD: Văn A"
                />
                {touched.LAST_NAME && errors.LAST_NAME ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.LAST_NAME}</p>
                ) : null}
              </Field>

              <Field label="Ngày sinh (BIRTH_DATE) *">
                <input
                  type="date"
                  value={values.BIRTH_DATE}
                  onChange={setField('BIRTH_DATE')}
                  onBlur={markTouched('BIRTH_DATE')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                />
                {touched.BIRTH_DATE && errors.BIRTH_DATE ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.BIRTH_DATE}</p>
                ) : null}
              </Field>

              <Field label="Số điện thoại (PHONE)">
                <input
                  value={values.PHONE}
                  onChange={setField('PHONE')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                  placeholder="VD: 0901234567"
                />
              </Field>

              <Field label="Email (EMAIL)">
                <input
                  value={values.EMAIL}
                  onChange={setField('EMAIL')}
                  onBlur={markTouched('EMAIL')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                  placeholder="VD: a.nguyen@company.com"
                />
                {touched.EMAIL && errors.EMAIL ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.EMAIL}</p>
                ) : null}
              </Field>

              <Field label="Unit ID (UNIT_ID)">
                <input
                  inputMode="numeric"
                  value={values.UNIT_ID}
                  onChange={setField('UNIT_ID')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                  placeholder="VD: 1"
                />
              </Field>

              <Field label="Mã vị trí (VT_CODE)">
                <input
                  inputMode="numeric"
                  value={values.VT_CODE}
                  onChange={setField('VT_CODE')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                  placeholder="VD: 101"
                />
              </Field>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className={[
                  'inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm',
                  canSubmit ? 'bg-primary hover:opacity-95' : 'bg-gray-300 cursor-not-allowed',
                ].join(' ')}
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddEmployeeModal
