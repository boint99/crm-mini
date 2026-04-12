import { useEffect, useState } from "react";
import ActionModal from "./Actions";
import { useAppDispatch } from "@/hook/useAppDispatch";
import {
  getAccounts,
  selectAccounts,
  selectAccountsLoading,
} from "@/redux/slice/accountsSlice";
import { useSelector } from "react-redux";
import LoadingItem from "@/components/ui/LoadingItem";
import NotDataTable from "@/components/ui/NotDataTable";
import { formatDateTime } from "@/utils/contants";
import { Pencil, Trash, KeyRound } from "lucide-react";
import { headerTableAccounts } from "@/utils/headerTable";

const accountColumns = Object.entries(headerTableAccounts);

function Accounts() {
  const [openModal, setOpenModal] = useState(false);
  const [action, setAction] = useState(null);
  const [selectItem, setSelectItem] = useState(null);

  const accountItems = useSelector(selectAccounts);
  const loading = useSelector(selectAccountsLoading);
  const dispatchAsync = useAppDispatch();

  useEffect(() => {
    dispatchAsync(getAccounts());
  }, []);

  const handleAction = (action, item = null) => {
    setAction(action);
    setSelectItem(item);
    setOpenModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Quản lý tài khoản
          </h2>
        </div>
        <button
          type="button"
          onClick={() => handleAction("create")}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
        >
          + Thêm tài khoản
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
          <p className="text-lg font-medium text-gray-900">
            Danh sách tài khoản
          </p>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-900">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tài khoản, trạng thái..."
              className="w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm
           placeholder:text-gray-400
           focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {accountColumns.map(([key, label]) => (
                  <th
                    key={key}
                    className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
                <th className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={accountColumns.length + 1}>
                    <LoadingItem />
                  </td>
                </tr>
              </tbody>
            ) : !accountItems?.length ? (
              <NotDataTable colSpan={accountColumns.length + 1} />
            ) : (
              <tbody className="divide-y divide-gray-200 bg-white">
                {accountItems.map((account, rowIndex) => (
                  <tr key={account.ACCOUNT_ID} className="hover:bg-gray-50">
                    {accountColumns.map(([key]) => {
                      const cellClass =
                        "px-4 py-2 text-gray-700 whitespace-nowrap";

                      if (key === "ACCOUNT_ID") {
                        return (
                          <td
                            key={key}
                            className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap"
                          >
                            {account.ACCOUNT_ID}
                          </td>
                        );
                      }

                      if (key === "STATUS") {
                        return (
                          <td key={key} className="px-4 py-2 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                account.STATUS === "ENABLE"
                                  ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                                  : "bg-gray-50 text-gray-700 ring-1 ring-gray-500/20"
                              }`}
                            >
                              {account.STATUS === "ENABLE"
                                ? "Hoạt động"
                                : "Ngừng hoạt động"}
                            </span>
                          </td>
                        );
                      }

                      if (key === "IS_LOGIN") {
                        return (
                          <td key={key} className="px-4 py-2 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                account.IS_LOGIN
                                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                                  : "bg-gray-50 text-gray-500 ring-1 ring-gray-400/20"
                              }`}
                            >
                              {account.IS_LOGIN ? "Có" : "Không"}
                            </span>
                          </td>
                        );
                      }

                      if (key === "EMPLOYEE") {
                        return (
                          <td key={key} className={cellClass}>
                            {account.EMPLOYEE ? (
                              `${account.EMPLOYEE.NAME} (${account.EMPLOYEE.EMPLOYEE_CODE})`
                            ) : (
                              <span className="text-gray-400 italic"></span>
                            )}
                          </td>
                        );
                      }

                      if (key === "CREATED_AT" || key === "UPDATED_AT") {
                        return (
                          <td key={key} className={cellClass}>
                            {formatDateTime(account[key])}
                          </td>
                        );
                      }

                      return (
                        <td key={key} className={cellClass}>
                          {account[key]}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2 whitespace-nowrap space-x-1">
                      <button
                        onClick={() => handleAction("edit", account)}
                        type="button"
                        title="Chỉnh sửa"
                        className="px-2.5 py-1 text-xs font-medium text-indigo-600 rounded-md hover:bg-indigo-100 transition cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction("reset-password", account)}
                        type="button"
                        title="Đặt lại mật khẩu"
                        className="px-2.5 py-1 text-xs font-medium text-amber-600 rounded-md hover:bg-amber-100 transition cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Xóa"
                        onClick={() => handleAction("delete", account)}
                        className="px-2.5 py-1 text-xs font-medium text-rose-600 rounded-md hover:bg-rose-100 transition cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
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
