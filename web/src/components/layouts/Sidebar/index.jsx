import { useState } from 'react'
import { NAV_GROUPS } from '@/utils/menuConfig'
import NavGroupItem from '@/components/navigate/NavGroupItem'
import NavItem from '@/components/navigate/NavItem'
import NavGroupCollapsed from '@/components/navigate/NavGroupCollapsed'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import logoImg from '@/assets/images/logo.png'

export default function Sidebar({ collapsed, setCollapsed }) {
  const [openId, setOpenId] = useState(null)

  return (
    <aside
      className={[
        'sidebar flex h-screen flex-shrink-0 flex-col overflow-y-auto overflow-x-hidden',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      ].join(' ')}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 ${collapsed ? 'justify-center' : ''}`}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm">
            <img src={logoImg} alt="IT-HELPDESK" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm">
              <img src={logoImg} alt="IT-HELPDESK" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[14px] font-extrabold text-slate-800 tracking-tight">
                IT-Helpdesk
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                System
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 pb-2 space-y-5 mt-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="sidebar-group-label">
                {group.group}
              </p>
            )}
            {collapsed && <div className="my-2 border-t border-slate-200/50" />}
            <ul className="space-y-0.5">
              {group.items.map((item) =>
                item.children ? (
                  collapsed ? (
                    <NavGroupCollapsed key={item.id} item={item} />
                  ) : (
                    <NavGroupItem
                      key={item.id}
                      item={item}
                      openId={openId}
                      setOpenId={setOpenId}
                    />
                  )
                ) : (
                  <li key={item.id}>
                    <NavItem item={item} collapsed={collapsed} />
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
