import LoadingItem from '@/components/ui/LoadingItem'
import { StatCard, FilterDropdown, StatusBadge, SearchBar, ActionButton, EmptyState, TableHeader, TableHeaderRight } from '@/components/ui/PageLayout'
import { dispatchWithToast } from '@/components/ui/dispatchWithToast'
import { useAppDispatch } from '@/hook/useAppDispatch'
import DepartmentModel from '@/pages/Organizations/Departments/Action/DepartmentModel'
import {
  createDepartment, deleteDepartment, getDepartments, selectDepartments, selectLoadingDepartments, updateDepartment
} from '@/redux/slice/departmentsSlice'
import { selectCompanies, getCompanies } from '@/redux/slice/companiesSilce'
import { formatDateTime, CUSTOM_MESSAGES } from '@/utils/contants'
import { Folder, FolderOpen, Pencil, Plus, Trash2, UserCheck, UserX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

function Departments() {
  const [openModal, setOpenModal] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [action, setAction] = useState('create')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

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
    if (selectedCompany) list = list.filter((d) => d.company?.id === selectedCompany)
    if (selectedStatus) list = list.filter((d) => d.status === selectedStatus)
    if (!q) return list
    return list.filter((dept) => {
      const hay = [dept.orgUnitCode, dept.unitName, dept.unitType, dept.parentUnit?.unitName, dept.company?.companyName, dept.branch?.branchName, dept.status]
        .filter(Boolean).join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [departments, query, selectedCompany, selectedStatus])

  const totalDepartments = departments.length
  const activeDepartments = departments.filter((d) => d.status === 'ENABLE').length
  const inactiveDepartments = totalDepartments - activeDepartments

  const handleAction = (act, item = null) => {
    setAction(act)
    setSelectedItem(act === 'create' ? null : item)
    setOpenModal(true)
  }

  const handleCloseModal = () => { setOpenModal(false); setSelectedItem(null); setAction('create') }

  const handleSubmit = async (payload) => {
    const config = { delete: deleteDepartment, edit: updateDepartment }
    const messages = { delete: CUSTOM_MESSAGES.delete, edit: CUSTOM_MESSAGES.update }
    await dispatchWithToast({ dispatch, action: config[action] || createDepartment, payload, messages: messages[action] || CUSTOM_MESSAGES.create })
    handleCloseModal()
    dispatchAsync(getDepartments())
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách phòng ban</h1>
          <p className="mt-1 text-sm text-slate-500">Hiển thị các phòng ban và bộ phận tổ chức trong hệ thống.</p>
        </div>
        <button type="button" onClick={() => handleAction('create')} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer">
          <Plus className="h-4 w-4" /> Thêm phòng ban
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <StatCard label="Tổng phòng ban" value={totalDepartments} icon={Folder} accentColor="indigo" />
        <StatCard label="Đang hoạt động" value={activeDepartments} icon={UserCheck} accentColor="emerald" subtitle="Phòng ban hiện tại" />
        <StatCard label="Ngưng hoạt động" value={inactiveDepartments} icon={UserX} accentColor="rose" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FilterDropdown label="Tất cả công ty" options={companies.map((c) => ({ value: c.id, label: c.companyName }))} value={selectedCompany} onChange={setSelectedCompany} />
          <FilterDropdown label="Trạng thái: Tất cả" options={[{ value: 'ENABLE', label: 'Hoạt động' }, { value: 'DISABLE', label: 'Ngưng hoạt động' }]} value={selectedStatus} onChange={setSelectedStatus} />
        </div>
        <p className="text-sm text-slate-500">Hiển thị <span className="font-semibold text-slate-700">{filteredRows.length}</span> trong tổng số <span className="font-semibold text-slate-700">{totalDepartments}</span> phòng ban</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo mã, tên, công ty..." />
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              <TableHeader>STT</TableHeader>
              <TableHeader>Mã phòng ban</TableHeader>
              <TableHeader>Tên phòng ban</TableHeader>
              <TableHeader>Loại</TableHeader>
              <TableHeader>Đơn vị cha</TableHeader>
              <TableHeader>Chi nhánh</TableHeader>
              <TableHeader>Công ty</TableHeader>
              <TableHeader>Trạng thái</TableHeader>
              <TableHeaderRight>Thao tác</TableHeaderRight>
            </tr></thead>
            {loading ? (
              <tbody><tr><td colSpan={9}><LoadingItem /></td></tr></tbody>
            ) : !filteredRows.length ? (
              <EmptyState icon={FolderOpen} message="Không có dữ liệu phòng ban" />
            ) : (
              <tbody className="divide-y divide-slate-50">
                {filteredRows.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">{String(i + 1).padStart(2, '0')}</td>
                    <td className="px-5 py-4 font-semibold text-indigo-600 whitespace-nowrap">{item.orgUnitCode || '-'}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">{item.unitName || '-'}</td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{item.unitType || '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap">{item.parentUnit?.unitName ? <span className="text-slate-900 font-medium">{item.parentUnit.unitName}</span> : <span className="text-slate-400 italic">Đơn vị gốc</span>}</td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{item.branch?.branchName || '-'}</td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{item.company?.companyName || '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <ActionButton icon={Pencil} onClick={() => handleAction('edit', item)} title="Chỉnh sửa" />
                        <ActionButton icon={Trash2} onClick={() => handleAction('delete', item)} variant="delete" title="Xóa" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      <DepartmentModel open={openModal} onClose={handleCloseModal} onSubmit={handleSubmit} mode={action} initialValues={selectedItem} />
    </div>
  )
}

export default Departments