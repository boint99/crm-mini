import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { NAV_GROUPS } from "@/utils/menuConfig";

/**
 * Xây danh sách breadcrumb từ pathname và NAV_GROUPS.
 * Trả về mảng: [{ label, path | null }]
 */
function buildCrumbs(pathname) {
  // Homepage
  if (pathname === "/") return [{ label: "Dashboard", path: null }];

  // Tìm item khớp với pathname trong toàn bộ NAV_GROUPS
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      // Item là leaf
      if (!item.children) {
        if (item.path === pathname) {
          return [
            { label: group.group, path: null },
            { label: item.label, path: null },
          ];
        }
        continue;
      }

      // Item có children (accordion/group)
      for (const child of item.children) {
        if (child.path === pathname) {
          return [
            { label: item.label, path: null },
            { label: child.label, path: null },
          ];
        }
      }

      // Kiểm tra xem pathname có bắt đầu bằng parent path không (nested)
      const parentPath = item.path;
      if (parentPath && pathname.startsWith(parentPath + "/")) {
        return [
          { label: group.group, path: null },
          { label: item.label, path: parentPath },
          { label: pathname.split("/").pop(), path: null },
        ];
      }
    }
  }

  // Fallback: tách segments
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => ({
    label: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    path:
      i < segments.length - 1 ? "/" + segments.slice(0, i + 1).join("/") : null,
  }));
}

function Breadcrumb() {
  const { pathname } = useLocation();
  const crumbs = buildCrumbs(pathname);

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, index) => {
        const displayLabel =
          index === 0 ? crumb.label : `/ ${crumb.label.toUpperCase()}`;

        return (
          <span key={index} className="flex items-center gap-1.5">
            {crumb.path ? (
              <Link
                to={crumb.path}
                className="text-gray-500 hover:text-primary transition-colors font-medium"
              >
                {displayLabel}
              </Link>
            ) : (
              <span
                className={
                  index === crumbs.length - 1
                    ? "text-gray-800 font-semibold"
                    : "text-gray-500 font-medium"
                }
              >
                {displayLabel}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
