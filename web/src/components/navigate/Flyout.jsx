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
              isActive
                ? "text-primary font-bold bg-blue-50"
                : "text-slate-600 hover:bg-slate-100",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              <child.icon
                size={13}
                className={isActive ? "text-primary" : "text-slate-400"}
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
