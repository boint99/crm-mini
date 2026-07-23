import LoadingItem from '@/components/ui/LoadingItem'
import { StatCard, StatusBadge, SearchBar, ActionButton, EmptyState, TableHeader, TableHeaderRight, Pagination } from '@/components/ui/PageLayout'
import { dispatchWithToast } from '@/components/ui/dispatchWithToast'
import { useAppDispatch } from '@/hook/useAppDispatch'
import ViettelModel from './Action/ViettelModel'
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  selectEmployeesViettel,
  selectLoadingViettel,
  updateEmployee
} from '@/redux/slice/employeesViettelSlice'
import { formatDateTime, CUSTOM_MESSAGES } from '@/utils/contants'
import { Pencil, Plus, Trash2, Users, UserCheck, UserX } from 'lucide-react'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

/* ─── Helpers ─── */
function stringToColor(str) {
  if (!str) return 'hsl(220, 60%, 55%)'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 55%, 50%)`
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function Viettel() {
  const [openAdd, setOpenAdd] = useState(false)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('create')
  const [selectedItem, setSelectedItem] = useState(null)
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

  const PAGE_SIZE = 10

  const dispatchAsync = useAppDispatch()
  const dispatch = useDispatch()
  const items = useSelector(selectEmployeesViettel)
  const loading = useSelector(selectLoadingViettel)

  useEffect(() => {
    dispatchAsync(getEmployees())
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

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = items
    if (selectedStatus) {
      list = list.filter((item) => item.status === selectedStatus)
    }
    if (!q) return list
    return list.filter((item) => {
      const fullName = item.employee ? `${item.employee.firstName || ''} ${item.employee.lastName || ''}`.trim() : ''
      const hay = [
        item.viettelCode,
        item.viettelEmail,
        item.status,
        item.employee?.employeeCode,
        fullName,
        item.viettelPosition,
        item.viettelBranch?.viettelBranchName
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [items, query, selectedStatus])

  const totalItems = items.length
  const activeItems = items.filter((item) => item.status === 'ENABLE').length
  const inactiveItems = totalItems - activeItems

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedItems = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const openCreateModal = () => {
    setMode('create')
    setSelectedItem(null)
    setOpenAdd(true)
  }

  const openEditModal = (item) => {
    setMode('edit')
    setSelectedItem(item)
    setOpenAdd(true)
  }

  const openDeleteModal = (item) => {
    setMode('delete')
    setSelectedItem(item)
    setOpenAdd(true)
  }

  const handleCloseModal = () => {
    setOpenAdd(false)
    setSelectedItem(null)
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
      handleCloseModal()
      dispatchAsync(getEmployees())
      return
    }

    if (mode === 'edit') {
      await dispatchWithToast({
        dispatch,
        action: updateEmployee,
        payload,
        messages: CUSTOM_MESSAGES.update
      })
      handleCloseModal()
      dispatchAsync(getEmployees())
      return
    }

    await dispatchWithToast({
      dispatch,
      action: createEmployee,
      payload,
      messages: CUSTOM_MESSAGES.create
    })
    handleCloseModal()
    dispatchAsync(getEmployees())
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Title Section */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Nhân viên Viettel
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý danh sách và thông tin tài khoản nhân viên Viettel trong hệ thống.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Thêm nhân viên
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <StatCard label="Tổng nhân viên Viettel" value={totalItems} icon={Users} accentColor="indigo" />
        <StatCard label="Đang hoạt động" value={activeItems} icon={UserCheck} accentColor="emerald" />
        <StatCard label="Ngưng hoạt động" value={inactiveItems} icon={UserX} accentColor="rose" />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSelectedStatus(''); setPage(1) }}
            className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              selectedStatus === '' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => { setSelectedStatus('ENABLE'); setPage(1) }}
            className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              selectedStatus === 'ENABLE' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Hoạt động
          </button>
          <button
            onClick={() => { setSelectedStatus('DISABLE'); setPage(1) }}
            className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              selectedStatus === 'DISABLE' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Ngưng hoạt động
          </button>
        </div>
        <p className="text-sm text-slate-500">
          Hiển thị <span className="font-semibold text-slate-700">{filteredRows.length}</span> nhân viên
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        <SearchBar value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Tìm theo mã, tên, email..." />
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <TableHeader>STT</TableHeader>
                <TableHeader>Mã Viettel</TableHeader>
                <TableHeader>Nhân viên Viettel</TableHeader>
                <TableHeader>Chức danh Viettel</TableHeader>
                <TableHeader>Đơn vị Viettel</TableHeader>
                <TableHeader>Mã NV ACT</TableHeader>
                <TableHeader>Ngày tạo</TableHeader>
                <TableHeader>Trạng thái</TableHeader>
                <TableHeaderRight>Thao tác</TableHeaderRight>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={9}>
                    <LoadingItem />
                  </td>
                </tr>
              </tbody>
            ) : !pagedItems.length ? (
              <EmptyState icon={Users} message="Không có dữ liệu nhân viên Viettel" />
            ) : (
              <tbody className="divide-y divide-slate-50">
                {pagedItems.map((item, index) => {
                  const stt = (currentPage - 1) * PAGE_SIZE + index + 1
                  const employeeName = item.employee
                    ? `${item.employee.firstName || ''} ${item.employee.lastName || ''}`.trim()
                    : 'Chưa liên kết'
                  const avatarColor = stringToColor(employeeName)
                  const initials = getInitials(employeeName)

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* STT */}
                      <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">
                        {String(stt).padStart(2, '0')}
                      </td>
                      {/* Mã Viettel */}
                      <td className="px-5 py-4 font-semibold text-slate-800 whitespace-nowrap">
                        {item.viettelCode || '-'}
                      </td>
                      {/* Nhân viên Viettel (Avatar + Name + Email) */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: avatarColor }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{employeeName}</p>
                            <p className="text-xs text-slate-400 truncate">{item.viettelEmail || '-'}</p>
                          </div>
                        </div>
                      </td>
                      {/* Chức danh Viettel */}
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {item.viettelPosition || '-'}
                      </td>
                      {/* Đơn vị Viettel */}
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {item.viettelBranch?.viettelBranchName || '-'}
                      </td>
                      {/* Mã NV ACT */}
                      <td className="px-5 py-4 font-medium text-indigo-600 whitespace-nowrap">
                        {item.employee?.employeeCode || '-'}
                      </td>
                      {/* Ngày tạo */}
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                        {item.createdAt ? formatDateTime(item.createdAt).split(' ')[0] : '-'}
                      </td>
                      {/* Trạng thái */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                      {/* Thao tác */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <ActionButton icon={Pencil} onClick={() => openEditModal(item)} title="Chỉnh sửa" />
                          <ActionButton icon={Trash2} onClick={() => openDeleteModal(item)} variant="delete" title="Xóa" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredRows.length > 0 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      <ViettelModel
        open={openAdd}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        mode={mode}
        initialValues={selectedItem}
      />
    </div>
  )
}

export default Viettel
