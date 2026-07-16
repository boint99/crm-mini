import { useEffect, useMemo, useState } from 'react'
import ActionModal from './Actions'
import { useAppDispatch } from '@/hook/useAppDispatch'
import {
  getAccounts,
  selectAccounts,
  selectAccountsLoading
} from '@/redux/slice/accountsSlice'
import { selectCompanies, getCompanies } from '@/redux/slice/companiesSilce'
import { useSelector } from 'react-redux'
import LoadingItem from '@/components/ui/LoadingItem'
import { formatDateTime } from '@/utils/contants'
import { StatCard, StatusBadge, SearchBar, ActionButton, EmptyState, TableHeader, TableHeaderRight, Pagination } from '@/components/ui/PageLayout'
import {
  Pencil,
  Trash2,
  KeyRound,
  CheckCircle2,
  XCircle,
  Plus,
  Users,
  UserCheck,
  UserX
} from 'lucide-react'

const PAGE_SIZE = 10

function Accounts() {
  const [openModal, setOpenModal] = useState(false)
  const [action, setAction] = useState(null)
  const [selectItem, setSelectItem] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [page, setPage] = useState(1)

  const accountItems = useSelector(selectAccounts)
  const loading = useSelector(selectAccountsLoading)
  const companies = useSelector(selectCompanies)
  const dispatchAsync = useAppDispatch()

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

  useEffect(() => {
    const params = {}
    if (selectedCompany && selectedCompany !== 'ALL') {
      params.companyId = selectedCompany
    }
    dispatchAsync(getAccounts(params))
  }, [selectedCompany, dispatchAsync])

  const handleAction = (actionType, item = null) => {
    setAction(actionType)
    setSelectItem(item)
    setOpenModal(true)
  }

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    return accountItems.filter((acc) => {
      const matchQuery =
        !q ||
        [acc.accountName, acc.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      const matchStatus = statusFilter === 'ALL' || acc.status === statusFilter
      return matchQuery && matchStatus
    })
  }, [accountItems, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const totalAccounts = accountItems.length
  const activeAccounts = accountItems.filter(
    (a) => a.status === 'ENABLE'
  ).length
  const inactiveAccounts = totalAccounts - activeAccounts

  const maxLogin = Math.max(
    ...accountItems.map((a) => Number(a.login) || 0),
    1
  )

  const renderLoginBar = (loginCount) => {
    const count = Number(loginCount) || 0
    const pct = Math.round((count / maxLogin) * 100)
    return (
      <div className="flex items-center gap-2 min-w-[110px]">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100">
          <div
            className="h-1.5 rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 w-6 text-right font-medium">{count}</span>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách tài khoản</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý và cấp quyền truy cập hệ thống cho nhân sự.</p>
        </div>
        <button
          type="button"
          onClick={() => handleAction('create')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Thêm tài khoản
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <StatCard label="Tổng tài khoản" value={totalAccounts} icon={Users} accentColor="indigo" />
        <StatCard label="Đang hoạt động" value={activeAccounts} icon={UserCheck} accentColor="emerald" />
        <StatCard label="Ngưng hoạt động" value={inactiveAccounts} icon={UserX} accentColor="rose" />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ENABLE">Hoạt động</option>
            <option value="DISABLED">Vô hiệu hóa</option>
          </select>

          <select
            value={selectedCompany}
            onChange={(e) => {
              setSelectedCompany(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer outline-none"
          >
            <option value="ALL">Tất cả công ty</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-slate-500">
          Hiển thị <span className="font-semibold text-slate-700">{filteredItems.length}</span> tài khoản
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        <SearchBar value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Tìm theo tên tài khoản, mô tả..." />
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <TableHeader>STT</TableHeader>
                <TableHeader>Tên tài khoản</TableHeader>
                <TableHeader>Nhân sự liên kết</TableHeader>
                <TableHeader>Vai trò</TableHeader>
                <TableHeader>Đăng nhập</TableHeader>
                <TableHeader>Số lần đăng nhập</TableHeader>
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
              <EmptyState icon={Users} message="Không có dữ liệu tài khoản" />
            ) : (
              <tbody className="divide-y divide-slate-50">
                {pagedItems.map((account, index) => {
                  const stt = (currentPage - 1) * PAGE_SIZE + index + 1
                  return (
                    <tr key={account.accountId} className="hover:bg-slate-50/60 transition-colors">
                      {/* STT */}
                      <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">
                        {String(stt).padStart(2, '0')}
                      </td>
                      {/* Tên tài khoản */}
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        {account.accountName}
                      </td>
                      {/* Nhân sự */}
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {account.employee ? (
                          <span className="font-medium text-slate-700">
                            {account.employee.firstName} {account.employee.lastName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">—</span>
                        )}
                      </td>
                      {/* Vai trò */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {account.roles && account.roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {account.roles.map((r) => (
                              <span
                                key={r.roleId}
                                className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-700/10"
                              >
                                {r.roleName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">—</span>
                        )}
                      </td>
                      {/* Đăng nhập (Hoạt động/Không hoạt động) */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        {account.isLogin ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Đã kết nối
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-xs">
                            <XCircle className="h-4 w-4 text-slate-300" />
                            Chưa kết nối
                          </span>
                        )}
                      </td>
                      {/* Số lần đăng nhập */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {renderLoginBar(account.login)}
                      </td>
                      {/* Ngày tạo */}
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                        {account.createdAt ? formatDateTime(account.createdAt).split(' ')[0] : '-'}
                      </td>
                      {/* Trạng thái */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={account.status} activeLabel="Hoạt động" inactiveLabel="Vô hiệu hóa" />
                      </td>
                      {/* Thao tác */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <ActionButton icon={Pencil} onClick={() => handleAction('edit', account)} title="Chỉnh sửa" />
                          <ActionButton icon={KeyRound} onClick={() => handleAction('reset-password', account)} variant="warning" title="Đặt lại mật khẩu" />
                          <ActionButton icon={Trash2} onClick={() => handleAction('delete', account)} variant="delete" title="Xóa" />
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
        {!loading && filteredItems.length > 0 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      <ActionModal
        open={openModal}
        onClose={() => {
          setOpenModal(false)
          setSelectItem(null)
          setAction(null)
        }}
        action={action}
        item={selectItem}
      />
    </div>
  )
}

export default Accounts
