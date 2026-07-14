import { useEffect, useRef, useState } from 'react'
import { ChevronDown, User, Bell, Menu } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectUser } from '@/redux/selectors/authSelectors'
import { logoutThunk } from '@/redux/slice/authSlice'
import { toast } from 'react-toastify'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { authAPI } from '@/api/auth'

function stringToColor(str) {
  if (!str) return 'hsl(220, 60%, 55%)';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 50%)`;
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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

  const lastName = profile?.employee?.lastName || ''
  const firstName = profile?.employee?.firstName || ''
  const displayName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (user?.accountName || 'Admin')
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
            title={_collapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
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
              className="inline-flex items-center gap-3 rounded-xl hover:bg-slate-100/60 p-1.5 text-left transition-colors cursor-pointer"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <div
                className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white shadow-sm border border-white"
                style={{ backgroundColor: avatarColor }}
              >
                {initials}
              </div>
              <div className="hidden sm:block leading-tight">
                <div
                  className="text-sm font-semibold"
                  style={{ color: '#1e293b' }}
                >
                  {displayName}
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]" title={roleNames}>
                  {roleNames}
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 ml-1" />
            </button>

            {open ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-lg z-30"
              >
                <div className="border-b border-slate-50 px-4 py-3">
                  <div
                    className="text-sm font-semibold truncate"
                    style={{ color: '#1e293b' }}
                  >
                    {displayName}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate" title={roleNames}>
                    {roleNames}
                  </div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setOpen(false)
                    navigate('/profile')
                  }}
                >
                  <User size={16} />
                  Hồ sơ cá nhân
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                  onClick={handleLogout}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                    <path d="M21 3v18" />
                  </svg>
                  Đăng xuất
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
