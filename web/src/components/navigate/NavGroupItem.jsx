import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

function NavGroupItem({ item, openId, setOpenId }) {
  const location = useLocation()
  const isChildActive = item.children?.some((c) =>
    location.pathname.startsWith(c.path)
  )
  const open = openId === item.id
  const Icon = item.icon

  useEffect(() => {
    if (isChildActive) setOpenId(item.id)
  }, [location.pathname, isChildActive])

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpenId(open ? null : item.id)}
        className={[
          'sidebar-nav-item w-full',
          open || isChildActive ? 'active' : ''
        ].join(' ')}
      >
        <Icon
          size={18}
          className="flex-shrink-0"
          strokeWidth={1.8}
        />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          size={14}
          className={[
            'transition-transform duration-300 ease-in-out opacity-60',
            open ? 'rotate-180' : ''
          ].join(' ')}
        />
      </button>

      <div
        className={[
          'overflow-hidden transition-all duration-300 ease-in-out',
          open ? 'max-h-96' : 'max-h-0'
        ].join(' ')}
      >
        <ul className="ml-4 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
          {item.children.map((child) => (
            <li key={child.id}>
              <NavLink
                to={child.path}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'text-indigo-600 font-semibold bg-indigo-50/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <child.icon
                      size={14}
                      className={isActive ? 'text-indigo-600' : 'text-slate-400'}
                      strokeWidth={1.8}
                    />
                    {child.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

export default NavGroupItem
