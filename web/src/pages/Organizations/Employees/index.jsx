import LoadingItem from '@/components/ui/LoadingItem'
import { dispatchWithToast } from '@/components/ui/dispatchWithToast'
import { useAppDispatch } from '@/hook/useAppDispatch'
import AddEmployeeModal from '@/pages/Organizations/Employees/Action/EmployeeModel'
import ImportEmployeeModal from '@/pages/Organizations/Employees/Action/ImportEmployeeModal'
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  selectEmployees,
  selectEmployeesTotal,
  selectLoading,
  updateEmployee
} from '@/redux/slice/employeesSlice'
import { selectCompanies, getCompanies } from '@/redux/slice/companiesSilce'
import { formatDateTime } from '@/utils/contants'
import { CUSTOM_MESSAGES } from '@/utils/contants'
import { Pencil, Plus, Search, Trash2, Users, ChevronDown, Upload, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { headerTableEmployees } from '@/utils/headerTable'

const employeeColumns = Object.entries(headerTableEmployees)

function FilterSelect({ options, value, onChange, placeholder = 'Tất cả' }) {
  const [isOpen, setIsOpen] = useState(false)
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

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-1 text-sm font-medium text-gray-700 hover:text-indigo-600 transition bg-transparent cursor-pointer outline-none focus:outline-none"
      >
        <span className="truncate max-w-[180px]">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 min-w-[220px] max-h-60 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-100">
          <button
            type="button"
            onClick={() => {
              onChange('')
              setIsOpen(false)
            }}
            className={`w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition cursor-pointer ${
              value === '' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700'
            }`}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition cursor-pointer ${
                opt.value === value ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Employees() {
  const [openAdd, setOpenAdd] = useState(false)
  const [openImportModal, setOpenImportModal] = useState(false)
  const [query, setQuery] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [mode, setMode] = useState('create')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedCompany, setSelectedCompany] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1

  const setPage = useCallback((newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
  }, [setSearchParams])

  const PAGE_SIZE = 50

  const dispatchAsync = useAppDispatch()
  const dispatch = useDispatch()
  const employees = useSelector(selectEmployees)
  const totalEmployees = useSelector(selectEmployeesTotal)
  const loading = useSelector(selectLoading)
  const companies = useSelector(selectCompanies)
  const debounceRef = useRef(null)

  useEffect(() => {
    dispatchAsync(getCompanies())
  }, [dispatchAsync])

  // Dynamic layout adjustments for MainLayout wrapper to prevent page-level scrollbars
  useEffect(() => {
    const contentArea = document.querySelector('.content-area')
    const layoutMain = document.querySelector('.layout-main')
    let innerDiv = null

    if (contentArea) {
      innerDiv = contentArea.querySelector('.flex.min-h-full.flex-col') || contentArea.firstElementChild
      contentArea.style.overflow = 'hidden'
    }
    if (innerDiv) {
      innerDiv.style.height = '100%'
      innerDiv.style.minHeight = 'auto'
    }
    if (layoutMain) {
      layoutMain.style.height = 'calc(100% - 41px)'
    }

    return () => {
      if (contentArea) {
        contentArea.style.overflow = ''
      }
      if (innerDiv) {
        innerDiv.style.height = ''
        innerDiv.style.minHeight = ''
      }
      if (layoutMain) {
        layoutMain.style.height = ''
      }
    }
  }, [])

  // Fetch employees khi đổi company hoặc search keyword thay đổi
  const fetchEmployees = useCallback(() => {
    const params = {
      page,
      limit: PAGE_SIZE
    }
    if (selectedCompany) {
      params.companyId = selectedCompany
    }
    if (searchKeyword.trim()) {
      params.search = searchKeyword.trim()
    }
    dispatchAsync(getEmployees(params))
  }, [selectedCompany, searchKeyword, page, dispatchAsync])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // Debounce search input → cập nhật searchKeyword sau 400ms và reset page
  const handleSearchChange = (e) => {
    const value = e.target.value
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchKeyword(value)
      setPage(1)
    }, 400)
  }

  // Client-side filter bổ sung (nếu cần lọc thêm ngoài server-side search)
  const filteredRows = useMemo(() => {
    return employees
  }, [employees])

  const activeEmployees = employees.filter(
    (employee) => employee.status === 'ENABLE'
  ).length

  const totalPages = Math.max(1, Math.ceil(totalEmployees / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const openCreateModal = () => {
    setMode('create')
    setSelectedEmployee(null)
    setOpenAdd(true)
  }

  const openEditModal = (employee) => {
    setMode('edit')
    setSelectedEmployee(employee)
    setOpenAdd(true)
  }

  const openDeleteModal = (employee) => {
    setMode('delete')
    setSelectedEmployee(employee)
    setOpenAdd(true)
  }

  const handleCloseModal = () => {
    setOpenAdd(false)
    setSelectedEmployee(null)
    setMode('create')
  }

  const handleSubmit = async (payload) => {
    if (mode === 'delete') {
      await dispatchWithToast({
        dispatch,
        action: deleteEmployee,
        payload,
        messages: CUSTOM_MESSAGES.delete
      })
      fetchEmployees()
      handleCloseModal()
      return
    }

    if (mode === 'edit') {
      await dispatchWithToast({
        dispatch,
        action: updateEmployee,
        payload,
        messages: CUSTOM_MESSAGES.update
      })
      fetchEmployees()
      handleCloseModal()
      return
    }

    await dispatchWithToast({
      dispatch,
      action: createEmployee,
      payload,
      messages: CUSTOM_MESSAGES.create
    })
    fetchEmployees()
    handleCloseModal()
  }

  const renderTableBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={employeeColumns.length + 1}>
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
            <td colSpan={employeeColumns.length + 1}>
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
                <Users className="h-10 w-10" />
                <p className="text-sm font-medium">
                  {query ? 'Không tìm thấy nhân viên phù hợp' : 'Không có dữ liệu nhân viên'}
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      )
    }

    return (
      <tbody className="divide-y divide-gray-200 bg-white">
        {filteredRows.map((employee) => (
          <tr key={employee.id} className="hover:bg-gray-50">
            {employeeColumns.map(([key]) => {
              const cellClass = 'px-4 py-3 text-gray-700 whitespace-nowrap'
              if (key === 'employeeId') {
                return (
                  <td
                    key={key}
                    className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {employee.employeeId || '-'}
                  </td>
                )
              }

              if (key === 'employeeCode') {
                return (
                  <td
                    key={key}
                    className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {employee.employeeCode}
                  </td>
                )
              }

              if (key === 'name') {
                return (
                  <td key={key} className={cellClass}>
                    {employee.firstName || '-'} {employee.lastName || ''}
                  </td>
                )
              }

              if (key === 'email') {
                return (
                  <td key={key} className={cellClass}>
                    {employee.email || '-'}
                  </td>
                )
              }

              if (key === 'birthday') {
                return (
                  <td key={key} className={cellClass}>
                    {employee.birthDate
                      ? formatDateTime(employee.birthDate).split(' ')[0]
                      : '-'}
                  </td>
                )
              }

              if (key === 'department') {
                const parentName = employee.unit?.parentUnit?.unitName
                const unitName = employee.unit?.unitName
                const hierarchy =
                  parentName && unitName
                    ? `${parentName} > ${unitName}`
                    : unitName
                return (
                  <td key={key} className={cellClass}>
                    {hierarchy || employee?.orgUnit?.unitName || '-'}
                  </td>
                )
              }

              if (key === 'parentUnit') {
                return (
                  <td key={key} className={cellClass}>
                    {employee.orgUnit?.parentUnit?.unitName || employee.orgUnit?.unitName || '-'}
                  </td>
                )
              }

              if (key === 'position') {
                return (
                  <td key={key} className={cellClass}>
                    {employee.position?.positionName || '-'}
                  </td>
                )
              }

              if (key === 'viettel') {
                return (
                  <td key={key} className={cellClass}>
                    {employee?.viettel?.viettelCode || '-'}
                  </td>
                )
              }

              if (key === 'status') {
                return (
                  <td key={key} className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        employee.status === 'ENABLE'
                          ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                          : 'bg-gray-50 text-gray-700 ring-1 ring-gray-500/20'
                      }`}
                    >
                      {employee.status === 'ENABLE'
                        ? 'Hoạt động'
                        : 'Ngưng hoạt động'}
                    </span>
                  </td>
                )
              }

              if (key === 'createdAt' || key === 'updatedAt') {
                return (
                  <td key={key} className={cellClass}>
                    {employee[key] ? formatDateTime(employee[key]) : '-'}
                  </td>
                )
              }

              return (
                <td key={key} className={cellClass}>
                  {employee[key] || '-'}
                </td>
              )
            })}
            <td className="px-4 py-3 text-right whitespace-nowrap">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(employee)}
                  className="rounded-md p-2 text-indigo-600 transition hover:bg-indigo-50 cursor-pointer"
                  title="Chỉnh sửa"
                  aria-label={`Chỉnh sửa ${employee.employeeCode}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteModal(employee)}
                  className="rounded-md p-2 text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                  title="Xóa"
                  aria-label={`Xóa ${employee.employeeCode}`}
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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Quản lý nhân viên
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Dữ liệu hiển thị tất cả nhân viên.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpenImportModal(true)}
            className="inline-flex items-center rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition focus-visible:outline-none cursor-pointer"
          >
            <Upload className="mr-2 h-4 w-4 text-gray-500" />
            Nhập Excel/CSV
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tổng nhân viên</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {totalEmployees}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">Đang hoạt động</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-900">
            {activeEmployees}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <p className="text-sm font-medium text-amber-700">Kết quả lọc</p>
          <p className="mt-3 text-3xl font-semibold text-amber-900">
            {filteredRows.length}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-medium text-gray-900">
              Danh sách nhân viên
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2">
            <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Công ty</span>
            <div className="flex items-center border-r border-gray-200 pr-3">
              <FilterSelect
                options={companies.map((c) => ({ value: c.id, label: c.companyName }))}
                value={selectedCompany}
                onChange={(val) => {
                  setSelectedCompany(val)
                  setPage(1)
                }}
                placeholder="Tất cả"
              />
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo mã, tên, email..."
                value={query}
                onChange={handleSearchChange}
                className="w-72 border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {employeeColumns.map(([key, label]) => (
                  <th
                    key={key}
                    className="sticky top-0 bg-gray-50 px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap z-10 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]"
                  >
                    {label}
                  </th>
                ))}
                <th className="sticky top-0 bg-gray-50 px-4 py-2 text-right font-semibold text-gray-700 whitespace-nowrap z-10 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  Thao tác
                </th>
              </tr>
            </thead>
            {renderTableBody()}
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredRows.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, totalEmployees)} /{' '}
              {totalEmployees} nhân viên
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - currentPage) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-[32px] rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      p === currentPage
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage(totalPages)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddEmployeeModal
        open={openAdd}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        mode={mode}
        initialValues={selectedEmployee}
      />

      <ImportEmployeeModal
        isOpen={openImportModal}
        onClose={() => setOpenImportModal(false)}
        onImportSuccess={() => fetchEmployees()}
      />
    </div>
  )
}

export default Employees
