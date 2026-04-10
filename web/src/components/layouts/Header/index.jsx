import { useEffect, useRef, useState } from "react";

function Header() {
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
    <header className="header sticky top-0 z-20 h-14 border-b border-gray-200 bg-gradient-to-r from-white via-white to-gray-50/70 backdrop-blur">
      <div className="mx-auto flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gray-900 text-white shadow-sm">
            {/* App icon */}
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l8 4v6c0 5-3.5 9.4-8 10-4.5-.6-8-5-8-10V6l8-4z" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-gray-900 cursor-pointer">
              CRM Mini
            </div>
            <div className="text-xs text-gray-500">Admin dashboard</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Background / theme icon button (placeholder) */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
            aria-label="Background settings"
            onClick={() => {}}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 3v18M3 12h18" />
            </svg>
          </button>

          {/* Notification icon button (placeholder) */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
            aria-label="Notifications"
            onClick={() => {}}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
              <path d="M9 17a3 3 0 0 0 6 0" />
            </svg>
          </button>

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left shadow-sm hover:bg-gray-50"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
                A
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900">Admin</div>
                <div className="text-xs text-gray-500">admin@crm.local</div>
              </div>
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="h-4 w-4 text-gray-500"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {open ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                <div className="px-4 py-3">
                  <div className="text-sm font-semibold text-gray-900">
                    Admin
                  </div>
                  <div className="text-xs text-gray-500">Quản trị hệ thống</div>
                </div>
                <div className="h-px bg-gray-100" />

                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    // TODO: open change password modal / navigate
                    // eslint-disable-next-line no-console
                    console.log("Change password");
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06-1.3 2.26-0.1-.03a1.8 1.8 0 0 0-2 .74l-.06.1h-2.6l-.03-.1a1.8 1.8 0 0 0-1.7-1.1 1.8 1.8 0 0 0-1.7 1.1l-.03.1H7.9l-.06-.1a1.8 1.8 0 0 0-2-.74l-.1.03-1.3-2.26.06-.06A1.8 1.8 0 0 0 4.6 15l-.1-.03V12l.1-.03A1.8 1.8 0 0 0 6 10.3l-.03-.1L7.3 8l.1.06a1.8 1.8 0 0 0 1.98-.36l.06-.06L12 6.3l.06.06a1.8 1.8 0 0 0 1.98.36l.1-.06 2.26 1.3-.03.1A1.8 1.8 0 0 0 18 10.3l.1.03V12l-.1.03A1.8 1.8 0 0 0 19.4 15z" />
                  </svg>
                  Đổi mật khẩu
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    // TODO: logout
                    // eslint-disable-next-line no-console
                    console.log("Logout");
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
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
