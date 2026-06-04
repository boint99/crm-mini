import { useState, useEffect, useMemo } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Layers,
  Users,
  Search,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useAppDispatch } from '@/hook/useAppDispatch'
import { getCompanies, selectCompanies } from '@/redux/slice/companiesSilce'
import { getBranches, selectBranches } from '@/redux/slice/branchesSlice'
import { getDepartments, selectDepartments } from '@/redux/slice/departmentsSlice'
import { getEmployees, selectEmployees } from '@/redux/slice/employeesSlice'
import { employeesAPI } from '@/api/employeesAPI'
import LoadingItem from '@/components/ui/LoadingItem'

const TreeNode = ({
  node,
  level = 0,
  onSelect,
  selectedId,
  expandedIds,
  toggleExpand
}) => {
  const isExpanded = expandedIds.has(node.id)
  const isSelected = selectedId === node.id
  const hasChildren = node.children && node.children.length > 0

  const getIcon = (type) => {
    switch (type) {
    case 'COMPANY':
      return <Building2 className="w-4 h-4 text-blue-600" />
    case 'DIVISION':
      return <Layers className="w-4 h-4 text-indigo-500" />
    default:
      return <Users className="w-4 h-4 text-slate-500" />
    }
  }

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 group ${
          isSelected
            ? 'bg-blue-50 text-blue-700 shadow-sm'
            : 'hover:bg-slate-100 text-slate-700'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        <div
          className="mr-1 p-1 hover:bg-white rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            toggleExpand(node.id)
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>
        <div className="mr-2">{getIcon(node.type)}</div>
        <span
          className={`text-sm font-medium truncate ${isSelected ? 'font-semibold' : ''}`}
        >
          {node.code} - {node.name}
        </span>
        <div className="ml-auto opacity-0 group-hover:opacity-100">
          <MoreVertical className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const Organization = () => {
  const dispatchAsync = useAppDispatch()

  const companies = useSelector(selectCompanies)
  const branches = useSelector(selectBranches)
  const departments = useSelector(selectDepartments)
  const employees = useSelector(selectEmployees)

  const companiesLoading = useSelector((state) => state.companies.loading)
  const branchesLoading = useSelector((state) => state.branches.loading)
  const departmentsLoading = useSelector((state) => state.departments.loading)
  const employeesLoading = useSelector((state) => state.employees.loading)
  const loading = companiesLoading || branchesLoading || departmentsLoading || employeesLoading

  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [selectedNode, setSelectedNode] = useState(null)
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [deptEmployees, setDeptEmployees] = useState([])
  const [deptEmployeesLoading, setDeptEmployeesLoading] = useState(false)

  // 1. Fetch companies, branches, employees once on mount
  useEffect(() => {
    dispatchAsync(getCompanies())
    dispatchAsync(getBranches())
    dispatchAsync(getEmployees())
  }, [dispatchAsync])

  // 2. Fetch departments tree when company or branch changes
  useEffect(() => {
    const params = { tree: '' }
    if (selectedCompanyId) params.companyid = selectedCompanyId
    if (selectedBranchId) params.branchid = selectedBranchId
    dispatchAsync(getDepartments(params))
  }, [dispatchAsync, selectedCompanyId, selectedBranchId])

  // 2b. Fetch employees of the selected node/department
  useEffect(() => {
    if (selectedNode && selectedNode.id) {
      setDeptEmployeesLoading(true)
      const params = {}
      if (selectedNode.type === 'COMPANY') {
        params.companyid = selectedNode.id
      } else {
        params.unitid = selectedNode.id
      }
      if (selectedBranchId) {
        params.branchid = selectedBranchId
      }
      employeesAPI.getLists(params)
        .then((res) => {
          setDeptEmployees(res.data || [])
        })
        .catch((err) => {
          console.error(err)
          setDeptEmployees([])
        })
        .finally(() => {
          setDeptEmployeesLoading(false)
        })
    } else {
      setDeptEmployees([])
    }
  }, [selectedNode, selectedBranchId])

  // 3. Process flat/tree backend response & map to frontend UI nodes (enriching with employee counts)
  const treeData = useMemo(() => {
    // Count employees per unit
    const empCountByUnit = {}
    employees.forEach((emp) => {
      const uid = emp.orgUnit?.id || emp.unitId
      if (uid) {
        empCountByUnit[uid] = (empCountByUnit[uid] || 0) + 1
      }
    })

    // Recursive function to map nodes & compute total employees
    const enrichTreeWithStats = (nodes) => {
      if (!Array.isArray(nodes)) return []
      return nodes.map((node) => {
        const children = node.children ? enrichTreeWithStats(node.children) : []
        const directEmployees = empCountByUnit[node.id] || 0
        const totalEmployees = directEmployees + children.reduce((sum, child) => sum + (child.totalEmployees || 0), 0)

        return {
          id: node.id,
          name: node.unitName || node.name || '',
          code: node.orgUnitCode || node.code || 'ORG',
          type: node.unitType || node.type || 'ORG_UNIT',
          manager: node.manager || 'Trưởng bộ phận',
          totalEmployees,
          children
        }
      })
    }

    const enrichedDeps = enrichTreeWithStats(departments)

    const selectedCompany = companies.find(c => c.id === selectedCompanyId)
    if (selectedCompany) {
      const totalEmp = enrichedDeps.reduce((sum, child) => sum + (child.totalEmployees || 0), 0)
      return [
        {
          id: selectedCompany.id,
          name: selectedCompany.companyName,
          code: 'COMPANY',
          type: 'COMPANY',
          manager: 'Giám đốc',
          totalEmployees: totalEmp,
          children: enrichedDeps
        }
      ]
    }

    return enrichedDeps
  }, [companies, departments, employees, selectedCompanyId])

  // 4. Filter tree by searchQuery
  const filteredTreeData = useMemo(() => {
    if (!searchQuery.trim()) return treeData

    const filterTree = (nodes, query) => {
      const lowerQuery = query.toLowerCase()
      return nodes
        .map((node) => {
          const nameMatches = node.name?.toLowerCase().includes(lowerQuery)
          const codeMatches = node.code?.toLowerCase().includes(lowerQuery)

          if (node.children && node.children.length > 0) {
            const filteredChildren = filterTree(node.children, query)
            if (filteredChildren.length > 0 || nameMatches || codeMatches) {
              return { ...node, children: filteredChildren }
            }
          }

          if (nameMatches || codeMatches) {
            return { ...node, children: [] }
          }

          return null
        })
        .filter(Boolean)
    }

    return filterTree(treeData, searchQuery.trim())
  }, [treeData, searchQuery])

  // 5. Auto expand top level nodes when tree data changes
  useEffect(() => {
    if (filteredTreeData.length > 0) {
      setExpandedIds((prev) => {
        if (prev.size > 0) return prev
        return new Set(filteredTreeData.map((node) => node.id))
      })
    }
  }, [filteredTreeData])

  // 6. Dynamic layout adjustments for MainLayout wrapper to prevent page-level scrollbars
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
      layoutMain.style.height = '100%'
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

  const toggleExpand = (id) => {
    const next = new Set(expandedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedIds(next)
  }

  const expandAll = () => {
    const ids = new Set()
    const traverse = (node) => {
      ids.add(node.id)
      if (node.children) node.children.forEach(traverse)
    }
    filteredTreeData.forEach(traverse)
    setExpandedIds(ids)
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  const handleRefresh = () => {
    dispatchAsync(getCompanies())
    dispatchAsync(getBranches())
    dispatchAsync(getEmployees())

    const params = { tree: '' }
    if (selectedCompanyId) params.companyid = selectedCompanyId
    if (selectedBranchId) params.branchid = selectedBranchId
    dispatchAsync(getDepartments(params))

    if (selectedNode && selectedNode.id) {
      setDeptEmployeesLoading(true)
      const params = {}
      if (selectedNode.type === 'COMPANY') {
        params.companyid = selectedNode.id
      } else {
        params.unitid = selectedNode.id
      }
      if (selectedBranchId) {
        params.branchid = selectedBranchId
      }
      employeesAPI.getLists(params)
        .then((res) => {
          setDeptEmployees(res.data || [])
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(() => {
          setDeptEmployeesLoading(false)
        })
    }
  }

  return (
    <div className="flex h-full bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - Org Tree */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Cơ cấu tổ chức</h2>
            <div className="flex gap-1">
              <button
                onClick={expandAll}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Mở rộng tất cả"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={collapseAll}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Thu gọn tất cả"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Company & Branch Select Filters */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Công ty
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value)
                  setSelectedBranchId('')
                }}
                className="w-full bg-slate-100 border-none rounded-lg text-sm px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="">-- Tất cả --</option>
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Chi nhánh
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-lg text-sm px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="">-- Tất cả chi nhánh --</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm phòng ban..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {loading ? (
            <LoadingItem />
          ) : (
            filteredTreeData.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                onSelect={setSelectedNode}
                selectedId={selectedNode?.id}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
              />
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center w-full gap-2 py-2 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm cursor-pointer"
          >
            Làm mới sơ đồ
          </button>
        </div>
      </div>

      {/* Main Content - Detail View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedNode ? (
          <div className="flex-1 overflow-y-auto p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header Detail */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">
                  <span>{selectedNode.type}</span>
                </nav>
                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                  {selectedNode.name}
                  <span className="text-sm font-normal px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                    {selectedNode.code}
                  </span>
                </h1>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Tổng nhân sự
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedNode.totalEmployees}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Layers className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Đơn vị trực thuộc
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedNode.children?.length || 0}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Loại hình
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedNode.type === 'COMPANY'
                      ? 'Công ty'
                      : selectedNode.type === 'DIVISION'
                        ? 'Khối'
                        : 'Phòng ban'}
                  </p>
                </div>
              </div>
            </div>

            {/* Info and Sub-units */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-6">
                    Thông tin lãnh đạo
                  </h3>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-200 rounded-full mb-4 flex items-center justify-center text-slate-500 text-2xl font-bold ring-4 ring-slate-50">
                      {selectedNode.manager.split(' ').pop()[0]}
                    </div>
                    <h4 className="font-bold text-lg text-slate-900">
                      {selectedNode.manager}
                    </h4>
                    <p className="text-sm text-slate-500 mb-6 font-medium">
                      Trưởng đơn vị / Quản lý
                    </p>
                    <div className="w-full space-y-3">
                      <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-600 transition-colors">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>
                          {selectedNode.code.toLowerCase()}@viettel.vn
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-600 transition-colors">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>+84 988 123 456</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-600 transition-colors">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>Tòa nhà Viettel, Hà Nội</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                {/* Danh sách nhân viên */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">
                      Danh sách nhân viên
                    </h3>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase">
                      {deptEmployees.length} nhân sự
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                          <th className="px-6 py-4">Mã NV</th>
                          <th className="px-6 py-4">Họ và tên</th>
                          <th className="px-6 py-4">Phòng ban</th>
                          <th className="px-6 py-4">Chi nhánh</th>
                          <th className="px-6 py-4">Chức vụ</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Số điện thoại</th>
                          <th className="px-6 py-4">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {deptEmployeesLoading ? (
                          <tr>
                            <td colSpan="8" className="px-6 py-8 text-center">
                              <div className="flex justify-center items-center gap-2 text-slate-500">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span>Đang tải danh sách nhân viên...</span>
                              </div>
                            </td>
                          </tr>
                        ) : deptEmployees.length > 0 ? (
                          deptEmployees.map((emp) => (
                            <tr
                              key={emp.id}
                              className="hover:bg-blue-50/10 transition-colors"
                            >
                              <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                {emp.employeeCode}
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                 {emp.firstName} {emp.lastName}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {emp.orgUnit?.unitName || '—'}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {emp.orgUnit?.branch?.branchName || '—'}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {emp.position?.positionName || 'Nhân viên'}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">
                                {emp.email || '—'}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">
                                {emp.phone || '—'}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  emp.status === 'ENABLE'
                                    ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                                    : 'bg-gray-50 text-gray-700 ring-1 ring-gray-500/20'
                                }`}>
                                  {emp.status === 'ENABLE' ? 'Hoạt động' : 'Tạm dừng'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="8"
                              className="px-6 py-12 text-center text-slate-400 italic"
                            >
                              Không có nhân viên trong đơn vị này
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white m-8 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
              <Layers className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Chào mừng bạn!
            </h2>
            <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
              Vui lòng chọn một đơn vị từ cây sơ đồ bên trái để xem thông tin
              chi tiết, nhân sự và cấu trúc tổ chức.
            </p>
            <div className="flex gap-4">
              {treeData.length > 0 && (
                <button
                  onClick={() => setSelectedNode(treeData[0])}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 cursor-pointer"
                >
                  Xem Công ty Tổng
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  )
}

export default Organization
