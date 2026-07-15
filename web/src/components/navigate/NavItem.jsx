import { NavLink } from 'react-router-dom'

/* ── NavItem (leaf) ─────────────────────────────────── */
function NavItem({ item, collapsed }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          'sidebar-nav-item',
          collapsed ? 'justify-center' : '',
          isActive ? 'active' : ''
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            className="flex-shrink-0"
            strokeWidth={1.8}
          />
          {!collapsed && <span>{item.label}</span>}
        </>
      )}
    </NavLink>
  )
}

export default NavItem
