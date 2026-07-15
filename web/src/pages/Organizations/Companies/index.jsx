import LoadingItem from '@/components/ui/LoadingItem'
import { StatCard, StatusBadge, SearchBar, ActionButton, EmptyState, TableHeader, TableHeaderRight, Pagination } from '@/components/ui/PageLayout'
import { dispatchWithToast } from '@/components/ui/dispatchWithToast'
import { useAppDispatch } from '@/hook/useAppDispatch'
import CompanyModel from '@/pages/Organizations/Companies/Action/CompanyModel'
import UploadCompanyModel from '@/pages/Organizations/Companies/Action/UploadCompanyModel'
import {
  createCompany,
  deleteCompany,
  getCompanies,
  selectCompanies,
  selectLoading,
  updateCompany
} from '@/redux/slice/companiesSilce'
import { formatDateTime, CUSTOM_MESSAGES } from '@/utils/contants'
import { Building2, Pencil, Plus, Trash2, Upload, UserCheck, UserX } from 'lucide-react'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

function Companies() {
  const [openModal, setOpenModal] = useState(false)
  const [openUploadModal, setOpenUploadModal] = useState(false)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('create')
  const [selectedCompany, setSelectedCompany] = useState(null)
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
  const companiesItems = useSelector(selectCompanies)
  const loading = useSelector(selectLoading)

  useEffect(() => {
    dispatchAsync(getCompanies())
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
    let list = companiesItems
    if (selectedStatus) {
      list = list.filter((c) => c.status === selectedStatus)
    }
    if (!q) return list
    return list.filter((company) => {
      const hay = [
        company.companyId?.toString(),
        company.companyName,
        company.status
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [companiesItems, query, selectedStatus])

  const totalCompanies = companiesItems.length
  const activeCompanies = companiesItems.filter(
    (company) => company.status === 'ENABLE'
  ).length
  const inactiveCompanies = totalCompanies - activeCompanies

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedItems = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const openCreateModal = () => {
    setMode('create')
    setSelectedCompany(null)
    setOpenModal(true)
  }

  const openEditModal = (company) => {
    setMode('edit')
    setSelectedCompany(company)
    setOpenModal(true)
  }

  const openDeleteModal = (company) => {
    setMode('delete')
    setSelectedCompany(company)
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedCompany(null)
    setMode('create')
  }

  const handleSubmit = async (payload) => {
    if (mode === 'delete') {
      await dispatchWithToast({
        dispatch,
        action: deleteCompany,
        payload,
        messages: CUSTOM_MESSAGES.delete
      })
      handleCloseModal()
      return
    }

    if (mode === 'edit') {
      await dispatchWithToast({
        dispatch,
        action: updateCompany,
        payload,
        messages: CUSTOM_MESSAGES.update
      })
      handleCloseModal()
      return
    }

    await dispatchWithToast({
      dispatch,
      action: createCompany,
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách công ty</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý và cập nhật danh sách các công ty trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpenUploadModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer"
          >
            <Upload className="h-4 w-4 text-slate-500" />
            Nhập Excel
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Thêm công ty
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <StatCard label="Tổng công ty" value={totalCompanies} icon={Building2} accentColor="indigo" />
        <StatCard label="Đang hoạt động" value={activeCompanies} icon={UserCheck} accentColor="emerald" />
        <StatCard label="Ngưng hoạt động" value={inactiveCompanies} icon={UserX} accentColor="rose" />
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
          Hiển thị <span className="font-semibold text-slate-700">{filteredRows.length}</span> công ty
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        <SearchBar value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Tìm theo tên công ty..." />
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <TableHeader>STT</TableHeader>
                <TableHeader>Tên công ty</TableHeader>
                <TableHeader>Ngày tạo</TableHeader>
                <TableHeader>Trạng thái</TableHeader>
                <TableHeaderRight>Thao tác</TableHeaderRight>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={5}>
                    <LoadingItem />
                  </td>
                </tr>
              </tbody>
            ) : !pagedItems.length ? (
              <EmptyState icon={Building2} message="Không có dữ liệu công ty" />
            ) : (
              <tbody className="divide-y divide-slate-50">
                {pagedItems.map((company, index) => {
                  const stt = (currentPage - 1) * PAGE_SIZE + index + 1
                  return (
                    <tr key={company.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">
                        {String(stt).padStart(2, '0')}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        {company.companyName || '-'}
                      </td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                        {company.createdAt ? formatDateTime(company.createdAt).split(' ')[0] : '-'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={company.status} />
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <ActionButton icon={Pencil} onClick={() => openEditModal(company)} title="Chỉnh sửa" />
                          <ActionButton icon={Trash2} onClick={() => openDeleteModal(company)} variant="delete" title="Xóa" />
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

      <CompanyModel
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        mode={mode}
        initialValues={selectedCompany}
      />
      <UploadCompanyModel
        open={openUploadModal}
        onClose={() => {
          setOpenUploadModal(false)
          dispatchAsync(getCompanies())
        }}
        onSubmit={async (payload) => {
          await dispatch(createCompany(payload)).unwrap()
        }}
      />
    </div>
  )
}

export default Companies
