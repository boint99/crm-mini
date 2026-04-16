import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

function NavGroupItem({ item, openId, setOpenId }) {
  const location = useLocation();
  const isChildActive = item.children?.some((c) =>
    location.pathname.startsWith(c.path),
  );
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
          open || isChildActive
            ? "text-primary bg-blue-50"
            : "text-slate-700 hover:bg-slate-100",
        ].join(" ")}
      >
        <Icon
          size={16}
          className={`flex-shrink-0 ${open || isChildActive ? "text-primary" : "text-slate-500"}`}
          strokeWidth={1.8}
        />
        <span className="flex-1 text-left font-normal">{item.label}</span>
        <ChevronDown
          size={14}
          className={[
            "text-slate-400 transition-transform duration-500 ease-in-out",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <div
        className={[
          "overflow-hidden transition-all duration-500 ease-in-out",
          open ? "max-h-96" : "max-h-0",
        ].join(" ")}
      >
        <ul className="ml-6 mt-0.5 space-y-0.5 border-l border-slate-100 pl-3">
          {item.children.map((child) => (
            <li key={child.id}>
              <NavLink
                to={child.path}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "text-primary font-bold"
                      : "text-slate-600 hover:text-primary font-normal",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <child.icon
                      size={14}
                      className={isActive ? "text-primary" : "text-slate-400"}
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
  );
}

export default NavGroupItem;
