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
      className="w-48 rounded-xl border border-slate-100 bg-white py-2 shadow-2xl"
      onMouseLeave={onClose}
    >
      <p className="px-3 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
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
                ? "text-indigo-600 font-semibold bg-indigo-50"
                : "text-slate-600 hover:bg-slate-550 hover:text-slate-900 hover:bg-slate-50",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              <child.icon
                size={13}
                className={isActive ? "text-indigo-600" : "text-slate-400"}
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
