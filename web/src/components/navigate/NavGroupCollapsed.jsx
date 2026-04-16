import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";

import Flyout from "./Flyout";

function NavGroupCollapsed({ item }) {
  const btnRef = useRef(null);
  const [showFlyout, setShowFlyout] = useState(false);
  const location = useLocation();
  const isChildActive = item.children?.some((c) =>
    location.pathname.startsWith(c.path),
  );
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
          isChildActive
            ? "text-primary bg-blue-50"
            : "text-slate-700 hover:bg-slate-100",
        ].join(" ")}
      >
        <Icon
          size={16}
          className={`flex-shrink-0 ${isChildActive ? "text-primary" : "text-slate-500"}`}
          strokeWidth={1.8}
        />
      </button>
      {showFlyout && (
        <Flyout
          anchorEl={btnRef.current}
          item={item}
          onClose={() => setShowFlyout(false)}
        />
      )}
    </li>
  );
}

export default NavGroupCollapsed;
