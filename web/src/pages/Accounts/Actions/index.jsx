import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'react-modal'
import { X } from 'lucide-react'
import {
  createAccount,
  updateAccount,
  deleteAccount,
  resetAccountPassword
} from '@/redux/slice/accountsSlice'
import { getEmployees } from '@/redux/slice/employeesSlice'
import { useAppDispatch } from '@/hook/useAppDispatch'
import { customStyles } from '@/utils/contants'
import { dispatchWithToast } from '@/components/ui/dispatchWithToast'
import { rolesAPI } from '@/api/rolesAPI'

const defaultValues = {
  accountName: '',
  password: '',
  status: 'ENABLE',
  employeeCode: '',
  description: '',
  isLogin: 'false',
  roleId: ''
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none'
const inputReadOnlyClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 bg-gray-50 cursor-not-allowed outline-none'
const selectClass =
  'w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-no-repeat bg-[position:right_0.75rem_center] bg-[size:1.25rem_1.25rem] bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22none%22%3E%3Cpath d=%22M7 9l3 3 3-3%22 stroke=%22%234b5563%22 stroke-width=%221.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E")]'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

function ActionModal({ open, onClose, action, item }) {
  const dispatch = useDispatch()
  const dispatchAsync = useAppDispatch()

  const employeeItems = useSelector((state) => state.employees?.items || [])
  const [rolesList, setRolesList] = useState([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid }
  } = useForm({ defaultValues, mode: 'onTouched' })

  useEffect(() => {
    if (open && employeeItems.length === 0) {
      dispatchAsync(getEmployees())
    }
  }, [open])

  useEffect(() => {
    if (open) {
      rolesAPI
        .getLists()
        .then((res) => {
          if (res && res.data) {
            setRolesList(res.data)
            if (action === 'edit' && item?.roles?.[0]?.roleId) {
              setValue('roleId', String(item.roles[0].roleId))
            }
          }
        })
        .catch((err) => {
          console.error('Lỗi khi tải danh sách vai trò:', err)
        })
    }
  }, [open, action, item, setValue])



  useEffect(() => {
    if (!open) return
    if (action === 'create') {
      reset(defaultValues)
    } else {
      reset({
        accountName: item?.accountName ?? '',
        password: '',
        status: item?.status ?? 'ENABLE',
        employeeCode: item?.employee?.employeeCode ? String(item.employee.employeeCode) : '',
        description: item?.description ?? '',
        isLogin: item?.isLogin !== undefined ? String(item.isLogin) : 'false',
        roleId: item?.roles?.[0]?.roleId ? String(item.roles[0].roleId) : ''
      })
    }
  }, [open, action, item, reset])

  const handleFormSubmit = async (data) => {
    if (action === 'delete') {
      await dispatchWithToast({
        dispatch,
        action: deleteAccount,
        payload: item.id,
        messages: { success: 'Xóa tài khoản thành công!' }
      })
      onClose?.()
      return
    }

    if (action === 'create') {
      await dispatchWithToast({
        dispatch,
        action: createAccount,
        payload: {
          accountName: data.accountName.trim(),
          password: data.password.trim(),
          status: data.status,
          employeeCode: data.employeeCode ? String(data.employeeCode) : null,
          description: data.description?.trim() || null,
          isLogin: data.isLogin === 'true',
          roleId: data.roleId ? Number(data.roleId) : null
        },
        messages: { success: 'Tạo tài khoản thành công!' }
      })
    } else if (action === 'edit') {
      await dispatchWithToast({
        dispatch,
        action: updateAccount,
        payload: {
          id: item.id,
          status: data.status,
          employeeCode: data.employeeCode ? String(data.employeeCode) : null,
          description: data.description?.trim() || null,
          isLogin: data.isLogin === 'true',
          roleId: data.roleId ? Number(data.roleId) : null
        },
        messages: { success: 'Cập nhật tài khoản thành công!' }
      })
    } else if (action === 'reset-password') {
      await dispatchWithToast({
        dispatch,
        action: resetAccountPassword,
        payload: {
          id: item.id,
          password: data.password.trim()
        },
        messages: { success: 'Đặt lại mật khẩu thành công!' }
      })
    }

    onClose?.()
  }

  const isDelete = action === 'delete'
  const isResetPwd = action === 'reset-password'
  const isCreate = action === 'create'

  if (isDelete) {
    return (
      <Modal
        isOpen={open}
        onRequestClose={onClose}
        style={customStyles}
        ariaHideApp={false}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Xác nhận xóa tài khoản
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Bạn có chắc muốn xóa tài khoản{' '}
            <span className="font-semibold">&quot;{item?.accountName || item?.ACCOUNT_NAME}&quot;</span>? Thao
            tác này không thể hoàn tác.
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

  return (
    <Modal
      isOpen={open}
      onRequestClose={onClose}
      style={customStyles}
      ariaHideApp={false}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            {isResetPwd
              ? 'Đặt lại mật khẩu'
              : isCreate
                ? 'Thêm tài khoản'
                : 'Chỉnh sửa tài khoản'}
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
            {/* ACCOUNT_NAME */}
            <div>
              <label className={labelClass}>
                Tên đăng nhập {isCreate && '*'}
              </label>
              {isCreate ? (
                <>
                  <input
                    type="text"
                    placeholder="VD: admin, nhanvien01"
                    className={inputClass}
                    {...register('accountName', {
                      required: isCreate ? 'Vui lòng nhập tên đăng nhập' : false,
                      validate: (v) =>
                        !isCreate || !!v.trim() || 'Vui lòng nhập tên đăng nhập'
                    })}
                  />
                  {errors.accountName && (
                    <p className="mt-1 text-xs text-rose-500">
                      {errors.accountName.message}
                    </p>
                  )}
                </>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={item?.accountName ?? ''}
                  className={inputReadOnlyClass}
                />
              )}
            </div>

            {/* PASSWORD — chỉ hiện khi create hoặc reset-password */}
            {(isCreate || isResetPwd) && (
              <div>
                <label className={labelClass}>
                  {isResetPwd ? 'Mật khẩu mới *' : 'Mật khẩu *'}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputClass}
                  {...register('password', {
                    required: (isCreate || isResetPwd) ? 'Vui lòng nhập mật khẩu' : false,
                    minLength: (isCreate || isResetPwd) ? { value: 8, message: 'Tối thiểu 8 ký tự' } : undefined
                  })}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
            )}

            {/* EMPLOYEE_ID — hidden when reset-password */}
            {!isResetPwd && (
              <div>
                <label className={labelClass}>MaNV</label>
                <input
                  type="text"
                  placeholder="Nhập mã nhân viên"
                  className={inputClass}
                  {...register('employeeCode')}
                />
              </div>
            )}
            {/* LOGIN — hidden when reset-password */}
            {!isResetPwd && (
              <div>
                <label className={labelClass}>Đăng nhập</label>
                <select
                  className={selectClass}
                  disabled={item?.accountId === 1}
                  {...register('isLogin', { required: true })}
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
            )}
            {/* ROLE — hidden when reset-password */}
            {!isResetPwd && (
              <div>
                <label className={labelClass}>Vai trò</label>
                <select
                  className={selectClass}
                  disabled={item?.accountId === 1}
                  {...register('roleId')}
                >
                  <option value="">Chọn vai trò...</option>
                  {rolesList.map((role) => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName} ({role.roleCode})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* STATUS —hidden when reset-password, moved below description */}
          {!isResetPwd && (
            <div>
              <label className={labelClass}>Trạng thái *</label>
              <select
                className={selectClass}
                disabled={item?.accountId === 1}
                {...register('status', { required: true })}
              >
                <option value="ENABLE">ENABLE (Hoạt động)</option>
                <option value="DISABLED">DISABLED (Ngừng hoạt động)</option>
              </select>
            </div>
          )}

          {/* DESCRIPTION — ẩn khi reset-password */}
          {!isResetPwd && (
            <div>
              <label className={labelClass}>Mô tả</label>
              <textarea
                rows={3}
                placeholder="Ghi chú về tài khoản..."
                className={`${inputClass} resize-none`}
                {...register('description')}
              />
            </div>
          )}
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
              disabled={!isValid}
              className={[
                'px-4 py-2 text-sm font-medium text-white rounded-lg',
                isValid
                  ? 'bg-primary hover:opacity-95 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              ].join(' ')}
            >
              {isResetPwd ? 'Đặt lại mật khẩu' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default ActionModal
