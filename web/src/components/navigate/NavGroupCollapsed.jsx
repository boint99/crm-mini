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
          "sidebar-nav-item justify-center w-full",
          isChildActive ? "active" : "",
        ].join(" ")}
      >
        <Icon
          size={18}
          className="flex-shrink-0"
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
