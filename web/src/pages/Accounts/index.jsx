import { useEffect, useMemo, useState } from "react";
import ActionModal from "./Actions";
import { useAppDispatch } from "@/hook/useAppDispatch";
import {
  getAccounts,
  selectAccounts,
  selectAccountsLoading,
} from "@/redux/slice/accountsSlice";
import { useSelector } from "react-redux";
import LoadingItem from "@/components/ui/LoadingItem";
import { formatDateTime } from "@/utils/contants";
import {
  Pencil,
  Trash2,
  KeyRound,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Users,
} from "lucide-react";

const PAGE_SIZE = 10;

const STATUS_CONFIG = {
  ENABLE: {
    label: "Hoạt động",
    className: "bg-green-100 text-green-700 border border-green-300",
  },
  DISABLED: {
    label: "Vô hiệu hóa",
    className: "bg-red-100 text-red-700 border border-red-300",
  },
};

const TABLE_HEADERS = [
  { key: "INDEX", label: "STT" },
  { key: "ACCOUNT_NAME", label: "Tài khoản" },
  { key: "EMPLOYEE", label: "Mã NV" },
  { key: "CREATED_AT", label: "Ngày tạo" },
  { key: "LOGIN", label: "Lượt đăng nhập" },
  { key: "STATUS", label: "Trạng thái" },
  { key: "DESCRIPTION", label: "Mô tả" },
  { key: "IS_LOGIN", label: "Đang đăng nhập" },
];

function Accounts() {
  const [openModal, setOpenModal] = useState(false);
  const [action, setAction] = useState(null);
  const [selectItem, setSelectItem] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const accountItems = useSelector(selectAccounts);
  const loading = useSelector(selectAccountsLoading);
  const dispatchAsync = useAppDispatch();

  useEffect(() => {
    dispatchAsync(getAccounts());
  }, []);

  const handleAction = (actionType, item = null) => {
    setAction(actionType);
    setSelectItem(item);
    setOpenModal(true);
  };

  const handleClear = () => {
    setQuery("");
    setStatusFilter("ALL");
    setPage(1);
  };

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accountItems.filter((acc) => {
      const matchQuery =
        !q ||
        [acc.ACCOUNT_NAME, acc.EMPLOYEE?.EMPLOYEE_CODE, acc.DESCRIPTION]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchStatus = statusFilter === "ALL" || acc.STATUS === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [accountItems, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const totalAccounts = accountItems.length;
  const activeAccounts = accountItems.filter(
    (a) => a.STATUS === "ENABLE",
  ).length;
  const loggedInAccounts = accountItems.filter((a) => a.IS_LOGIN).length;

  const maxLogin = Math.max(
    ...accountItems.map((a) => Number(a.LOGIN) || 0),
    1,
  );

  const renderLoginBar = (loginCount) => {
    const count = Number(loginCount) || 0;
    const pct = Math.round((count / maxLogin) * 100);
    return (
      <div className="flex items-center gap-2 min-w-[110px]">
        <div className="flex-1 h-1.5 rounded-full bg-gray-200">
          <div
            className="h-1.5 rounded-full bg-indigo-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
      </div>
    );
  };

  const renderCell = (account, key, rowIndex) => {
    const cellClass = "px-4 py-3 text-gray-700 whitespace-nowrap";
    switch (key) {
      case "INDEX":
        return (
          <td
            key={key}
            className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap"
          >
            {(currentPage - 1) * PAGE_SIZE + rowIndex + 1}
          </td>
        );
      case "ACCOUNT_NAME":
        return (
          <td
            key={key}
            className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap"
          >
            {account.ACCOUNT_NAME}
          </td>
        );
      case "EMPLOYEE":
        return (
          <td key={key} className={cellClass}>
            {account.EMPLOYEE ? (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                {account.EMPLOYEE.EMPLOYEE_CODE}
              </span>
            ) : (
              <span className="text-gray-400 italic text-xs">—</span>
            )}
          </td>
        );
      case "CREATED_AT":
        return (
          <td key={key} className={cellClass}>
            {formatDateTime(account.CREATED_AT)}
          </td>
        );
      case "LOGIN":
        return (
          <td key={key} className="px-4 py-3 whitespace-nowrap">
            {renderLoginBar(account.LOGIN)}
          </td>
        );
      case "STATUS": {
        const cfg = STATUS_CONFIG[account.STATUS] ?? {
          label: account.STATUS,
          className: "bg-gray-100 text-gray-600 border border-gray-300",
        };
        return (
          <td key={key} className="px-4 py-3 whitespace-nowrap">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${cfg.className}`}
            >
              {cfg.label}
            </span>
          </td>
        );
      }
      case "DESCRIPTION":
        return (
          <td
            key={key}
            className="px-4 py-3 max-w-[160px] truncate text-gray-600 text-xs"
          >
            {account.DESCRIPTION || (
              <span className="text-gray-400 italic">—</span>
            )}
          </td>
        );
      case "IS_LOGIN":
        return (
          <td key={key} className="px-4 py-3 whitespace-nowrap text-center">
            {account.IS_LOGIN ? (
              <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />
            ) : (
              <XCircle className="mx-auto h-5 w-5 text-rose-400" />
            )}
          </td>
        );
      default:
        return (
          <td key={key} className={cellClass}>
            {account[key]}
          </td>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Quản lý tài khoản
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Danh sách tài khoản trong hệ thống.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleAction("create")}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm tài khoản
        </button>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tổng tài khoản</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {totalAccounts}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">Đang hoạt động</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-900">
            {activeAccounts}
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <p className="text-sm font-medium text-indigo-700">Đang đăng nhập</p>
          <p className="mt-3 text-3xl font-semibold text-indigo-900">
            {loggedInAccounts}
          </p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filter Menu
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Clear
            </button>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ENABLE">Hoạt động</option>
              <option value="DISABLED">Vô hiệu hóa</option>
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Keyword Search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-60 border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_HEADERS.map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={TABLE_HEADERS.length + 1}>
                    <LoadingItem />
                  </td>
                </tr>
              </tbody>
            ) : !pagedItems.length ? (
              <tbody>
                <tr>
                  <td colSpan={TABLE_HEADERS.length + 1}>
                    <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
                      <Users className="h-10 w-10" />
                      <p className="text-sm font-medium">
                        Không có dữ liệu tài khoản
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-200 bg-white">
                {pagedItems.map((account, rowIndex) => (
                  <tr key={account.ACCOUNT_ID} className="hover:bg-gray-50">
                    {TABLE_HEADERS.map(({ key }) =>
                      renderCell(account, key, rowIndex),
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleAction("edit", account)}
                          type="button"
                          title="Chỉnh sửa"
                          className="rounded-md p-2 text-indigo-600 transition hover:bg-indigo-50 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleAction("reset-password", account)
                          }
                          type="button"
                          title="Đặt lại mật khẩu"
                          className="rounded-md p-2 text-amber-600 transition hover:bg-amber-50 cursor-pointer"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Xóa"
                          onClick={() => handleAction("delete", account)}
                          className="rounded-md p-2 text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredItems.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredItems.length)} /{" "}
              {filteredItems.length} tài khoản
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - currentPage) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-[32px] rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      p === currentPage
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage(totalPages)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ActionModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectItem(null);
          setAction(null);
        }}
        action={action}
        item={selectItem}
      />
    </div>
  );
}

export default Accounts;
