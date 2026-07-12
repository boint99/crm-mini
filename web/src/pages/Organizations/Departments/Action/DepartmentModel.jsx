import { customStyles } from '@/utils/contants'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Modal from 'react-modal'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/hook/useAppDispatch'
import { selectCompanies, getCompanies } from '@/redux/slice/companiesSilce'
import { selectBranches, getBranches } from '@/redux/slice/branchesSlice'
import { selectDepartments, getDepartments } from '@/redux/slice/departmentsSlice'

export default function DepartmentModel({
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
    watch,
    formState: { errors, isSubmitting }
  } = useForm()

  const isEdit = mode === 'edit'

  const dispatchAsync = useAppDispatch()
  const companies = useSelector(selectCompanies)
  const branches = useSelector(selectBranches)
  const departments = useSelector(selectDepartments)

  const watchCompanyId = watch('companyId')

  useEffect(() => {
    if (isOpen) {
      dispatchAsync(getCompanies())
      dispatchAsync(getBranches())
      dispatchAsync(getDepartments())
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && data) {
        reset({
          orgUnitCode: data.orgUnitCode || '',
          unitName: data.unitName || '',
          unitType: data.unitType || '',
          companyId: data.company?.id || '',
          branchId: data.branch?.id || '',
          parentUnitId: data.parentUnit?.id || '',
          status: data.status || 'ENABLE'
        })
      } else if (mode === 'create') {
        reset({
          orgUnitCode: '',
          unitName: '',
          unitType: 'Department',
          companyId: '',
          branchId: '',
          parentUnitId: '',
          status: 'ENABLE'
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
      orgUnitCode: formData.orgUnitCode.trim(),
      unitName: formData.unitName.trim(),
      unitType: formData.unitType?.trim() || null,
      companyId: formData.companyId,
      branchId: formData.branchId || null,
      parentUnitId: formData.parentUnitId || null,
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
              Xác nhận xóa phòng ban
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Bạn có chắc muốn xóa phòng ban <span className="font-semibold">{data?.unitName}</span>? Thao tác này không thể hoàn tác.
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

  // Filter out self and circular reference for parent unit list when editing,
  // and only include parent units belonging to the selected company
  const filteredParents = departments.filter((dept) => {
    const isNotSelf = !isEdit || !data || dept.id !== data.id
    const isSameCompany = !watchCompanyId || dept.company?.id === watchCompanyId
    return isNotSelf && isSameCompany
  })

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
            {isEdit ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}
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
              <label className={labelClass}>Mã phòng ban *</label>
              <input
                type="text"
                placeholder="VD: PB001"
                className={inputClass}
                {...register('orgUnitCode', {
                  required: 'Mã phòng ban là bắt buộc'
                })}
              />
              {errors.orgUnitCode && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.orgUnitCode.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Tên phòng ban *</label>
              <input
                type="text"
                placeholder="VD: Phòng Hành chính"
                className={inputClass}
                {...register('unitName', {
                  required: 'Tên phòng ban là bắt buộc'
                })}
              />
              {errors.unitName && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.unitName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Loại phòng ban</label>
              <input
                type="text"
                placeholder="VD: Department, Team..."
                className={inputClass}
                {...register('unitType')}
              />
            </div>

            <div>
              <label className={labelClass}>Trạng thái</label>
              <select className={inputClass} {...register('status')}>
                <option value="ENABLE">ENABLE (Hoạt động)</option>
                <option value="DISABLED">DISABLED (Ngưng hoạt động)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Công ty *</label>
            <select
              className={inputClass}
              {...register('companyId', { required: 'Vui lòng chọn công ty' })}
            >
              <option value="">-- Chọn công ty --</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
            {errors.companyId && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.companyId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Chi nhánh</label>
              <select className={inputClass} {...register('branchId')}>
                <option value="">-- Chọn chi nhánh --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Đơn vị cha</label>
              <select className={inputClass} {...register('parentUnitId')}>
                <option value="">-- Chọn đơn vị cha (Nếu để trống thì nó là đơn vị cha/gốc) --</option>
                {filteredParents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.unitName}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Nếu để trống, phòng ban này sẽ là đơn vị gốc (cha) và chưa có đơn vị con.
              </p>
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
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
