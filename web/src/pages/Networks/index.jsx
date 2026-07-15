import LoadingItem from '@/components/ui/LoadingItem'
import { dispatchWithToast } from '@/components/ui/dispatchWithToast'
import { useAppDispatch } from '@/hook/useAppDispatch'
import {
  getVlans,
  createVlan,
  updateVlan,
  deleteVlan,
  selectVlans,
  selectVlansLoading
} from '@/redux/slice/vlansSlice'
import {
  getIps,
  createIp,
  updateIp,
  deleteIp,
  selectIps,
  selectIpsLoading
} from '@/redux/slice/ipsSlice'
import { CUSTOM_MESSAGES } from '@/utils/contants'
import {
  Plus,
  Search,
  Download,
  Network,
  Pencil,
  Trash2,
  ChevronDown
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import VlanModal from './VlanModal'
import IpModal from './IpModal'
import { StatusBadge, TableHeader, TableHeaderRight } from '@/components/ui/PageLayout'

function LocalStatusBadge({ status }) {
  const isActive = status === 'ACTIVE' || status === 'ENABLE'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ring-1 ${
        isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-rose-50 text-rose-600 ring-rose-200'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {isActive ? 'Online' : 'Offline'}
    </span>
  )
}

function DeviceTypeBadge({ type }) {
  if (!type) return <span className="text-gray-400">—</span>
  const isStatic = type.toUpperCase() === 'STATIC'
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
        isStatic ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
      }`}
    >
      {type}
    </span>
  )
}

export default function Networks() {
  const [vlanDropdownOpen, setVlanDropdownOpen] = useState(false)
  const [selectedVlanId, setSelectedVlanId] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // VLAN modal
  const [vlanModalOpen, setVlanModalOpen] = useState(false)
  const [vlanMode, setVlanMode] = useState('create')
  const [selectedVlanData, setSelectedVlanData] = useState(null)

  // IP modal
  const [ipModalOpen, setIpModalOpen] = useState(false)
  const [ipMode, setIpMode] = useState('create')
  const [selectedIpData, setSelectedIpData] = useState(null)

  const dispatchAsync = useAppDispatch()
  const dispatch = useDispatch()
  const vlans = useSelector(selectVlans)

  const vlansLoading = useSelector(selectVlansLoading)
  const ips = useSelector(selectIps)
  const ipsLoading = useSelector(selectIpsLoading)
  const [searchParams, setSearchParams] = useSearchParams()

  const dropdownRef = useRef(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    const status = searchParams.get('status')
    const vlanId = searchParams.get('vlanId')
    const all = searchParams.get('all')

    const params = {}
    if (status) params.status = status
    if (vlanId) params.vlanId = vlanId
    if (all) params.all = all

    dispatchAsync(getVlans(params))
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setVlanDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-select VLAN from URL on initial load only
  useEffect(() => {
    if (vlans.length === 0 || initializedRef.current) return
    initializedRef.current = true
    const idFromUrl = searchParams.get('vlanid')
    if (idFromUrl) {
      const match = vlans.find((v) => String(v.id) === idFromUrl)
      if (match) {
        Promise.resolve().then(() => {
          setSelectedVlanId(match.id)
        })
        return
      }
    }
    dispatchAsync(getIps({}))
  }, [vlans])

  // Sync URL + fetch IPs when selectedVlanId changes
  useEffect(() => {
    if (!initializedRef.current) return
    if (selectedVlanId === null) {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('vlanid')
      setSearchParams(newParams, { replace: true })
      dispatchAsync(getIps({}))
    } else {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('vlanid', String(selectedVlanId))
      setSearchParams(newParams, { replace: true })
      dispatchAsync(getIps({ vlanid: selectedVlanId }))
    }
  }, [selectedVlanId])

  const selectedVlan = useMemo(
    () => vlans.find((v) => v.id === selectedVlanId),
    [vlans, selectedVlanId]
  )

  // Filter IPs for the selected VLAN
  const filteredIps = useMemo(() => {
    let list = [...ips]
    if (statusFilter !== 'ALL') {
      list = list.filter((ip) => ip.status === statusFilter)
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((ip) => {
        const hay = [
          ip.host,
          ip.deviceType,
          ip.employee?.employeeCode,
          ip.employee?.firstName,
          ip.employee?.lastName,
          ip.status
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
    }
    return list
  }, [ips, statusFilter, query])

  // ── VLAN actions ──
  const openCreateVlan = () => {
    setVlanMode('create')
    setSelectedVlanData(null)
    setVlanModalOpen(true)
  }

  const openEditVlan = () => {
    if (!selectedVlan) return
    setVlanMode('edit')
    setSelectedVlanData(selectedVlan)
    setVlanModalOpen(true)
  }

  const openDeleteVlan = () => {
    if (!selectedVlan) return
    setVlanMode('delete')
    setSelectedVlanData(selectedVlan)
    setVlanModalOpen(true)
  }

  const handleVlanSubmit = async (payload) => {
    if (vlanMode === 'delete') {
      await dispatchWithToast({
        dispatch,
        action: deleteVlan,
        payload,
        messages: CUSTOM_MESSAGES.delete
      })
      const remaining = vlans.filter((v) => v.id !== payload)
      setSelectedVlanId(remaining.length > 0 ? remaining[0].id : null)
    } else if (vlanMode === 'edit') {
      await dispatchWithToast({
        dispatch,
        action: updateVlan,
        payload,
        messages: CUSTOM_MESSAGES.update
      })
    } else {
      await dispatchWithToast({
        dispatch,
        action: createVlan,
        payload,
        messages: CUSTOM_MESSAGES.create
      })
    }
    setVlanModalOpen(false)
    setSelectedVlanData(null)
  }

  // ── IP actions ──
  const openCreateIp = () => {
    setIpMode('create')
    setSelectedIpData(null)
    setIpModalOpen(true)
  }

  const openEditIp = (ip) => {
    setIpMode('edit')
    setSelectedIpData(ip)
    setIpModalOpen(true)
  }

  const openDeleteIp = (ip) => {
    setIpMode('delete')
    setSelectedIpData(ip)
    setIpModalOpen(true)
  }

  const handleIpSubmit = async (payload) => {
    if (ipMode === 'delete') {
      await dispatchWithToast({
        dispatch,
        action: deleteIp,
        payload,
        messages: CUSTOM_MESSAGES.delete
      })
    } else if (ipMode === 'edit') {
      await dispatchWithToast({
        dispatch,
        action: updateIp,
        payload,
        messages: CUSTOM_MESSAGES.update
      })
    } else {
      await dispatchWithToast({
        dispatch,
        action: createIp,
        payload,
        messages: CUSTOM_MESSAGES.create
      })
    }
    setIpModalOpen(false)
    setSelectedIpData(null)
    if (selectedVlanId) {
      dispatchAsync(getIps({ vlanid: selectedVlanId }))
    } else {
      dispatchAsync(getIps({}))
    }
  }

  // CSV export
  const handleExport = () => {
    if (!filteredIps.length) return

    const headers = [
      'IP Address',
      'Device Type',
      'Employee code',
      'Full Name',
      'Type',
      'Status'
    ]

    const escapeCSV = (value) => {
      if (!value) return ''
      const str = String(value).replace(/"/g, '""')
      return `"${str}"`
    }

    const rows = filteredIps.map((ip) => [
      escapeCSV(ip.host),
      escapeCSV(ip.deviceType),
      escapeCSV(ip.employee?.employeeCode),
      escapeCSV(
        `${ip.employee?.firstName || ''} ${ip.employee?.lastName || ''}`.trim()
      ),
      escapeCSV(ip.type),
      escapeCSV(ip.status)
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vlan-${selectedVlan?.VLAN_CODE || 'ips'}-export.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý mạng & IP</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cấu hình phân đoạn mạng và quản lý cấp phát không gian địa chỉ IP.
          </p>
        </div>
      </div>

      {/* ── VLAN Detail ── */}
      {vlansLoading ? (
        <div className="mb-6">
          <LoadingItem />
        </div>
      ) : vlans.length === 0 ? (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Không có VLAN nào</h2>
            <button
              onClick={openCreateVlan}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Thêm VLAN
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <Network className="h-10 w-10 mb-2 text-slate-300" />
            <p className="text-sm">
              Không tìm thấy VLAN nào. Hãy tạo mới để bắt đầu.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {selectedVlan ? (
                <>
                  <h2 className="text-lg font-bold text-slate-900">
                    VLAN {selectedVlan.vlanId}
                  </h2>
                  <span className="text-sm text-slate-500">
                    {selectedVlan.vlanName}
                  </span>
                  <StatusBadge status={selectedVlan.status} />
                </>
              ) : (
                <h2 className="text-lg font-bold text-slate-900">Tất cả VLANs</h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* VLAN Dropdown Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setVlanDropdownOpen(!vlanDropdownOpen)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  <Network className="h-3.5 w-3.5" />
                  {selectedVlan
                    ? `VLAN ${selectedVlan.vlanId}`
                    : 'Tất cả VLANs'}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${vlanDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {vlanDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 z-20 w-64 rounded-xl border border-slate-200 bg-white py-1 shadow-lg max-h-60 overflow-y-auto">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                        Chọn VLAN · {vlans.length} Defined
                      </p>
                    </div>
                    <div>
                      {/* All VLANs option */}
                      <button
                        onClick={() => {
                          setSelectedVlanId(null)
                          setVlanDropdownOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                          selectedVlanId === null ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            selectedVlanId === null
                              ? 'border-indigo-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {selectedVlanId === null && (
                            <div className="h-2 w-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            Tất cả VLANs
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Hiển thị toàn bộ địa chỉ IP
                          </p>
                        </div>
                      </button>
                      {vlans.map((vlan) => (
                        <button
                          key={vlan.id}
                          onClick={() => {
                            setSelectedVlanId(vlan.id)
                            setVlanDropdownOpen(false)
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                            vlan.id === selectedVlanId ? 'bg-indigo-50/50' : ''
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                              vlan.id === selectedVlanId
                                ? 'border-indigo-600'
                                : 'border-slate-300'
                            }`}
                          >
                            {vlan.id === selectedVlanId && (
                              <div className="h-2 w-2 rounded-full bg-indigo-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900">
                              VLAN {vlan.vlanId}
                              <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                                {vlan.vlanName}
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {vlan.network || '—'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={openCreateVlan}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm VLAN
              </button>
              {selectedVlan && (
                <>
                  <button
                    onClick={openEditVlan}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={openDeleteVlan}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm hover:bg-rose-100 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa
                  </button>
                </>
              )}
            </div>
          </div>
          {selectedVlan &&
            (selectedVlan.network ||
              selectedVlan.defaultGateway ||
              selectedVlan.subnetMask ||
              selectedVlan.ipRange) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Network
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedVlan.network || '—'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Gateway
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedVlan.defaultGateway || '—'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Subnet Mask
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                    /{selectedVlan.subnetMask || '—'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    IP Range
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedVlan.ipRange || '—'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── IP Allocation Table ── */}
      {vlans.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Table header toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 w-80">
              <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Tìm kiếm IP hoặc thiết bị..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-400 outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-3">
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 cursor-pointer shadow-sm"
              >
                <option value="ALL">Tất cả</option>
                <option value="ACTIVE">Online</option>
                <option value="INACTIVE">Offline</option>
              </select>

              {/* Export */}
              <button
                onClick={handleExport}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 cursor-pointer transition shadow-sm bg-white"
                title="Export CSV"
              >
                <Download className="h-4 w-4" />
              </button>

              {/* Add IP */}
              <button
                onClick={openCreateIp}
                disabled={!selectedVlanId}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                Thêm IP
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 min-h-0 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <TableHeader>IP Address</TableHeader>
                  <TableHeader>VLAN ID</TableHeader>
                  <TableHeader>Device Name</TableHeader>
                  <TableHeader>Mã nhân viên</TableHeader>
                  <TableHeader>Họ và Tên</TableHeader>
                  <TableHeader>Loại thiết bị</TableHeader>
                  <TableHeader>Trạng thái</TableHeader>
                  {selectedVlanId && (
                    <TableHeaderRight>Thao tác</TableHeaderRight>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {ipsLoading ? (
                  <tr>
                    <td colSpan={selectedVlanId ? 8 : 7}>
                      <LoadingItem />
                    </td>
                  </tr>
                ) : filteredIps.length === 0 ? (
                  <tr>
                    <td colSpan={selectedVlanId ? 8 : 7}>
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Network className="h-10 w-10 mb-2 text-slate-300" />
                        <p className="text-sm">
                          Không tìm thấy địa chỉ IP nào
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredIps.map((ip) => (
                    <tr key={ip.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-bold text-indigo-600">
                          {ip.host}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-600">
                          {ip.vlanId}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-700">
                        {ip.deviceType || '—'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {ip.employee?.employeeCode ? (
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-mono font-semibold bg-slate-50 text-slate-700 border border-slate-100">
                            {ip.employee.employeeCode}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-600 font-medium">
                        {ip.employee?.firstName || '—'}{' '}
                        {ip.employee?.lastName || ''}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <DeviceTypeBadge type={ip.deviceType} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <LocalStatusBadge status={ip.status} />
                      </td>
                      {selectedVlanId && (
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditIp(ip)}
                              className="rounded-lg p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteIp(ip)}
                              className="rounded-lg p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <VlanModal
        isOpen={vlanModalOpen}
        onClose={() => {
          setVlanModalOpen(false)
          setSelectedVlanData(null)
        }}
        onSubmit={handleVlanSubmit}
        mode={vlanMode}
        data={selectedVlanData}
      />
      <IpModal
        isOpen={ipModalOpen}
        onClose={() => {
          setIpModalOpen(false)
          setSelectedIpData(null)
        }}
        onSubmit={handleIpSubmit}
        mode={ipMode}
        data={selectedIpData}
        vlanId={selectedVlanId}
      />
    </div>
  )
}
