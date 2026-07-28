import { useEffect, useRef, useState } from 'react'
import { ChevronDown, User, Bell, Menu, KeyRound, LogOut } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectUser } from '@/redux/selectors/authSelectors'
import { logoutThunk } from '@/redux/slice/authSlice'
import { toast } from 'react-toastify'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { authAPI } from '@/api/auth'

function stringToColor(str) {
  if (!str) return 'hsl(220, 60%, 55%)'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 55%, 50%)`
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function Header({ collapsed: _collapsed, setCollapsed: _setCollapsed }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let active = true
    authAPI.getProfile()
      .then((res) => {
        if (active && res?.success) {
          setProfile(res.data)
        }
      })
      .catch((err) => console.error('Failed to load profile in header:', err))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      setOpen(false)
      await dispatch(logoutThunk()).unwrap()
      toast.success('Đăng xuất thành công!')
      navigate('/auth/login')
    } catch {
      toast.error('Đăng xuất thất bại!')
    }
  }

  const avatarUrl = profile?.avatar || profile?.employee?.avatar || user?.avatar
  const lastName = profile?.employee?.lastName || ''
  const firstName = profile?.employee?.firstName || ''
  const accountName = profile?.accountName || user?.username || user?.email || user?.accountName || 'Admin'
  const displayName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : accountName
  const roleNames = profile?.accountRoles
    ? profile.accountRoles.map((ar) => ar.role?.roleName || ar.role?.roleCode).filter(Boolean).join(', ')
    : 'Quản trị hệ thống'
  const initials = getInitials(displayName)
  const avatarColor = stringToColor(displayName)

  return (
    <header className="header header-white sticky top-0 z-20 h-[70px]">
      <div className="mx-auto flex h-full items-center justify-between px-6">
        {/* Dynamic Breadcrumb Route Display */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => _setCollapsed((v) => !v)}
            title={_collapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-slate-600"
          >
            <Menu size={20} />
          </button>
          <Breadcrumb />
        </div>

        {/* Right tools (Notifications, Profile) */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-slate-600"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="inline-flex items-center gap-2.5 rounded-xl hover:bg-slate-100/60 p-1.5 text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-50 active:scale-98"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white shadow-sm border border-white overflow-hidden bg-slate-100"
                style={{ backgroundColor: avatarUrl ? 'transparent' : avatarColor }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="hidden sm:block leading-tight">
                <div
                  className="text-sm font-semibold"
                  style={{ color: '#1e293b' }}
                >
                  {displayName}
                </div>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 ml-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              />
            </button>
            {open ? (
              <div
                role="menu"
                className="absolute right-0 mt-2.5 w-68 origin-top-right overflow-hidden rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-md p-1.5 shadow-xl ring-1 ring-black/5 z-30 animate-dropdown-enter"
              >
                {/* Profile summary header */}
                <div className="bg-slate-50/70 p-3 rounded-xl mb-1.5 flex items-center gap-3 border border-slate-100/50">
                  <div
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-base font-bold text-white shadow-sm border-2 border-white overflow-hidden bg-slate-100"
                    style={{ backgroundColor: avatarUrl ? 'transparent' : avatarColor }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-bold text-slate-800 truncate leading-snug">
                      {displayName}
                    </div>
                    <div className="text-xs text-slate-500 truncate mb-1">
                      {profile?.accountName || user?.accountName || 'admin'}
                    </div>
                    <span className="inline-block text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/40 truncate max-w-full">
                      {roleNames}
                    </span>
                  </div>
                </div>

                {/* Profile actions */}
                <button
                  type="button"
                  role="menuitem"
                  className="group flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left cursor-pointer transition-all duration-150 hover:bg-slate-50"
                  onClick={() => {
                    setOpen(false)
                    navigate('/profile')
                  }}
                >
                  <div className="mt-0.5 rounded-lg p-1.5 text-indigo-600 bg-indigo-50/50 group-hover:bg-indigo-100/50 transition-colors">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">Hồ sơ cá nhân</div>
                    <div className="text-[11px] text-slate-400 group-hover:text-slate-500 transition-colors leading-tight">Cập nhật thông tin & ảnh đại diện</div>
                  </div>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="group flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left cursor-pointer transition-all duration-150 hover:bg-slate-50"
                  onClick={() => {
                    setOpen(false)
                    navigate('/profile', { state: { activeTab: 'password' } })
                  }}
                >
                  <div className="mt-0.5 rounded-lg p-1.5 text-amber-500 bg-amber-50/50 group-hover:bg-amber-100/50 transition-colors">
                    <KeyRound size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">Đổi mật khẩu</div>
                    <div className="text-[11px] text-slate-400 group-hover:text-slate-500 transition-colors leading-tight">Thay đổi mật khẩu tài khoản</div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  role="menuitem"
                  className="group flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left cursor-pointer transition-all duration-150 hover:bg-rose-50/70"
                  onClick={handleLogout}
                >
                  <div className="mt-0.5 rounded-lg p-1.5 text-rose-500 bg-rose-50/50 group-hover:bg-rose-100/50 transition-colors">
                    <LogOut size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">Đăng xuất</div>
                    <div className="text-[11px] text-slate-400 group-hover:text-rose-400 transition-colors leading-tight">Thoát khỏi phiên làm việc an toàn</div>
                  </div>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
