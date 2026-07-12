import { useState } from "react";
import { NAV_GROUPS } from "@/utils/menuConfig";
import NavGroupItem from "@/components/navigate/NavGroupItem";
import NavItem from "@/components/navigate/NavItem";
import NavGroupCollapsed from "@/components/navigate/NavGroupCollapsed";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import logoImg from "@/assets/images/logo.png";

export default function Sidebar({ collapsed, setCollapsed }) {
  const [openId, setOpenId] = useState(null);

  return (
    <aside
      className={[
        "sidebar flex h-screen flex-shrink-0 flex-col overflow-y-auto overflow-x-hidden",
        collapsed ? "w-[68px]" : "w-[260px]",
      ].join(" ")}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-4 ${collapsed ? "justify-center" : ""}`}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
            <img src={logoImg} alt="IT-HELPDESK" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
              <img src={logoImg} alt="IT-HELPDESK" className="w-full h-full object-cover" />
            </div>
            <span className="text-base font-bold text-white tracking-tight leading-tight">
              IT-HELPDESK
            </span>
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
            {collapsed && <div className="my-2 border-t border-slate-700/50" />}
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
                ),
              )}
            </ul>
          </div>
        ))}
      </nav>

      {/* Toggle collapse button */}
      <div className="px-3 py-4 border-t border-slate-700/40">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
          className={[
            "sidebar-nav-item w-full",
            collapsed ? "justify-center" : "",
          ].join(" ")}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} className="flex-shrink-0" strokeWidth={1.8} />
          ) : (
            <>
              <PanelLeftClose size={18} className="flex-shrink-0" strokeWidth={1.8} />
              <span>Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
