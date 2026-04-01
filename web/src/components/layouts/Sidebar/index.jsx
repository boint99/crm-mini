import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, Settings, LayoutGrid } from "lucide-react";
import { NAV_ITEMS } from "@/utils/menuConfig";

/* ─── Sub‑components ──────────────────────────────────────── */

function NavIcon({ Icon, active, collapsed }) {
  return (
    <span
      className={[
        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-150",
        active
          ? "bg-primary text-white shadow-md shadow-indigo-200"
          : "text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700",
      ].join(" ")}
    >
      <Icon size={16} strokeWidth={2} />
    </span>
  );
}

/* Tooltip đơn giản — dùng cho item không có submenu */
function Tooltip({ label, children }) {
  return (
    <div className="relative flex items-center group/tip">
      {children}
      <div className="pointer-events-none absolute left-full ml-3 z-[9999] whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl opacity-0 -translate-x-1 scale-95 group-hover/tip:opacity-100 group-hover/tip:translate-x-0 group-hover/tip:scale-100 transition-all duration-150">
        {label}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
      </div>
    </div>
  );
}

/* Portal Flyout — render ra document.body để thoát overflow:hidden của aside */
function FlyoutPortal({ anchorRef, item, onClose }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function updatePos() {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.top, left: rect.right + 8 });
    }
    updatePos();
  }, [anchorRef]);

  useEffect(() => {
    function handler(e) {
      const flyout = document.getElementById("sidebar-flyout");
      if (anchorRef.current?.contains(e.target)) return;
      if (flyout?.contains(e.target)) return;
      onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [anchorRef, onClose]);

  return createPortal(
    <div
      id="sidebar-flyout"
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
      className="w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-2xl shadow-slate-300/60"
    >
      <p className="px-3 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {item.label}
      </p>
      {item.children.map((child) => (
        <NavLink
          key={child.path}
          to={child.path}
          onClick={onClose}
          className={({ isActive }) =>
            [
              "flex items-center gap-2 rounded-lg mx-1.5 px-2.5 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-primary text-white font-medium"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            ].join(" ")
          }
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
          {child.label}
        </NavLink>
      ))}
    </div>,
    document.body,
  );
}

/* ─── Sidebar ─────────────────────────────────────────────── */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openId, setOpenId] = useState(null);
  const location = useLocation();

  // Map item.id -> ref của button
  const anchorRefs = useRef({});
  const getAnchorRef = (id) => {
    if (!anchorRefs.current[id]) anchorRefs.current[id] = { current: null };
    return anchorRefs.current[id];
  };

  /* Tự mở submenu khi route khớp, đóng khi route không thuộc submenu nào */
  useEffect(() => {
    const parent =
      NAV_ITEMS.find((it) =>
        it.children?.some((c) => location.pathname.startsWith(c.path)),
      )?.id ?? null;
    setOpenId(parent);
  }, [location.pathname]);

  /* Đóng flyout khi sidebar mở rộng lại */
  useEffect(() => {
    if (!collapsed) setOpenId(null);
  }, [collapsed]);

  const toggleMenu = useCallback((id) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const closeMenu = useCallback(() => setOpenId(null), []);

  const isChildActive = (item) =>
    item.children?.some((c) => location.pathname.startsWith(c.path)) ?? false;

  /* Item mở flyout hiện tại */
  const flyoutItem = collapsed
    ? NAV_ITEMS.find((it) => it.id === openId && it.children)
    : null;

  return (
    <aside
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      className={[
        "relative flex h-screen flex-col border-r border-slate-200 bg-white",
        "transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[68px]" : "w-60",
      ].join(" ")}
    >
      {/* Portal flyout cho collapsed mode */}
      {flyoutItem && (
        <FlyoutPortal
          anchorRef={getAnchorRef(flyoutItem.id)}
          item={flyoutItem}
          onClose={closeMenu}
        />
      )}
      {/* ── Logo ── */}
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-100 px-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
          <LayoutGrid className="w-4 h-4" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-slate-800">
            CRM <span className="font-normal text-slate-400">Admin</span>
          </span>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {!collapsed && (
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Menu
          </p>
        )}

        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const hasChildren = !!item.children;
            const childActive = isChildActive(item);
            const isOpen = openId === item.id;

            /* ── Item có submenu ── */
            if (hasChildren) {
              return (
                <li key={item.id}>
                  {collapsed ? (
                    /* --- Collapsed: button gắn ref, flyout qua Portal --- */
                    <button
                      ref={(el) => {
                        getAnchorRef(item.id).current = el;
                      }}
                      type="button"
                      onClick={() => toggleMenu(item.id)}
                      className={[
                        "group flex w-full items-center justify-center rounded-xl p-1.5 transition-colors",
                        childActive || isOpen
                          ? "bg-indigo-50"
                          : "hover:bg-slate-100",
                      ].join(" ")}
                    >
                      <NavIcon
                        Icon={Icon}
                        active={childActive || isOpen}
                        collapsed
                      />
                    </button>
                  ) : (
                    /* --- Expanded: accordion --- */
                    <>
                      <button
                        type="button"
                        onClick={() => toggleMenu(item.id)}
                        className={[
                          "group flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm transition-colors",
                          childActive || isOpen
                            ? "bg-indigo-50 text-slate-800"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-800",
                        ].join(" ")}
                      >
                        <NavIcon Icon={Icon} active={childActive || isOpen} />
                        <span className="flex-1 truncate font-medium text-left">
                          {item.label}
                        </span>
                        <span
                          className={[
                            "transition-transform duration-200 text-slate-400",
                            isOpen ? "rotate-180" : "",
                          ].join(" ")}
                        >
                          <ChevronDown size={14} />
                        </span>
                      </button>

                      {/* Accordion children */}
                      <div
                        className={[
                          "overflow-hidden transition-all duration-200 ease-in-out",
                          isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0",
                        ].join(" ")}
                      >
                        <ul className="ml-10 mt-0.5 space-y-0.5 pb-1">
                          {item.children.map((child) => (
                            <li key={child.path}>
                              <NavLink
                                to={child.path}
                                className={({ isActive }) =>
                                  [
                                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors",
                                    isActive
                                      ? "bg-primary text-white font-medium shadow-sm shadow-indigo-200"
                                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                                  ].join(" ")
                                }
                              >
                                {({ isActive }) => (
                                  <>
                                    <span
                                      className={[
                                        "h-1.5 w-1.5 rounded-full flex-shrink-0",
                                        isActive ? "bg-white" : "bg-slate-300",
                                      ].join(" ")}
                                    />
                                    {child.label}
                                  </>
                                )}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </li>
              );
            }

            /* ── Item thường ── */
            return (
              <li key={item.id}>
                {collapsed ? (
                  <Tooltip label={item.label}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        [
                          "group flex w-full items-center justify-center rounded-xl p-1.5 transition-colors",
                          isActive ? "bg-indigo-50" : "hover:bg-slate-100",
                        ].join(" ")
                      }
                    >
                      {({ isActive }) => (
                        <NavIcon Icon={Icon} active={isActive} collapsed />
                      )}
                    </NavLink>
                  </Tooltip>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-2.5 rounded-xl px-2 py-1.5 font-medium transition-colors",
                        isActive
                          ? "bg-indigo-50 text-slate-800"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <NavIcon Icon={Icon} active={isActive} />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-slate-100 p-2.5">
        {collapsed ? (
          <Tooltip label="Cài đặt">
            <button
              type="button"
              className="group flex w-full items-center justify-center rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg group-hover:bg-slate-100">
                <Settings size={16} />
              </span>
            </button>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-700">
                Admin User
              </p>
              <p className="truncate text-[11px] text-slate-400">
                admin@crm.vn
              </p>
            </div>
            <Settings
              size={14}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* ── Toggle button ── */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Mở sidebar" : "Đóng sidebar"}
        className="
          absolute -right-3 top-[52px]
          flex h-6 w-6 items-center justify-center
          rounded-full border border-slate-200 bg-white
          text-slate-500 shadow-sm
          hover:bg-slate-50 hover:text-slate-700
          transition-colors cursor-pointer z-10
        "
      >
        <ChevronRight
          size={13}
          className={[
            "transition-transform duration-200",
            collapsed ? "" : "rotate-180",
          ].join(" ")}
        />
      </button>
    </aside>
  );
}
