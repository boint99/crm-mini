import { customStyles } from '@/utils/contants'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Modal from 'react-modal'

export default function BranchModel({
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

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && data) {
        reset({
          branchName: data.branchName || '',
          branchCode: data.branchCode || '',
          location: data.location || '',
          status: data.status || 'ENABLE'
        })
      } else if (mode === 'create') {
        reset({
          branchName: '',
          branchCode: '',
          location: '',
          status: 'ENABLE'
        })
      }
    }
  }, [isOpen, mode, data, reset])

  const handleFormSubmit = (formData) => {
    if (mode === 'delete') {
      onSubmit?.(data?.id || data?.branchId)
      return
    }
    const payload = {
      ...formData,
      branchName: formData.branchName.trim(),
      branchCode: formData.branchCode.trim(),
      location: formData.location?.trim() || null,
      status: formData.status
    }
    if (mode === 'edit' && data) {
      if (data.id) payload.id = data.id
      if (data.branchId) payload.branchId = Number(data.branchId)
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
              Xác nhận xóa chi nhánh
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Bạn có chắc muốn xóa chi nhánh{' '}
            <span className="font-semibold">{data?.branchName}</span> —{' '}
            <span className="font-medium">{data?.branchCode}</span>? Thao tác này
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
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none'
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
            {mode === 'edit' ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}
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
              <label className={labelClass}>Tên chi nhánh *</label>
              <input
                type="text"
                placeholder="VD: Chi nhánh Tp.HCM"
                className={inputClass}
                {...register('branchName', { required: 'Bắt buộc' })}
              />
              {errors.branchName && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.branchName.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Tên viết tắt *</label>
              <input
                type="text"
                placeholder="VD: CN-HCM"
                className={inputClass}
                {...register('branchCode', { required: 'Bắt buộc' })}
              />
              {errors.branchCode && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.branchCode.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Địa điểm</label>
            <input
              type="text"
              placeholder="VD: 123 Đường ABC, Tp.HCM"
              className={inputClass}
              {...register('location')}
            />
          </div>

          <div>
            <label className={labelClass}>Trạng thái</label>
            <select className={inputClass} {...register('status')}>
              <option value="ENABLE">ENABLE (Hoạt động)</option>
              <option value="DISABLED">DISABLED</option>
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
              {mode === 'edit' ? 'Cập nhật' : 'Tạo chi nhánh'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
