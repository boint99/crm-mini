import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown } from "lucide-react";

function Header({ collapsed, setCollapsed }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    function onPointerDown(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <header className="header sticky top-0 z-20 h-[60px]">
      <div className="mx-auto flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="relative">
          {/* <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search"
            className="header-search"
          /> */}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification */}
          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            {/* <Bell size={20} strokeWidth={1.8} /> */}
            {/* <span className="notification-badge"></span> */}
          </button>

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="inline-flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-left transition-colors cursor-pointer"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
                A
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium">Admin</div>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {open ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl shadow-2xl"
              >
                {/* <div className="px-4 py-3">
                  <div className="text-sm font-semibold text-white">
                    Admin
                  </div>
                  <div className="text-xs text-slate-400">Quản trị hệ thống</div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 cursor-pointer transition-colors"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                    <path d="M21 3v18" />
                  </svg>
                  Đăng xuất
                </button> */}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
