import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/hook/useAppDispatch'
import { getEmployees, selectEmployees } from '@/redux/slice/employeesSlice'
import { getAccounts, selectAccounts } from '@/redux/slice/accountsSlice'
import { getVlans, selectVlans } from '@/redux/slice/vlansSlice'
import { getIps, selectIps } from '@/redux/slice/ipsSlice'
import {
  Users,
  KeyRound,
  Network,
  Layers,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Sparkles,
  Server,
  Monitor,
  Laptop
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts'

export default function Dashboard() {
  const navigate = useNavigate()
  const dispatchAsync = useAppDispatch()

  const employees = useSelector(selectEmployees)
  const accounts = useSelector(selectAccounts)
  const vlans = useSelector(selectVlans)
  const ips = useSelector(selectIps)

  const [dateRange] = useState('May 12 - Jun 12, 2026')

  useEffect(() => {
    dispatchAsync(getEmployees())
    dispatchAsync(getAccounts())
    dispatchAsync(getVlans())
    dispatchAsync(getIps())
  }, [dispatchAsync])

  // Mock data cho Line Chart (Monthly Overviews)
  const lineChartData = [
    { name: 'Jan', Activity: 400 },
    { name: 'Feb', Activity: 300 },
    { name: 'Mar', Activity: 600 },
    { name: 'Apr', Activity: 500 },
    { name: 'May', Activity: 700 },
    { name: 'Jun', Activity: 1256 },
    { name: 'Jul', Activity: 900 },
    { name: 'Aug', Activity: 850 },
    { name: 'Sep', Activity: 1100 },
    { name: 'Oct', Activity: 1300 },
    { name: 'Nov', Activity: 1200 },
    { name: 'Dec', Activity: 1400 }
  ]

  // Donut chart data đại diện cho các VLAN Categories
  const donutColors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899']
  const donutData = [
    { name: 'Hệ thống (System)', value: 45 },
    { name: 'Văn phòng (Office)', value: 30 },
    { name: 'Kỹ thuật (Tech)', value: 15 },
    { name: 'Khách (Guest)', value: 8 },
    { name: 'Bảo mật (Secure)', value: 2 }
  ]

  // Hoạt động gần đây
  const recentActivities = [
    {
      id: 1,
      type: 'account',
      title: 'Đã tạo tài khoản mới cho Aarav Sharma',
      desc: 'Bởi Admin Hệ Thống',
      time: '10 phút trước',
      iconBg: 'bg-blue-50 text-blue-600',
      icon: Users
    },
    {
      id: 2,
      type: 'vlan',
      title: 'Đã cấp dải IP mới cho VLAN Phòng Lab',
      desc: 'Bởi kỹ sư hạ tầng Nguyễn Văn A',
      time: '25 phút trước',
      iconBg: 'bg-emerald-50 text-emerald-600',
      icon: Network
    },
    {
      id: 3,
      type: 'system',
      title: 'Cập nhật chứng chỉ SSL máy chủ AD',
      desc: 'Bởi hệ thống tự động',
      time: '1 giờ trước',
      iconBg: 'bg-purple-50 text-purple-600',
      icon: Server
    },
    {
      id: 4,
      type: 'ip',
      title: 'Xung đột IP được phát hiện & tự động xử lý',
      desc: 'VLAN 10 - Host 192.168.1.15',
      time: '2 giờ trước',
      iconBg: 'bg-amber-50 text-amber-600',
      icon: Layers
    }
  ]

  // Bảng phân bổ IP theo chi nhánh
  const branchesPopularity = [
    { name: 'Chi Nhánh Hà Nội', percentage: 72, color: 'bg-indigo-600' },
    { name: 'Chi Nhánh Hồ Chi Minh', percentage: 58, color: 'bg-purple-600' },
    { name: 'Chi Nhánh Đà Nẵng', percentage: 46, color: 'bg-emerald-600' },
    { name: 'Trung Tâm Kỹ Thuật Viettel', percentage: 34, color: 'bg-blue-600' },
    { name: 'Văn Phòng Hải Phòng', percentage: 28, color: 'bg-pink-600' }
  ]

  return (
    <div className="space-y-8">
      {/* Dashboard Top Title with Date Range Select */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            {'Welcome back! Here\'s what\'s happening with your network & IT infrastructure today.'}
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
          <Calendar size={16} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">{dateRange}</span>
        </div>
      </div>

      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: TOTAL EMPLOYEES */}
        <div className="relative overflow-hidden bg-blue-50/50 border border-blue-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-blue-600/80 uppercase tracking-wider">Total Employees</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2 font-mono">{employees.length || 0}</h3>
              <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
                <TrendingUp size={14} />
                <span>+12.5%</span>
                <span className="text-slate-400 font-normal ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-600 text-white shadow-sm">
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Card 2: SYSTEM ACCOUNTS */}
        <div className="relative overflow-hidden bg-purple-50/50 border border-purple-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-purple-600/80 uppercase tracking-wider">Active Accounts</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2 font-mono">{accounts.length || 0}</h3>
              <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
                <TrendingUp size={14} />
                <span>+8.4%</span>
                <span className="text-slate-400 font-normal ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-600 text-white shadow-sm">
              <KeyRound size={20} />
            </div>
          </div>
        </div>

        {/* Card 3: VLANs */}
        <div className="relative overflow-hidden bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-wider">VLANs Configured</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2 font-mono">{vlans.length || 5}</h3>
              <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
                <TrendingUp size={14} />
                <span>+15.3%</span>
                <span className="text-slate-400 font-normal ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-600 text-white shadow-sm">
              <Network size={20} />
            </div>
          </div>
        </div>

        {/* Card 4: IPs ASSIGNED */}
        <div className="relative overflow-hidden bg-amber-50/50 border border-amber-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-amber-600/80 uppercase tracking-wider">IPs Allocated</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2 font-mono">{ips.length || 42}</h3>
              <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-rose-600">
                <TrendingDown size={14} />
                <span>-5.6%</span>
                <span className="text-slate-400 font-normal ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-500 text-white shadow-sm">
              <Layers size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Activity Line Chart */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Monthly Network Activity</h3>
              <p className="text-xs text-slate-400">Activity and incident requests</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-600">This Year</span>
          </div>

          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height={240} initialDimension={{ width: 300, height: 240 }}>
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="Activity"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut chart for VLAN distribution */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-base font-bold text-slate-800">VLAN Segments</h3>
            <p className="text-xs text-slate-400">Total configured endpoints</p>
          </div>

          <div className="h-40 flex items-center justify-center my-4 relative min-w-0">
            <ResponsiveContainer width="100%" height={160} initialDimension={{ width: 200, height: 160 }}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total</span>
              <span className="text-xl font-black text-slate-850 font-mono">100%</span>
            </div>
          </div>

          <div className="space-y-1.5 text-left text-xs font-semibold text-slate-650">
            {donutData.map((d, i) => (
              <div key={d.name} className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: donutColors[i] }} />
                  <span className="truncate max-w-[140px] text-slate-600">{d.name}</span>
                </div>
                <span className="text-slate-400 font-mono">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Branch Popularity/Usage Bar List */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-800">IP Popularity</h3>
            <p className="text-xs text-slate-400">VLAN allocation by branch</p>
          </div>

          <div className="mt-6 space-y-4 text-left">
            {branchesPopularity.map((b) => (
              <div key={b.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-650 truncate max-w-[170px]">{b.name}</span>
                  <span className="text-slate-400 font-mono">{b.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Assignments Table + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table: Recent IP Allocations */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent IP Assignments</h3>
              <p className="text-xs text-slate-400">Newly connected workstation IP addresses</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer flex items-center gap-0.5" onClick={() => navigate('/network-management')}>
              View All IPs <ArrowUpRight size={14} />
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-450 uppercase font-bold tracking-wider">
                  <th className="py-3 px-2">IP HOST</th>
                  <th className="py-3 px-2">EMPLOYEE</th>
                  <th className="py-3 px-2">DEVICE TYPE</th>
                  <th className="py-3 px-2">VLAN</th>
                  <th className="py-3 px-2">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                {ips.slice(0, 5).map((ip, index) => (
                  <tr key={ip.id || index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-2 font-mono text-indigo-600">{ip.host || '192.168.1.10'}</td>
                    <td className="py-3.5 px-2">{ip.employee?.lastName ? `${ip.employee.firstName} ${ip.employee.lastName}` : 'Chưa gán'}</td>
                    <td className="py-3.5 px-2">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 py-0.5 px-2 rounded-full font-medium">
                        {ip.deviceType || 'PC / Laptop'}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-mono text-slate-500">{ip.vlan?.vlanName || 'Default'}</td>
                    <td className="py-3.5 px-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ip.status === 'ACTIVE'
                          ? 'text-emerald-700 bg-emerald-50'
                          : ip.status === 'ASSIGNED'
                            ? 'text-blue-700 bg-blue-50'
                            : 'text-slate-600 bg-slate-100'
                      }`}>
                        {ip.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(ips.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Chưa có dải IP nào được thiết lập hoặc kết nối.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Activity</h3>
            <p className="text-xs text-slate-400">Audit logs & network alerts</p>

            <div className="mt-6 space-y-5 text-left">
              {recentActivities.map((act) => {
                const IconComponent = act.icon
                return (
                  <div key={act.id} className="flex gap-3">
                    <div className={`p-2.5 rounded-xl ${act.iconBg} self-start shrink-0`}>
                      <IconComponent size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{act.title}</h4>
                      <p className="text-[11px] text-slate-400">{act.desc}</p>
                      <span className="text-[10px] text-slate-350 block pt-0.5 font-medium">{act.time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <span className="text-xs font-bold text-indigo-600 hover:text-indigo-750 hover:underline cursor-pointer text-center block pt-4 border-t border-slate-50 mt-4">
            View All Activity
          </span>
        </div>
      </div>
    </div>
  )
}
