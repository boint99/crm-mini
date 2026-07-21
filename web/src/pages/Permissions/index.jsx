import { useEffect, useState, useMemo } from 'react'
import Modal from 'react-modal'
import { toast } from 'react-toastify'
import {
  Shield,
  KeyRound,
  Plus,
  Pencil,
  Trash2,
  Users,
  Search,
  X,
  XCircle,
  Settings,
  ShieldCheck,
  UserCheck
} from 'lucide-react'
import { permissionsAPI } from '@/api/permissionsAPI'
import { rolesAPI } from '@/api/rolesAPI'
import { accountRolesAPI } from '@/api/accountRolesAPI'
import { accountsAPI } from '@/api/accountsAPI'
import { customStyles } from '@/utils/contants'
import LoadingItem from '@/components/ui/LoadingItem'
import { StatCard, StatusBadge, SearchBar, ActionButton, EmptyState, TableHeader, TableHeaderRight } from '@/components/ui/PageLayout'

const STATUS_CONFIG = {
  ENABLE: {
    label: 'Hoạt động',
    className: 'bg-green-100 text-green-700 border border-green-300'
  },
  DISABLED: {
    label: 'Vô hiệu hóa',
    className: 'bg-red-100 text-red-700 border border-red-300'
  }
}

const modalStyles = {
  ...customStyles,
  content: {
    ...customStyles.content,
    maxWidth: '672px',
    borderRadius: '1rem',
    overflow: 'visible'
  }
}

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed bg-white'
const labelClass = 'block text-sm font-semibold text-slate-700 mb-1'

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState('permissions') // permissions, roles, assignments

  // Data State
  const [permissions, setPermissions] = useState([])
  const [roles, setRoles] = useState([])
  const [assignments, setAssignments] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState('') // create, edit, delete, assign
  const [modalType, setModalType] = useState('') // permission, role, assignment
  const [selectedItem, setSelectedItem] = useState(null)

  // Form Field States
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([])
  const [rolePermissionsLoading, setRolePermissionsLoading] = useState(false)

  // 1. Permission Form Fields
  const [perCode, setPerCode] = useState('')
  const [perName, setPerName] = useState('')
  const [apiPath, setApiPath] = useState('')
  const [method, setMethod] = useState('GET')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('ENABLE')

  // 2. Role Form Fields
  const [roleCode, setRoleCode] = useState('')
  const [roleName, setRoleName] = useState('')
  const [roleDesc, setRoleDesc] = useState('')

  // 3. Assignment Form Fields
  const [assignAccountId, setAssignAccountId] = useState('')
  const [assignRoleId, setAssignRoleId] = useState('')

  // Fetch all data
  const fetchData = async () => {
    setLoading(true)
    try {
      const [permsRes, rolesRes, assignsRes, accountsRes] = await Promise.all([
        permissionsAPI.getLists(),
        rolesAPI.getLists(),
        accountRolesAPI.getLists(),
        accountsAPI.getLists()
      ])

      if (permsRes?.success) setPermissions(permsRes.data)
      if (rolesRes?.success) setRoles(rolesRes.data)
      if (assignsRes?.success) setAssignments(assignsRes.data)
      if (accountsRes?.success) setAccounts(accountsRes.data)
    } catch (error) {
      if (error?.response?.status !== 403 && error?.status !== 403) {
        toast.error('Không thể tải danh sách dữ liệu!')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchData()
    })
  }, [])

  // Open creation modal
  const handleCreateOpen = (type) => {
    setModalType(type)
    setModalAction('create')
    setSelectedItem(null)

    if (type === 'permission') {
      setPerCode('')
      setPerName('')
      setApiPath('')
      setMethod('GET')
      setNotes('')
      setStatus('ENABLE')
    } else if (type === 'role') {
      setRoleCode('')
      setRoleName('')
      setRoleDesc('')
      setStatus('ENABLE')
    } else if (type === 'assignment') {
      setAssignAccountId(accounts[0]?.accountId || '')
      setAssignRoleId(roles[0]?.roleId || '')
    }
    setModalOpen(true)
  }

  // Open edit modal
  const handleEditOpen = (type, item) => {
    setModalType(type)
    setModalAction('edit')
    setSelectedItem(item)

    if (type === 'permission') {
      setPerCode(item.perCode)
      setPerName(item.perName)
      setApiPath(item.apiPath || '')
      setMethod(item.method || 'GET')
      setNotes(item.notes || '')
      setStatus(item.status)
    } else if (type === 'role') {
      setRoleCode(item.roleCode)
      setRoleName(item.roleName)
      setRoleDesc(item.description || '')
      setStatus(item.status)
    }
    setModalOpen(true)
  }

  // Open delete/revoke modal
  const handleDeleteOpen = (type, item) => {
    setModalType(type)
    setModalAction(type === 'assignment' ? 'revoke' : 'delete')
    setSelectedItem(item)
    setModalOpen(true)
  }

  const handleAssignPermissionsOpen = async (role) => {
    setSelectedItem(role)
    setModalType('role')
    setModalAction('assignPermissions')
    setRolePermissionsLoading(true)
    setSelectedPermissionIds([])
    setModalOpen(true)
    try {
      const res = await rolesAPI.getPermissions(role.id)
      if (res?.success) {
        setSelectedPermissionIds(res.data)
      }
    } catch (error) {
      toast.error('Không thể tải danh sách quyền của vai trò!')
    } finally {
      setRolePermissionsLoading(false)
    }
  }

  const handlePermissionCheckboxChange = (perId) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(perId) ? prev.filter((id) => id !== perId) : [...prev, perId]
    )
  }

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (modalType === 'permission') {
        if (modalAction === 'create') {
          const res = await permissionsAPI.create({
            perCode: perCode.trim(),
            perName: perName.trim(),
            apiPath: apiPath.trim() || null,
            method: method,
            notes: notes.trim() || null,
            status
          })
          if (res?.success) {
            toast.success('Tạo quyền hạn thành công!')
            fetchData()
          }
        } else if (modalAction === 'edit') {
          const res = await permissionsAPI.update(selectedItem.id, {
            id: selectedItem.id,
            perCode: perCode.trim(),
            perName: perName.trim(),
            apiPath: apiPath.trim() || null,
            method: method,
            notes: notes.trim() || null,
            status
          })
          if (res?.success) {
            toast.success('Cập nhật quyền hạn thành công!')
            fetchData()
          }
        } else if (modalAction === 'delete') {
          const res = await permissionsAPI.delete(selectedItem.id)
          if (res?.success) {
            toast.success('Xóa quyền hạn thành công!')
            fetchData()
          }
        }
      } else if (modalType === 'role') {
        if (modalAction === 'assignPermissions') {
          const res = await rolesAPI.assignPermissions(selectedItem.id, selectedPermissionIds)
          if (res?.success) {
            toast.success('Cập nhật phân quyền vai trò thành công!')
            fetchData()
          }
        } else if (modalAction === 'create') {
          const res = await rolesAPI.create({
            roleCode: roleCode.trim(),
            roleName: roleName.trim(),
            description: roleDesc.trim() || null,
            status
          })
          if (res?.success) {
            toast.success('Tạo vai trò thành công!')
            fetchData()
          }
        } else if (modalAction === 'edit') {
          const res = await rolesAPI.update(selectedItem.id, {
            id: selectedItem.id,
            roleCode: roleCode.trim(),
            roleName: roleName.trim(),
            description: roleDesc.trim() || null,
            status
          })
          if (res?.success) {
            toast.success('Cập nhật vai trò thành công!')
            fetchData()
          }
        } else if (modalAction === 'delete') {
          const res = await rolesAPI.delete(selectedItem.id)
          if (res?.success) {
            toast.success('Xóa vai trò thành công!')
            fetchData()
          }
        }
      } else if (modalType === 'assignment') {
        if (modalAction === 'create') {
          const res = await accountRolesAPI.assign({
            accountId: Number(assignAccountId),
            roleId: Number(assignRoleId)
          })
          if (res?.success) {
            toast.success('Gán vai trò thành công!')
            fetchData()
          }
        } else if (modalAction === 'revoke') {
          const res = await accountRolesAPI.revoke(selectedItem.id)
          if (res?.success) {
            toast.success('Thu hồi vai trò thành công!')
            fetchData()
          }
        }
      }
      setModalOpen(false)
    } catch (error) {
      console.error('Form submit failed:', error)
      if (error?.response?.status !== 403 && error?.status !== 403) {
        toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi thực hiện!')
      }
    }
  }

  // Filter items based on search query
  const filteredPermissions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return permissions
    return permissions.filter(
      (p) =>
        p.perName.toLowerCase().includes(q) ||
        p.perCode.toLowerCase().includes(q) ||
        (p.apiPath && p.apiPath.toLowerCase().includes(q))
    )
  }, [permissions, searchQuery])

  const filteredRoles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return roles
    return roles.filter(
      (r) =>
        r.roleName.toLowerCase().includes(q) ||
        r.roleCode.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
    )
  }, [roles, searchQuery])

  const filteredAssignments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return assignments
    return assignments.filter(
      (a) =>
        (a.account?.accountName && a.account.accountName.toLowerCase().includes(q)) ||
        (a.role?.roleName && a.role.roleName.toLowerCase().includes(q))
    )
  }, [assignments, searchQuery])

  const getSubmitButtonText = () => {
    if (modalAction === 'assignPermissions') return 'Lưu'
    if (modalAction === 'create') {
      if (modalType === 'permission') return 'Tạo quyền hạn'
      if (modalType === 'role') return 'Tạo vai trò'
      if (modalType === 'assignment') return 'Gán vai trò'
    }
    return 'Cập nhật'
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-500" />
            Cấu Hình Hệ Thống Phân Quyền
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý vai trò (Roles), danh mục quyền hạn (Permissions) và phân vai trò người dùng động.
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => {
            setActiveTab('permissions')
            setSearchQuery('')
          }}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 outline-none ${
            activeTab === 'permissions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Shield className="h-4 w-4" />
          Danh mục Quyền hạn
        </button>
        <button
          onClick={() => {
            setActiveTab('roles')
            setSearchQuery('')
          }}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 outline-none ${
            activeTab === 'roles'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Vai trò (Roles)
        </button>
        <button
          onClick={() => {
            setActiveTab('assignments')
            setSearchQuery('')
          }}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 outline-none ${
            activeTab === 'assignments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Gán vai trò người dùng
        </button>
      </div>

      {/* Stats summary cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Tổng quyền hạn" value={permissions.length} icon={Shield} accentColor="indigo" />
        <StatCard label="Số lượng vai trò" value={roles.length} icon={ShieldCheck} accentColor="emerald" />
        <StatCard label="Liên kết gán vai trò" value={assignments.length} icon={UserCheck} accentColor="rose" />
      </div>

      {/* Tables based on active tab */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Integrated Filter and Action Header */}
        <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between gap-4 flex-wrap bg-white">
          <div>
            <p className="text-lg font-bold text-slate-900">
              {activeTab === 'permissions' && 'Danh mục Quyền hạn'}
              {activeTab === 'roles' && 'Danh sách vai trò (Roles)'}
              {activeTab === 'assignments' && 'Danh sách gán vai trò'}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 w-64">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
            </div>

            {activeTab === 'permissions' && (
              <button
                onClick={() => handleCreateOpen('permission')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Thêm quyền hạn
              </button>
            )}

            {activeTab === 'roles' && (
              <button
                onClick={() => handleCreateOpen('role')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Thêm vai trò
              </button>
            )}

            {activeTab === 'assignments' && (
              <button
                onClick={() => handleCreateOpen('assignment')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Gán vai trò
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <div className="p-8">
            <LoadingItem />
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-auto">
            {/* 1. PERMISSIONS TABLE */}
            {activeTab === 'permissions' && (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <TableHeader>#</TableHeader>
                    <TableHeader>Mã quyền</TableHeader>
                    <TableHeader>Tên quyền</TableHeader>
                    <TableHeader>API Path</TableHeader>
                    <TableHeader>Method</TableHeader>
                    <TableHeader>Ghi chú</TableHeader>
                    <TableHeader>Trạng thái</TableHeader>
                    <TableHeaderRight>Thao tác</TableHeaderRight>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!filteredPermissions.length ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                        Không có dữ liệu quyền hạn nào.
                      </td>
                    </tr>
                  ) : (
                    filteredPermissions.map((p, idx) => {
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">{idx + 1}</td>
                          <td className="px-5 py-4 font-semibold text-slate-800 whitespace-nowrap">{p.perCode}</td>
                          <td className="px-5 py-4 text-slate-900 font-medium whitespace-nowrap">{p.perName}</td>
                          <td className="px-5 py-4 text-indigo-600 font-mono text-xs whitespace-nowrap">{p.apiPath || '—'}</td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {p.method ? (
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800 font-mono border border-slate-200">
                                {p.method}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-xs truncate max-w-xs">{p.notes || '—'}</td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1">
                              <ActionButton icon={Pencil} onClick={() => handleEditOpen('permission', p)} title="Chỉnh sửa" />
                              <ActionButton icon={Trash2} onClick={() => handleDeleteOpen('permission', p)} variant="delete" title="Xóa" />
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* 2. ROLES TABLE */}
            {activeTab === 'roles' && (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <TableHeader>#</TableHeader>
                    <TableHeader>Mã vai trò</TableHeader>
                    <TableHeader>Tên vai trò</TableHeader>
                    <TableHeader>Mô tả</TableHeader>
                    <TableHeader>Trạng thái</TableHeader>
                    <TableHeaderRight>Thao tác</TableHeaderRight>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!filteredRoles.length ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                        Không có dữ liệu vai trò nào.
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((r, idx) => {
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">{idx + 1}</td>
                          <td className="px-5 py-4 font-semibold text-slate-800 whitespace-nowrap">{r.roleCode}</td>
                          <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">{r.roleName}</td>
                          <td className="px-5 py-4 text-slate-500 text-xs truncate max-w-sm">{r.description || '—'}</td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1">
                              <ActionButton icon={KeyRound} onClick={() => handleAssignPermissionsOpen(r)} variant="warning" title="Phân quyền" />
                              <ActionButton icon={Pencil} onClick={() => handleEditOpen('role', r)} title="Chỉnh sửa" />
                              <ActionButton icon={Trash2} onClick={() => handleDeleteOpen('role', r)} variant="delete" title="Xóa" />
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* 3. ASSIGNMENTS TABLE */}
            {activeTab === 'assignments' && (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <TableHeader>#</TableHeader>
                    <TableHeader>Tài khoản</TableHeader>
                    <TableHeader>Vai trò đang sở hữu</TableHeader>
                    <TableHeaderRight>Thao tác</TableHeaderRight>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!filteredAssignments.length ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                        Chưa có tài khoản nào được gán vai trò.
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map((a, idx) => (
                      <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">{idx + 1}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                          {a.account?.accountName || <span className="text-slate-400 font-normal italic">Đã xóa tài khoản (ID: {a.accountId})</span>}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {a.role ? (
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200">
                              {a.role.roleName} ({a.role.roleCode})
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Đã xóa vai trò (ID: {a.roleId})</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteOpen('assignment', a)}
                            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 transition cursor-pointer inline-flex items-center gap-1 text-xs font-semibold border border-rose-200 px-2 py-1"
                            title="Thu hồi quyền hạn"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Thu hồi
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* CRUD MODAL FOR POPUPS */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        style={(modalAction === 'delete' || modalAction === 'revoke') ? customStyles : modalStyles}
        ariaHideApp={false}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900">
              {modalAction === 'delete' && 'Xác nhận xóa'}
              {modalAction === 'revoke' && 'Xác nhận thu hồi vai trò'}
              {modalAction === 'assignPermissions' && `Phân quyền cho vai trò: ${selectedItem?.roleName}`}
              {modalAction === 'create' && (
                modalType === 'permission' ? 'Thêm quyền hạn mới' :
                  modalType === 'role' ? 'Thêm vai trò mới' :
                    'Gán vai trò mới'
              )}
              {modalAction === 'edit' && (
                modalType === 'permission' ? 'Chỉnh sửa quyền hạn' : 'Chỉnh sửa vai trò'
              )}
            </h3>
            <button
              onClick={() => setModalOpen(false)}
              className="p-1 rounded-md hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {(modalAction === 'delete' || modalAction === 'revoke') ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50 flex items-start gap-3">
                <XCircle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
                <div className="text-sm text-slate-700 leading-relaxed">
                  {modalAction === 'revoke' ? (
                    <>
                      Bạn có chắc chắn muốn thu hồi vai trò{' '}
                      <span className="font-semibold text-rose-600">&quot;{selectedItem?.role?.roleName}&quot;</span> khỏi tài khoản{' '}
                      <span className="font-semibold text-slate-900">&quot;{selectedItem?.account?.accountName}&quot;</span>?
                    </>
                  ) : (
                    <>
                      Bạn có chắc chắn muốn xóa {modalType === 'permission' ? 'quyền' : 'vai trò'}{' '}
                      <span className="font-semibold text-rose-600">
                        &quot;{modalType === 'permission' ? selectedItem?.perName : selectedItem?.roleName}&quot;
                      </span>? Hành động này sẽ chuyển trạng thái về ngưng hoạt động.
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 cursor-pointer"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. PERMISSION FORM */}
              {modalType === 'permission' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Mã Quyền *</label>
                    <input
                      type="text"
                      placeholder="VD: COMPANY_VIEW"
                      value={perCode}
                      onChange={(e) => setPerCode(e.target.value)}
                      className={inputClass}
                      required
                      disabled={modalAction === 'edit'}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Tên Quyền *</label>
                    <input
                      type="text"
                      placeholder="VD: COMPANY_VIEW"
                      value={perName}
                      onChange={(e) => setPerName(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>API Path</label>
                    <input
                      type="text"
                      placeholder="VD: /api/company/:id"
                      value={apiPath}
                      onChange={(e) => setApiPath(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>HTTP Method</label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className={inputClass}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Trạng thái (STATUS) *</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={inputClass}
                      required
                    >
                      <option value="ENABLE">ENABLE (Hoạt động)</option>
                      <option value="DISABLED">DISABLED (Khóa)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Ghi chú</label>
                    <textarea
                      rows={2}
                      placeholder="Mô tả công dụng của quyền này..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              )}

              {/* 2. ROLE FORM */}
              {modalType === 'role' && modalAction !== 'assignPermissions' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Mã vai trò *</label>
                    <input
                      type="text"
                      placeholder="VD: ADMIN_ROLE"
                      value={roleCode}
                      onChange={(e) => setRoleCode(e.target.value)}
                      className={inputClass}
                      required
                      disabled={modalAction === 'edit'}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Tên vai trò *</label>
                    <input
                      type="text"
                      placeholder="VD: ADMIN_ROLE"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Trạng thái (STATUS) *</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={inputClass}
                      required
                    >
                      <option value="ENABLE">ENABLE (Hoạt động)</option>
                      <option value="DISABLED">DISABLED (Khóa)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Mô tả vai trò</label>
                    <textarea
                      rows={3}
                      placeholder="Ghi chú về phân quyền của vai trò này..."
                      value={roleDesc}
                      onChange={(e) => setRoleDesc(e.target.value)}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              )}

              {/* 4. ROLE PERMISSIONS ASSIGNMENT FORM */}
              {modalType === 'role' && modalAction === 'assignPermissions' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 mb-2">
                    Tích chọn các quyền hạn muốn cấp cho vai trò <span className="font-semibold text-slate-900">{selectedItem?.roleName}</span>:
                  </p>
                  {rolePermissionsLoading ? (
                    <div className="py-8"><LoadingItem /></div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-64 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                      {!permissions.filter(p => p.status === 'ENABLE').length ? (
                        <div className="sm:col-span-2 text-center text-sm text-slate-400 py-4 italic">
                          Không có quyền hạn hoạt động nào để gán.
                        </div>
                      ) : (
                        permissions
                          .filter(p => p.status === 'ENABLE')
                          .map((p) => {
                            const isChecked = selectedPermissionIds.includes(p.perId)
                            return (
                              <label
                                key={p.perId}
                                className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-100 hover:border-slate-200 cursor-pointer transition text-sm text-slate-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handlePermissionCheckboxChange(p.perId)}
                                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                />
                                <div>
                                  <div className="font-semibold text-slate-900">{p.perCode}</div>
                                  <div className="text-xs text-slate-500">{p.perName}</div>
                                </div>
                              </label>
                            )
                          })
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 3. ASSIGNMENT FORM */}
              {modalType === 'assignment' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Chọn tài khoản *</label>
                    <select
                      value={assignAccountId}
                      onChange={(e) => setAssignAccountId(e.target.value)}
                      className={inputClass}
                      required
                    >
                      <option value="" disabled>-- Chọn tài khoản --</option>
                      {accounts
                        .filter(a => a.status === 'ENABLE')
                        .map(a => (
                          <option key={a.accountId} value={a.accountId}>
                            {a.accountName}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Chọn vai trò *</label>
                    <select
                      value={assignRoleId}
                      onChange={(e) => setAssignRoleId(e.target.value)}
                      className={inputClass}
                      required
                    >
                      <option value="" disabled>-- Chọn vai trò --</option>
                      {roles
                        .filter(r => r.status === 'ENABLE')
                        .map(r => (
                          <option key={r.roleId} value={r.roleId}>
                            {r.roleName} ({r.roleCode})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {getSubmitButtonText()}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  )
}
