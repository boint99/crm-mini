import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV_GROUPS } from "@/utils/menuConfig";

/* ── Flyout Portal ──────────────────────────────────── */
function Flyout({ anchorEl, item, onClose }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    setPos({ top: rect.top, left: rect.right + 6 });
  }, [anchorEl]);

  useEffect(() => {
    const handler = (e) => {
      if (anchorEl?.contains(e.target)) return;
      if (document.getElementById("sidebar-flyout")?.contains(e.target)) return;
      onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [anchorEl, onClose]);

  return createPortal(
    <div
      id="sidebar-flyout"
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
      className="w-44 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl"
      onMouseLeave={onClose}
    >
      <p className="px-3 pb-1 pt-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
        {item.label}
      </p>
      {item.children.map((child) => (
        <NavLink
          key={child.id}
          to={child.path}
          onClick={onClose}
          className={({ isActive }) =>
            [
              "flex items-center gap-2 mx-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors",
              isActive ? "text-primary font-bold bg-blue-50" : "text-slate-600 hover:bg-slate-100",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              <child.icon size={13} className={isActive ? "text-primary" : "text-slate-400"} strokeWidth={1.8} />
              {child.label}
            </>
          )}
        </NavLink>
      ))}
    </div>,
    document.body
  );
}

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
          isActive ? "text-primary font-bold bg-blue-50" : "text-slate-700 hover:bg-slate-100 font-normal",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={16} className={`flex-shrink-0 ${isActive ? "text-primary" : "text-slate-500"}`} strokeWidth={1.8} />
          {!collapsed && <span>{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

/* ── NavGroup collapsed (flyout on hover) ───────────── */
function NavGroupCollapsed({ item }) {
  const btnRef = useRef(null);
  const [showFlyout, setShowFlyout] = useState(false);
  const location = useLocation();
  const isChildActive = item.children?.some((c) => location.pathname.startsWith(c.path));
  const Icon = item.icon;

  return (
    <li>
      <button
        ref={btnRef}
        type="button"
        title={item.label}
        onMouseEnter={() => setShowFlyout(true)}
        onMouseLeave={(e) => {
          const flyout = document.getElementById("sidebar-flyout");
          if (!flyout?.contains(e.relatedTarget)) setShowFlyout(false);
        }}
        className={[
          "flex w-full items-center justify-center px-3 py-2 rounded-lg text-sm transition-colors",
          isChildActive ? "text-primary bg-blue-50" : "text-slate-700 hover:bg-slate-100",
        ].join(" ")}
      >
        <Icon size={16} className={`flex-shrink-0 ${isChildActive ? "text-primary" : "text-slate-500"}`} strokeWidth={1.8} />
      </button>
      {showFlyout && (
        <Flyout anchorEl={btnRef.current} item={item} onClose={() => setShowFlyout(false)} />
      )}
    </li>
  );
}

/* ── NavGroup expanded (accordion) ─────────────────── */
function NavGroupItem({ item, openId, setOpenId }) {
  const location = useLocation();
  const isChildActive = item.children?.some((c) => location.pathname.startsWith(c.path));
  const open = openId === item.id;
  const Icon = item.icon;

  useEffect(() => {
    if (isChildActive) setOpenId(item.id);
  }, [location.pathname, isChildActive]);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpenId(open ? null : item.id)}
        className={[
          "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
          open || isChildActive ? "text-primary bg-blue-50" : "text-slate-700 hover:bg-slate-100",
        ].join(" ")}
      >
        <Icon size={16} className={`flex-shrink-0 ${open || isChildActive ? "text-primary" : "text-slate-500"}`} strokeWidth={1.8} />
        <span className="flex-1 text-left font-normal">{item.label}</span>
        <ChevronDown
          size={14}
          className={["text-slate-400 transition-transform duration-500 ease-in-out", open ? "rotate-180" : ""].join(" ")}
        />
      </button>

      <div className={["overflow-hidden transition-all duration-500 ease-in-out", open ? "max-h-96" : "max-h-0"].join(" ")}>
        <ul className="ml-6 mt-0.5 space-y-0.5 border-l border-slate-100 pl-3">
          {item.children.map((child) => (
            <li key={child.id}>
              <NavLink
                to={child.path}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-sm transition-colors",
                    isActive ? "text-primary font-bold" : "text-slate-600 hover:text-primary font-normal",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <child.icon size={14} className={isActive ? "text-primary" : "text-slate-400"} strokeWidth={1.8} />
                    {child.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

/* ── Sidebar ────────────────────────────────────────── */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openId, setOpenId] = useState(null);

  return (
    <aside
      className={[
        "flex h-screen flex-shrink-0 flex-col border-r border-slate-200 bg-white overflow-y-auto transition-[width] duration-200",
        collapsed ? "w-[60px]" : "w-64",
      ].join(" ")}
    >
      {/* Logo + toggle */}
      <div className="relative flex items-center justify-center py-5 px-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-6 w-6 flex-shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" strokeOpacity="0.5" />
            </svg>
            <span className="text-lg font-bold tracking-widest text-primary uppercase">CRM</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="absolute right-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors"
          title={collapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-2 pb-6 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-primary">
                {group.group}
              </p>
            )}
            {collapsed && <div className="my-1 border-t border-slate-100" />}
            <ul className="space-y-0.5">
              {group.items.map((item) =>
                item.children ? (
                  collapsed
                    ? <NavGroupCollapsed key={item.id} item={item} />
                    : <NavGroupItem key={item.id} item={item} openId={openId} setOpenId={setOpenId} />
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
  );
}
