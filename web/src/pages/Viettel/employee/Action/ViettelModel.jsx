import { customStyles } from '@/utils/contants'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Modal from 'react-modal'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/hook/useAppDispatch'
import { getBranches, selectViettelBranches } from '@/redux/slice/viettelBranchSlice'

export default function ViettelModel({
  open,
  isOpen = open,
  onClose,
  onSubmit,
  mode = 'create',
  initialValues,
  data = initialValues
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm()

  const isEdit = mode === 'edit'

  const dispatchAsync = useAppDispatch()
  const branches = useSelector(selectViettelBranches)

  useEffect(() => {
    if (isOpen) {
      dispatchAsync(getBranches())
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && data) {
        reset({
          viettelCode: data.viettelCode || '',
          viettelEmail: data.viettelEmail || '',
          employeeCode: data.employee?.employeeCode || '',
          status: data.status || 'ENABLE',
          viettelPosition: data.viettelPosition || '',
          viettelBranchId: data.viettelBranch?.id || ''
        })
      } else if (mode === 'create') {
        reset({
          viettelCode: '',
          viettelEmail: '',
          employeeCode: '',
          status: 'ENABLE',
          viettelPosition: '',
          viettelBranchId: ''
        })
      }
    }
  }, [isOpen, mode, data, reset])

  const handleFormSubmit = (formData) => {
    if (mode === 'delete') {
      onSubmit?.(data?.id)
      return
    }

    const payload = {
      viettelCode: formData.viettelCode.trim(),
      viettelEmail: formData.viettelEmail?.trim() || null,
      employeeCode: formData.employeeCode?.trim() || null,
      viettelPosition: formData.viettelPosition?.trim() || null,
      viettelBranchId: formData.viettelBranchId || null,
      status: formData.status
    }

    if (isEdit && data?.id) {
      payload.id = data.id
    }

    onSubmit?.(payload)
  }

  if (mode === 'delete') {
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
              Xác nhận xóa nhân viên Viettel
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Bạn có chắc muốn xóa nhân viên Viettel với mã{' '}
            <span className="font-semibold">{data?.viettelCode}</span>? Thao tác này
            không thể hoàn tác.
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
    )
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

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
            {isEdit ? 'Chỉnh sửa' : 'Thêm mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Mã *</label>
              <input
                type="text"
                placeholder="VD: VT0001"
                disabled={isEdit}
                className={inputClass}
                {...register('viettelCode', {
                  required: 'Bắt buộc',
                  validate: (v) =>
                    v.trim().length === 6 || 'Mã Viettel phải đúng 6 ký tự'
                })}
              />
              {errors.viettelCode && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.viettelCode.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Trạng thái (status)</label>
              <select className={inputClass} {...register('status')}>
                <option value="ENABLE">ENABLE (Hoạt động)</option>
                <option value="DISABLED">DISABLED</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Email Viettel</label>
            <input
              type="text"
              placeholder="VD: user@viettel.com.vn"
              className={inputClass}
              {...register('viettelEmail', {
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Email không hợp lệ'
                }
              })}
            />
            {errors.viettelEmail && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.viettelEmail.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Chức danh Viettel</label>
              <input
                type="text"
                placeholder="VD: Chuyên viên"
                className={inputClass}
                {...register('viettelPosition')}
              />
            </div>

            <div>
              <label className={labelClass}>Đơn vị Viettel</label>
              <select className={inputClass} {...register('viettelBranchId')}>
                <option value="">-- Chọn đơn vị --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.viettelBranchName || b.viettelBranchCode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Mã nhân viên liên kết</label>
            <input
              type="text"
              placeholder="VD: NV001"
              className={inputClass}
              {...register('employeeCode')}
            />
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
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
