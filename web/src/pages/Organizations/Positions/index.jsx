import LoadingItem from '@/components/ui/LoadingItem'
import { StatCard, FilterDropdown, StatusBadge, SearchBar, ActionButton, EmptyState, TableHeader, TableHeaderRight } from '@/components/ui/PageLayout'
import { dispatchWithToast } from '@/components/ui/dispatchWithToast'
import { useAppDispatch } from '@/hook/useAppDispatch'
import {
  createPosition,
  deletePosition,
  getPositions,
  selectPositions,
  selectLoading,
  updatePosition
} from '@/redux/slice/positionsSlice'
import { selectCompanies, getCompanies } from '@/redux/slice/companiesSilce'
import { formatDateTime, CUSTOM_MESSAGES } from '@/utils/contants'
import { Award, BriefcaseBusiness, Pencil, Plus, Trash2, UserCheck, UserX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PositionModel from '@/pages/Organizations/Positions/Action/PositionModel'

function Positions() {
  const [openModal, setOpenModal] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [action, setAction] = useState('create')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const dispatchAsync = useAppDispatch()
  const dispatch = useDispatch()
  const positions = useSelector(selectPositions)
  const loading = useSelector(selectLoading)
  const companies = useSelector(selectCompanies)

  useEffect(() => {
    dispatchAsync(getPositions())
    dispatchAsync(getCompanies())
  }, [])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = positions
    if (selectedCompany) {
      list = list.filter((pos) => pos.company?.id === selectedCompany)
    }
    if (selectedStatus) {
      list = list.filter((pos) => pos.status === selectedStatus)
    }
    if (!q) return list
    return list.filter((position) => {
      const companyName = position.company?.companyName || ''
      const hay = [position.positionCode, position.positionName, position.level, companyName, position.status]
        .filter(Boolean).join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [positions, query, selectedCompany, selectedStatus])

  const totalPositions = positions.length
  const activePositions = positions.filter((p) => p.status === 'ENABLE').length
  const inactivePositions = totalPositions - activePositions

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
    handleCloseModal()
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách chức vụ</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý các chức vụ và cấp bậc trong doanh nghiệp.</p>
        </div>
        <button
          type="button"
          onClick={() => handleAction('create')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Thêm
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <StatCard label="Tổng chức vụ" value={totalPositions} icon={BriefcaseBusiness} accentColor="indigo" />
        <StatCard label="Đang hoạt động" value={activePositions} icon={UserCheck} accentColor="emerald" subtitle="Chức vụ hiện tại" />
        <StatCard label="Ngưng hoạt động" value={inactivePositions} icon={UserX} accentColor="rose" />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FilterDropdown
            label="Tất cả công ty"
            options={companies.map((c) => ({ value: c.id, label: c.companyName }))}
            value={selectedCompany}
            onChange={setSelectedCompany}
          />
          <FilterDropdown
            label="Trạng thái: Tất cả"
            options={[{ value: 'ENABLE', label: 'Hoạt động' }, { value: 'DISABLE', label: 'Ngưng hoạt động' }]}
            value={selectedStatus}
            onChange={setSelectedStatus}
          />
        </div>
        <p className="text-sm text-slate-500">
          Hiển thị <span className="font-semibold text-slate-700">{filteredRows.length}</span> trong tổng số{' '}
          <span className="font-semibold text-slate-700">{totalPositions}</span> chức vụ
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên, cấp bậc..." />
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
            ) : !filteredRows.length ? (
              <EmptyState icon={Award} message="Không có dữ liệu chức vụ" />
            ) : (
              <tbody className="divide-y divide-slate-50">
                {filteredRows.map((position, i) => (
                  <tr key={position.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">{String(i + 1).padStart(2, '0')}</td>
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
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      <PositionModel open={openModal} onClose={handleCloseModal} onSubmit={handleSubmit} mode={action} initialValues={selectedPosition} />
    </div>
  )
}

export default Positions
