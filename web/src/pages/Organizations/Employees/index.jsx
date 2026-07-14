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
import { getDepartments, selectDepartments } from '@/redux/slice/departmentsSlice'
import { formatDateTime } from '@/utils/contants'
import { CUSTOM_MESSAGES } from '@/utils/contants'
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  ChevronDown,
  Upload,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  MoreHorizontal
} from 'lucide-react'
import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

/* ─── Helpers ─── */

/** Generate a consistent HSL color from a string */
function stringToColor(str) {
  if (!str) return 'hsl(220, 60%, 55%)'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 55%, 50%)`
}

/** Get initials (max 2 chars) from name */
function getInitials(firstName, lastName) {
  const f = (firstName || '').charAt(0).toUpperCase()
  const l = (lastName || '').charAt(0).toUpperCase()
  return (f + l) || '?'
}

/* ─── Filter Dropdown ─── */
function FilterDropdown({ label, options, value, onChange }) {
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

  const selectedLabel = options.find((o) => o.value === value)?.label || label

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer"
      >
        <span className="truncate max-w-[180px]">{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 min-w-[220px] max-h-60 overflow-y-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5">
          <button
            type="button"
            onClick={() => { onChange(''); setIsOpen(false) }}
            className={`w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition cursor-pointer ${value === '' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-700'}`}
          >
            {label}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setIsOpen(false) }}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition cursor-pointer ${opt.value === value ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-700'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main Component ─── */
function Employees() {
  const [openAdd, setOpenAdd] = useState(false)
  const [openImportModal, setOpenImportModal] = useState(false)
  const [query, setQuery] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [mode, setMode] = useState('create')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1

  const setPage = useCallback((newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
  }, [setSearchParams])

  const PAGE_SIZE = 30

  const dispatchAsync = useAppDispatch()
  const dispatch = useDispatch()
  const employees = useSelector(selectEmployees)
  const totalEmployees = useSelector(selectEmployeesTotal)
  const loading = useSelector(selectLoading)
  const companies = useSelector(selectCompanies)
  const departments = useSelector(selectDepartments)
  const debounceRef = useRef(null)

  useEffect(() => {
    dispatchAsync(getCompanies())
    dispatchAsync(getDepartments())
  }, [dispatchAsync])

  useEffect(() => {
    if (!searchParams.get('page')) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('page', '1')
        return next
      }, { replace: true })
    }
  }, [searchParams, setSearchParams])

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

  // Fetch employees
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

  // Debounce search
  const handleSearchChange = (e) => {
    const value = e.target.value
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchKeyword(value)
      setPage(1)
    }, 400)
  }

  // Filter by status (client-side)
  const filteredRows = useMemo(() => {
    if (!selectedStatus) return employees
    return employees.filter((emp) => emp.status === selectedStatus)
  }, [employees, selectedStatus])

  const activeEmployees = employees.filter(
    (employee) => employee.status === 'ENABLE'
  ).length

  const inactiveEmployees = totalEmployees - activeEmployees

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

  /* ─── Pagination helpers ─── */
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 3
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  /* ─── Render ─── */
  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Title Section ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Danh sách đội ngũ
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Hệ thống quản lý dữ liệu nhân sự tập trung của doanh nghiệp.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpenImportModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer"
          >
            <Upload className="h-4 w-4 text-slate-500" />
            Nhập Excel/CSV
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        {/* Total */}
        <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng nhân viên</p>
              <div className="flex items-baseline gap-3 mt-2">
                <p className="text-3xl font-bold text-slate-900">{totalEmployees}</p>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  +12%
                </span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đang hoạt động</p>
              <div className="flex items-baseline gap-3 mt-2">
                <p className="text-3xl font-bold text-slate-900">{activeEmployees}</p>
                <span className="text-xs text-slate-400 font-medium">Thành viên trực tuyến</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <UserCheck className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Inactive */}
        <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden sm:col-span-2 xl:col-span-1">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-400 rounded-l-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nghỉ việc/Tạm dừng</p>
              <div className="flex items-baseline gap-3 mt-2">
                <p className="text-3xl font-bold text-slate-900">{inactiveEmployees}</p>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-500">
                  <TrendingDown className="h-3 w-3" />
                  -5%
                </span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
              <UserX className="h-6 w-6 text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FilterDropdown
            label="Tất cả phòng ban"
            options={departments.map((d) => ({ value: d.orgUnitId || d.id, label: d.unitName }))}
            value=""
            onChange={() => {}}
          />
          <FilterDropdown
            label="Trạng thái: Tất cả"
            options={[
              { value: 'ENABLE', label: 'Đang hoạt động' },
              { value: 'DISABLE', label: 'Nghỉ việc/Tạm dừng' }
            ]}
            value={selectedStatus}
            onChange={(val) => { setSelectedStatus(val); setPage(1) }}
          />
        </div>
        <p className="text-sm text-slate-500">
          Hiển thị <span className="font-semibold text-slate-700">{filteredRows.length}</span> trong tổng số{' '}
          <span className="font-semibold text-slate-700">{totalEmployees}</span> nhân viên
        </p>
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Search bar inside table header */}
        <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 w-80">
            <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo mã, tên, email..."
              value={query}
              onChange={handleSearchChange}
              className="bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-400 outline-none w-full"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="sticky top-0 bg-slate-50/80 backdrop-blur-sm px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap z-10">STT</th>
                <th className="sticky top-0 bg-slate-50/80 backdrop-blur-sm px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap z-10">Mã NV</th>
                <th className="sticky top-0 bg-slate-50/80 backdrop-blur-sm px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap z-10">Nhân viên</th>
                <th className="sticky top-0 bg-slate-50/80 backdrop-blur-sm px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap z-10">Chức vụ</th>
                <th className="sticky top-0 bg-slate-50/80 backdrop-blur-sm px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap z-10">Đơn vị</th>
                <th className="sticky top-0 bg-slate-50/80 backdrop-blur-sm px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap z-10">Ngày tạo</th>
                <th className="sticky top-0 bg-slate-50/80 backdrop-blur-sm px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap z-10">Trạng thái</th>
                <th className="sticky top-0 bg-slate-50/80 backdrop-blur-sm px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap z-10">Thao tác</th>
              </tr>
            </thead>

            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={8}>
                    <LoadingItem />
                  </td>
                </tr>
              </tbody>
            ) : !filteredRows.length ? (
              <tbody>
                <tr>
                  <td colSpan={8}>
                    <div className="flex h-48 flex-col items-center justify-center gap-3 text-slate-400">
                      <Users className="h-12 w-12 text-slate-300" />
                      <p className="text-sm font-medium">
                        {query ? 'Không tìm thấy nhân viên phù hợp' : 'Không có dữ liệu nhân viên'}
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-50">
                {filteredRows.map((employee, index) => {
                  const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'N/A'
                  const initials = getInitials(employee.firstName, employee.lastName)
                  const avatarColor = stringToColor(fullName)
                  const stt = (currentPage - 1) * PAGE_SIZE + index + 1

                  return (
                    <tr key={employee.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* STT */}
                      <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">
                        {String(stt).padStart(2, '0')}
                      </td>

                      {/* Mã NV */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{employee.employeeCode || '-'}</span>
                      </td>

                      {/* Nhân viên (Avatar + Tên + Email) */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: avatarColor }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{fullName}</p>
                            <p className="text-xs text-slate-400 truncate">{employee.email || '-'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Chức vụ */}
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {employee.position?.positionName || '-'}
                      </td>

                      {/* Đơn vị */}
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {employee.unit?.unitName || employee.orgUnit?.unitName || '-'}
                      </td>

                      {/* Ngày tạo */}
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                        {employee.createdAt ? formatDateTime(employee.createdAt).split(' ')[0] : '-'}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {employee.status === 'ENABLE' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 ring-1 ring-rose-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Nghỉ việc
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(employee)}
                            className="rounded-lg p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                            title="Chỉnh sửa"
                            aria-label={`Chỉnh sửa ${employee.employeeCode}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(employee)}
                            className="rounded-lg p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Xóa"
                            aria-label={`Xóa ${employee.employeeCode}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && filteredRows.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Trang <span className="font-semibold text-slate-700">{currentPage}</span> / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg text-sm font-semibold transition cursor-pointer ${
                    p === currentPage
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label="Trang sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
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
