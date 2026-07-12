import LoadingItem from '@/components/ui/LoadingItem'
import { dispatchWithToast } from '@/components/ui/dispatchWithToast'
import { useAppDispatch } from '@/hook/useAppDispatch'
import DepartmentModel from '@/pages/Organizations/Departments/Action/DepartmentModel'
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  selectDepartments,
  selectLoadingDepartments,
  updateDepartment
} from '@/redux/slice/departmentsSlice'
import { selectCompanies, getCompanies } from '@/redux/slice/companiesSilce'
import { formatDateTime, CUSTOM_MESSAGES } from '@/utils/contants'
import { headerTableDepartments } from '@/utils/headerTable'
import { Folder, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const departmentColumns = Object.entries(headerTableDepartments)

function Departments() {
  const [openModal, setOpenModal] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [action, setAction] = useState('create')
  const [selectedCompany, setSelectedCompany] = useState('')

  const dispatchAsync = useAppDispatch()
  const dispatch = useDispatch()
  const departments = useSelector(selectDepartments)
  const loading = useSelector(selectLoadingDepartments)
  const companies = useSelector(selectCompanies)

  useEffect(() => {
    dispatchAsync(getDepartments())
    dispatchAsync(getCompanies())
  }, [])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = departments
    if (selectedCompany && selectedCompany !== 'ALL') {
      list = list.filter((dept) => dept.company?.id === selectedCompany)
    }
    if (!q) return list
    return list.filter((dept) => {
      const parentName = dept.parentUnit?.unitName || ''
      const companyName = dept.company?.companyName || ''
      const branchName = dept.branch?.branchName || ''
      const hay = [
        dept.orgUnitCode,
        dept.unitName,
        dept.unitType,
        parentName,
        companyName,
        branchName,
        dept.status
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [departments, query, selectedCompany])

  const totalDepartments = departments.length
  const activeDepartments = departments.filter((d) => d.status === 'ENABLE').length

  const handleAction = (action, item = null) => {
    switch (action) {
    case 'edit':
      setAction('edit')
      setSelectedItem(item)
      setOpenModal(true)
      break
    case 'create':
      setAction('create')
      setSelectedItem(null)
      setOpenModal(true)
      break
    case 'delete':
      setAction('delete')
      setSelectedItem(item)
      setOpenModal(true)
      break
    default:
      break
    }
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedItem(null)
    setAction('create')
  }

  const handleSubmit = async (payload) => {
    if (action === 'delete') {
      await dispatchWithToast({
        dispatch,
        action: deleteDepartment,
        payload,
        messages: CUSTOM_MESSAGES.delete
      })
      handleCloseModal()
      dispatchAsync(getDepartments())
      return
    }

    if (action === 'edit') {
      await dispatchWithToast({
        dispatch,
        action: updateDepartment,
        payload,
        messages: CUSTOM_MESSAGES.update
      })
      handleCloseModal()
      dispatchAsync(getDepartments())
      return
    }

    await dispatchWithToast({
      dispatch,
      action: createDepartment,
      payload,
      messages: CUSTOM_MESSAGES.create
    })
    handleCloseModal()
    dispatchAsync(getDepartments())
  }

  const renderTableBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={departmentColumns.length + 1}>
              <LoadingItem />
            </td>
          </tr>
        </tbody>
      )
    }

    if (!filteredRows.length) {
      return (
        <tbody>
          <tr>
            <td colSpan={departmentColumns.length + 1}>
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
                <Folder className="h-10 w-10 text-gray-300" />
                <p className="text-sm font-medium">Không có dữ liệu phòng ban</p>
              </div>
            </td>
          </tr>
        </tbody>
      )
    }

    return (
      <tbody className="divide-y divide-gray-200 bg-white">
        {filteredRows.map((item, rowIndex) => (
          <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
            {departmentColumns.map(([key]) => {
              const cellClass = 'px-4 py-3 text-gray-700 whitespace-nowrap'

              if (key === 'orgUnitId') {
                return (
                  <td
                    key={key}
                    className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap"
                  >
                    {rowIndex + 1}
                  </td>
                )
              }

              if (key === 'orgUnitCode') {
                return (
                  <td
                    key={key}
                    className="px-4 py-3 font-medium text-indigo-600 whitespace-nowrap"
                  >
                    {item.orgUnitCode || '-'}
                  </td>
                )
              }

              if (key === 'unitName') {
                return (
                  <td key={key} className={cellClass}>
                    {item.unitName || '-'}
                  </td>
                )
              }

              if (key === 'unitType') {
                return (
                  <td key={key} className={cellClass}>
                    {item.unitType || '-'}
                  </td>
                )
              }

              if (key === 'parentUnit') {
                // Nghiệp vụ: nếu parentUnit là null thì chính nó là đơn vị gốc (cha)
                return (
                  <td key={key} className={cellClass}>
                    {item.parentUnit?.unitName ? (
                      <span className="text-gray-900 font-medium">{item.parentUnit.unitName}</span>
                    ) : (
                      <span className="text-gray-400 italic">Đơn vị gốc</span>
                    )}
                  </td>
                )
              }

              if (key === 'branchName') {
                return (
                  <td key={key} className={cellClass}>
                    {item.branch?.branchName || '-'}
                  </td>
                )
              }

              if (key === 'companyName') {
                return (
                  <td key={key} className={cellClass}>
                    {item.company?.companyName || '-'}
                  </td>
                )
              }

              if (key === 'status') {
                return (
                  <td key={key} className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        item.status === 'ENABLE'
                          ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                          : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                      }`}
                    >
                      {item.status === 'ENABLE'
                        ? 'Hoạt động'
                        : 'Ngưng hoạt động'}
                    </span>
                  </td>
                )
              }

              if (key === 'createdAt' || key === 'updatedAt') {
                return (
                  <td key={key} className={cellClass}>
                    {item[key] ? formatDateTime(item[key]) : '-'}
                  </td>
                )
              }

              return (
                <td key={key} className={cellClass}>
                  {item[key] || '-'}
                </td>
              )
            })}
            <td className="px-4 py-3 text-right whitespace-nowrap">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => handleAction('edit', item)}
                  className="rounded-md p-2 text-indigo-600 transition hover:bg-indigo-50 cursor-pointer"
                  title="Chỉnh sửa phòng ban"
                  aria-label={`Chỉnh sửa ${item.unitName}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('delete', item)}
                  className="rounded-md p-2 text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                  title="Xóa phòng ban"
                  aria-label={`Xóa ${item.unitName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Quản lý phòng ban (Departments)
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Hiển thị danh sách các phòng ban và bộ phận tổ chức trong hệ thống.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleAction('create')}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm phòng ban
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <p className="text-sm font-medium text-slate-500">Tổng phòng ban</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {totalDepartments}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm hover:shadow-md transition">
          <p className="text-sm font-medium text-emerald-700">Đang hoạt động</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-900">
            {activeDepartments}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:col-span-2 xl:col-span-1 hover:shadow-md transition">
          <p className="text-sm font-medium text-amber-700">Kết quả lọc</p>
          <p className="mt-3 text-3xl font-semibold text-amber-900">
            {filteredRows.length}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-medium text-gray-900">
              Danh sách phòng ban
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500"
            >
              <option value="ALL">Tất cả công ty</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo mã, tên, công ty..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-72 border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {departmentColumns.map(([key, label]) => (
                  <th
                    key={key}
                    className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap"
                  >
                    {label === 'orgUnitId' ? 'STT' : label}
                  </th>
                ))}
                <th className="px-4 py-2 text-right font-semibold text-gray-700 whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            {renderTableBody()}
          </table>
        </div>
      </div>

      <DepartmentModel
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        mode={action}
        initialValues={selectedItem}
      />
    </div>
  )
}

export default Departments