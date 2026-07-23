import { customStyles } from '@/utils/contants'
import { X } from 'lucide-react'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Modal from 'react-modal'
import { positionsAPI } from '@/api/positionsAPI'
import { departmentsAPI } from '@/api/departmentsAPI'
import { companiesAPI } from '@/api/companiesAPI'
import { toast } from 'react-toastify'

const modalStyles = {
  ...customStyles,
  content: {
    ...customStyles.content,
    maxWidth: '672px',
    overflow: 'visible'
  }
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  inputClass,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return options
    return options.filter((opt) =>
      opt.label?.toLowerCase().includes(query)
    )
  }, [options, search])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen)
            setSearch('')
          }
        }}
        className={`${inputClass} flex items-center justify-between bg-white text-left`}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption ? (selectedOption.cleanLabel || selectedOption.label) : placeholder}
        </span>
        <svg
          className="ml-2 h-4 w-4 text-gray-400 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
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
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`px-3 py-2 hover:bg-slate-100 cursor-pointer ${
                    opt.value === value ? 'bg-blue-50 text-blue-600 font-medium' : ''
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
  )
}

export default function EmployeeModel({
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
    setValue,
    control,
    formState: { errors, isSubmitting }
  } = useForm()

  const isEdit = mode === 'edit'

  const companyId = useWatch({ control, name: 'companyId' })
  const unitId = useWatch({ control, name: 'unitId' })
  const positionId = useWatch({ control, name: 'positionId' })
  const watchIsAccount = useWatch({ control, name: 'isAccount' })

  const [companies, setCompanies] = useState([])
  const [units, setUnits] = useState([])
  const [positions, setPositions] = useState([])

  const unitOptions = useMemo(() => {
    const list = Array.isArray(units) ? units : (units?.list || [])
    if (!list || list.length === 0) return []

    // Loại bỏ trùng lặp nếu API trả về các phần tử trùng lặp và lọc theo companyId
    const uniqueUnitsMap = {}
    list.forEach((u) => {
      if (u && u.id) {
        if (!companyId || u.company?.id === companyId) {
          uniqueUnitsMap[u.id] = u
        }
      }
    })
    const uniqueUnits = Object.values(uniqueUnitsMap)

    const map = {}
    uniqueUnits.forEach((unit) => {
      map[unit.id] = { ...unit, children: [] }
    })

    const roots = []
    uniqueUnits.forEach((unit) => {
      const mapped = map[unit.id]
      const parentId = unit.parentUnit?.id
      if (parentId && map[parentId]) {
        map[parentId].children.push(mapped)
      } else {
        roots.push(mapped)
      }
    })

    const options = []
    const traverse = (node, depth = 0) => {
      const indent = '\u00A0\u00A0'.repeat(depth)
      const prefix = depth > 0 ? `${indent}↳ ` : ''

      let extra = ''
      if (node.company?.companyName && depth === 0) {
        extra = ` (${node.company.companyName})`
      } else if (node.branch?.branchName && depth === 0) {
        extra = ` (${node.branch.branchName})`
      }

      options.push({
        value: node.id,
        label: `${prefix}${node.unitName}`,
        cleanLabel: `${node.unitName}`
      })

      if (node.children) {
        node.children.forEach((child) => traverse(child, depth + 1))
      }
    }

    roots.forEach((root) => traverse(root, 0))
    return options
  }, [units, companyId])

  const filteredPositions = useMemo(() => {
    const list = Array.isArray(positions) ? positions : (positions?.list || [])
    return list.filter((pos) => !companyId || !pos.company?.id || pos.company?.id === companyId)
  }, [positions, companyId])

  useEffect(() => {
    if (isOpen) {
      companiesAPI
        .getLists()
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : (res.data?.list || res.data || [])
          setCompanies(Array.isArray(list) ? list : [])
        })
        .catch(() => {
          toast.error('Không thể tải danh sách công ty!')
        })
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      if (companyId) {
        departmentsAPI
          .getLists({ companyid: companyId })
          .then((res) => {
            const list = Array.isArray(res.data) ? res.data : (res.data?.list || res.data || [])
            setUnits(Array.isArray(list) ? list : [])
          })
          .catch(() => {
            toast.error('Không thể tải danh sách đơn vị!')
          })

        positionsAPI
          .getLists({ companyId: companyId })
          .then((res) => {
            const list = Array.isArray(res.data) ? res.data : (res.data?.list || res.data || [])
            setPositions(Array.isArray(list) ? list : [])
          })
          .catch(() => {
            toast.error('Không thể tải danh sách chức vụ!')
          })
      } else {
        Promise.resolve().then(() => {
          setUnits([])
          setPositions([])
        })
      }
    }
  }, [isOpen, companyId])

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && data) {
        const targetCompanyId =
          data.orgUnit?.company?.id ||
          data.position?.company?.id ||
          data.company?.id ||
          companies.find(
            (c) =>
              c.id === data.companyId ||
              c.companyId === data.companyId ||
              String(c.companyId) === String(data.companyId)
          )?.id ||
          ''

        reset({
          employeeCode: data.employeeCode || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          email: data.email || '',
          birthDate: data.birthDate ? String(data.birthDate).slice(0, 10) : '',
          companyId: targetCompanyId,
          unitId: data.orgUnit?.id || data.unitId || '',
          viettelCode: data.viettelCode || '',
          positionId: data.position?.id || data.positionId || '',
          status: data.status || 'ENABLE',
          description: data.description || '',
          isAccount: data.isAccount || false
        })
      } else if (mode === 'create') {
        reset({
          employeeCode: '',
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          birthDate: '',
          companyId: '',
          unitId: '',
          viettelCode: '',
          positionId: '',
          status: 'ENABLE',
          description: '',
          isAccount: false
        })
      }
    }
  }, [isOpen, mode, data, companies, reset])

  const handleFormSubmit = (formData) => {
    if (mode === 'delete') {
      onSubmit?.(data?.id || data?.employeeId)
      return
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
      isAccount: formData.isAccount || false
    }

    if (formData.viettelCode?.trim()) {
      payload.viettelCode = formData.viettelCode.trim()
    }

    if (isEdit && data) {
      if (data.id) payload.id = data.id
      if (data.employeeId) payload.employeeId = Number(data.employeeId)
    } else {
      payload.employeeCode = formData.employeeCode.trim()
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
            Bạn có chắc muốn xóa nhân viên{' '}
            <span className="font-semibold">
              {[data?.firstName, data?.lastName].filter(Boolean).join(' ')}
            </span>{' '}
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
    )
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

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
            {isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <input type="hidden" {...register('companyId')} />
          <input type="hidden" {...register('unitId')} />
          <input type="hidden" {...register('positionId')} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Mã nhân viên*</label>
              <input
                type="text"
                placeholder="VD: EMP123"
                disabled={isEdit}
                className={inputClass}
                {...register('employeeCode', {
                  required: 'Bắt buộc',
                  validate: (v) =>
                    v.trim().length >= 6 || 'Mã nhân viên phải tối thiểu 6 ký tự'
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
                {...register('firstName', { required: 'Bắt buộc' })}
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
                {...register('lastName', { required: 'Bắt buộc' })}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Ngày sinh (Birth Date)</label>
              <input type="date" className={inputClass} {...register('birthDate')} />
            </div>

            <div>
              <label className={labelClass}>Số điện thoại</label>
              <input
                type="text"
                placeholder="VD: 0901234567"
                className={inputClass}
                {...register('phone')}
              />
            </div>

            <div>
              <label className={labelClass}>Email{watchIsAccount ? ' *' : ''}</label>
              <input
                type="text"
                placeholder="VD: a.nguyen@company.com"
                className={inputClass}
                {...register('email', {
                  required: watchIsAccount ? 'Bắt buộc nhập Email khi chọn tạo tài khoản' : false,
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Email không hợp lệ'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                id="isAccount"
                type="checkbox"
                disabled={isEdit && data?.isAccount}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                {...register('isAccount')}
              />
              <label htmlFor="isAccount" className="text-sm font-medium text-gray-700 cursor-pointer">
                Tạo tài khoản hệ thống (Lấy từ Email)
              </label>
            </div>

            <div>
              <label className={labelClass}>Công ty *</label>
              <select
                className={inputClass}
                value={companyId}
                onChange={(e) => {
                  setValue('companyId', e.target.value)
                  setValue('unitId', '') // Reset unit when company changes
                  setValue('positionId', '') // Reset position when company changes
                }}
              >
                <option value="">-- Chọn công ty --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Đơn vị/phòng ban</label>
              <SearchableSelect
                options={unitOptions}
                value={unitId}
                onChange={(val) => setValue('unitId', val)}
                placeholder={companyId ? 'Chọn đơn vị' : 'Vui lòng chọn công ty trước'}
                disabled={!companyId}
                inputClass={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Chức vụ</label>
              <SearchableSelect
                options={filteredPositions.map((pos) => ({
                  value: pos.id || '',
                  label: pos.positionName || ''
                }))}
                value={positionId}
                onChange={(val) => setValue('positionId', val)}
                placeholder={companyId ? 'Chọn chức vụ' : 'Vui lòng chọn công ty trước'}
                disabled={!companyId}
                inputClass={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Mã Viettel</label>
              <input
                type="text"
                placeholder="VD: VT001"
                className={inputClass}
                {...register('viettelCode')}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Mô tả</label>
              <textarea
                placeholder="Nhập mô tả nhân viên..."
                rows={3}
                className={inputClass}
                {...register('description')}
              />
            </div>

            <div>
              <label className={labelClass}>Trạng thái (STATUS) *</label>
              <select className={inputClass} {...register('status')}>
                <option value="ENABLE">ENABLE (Hoạt động)</option>
                <option value="DISABLED">DISABLED</option>
              </select>
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
              {isEdit ? 'Cập nhật' : 'Tạo nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
