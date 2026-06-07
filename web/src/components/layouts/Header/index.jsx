import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectUser } from '@/redux/selectors/authSelectors'
import { logoutThunk } from '@/redux/slice/authSlice'
import { toast } from 'react-toastify'

function Header({ collapsed: _collapsed, setCollapsed: _setCollapsed }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }

    function onPointerDown(e) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target)) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
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

  const avatarLetter = user?.accountName
    ? user.accountName.charAt(0).toUpperCase()
    : 'A'

  return (
    <header className="header sticky top-0 z-20 h-[60px]">
      <div className="mx-auto flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="relative">
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification */}
          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer"
            aria-label="Notifications"
          >
          </button>

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="inline-flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-left transition-colors cursor-pointer"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
                {avatarLetter}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-slate-700">
                  {user?.accountName || 'Admin'}
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {open ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-lg z-30"
              >
                <div className="border-b border-slate-50 px-4 py-3">
                  <div className="text-sm font-semibold text-slate-800 truncate">
                    {user?.accountName || 'Admin'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Quản trị hệ thống</div>
                </div>
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
