import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/hook/useAppDispatch'
import { getEmployees, selectEmployees } from '@/redux/slice/employeesSlice'
import { getAccounts, selectAccounts } from '@/redux/slice/accountsSlice'
import {
  Settings,
  Hammer,
  Users,
  Network,
  Trash2,
  Lightbulb,
  CheckCircle2,
  Send,
  Sparkles,
  Layers,
  ArrowUpRight,
  Wrench,
  TrendingUp
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const dispatchAsync = useAppDispatch()

  const employees = useSelector(selectEmployees)
  const accounts = useSelector(selectAccounts)

  const [suggestion, setSuggestion] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [progressVal, setProgressVal] = useState(0)

  useEffect(() => {
    dispatchAsync(getEmployees())
    dispatchAsync(getAccounts())
  }, [dispatchAsync])

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressVal(72)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const handleSuggestionSubmit = (e) => {
    e.preventDefault()
    if (!suggestion.trim()) return
    setSubmitted(true)
    setTimeout(() => {
      setSuggestion('')
      setSubmitted(false)
    }, 3500)
  }

  const stats = [
    {
      label: 'Nhân viên hoạt động',
      value: employees.length || 0,
      sub: 'Hồ sơ & phòng ban hoạt động',
      color: 'from-blue-500 to-indigo-500',
      icon: Users,
      path: '/organizations/employees',
      glow: 'rgba(59, 130, 246, 0.05)'
    },
    {
      label: 'Tài khoản hệ thống',
      value: accounts.length || 0,
      sub: 'Danh sách tài khoản & vai trò',
      color: 'from-purple-500 to-pink-500',
      icon: CheckCircle2,
      path: '/accounts',
      glow: 'rgba(168, 85, 247, 0.05)'
    }
  ]

  const comingSoonFeatures = [
    {
      title: 'Phân tích & Thống kê HR',
      desc: 'Trực quan hóa biến động nhân sự, tỷ lệ phân bổ nhân viên theo phòng ban và vị trí bằng các biểu đồ nâng cao.',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      glow: 'rgba(59, 130, 246, 0.05)',
      status: 'in-progress',
      statusLabel: 'Đang phát triển',
      percentage: 78
    },
    {
      title: 'Bản đồ dải IP & VLAN',
      desc: 'Bản đồ hóa hạ tầng mạng, phát hiện xung đột IP, theo dõi VLAN động và cấu hình dải IP tự động.',
      icon: Network,
      color: 'from-purple-500 to-pink-500',
      glow: 'rgba(168, 85, 247, 0.05)',
      status: 'in-progress',
      statusLabel: 'Đang thiết kế',
      percentage: 45
    },
    {
      title: 'Quy trình Bàn giao & Thu hồi',
      desc: 'Tự động hóa luồng offboarding, kiểm soát và xác nhận việc thu hồi IP, tài khoản hệ thống của nhân viên rời đi.',
      icon: Trash2,
      color: 'from-amber-500 to-orange-500',
      glow: 'rgba(245, 158, 11, 0.05)',
      status: 'planned',
      statusLabel: 'Đang lên kế hoạch',
      percentage: 10
    }
  ]

  const filteredFeatures = comingSoonFeatures.filter((feat) => {
    if (activeTab === 'all') return true
    return feat.status === activeTab
  })

  return (
    <div className="relative min-h-[82vh] flex flex-col justify-between px-6 py-8 overflow-hidden rounded-3xl bg-white border border-gray-200/80 shadow-sm">
      {/* Light Neon Glow Background Ornaments */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-100/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-100/30 blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-1/3 w-64 h-64 rounded-full bg-blue-100/30 blur-[90px] pointer-events-none" />

      {/* Main Panel Content */}
      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col space-y-12">
        
        {/* Upper Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Headline & Progress Box */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 uppercase">
              <Sparkles size={12} className="animate-pulse" /> Phiên bản Beta 1.2
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
              Hạ Tầng Hiện Đại <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Đang Được Thiết Kế
              </span>
            </h1>
            <p className="text-base text-slate-600 max-w-lg leading-relaxed">
              Trang Dashboard tổng quan đang được phát triển tích hợp biểu đồ số liệu nhân sự động và sơ đồ quản lý địa chỉ IP trực quan. 
              Các phân hệ quản trị cốt lõi hiện đã sẵn sàng phục vụ!
            </p>

            {/* Development Progress Indicator */}
            <div className="max-w-md p-5 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Wrench size={16} className="text-indigo-600 animate-pulse" /> Tiến độ hoàn thiện
                </span>
                <span className="text-indigo-600 font-mono">{progressVal}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200/65 border border-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progressVal}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Phase 1: Quản trị Core (Xong)</span>
                <span>Phase 2: Dashboard & IP (Đang làm)</span>
              </div>
            </div>
          </div>

          {/* Icon Rotating Gears Visual Box */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative flex items-center justify-center w-52 h-52 sm:w-64 sm:h-64 rounded-3xl bg-slate-50/50 border border-slate-200/70 shadow-inner group hover:border-slate-300 transition-colors duration-300">
              {/* Outer Gear */}
              <div className="absolute animate-spin" style={{ animationDuration: '16s' }}>
                <Settings size={120} className="text-indigo-600/5 sm:w-[150px] sm:h-[150px]" />
              </div>
              {/* Center Gear */}
              <div className="absolute animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}>
                <Settings size={80} className="text-purple-600/10 sm:w-[100px] sm:h-[100px]" />
              </div>
              {/* Core Icon */}
              <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-white border border-indigo-100 shadow-md">
                <Hammer size={40} className="text-indigo-600 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              
              <div className="absolute bottom-4 flex items-center gap-1 text-[11px] font-bold tracking-widest text-indigo-600 uppercase">
                <TrendingUp size={12} /> Under Construction
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Quick Shortcut Stats */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 text-left flex items-center gap-2">
            <Layers size={18} className="text-indigo-600" /> Các phân hệ hoạt động
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat) => {
              const IconComp = stat.icon
              return (
                <div
                  key={stat.label}
                  onClick={() => navigate(stat.path)}
                  className="relative overflow-hidden rounded-2xl bg-white hover:bg-slate-50/40 border border-gray-200/80 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 cursor-pointer p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 text-left">
                      <p className="text-sm font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
                        {stat.label}
                      </p>
                      <h3 className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                        {stat.value}
                      </h3>
                      <p className="text-xs text-slate-400">{stat.sub}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-md`}>
                      <IconComp size={24} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    Truy cập quản lý <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Timeline Roadmap & Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          
          {/* Upcoming Roadmap section */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Lightbulb size={18} className="text-indigo-600" /> Kế hoạch phát triển
              </h2>
              {/* Category Filter Tabs */}
              <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200/60 self-start sm:self-auto">
                {['all', 'in-progress', 'planned'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer capitalize ${
                      activeTab === tab
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab === 'all' ? 'Tất cả' : tab === 'in-progress' ? 'Đang làm' : 'Sắp tới'}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Features */}
            <div className="space-y-4">
              {filteredFeatures.map((feat) => {
                const IconComponent = feat.icon
                return (
                  <div
                    key={feat.title}
                    className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition-all duration-300 p-5 flex gap-4"
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feat.color} text-white shadow-sm self-start shrink-0`}>
                      <IconComponent size={18} />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-base font-bold text-slate-800">
                          {feat.title}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            feat.status === 'in-progress'
                              ? 'text-indigo-600 bg-indigo-50 border-indigo-100'
                              : 'text-amber-700 bg-amber-50 border-amber-100'
                          }`}
                        >
                          {feat.statusLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {feat.desc}
                      </p>
                      {/* Mini Progress */}
                      <div className="pt-1 flex items-center gap-3">
                        <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${feat.color}`}
                            style={{ width: `${feat.percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          {feat.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Interactive Suggestion Feedback Widget */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm h-full flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                    <Lightbulb size={20} />
                  </span>
                  <h3 className="text-lg font-bold text-slate-800">Đóng Góp Ý Tưởng</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bạn mong muốn hệ thống CRM có thêm tính năng nào khác? 
                  Hãy gửi đề xuất cho ban phát triển để chúng tôi tích hợp vào phiên bản tiếp theo.
                </p>
              </div>

              {submitted ? (
                <div className="my-8 flex flex-col items-center justify-center text-center space-y-3 py-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-550 border border-emerald-200 flex items-center justify-center text-emerald-600 animate-bounce">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-800">Đề xuất đã gửi thành công!</h4>
                  <p className="text-xs text-emerald-600 max-w-[200px]">
                    Cảm ơn bạn đã đóng góp ý tưởng xây dựng hệ thống.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSuggestionSubmit} className="space-y-4 mt-6">
                  <textarea
                    rows={4}
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    placeholder="VD: Cần thêm tính năng xuất báo cáo PDF cho danh sách nhân viên..."
                    className="w-full text-sm rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 text-slate-800 p-4 transition-all duration-200 resize-none outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!suggestion.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200"
                  >
                    Gửi đề xuất <Send size={14} />
                  </button>
                </form>
              )}

              <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                <Sparkles size={10} className="text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} /> Thiết kế bởi Antigravity
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
