import { NavLink } from "react-router-dom";

/* ── NavItem (leaf) ─────────────────────────────────── */
function NavItem({ item, collapsed }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
          collapsed ? "justify-center" : "",
          isActive
            ? "text-primary font-bold bg-blue-50"
            : "text-slate-700 hover:bg-slate-100 font-normal",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={16}
            className={`flex-shrink-0 ${isActive ? "text-primary" : "text-slate-500"}`}
            strokeWidth={1.8}
          />
          {!collapsed && <span>{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

export default NavItem;
