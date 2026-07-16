import LoadingItem from '@/components/ui/LoadingItem'
import { StatCard, StatusBadge, SearchBar, ActionButton, EmptyState, TableHeader, TableHeaderRight, Pagination } from '@/components/ui/PageLayout'
import { dispatchWithToast } from '@/components/ui/dispatchWithToast'
import { useAppDispatch } from '@/hook/useAppDispatch'
import BranchModel from '@/pages/Organizations/Branches/Action/BranchModel'
import {
  createBranch,
  deleteBranch,
  getBranches,
  selectBranches,
  selectLoading,
  updateBranch
} from '@/redux/slice/branchesSlice'
import { formatDateTime, CUSTOM_MESSAGES } from '@/utils/contants'
import { Building2, Pencil, Plus, Trash2, MapPin, UserCheck, UserX } from 'lucide-react'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

function Branches() {
  const [openModal, setOpenModal] = useState(false)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('create')
  const [selectedBranch, setSelectedBranch] = useState(null)
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
  const branches = useSelector(selectBranches)
  const loading = useSelector(selectLoading)

  useEffect(() => {
    dispatchAsync(getBranches())
  }, [])

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
    let list = branches
    if (selectedStatus) {
      list = list.filter((b) => b.status === selectedStatus)
    }
    if (!q) return list
    return list.filter((branch) => {
      const hay = [
        branch.branchId,
        branch.branchName,
        branch.branchCode,
        branch.location,
        branch.status
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [branches, query, selectedStatus])

  const totalBranches = branches.length
  const activeBranches = branches.filter(
    (branch) => branch.status === 'ENABLE'
  ).length
  const inactiveBranches = totalBranches - activeBranches

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedItems = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const openCreateModal = () => {
    setMode('create')
    setSelectedBranch(null)
    setOpenModal(true)
  }

  const openEditModal = (branch) => {
    setMode('edit')
    setSelectedBranch(branch)
    setOpenModal(true)
  }

  const openDeleteModal = (branch) => {
    setMode('delete')
    setSelectedBranch(branch)
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedBranch(null)
    setMode('create')
  }

  const handleSubmit = async (payload) => {
    if (mode === 'delete') {
      await dispatchWithToast({
        dispatch,
        action: deleteBranch,
        payload,
        messages: CUSTOM_MESSAGES.delete
      })
      handleCloseModal()
      return
    }

    if (mode === 'edit') {
      await dispatchWithToast({
        dispatch,
        action: updateBranch,
        payload,
        messages: CUSTOM_MESSAGES.update
      })
      handleCloseModal()
      return
    }

    await dispatchWithToast({
      dispatch,
      action: createBranch,
      payload,
      messages: CUSTOM_MESSAGES.create
    })
    handleCloseModal()
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách chi nhánh</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý và cập nhật danh sách chi nhánh trong hệ thống.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Thêm chi nhánh
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <StatCard label="Tổng chi nhánh" value={totalBranches} icon={Building2} accentColor="indigo" />
        <StatCard label="Đang hoạt động" value={activeBranches} icon={UserCheck} accentColor="emerald" />
        <StatCard label="Ngưng hoạt động" value={inactiveBranches} icon={UserX} accentColor="rose" />
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
          Hiển thị <span className="font-semibold text-slate-700">{filteredRows.length}</span> chi nhánh
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        <SearchBar value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Tìm theo tên, địa điểm, mã..." />
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <TableHeader>STT</TableHeader>
                <TableHeader>Mã chi nhánh</TableHeader>
                <TableHeader>Tên chi nhánh</TableHeader>
                <TableHeader>Địa điểm</TableHeader>
                <TableHeader>Ngày tạo</TableHeader>
                <TableHeader>Trạng thái</TableHeader>
                <TableHeaderRight>Thao tác</TableHeaderRight>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={7}>
                    <LoadingItem />
                  </td>
                </tr>
              </tbody>
            ) : !pagedItems.length ? (
              <EmptyState icon={MapPin} message="Không có dữ liệu chi nhánh" />
            ) : (
              <tbody className="divide-y divide-slate-50">
                {pagedItems.map((branch, index) => {
                  const stt = (currentPage - 1) * PAGE_SIZE + index + 1
                  return (
                    <tr key={branch.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">
                        {String(stt).padStart(2, '0')}
                      </td>
                      <td className="px-5 py-4 font-semibold text-indigo-600 whitespace-nowrap">
                        {branch.branchCode || '-'}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        {branch.branchName || '-'}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {branch.location || '-'}
                      </td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                        {branch.createdAt ? formatDateTime(branch.createdAt).split(' ')[0] : '-'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={branch.status} />
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <ActionButton icon={Pencil} onClick={() => openEditModal(branch)} title="Chỉnh sửa" />
                          <ActionButton icon={Trash2} onClick={() => openDeleteModal(branch)} variant="delete" title="Xóa" />
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

      <BranchModel
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        mode={mode}
        initialValues={selectedBranch}
      />
    </div>
  )
}

export default Branches
