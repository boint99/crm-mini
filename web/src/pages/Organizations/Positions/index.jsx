import LoadingItem from '@/components/ui/LoadingItem'
import { StatCard, FilterDropdown, StatusBadge, ActionButton, TableHeader, TableHeaderRight } from '@/components/ui/PageLayout'
import { dispatchWithToast } from '@/components/ui/dispatchWithToast'
import { useAppDispatch } from '@/hook/useAppDispatch'
import { useDynamicTab } from '@/hook/useDynamicTab'
import {
  createPosition,
  deletePosition,
  getPositions,
  selectPositions,
  selectPositionsTotal,
  selectLoading,
  updatePosition
} from '@/redux/slice/positionsSlice'
import { selectCompanies, getCompanies } from '@/redux/slice/companiesSilce'
import { formatDateTime, CUSTOM_MESSAGES } from '@/utils/contants'
import { Award, BriefcaseBusiness, Pencil, Plus, Trash2, UserCheck, UserX, Upload, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import PositionModel from '@/pages/Organizations/Positions/Action/PositionModel'
import ImportPositionModal from '@/pages/Organizations/Positions/Action/ImportPositionModal'

function Positions() {
  useDynamicTab('Danh sách chức vụ | CRM Mini')
  const [openModal, setOpenModal] = useState(false)
  const [query, setQuery] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [action, setAction] = useState('create')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [openImportModal, setOpenImportModal] = useState(false)
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
  const positions = useSelector(selectPositions)
  const totalPositions = useSelector(selectPositionsTotal)
  const loading = useSelector(selectLoading)
  const companies = useSelector(selectCompanies)
  const debounceRef = useRef(null)

  useEffect(() => {
    dispatchAsync(getCompanies())
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

  // Fetch positions
  const fetchPositions = useCallback(() => {
    const params = {
      page,
      limit: PAGE_SIZE
    }
    if (selectedCompany) {
      params.companyId = selectedCompany
    }
    if (selectedStatus) {
      params.status = selectedStatus
    }
    if (searchKeyword.trim()) {
      params.search = searchKeyword.trim()
    }
    dispatchAsync(getPositions(params))
  }, [selectedCompany, selectedStatus, searchKeyword, page, dispatchAsync])

  useEffect(() => {
    fetchPositions()
  }, [fetchPositions])

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

  const handleCompanyChange = (companyId) => {
    setSelectedCompany(companyId)
    setPage(1)
  }

  const handleStatusChange = (status) => {
    setSelectedStatus(status)
    setPage(1)
  }

  const activePositions = positions.filter((p) => p.status === 'ENABLE').length
  const inactivePositions = Math.max(0, totalPositions - activePositions)

  const totalPages = Math.max(1, Math.ceil(totalPositions / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const handleAction = (act, position = null) => {
    setAction(act)
    setSelectedPosition(act === 'create' ? null : position)
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedPosition(null)
    setAction('create')
  }

  const handleSubmit = async (payload) => {
    const config = { delete: deletePosition, edit: updatePosition }
    const messages = { delete: CUSTOM_MESSAGES.delete, edit: CUSTOM_MESSAGES.update }
    await dispatchWithToast({
      dispatch,
      action: config[action] || createPosition,
      payload,
      messages: messages[action] || CUSTOM_MESSAGES.create
    })
    fetchPositions()
    handleCloseModal()
  }

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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách chức vụ</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý các chức vụ và cấp bậc trong doanh nghiệp.</p>
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
            onClick={() => handleAction('create')}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <StatCard label="Tổng chức vụ" value={totalPositions} icon={BriefcaseBusiness} accentColor="indigo" />
        <StatCard label="Đang hoạt động" value={activePositions} icon={UserCheck} accentColor="emerald" subtitle="Chức vụ trang này" />
        <StatCard label="Ngưng hoạt động" value={inactivePositions} icon={UserX} accentColor="rose" />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FilterDropdown
            label="Tất cả công ty"
            options={companies.map((c) => ({ value: c.id, label: c.companyName }))}
            value={selectedCompany}
            onChange={handleCompanyChange}
          />
          <FilterDropdown
            label="Trạng thái: Tất cả"
            options={[{ value: 'ENABLE', label: 'Hoạt động' }, { value: 'DISABLE', label: 'Ngưng hoạt động' }]}
            value={selectedStatus}
            onChange={handleStatusChange}
          />
        </div>
        <p className="text-sm text-slate-500">
          Hiển thị <span className="font-semibold text-slate-700">{positions.length}</span> trong tổng số{' '}
          <span className="font-semibold text-slate-700">{totalPositions}</span> chức vụ
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên chức vụ, cấp bậc..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <TableHeader>STT</TableHeader>
                <TableHeader>Tên chức vụ</TableHeader>
                <TableHeader>Cấp bậc</TableHeader>
                <TableHeader>Công ty</TableHeader>
                <TableHeader>Ngày tạo</TableHeader>
                <TableHeader>Trạng thái</TableHeader>
                <TableHeaderRight>Thao tác</TableHeaderRight>
              </tr>
            </thead>
            {loading ? (
              <tbody><tr><td colSpan={7}><LoadingItem /></td></tr></tbody>
            ) : !positions.length ? (
              <tbody>
                <tr>
                  <td colSpan={7}>
                    <div className="flex h-48 flex-col items-center justify-center gap-3 text-slate-400">
                      <Award className="h-12 w-12 text-slate-300" />
                      <p className="text-sm font-medium">
                        {query ? 'Không tìm thấy chức vụ phù hợp' : 'Không có dữ liệu chức vụ'}
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-50">
                {positions.map((position, index) => {
                  const stt = (currentPage - 1) * PAGE_SIZE + index + 1
                  return (
                    <tr key={position.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">{String(stt).padStart(2, '0')}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">{position.positionName || '-'}</td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{position.level || '-'}</td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{position.company?.companyName || '-'}</td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{position.createdAt ? formatDateTime(position.createdAt).split(' ')[0] : '-'}</td>
                      <td className="px-5 py-4 whitespace-nowrap"><StatusBadge status={position.status} /></td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <ActionButton icon={Pencil} onClick={() => handleAction('edit', position)} title="Chỉnh sửa" />
                          <ActionButton icon={Trash2} onClick={() => handleAction('delete', position)} variant="delete" title="Xóa" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        {!loading && positions.length > 0 && (
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

      <PositionModel open={openModal} onClose={handleCloseModal} onSubmit={handleSubmit} mode={action} initialValues={selectedPosition} />
      <ImportPositionModal isOpen={openImportModal} onClose={() => setOpenImportModal(false)} onImportSuccess={() => fetchPositions()} />
    </div>
  )
}

export default Positions
