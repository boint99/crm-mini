import { useState } from "react";
import { NAV_GROUPS } from "@/utils/menuConfig";
import logoCrm from "@/assets/images/logo-crm.png";
import logoCrmSmall from "@/assets/images/logo-crm-small.png";
import NavGroupItem from "@/components/navigate/NavGroupItem";
import NavItem from "@/components/navigate/NavItem";
import NavGroupCollapsed from "@/components/navigate/NavGroupCollapsed";

export default function Sidebar({ collapsed }) {
  const [openId, setOpenId] = useState(null);

  return (
    <aside
      className={[
        "flex h-screen flex-shrink-0 flex-col border-r border-slate-200 bg-white overflow-y-auto transition-[width] duration-200",
        collapsed ? "w-[60px]" : "w-64",
      ].join(" ")}
    >
      {/* Logo */}
      <div className="flex items-center justify-center py-5 px-3">
        <div className="flex items-center justify-center py-5">
        <img
          src={collapsed ? logoCrmSmall : logoCrm}
          alt="CRM Logo"
          className={collapsed ? "h-9 w-auto" : "h-full w-auto"}
        />
    </div>

      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-2 pb-6 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-primary sidebar-text">
                {group.group}
              </p>
            )}
            {collapsed && <div className="my-1 border-t border-slate-100" />}
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
    </aside>
  );
}
