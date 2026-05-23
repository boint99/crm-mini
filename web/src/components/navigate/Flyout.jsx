import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";

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
      className="w-48 rounded-xl border border-slate-700 bg-slate-800 py-2 shadow-2xl"
      onMouseLeave={onClose}
    >
      <p className="px-3 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
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
              isActive
                ? "text-white font-semibold bg-indigo-500/20"
                : "text-slate-300 hover:bg-slate-700 hover:text-white",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              <child.icon
                size={13}
                className={isActive ? "text-indigo-400" : "text-slate-500"}
                strokeWidth={1.8}
              />
              {child.label}
            </>
          )}
        </NavLink>
      ))}
    </div>,
    document.body,
  );
}

export default Flyout;
