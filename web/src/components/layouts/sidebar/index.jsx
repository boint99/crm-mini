import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Mail,
  Shield,
  Network,
  BriefcaseBusiness,
  KeyRound,
  MonitorSmartphone,
} from 'lucide-react'

const NavIcon = ({ children }) => (
  <span className="grid h-9 w-9 place-items-center rounded-lg bg-gray-50 text-gray-700 group-hover:bg-gray-100">
    {children}
  </span>
)

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  const items = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/',
    },
    {
      label: 'Quản lý người dùng',
      icon: <Users className="h-5 w-5" />,
      path: '/employees',
    },
    {
      label: 'Quản lý email',
      icon: <Mail className="h-5 w-5" />,
    },
    {
      label: 'IPs',
      icon: <Shield className="h-5 w-5" />,
    },
    {
      label: 'VLAN',
      icon: <Network className="h-5 w-5" />,
    },
    {
      label: 'Quản lý nhân viên OS',
      icon: <BriefcaseBusiness className="h-5 w-5" />,
    },
    {
      label: 'Quản lý tài khoản',
      icon: <KeyRound className="h-5 w-5" />,
    },
    {
      label: 'Tài khoản & thiết bị',
      icon: <MonitorSmartphone className="h-5 w-5" />,
    },
  ]

  return (
    <aside
      className={[
        'relative h-full bg-white shadow-sm border-r border-gray-200 flex flex-col',
        collapsed ? 'w-16' : 'w-64',
        'transition-[width] duration-200 ease-in-out',
      ].join(' ')}
    >
      <div className="px-3 pt-4">
        <div className={collapsed ? 'px-1' : 'px-1'}>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {collapsed ? 'CRM' : 'Menu'}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.label}>
              {it.path ? (
                <NavLink
                  to={it.path}
                  title={collapsed ? it.label : undefined}
                  className={({ isActive }) =>
                    [
                      'group flex items-center gap-3 rounded-xl px-2 py-2 text-sm',
                      isActive
                        ? 'bg-sidebar text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    ].join(' ')
                  }
                >
                  <NavIcon>{it.icon}</NavIcon>
                  {!collapsed ? <span className="truncate">{it.label}</span> : null}
                </NavLink>
              ) : (
                <button
                  type="button"
                  title={collapsed ? it.label : undefined}
                  className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left"
                >
                  <NavIcon>{it.icon}</NavIcon>
                  {!collapsed ? <span className="truncate">{it.label}</span> : null}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle button (on the right edge) */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer"
        aria-label={collapsed ? 'Mở sidebar' : 'Đóng sidebar'}
        title={collapsed ? 'Mở sidebar' : 'Đóng sidebar'}
      >
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={['h-4 w-4 transition-transform', collapsed ? 'rotate-180' : ''].join(' ')}
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.78 15.53a.75.75 0 0 1-1.06-.0l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 1 1 1.06 1.06L9.06 10l3.72 3.72a.75.75 0 0 1 0 1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </aside>
  )
}

export default Sidebar
