import LoadingItem from "@/components/ui/LoadingItem";
import { dispatchWithToast } from "@/components/ui/dispatchWithToast";
import { useAppDispatch } from "@/hook/useAppDispatch";
import BranchModel from "@/pages/Viettel/branch/Action/BranchModel";
import {
  createBranch,
  deleteBranch,
  getBranches,
  selectViettelBranches,
  selectLoadingViettelBranch,
  updateBranch,
} from "@/redux/slice/viettelBranchSlice";
import { formatDateTime, CUSTOM_MESSAGES } from "@/utils/contants";
import { headerTableViettelBranches } from "@/utils/headerTable";
import { Pencil, Plus, Search, Trash2, GitBranch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const branchColumns = Object.entries(headerTableViettelBranches);

function BranchList() {
  const [openAdd, setOpenAdd] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);

  const dispatchAsync = useAppDispatch();
  const dispatch = useDispatch();
  const items = useSelector(selectViettelBranches);
  const loading = useSelector(selectLoadingViettelBranch);

  useEffect(() => {
    dispatchAsync(getBranches());
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = [
        item.viettelBranchCode,
        item.viettelBranchName,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const totalItems = items.length;
  const activeItems = items.filter((item) => item.status === "ENABLE").length;

  const openCreateModal = () => {
    setMode("create");
    setSelectedItem(null);
    setOpenAdd(true);
  };

  const openEditModal = (item) => {
    setMode("edit");
    setSelectedItem(item);
    setOpenAdd(true);
  };

  const openDeleteModal = (item) => {
    setMode("delete");
    setSelectedItem(item);
    setOpenAdd(true);
  };

  const handleCloseModal = () => {
    setOpenAdd(false);
    setSelectedItem(null);
    setMode("create");
  };

  const handleSubmit = async (payload) => {
    if (mode === "delete") {
      await dispatchWithToast({
        dispatch,
        action: deleteBranch,
        payload,
        messages: CUSTOM_MESSAGES.delete,
      });
      handleCloseModal();
      dispatchAsync(getBranches());
      return;
    }

    if (mode === "edit") {
      await dispatchWithToast({
        dispatch,
        action: updateBranch,
        payload,
        messages: CUSTOM_MESSAGES.update,
      });
      handleCloseModal();
      dispatchAsync(getBranches());
      return;
    }

    await dispatchWithToast({
      dispatch,
      action: createBranch,
      payload,
      messages: CUSTOM_MESSAGES.create,
    });
    handleCloseModal();
    dispatchAsync(getBranches());
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={branchColumns.length + 1}>
              <LoadingItem />
            </td>
          </tr>
        </tbody>
      );
    }

    if (!filteredRows.length) {
      return (
        <tbody>
          <tr>
            <td colSpan={branchColumns.length + 1}>
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
                <GitBranch className="h-10 w-10 text-gray-300" />
                <p className="text-sm font-medium">
                  Không có dữ liệu chi nhánh Viettel
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className="divide-y divide-gray-200 bg-white">
        {filteredRows.map((item) => (
          <tr key={item.id || item.viettelBranchId} className="hover:bg-gray-50 transition duration-150">
            {branchColumns.map(([key]) => {
              const cellClass = "px-4 py-3 text-gray-700 whitespace-nowrap";

              if (key === "viettelBranchId") {
                return (
                  <td
                    key={key}
                    className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap"
                  >
                    {item.viettelBranchId}
                  </td>
                );
              }

              if (key === "viettelBranchCode") {
                return (
                  <td
                    key={key}
                    className="px-4 py-3 font-medium text-indigo-600 whitespace-nowrap"
                  >
                    {item.viettelBranchCode || "-"}
                  </td>
                );
              }

              if (key === "viettelBranchName") {
                return (
                  <td key={key} className={cellClass}>
                    {item.viettelBranchName || "-"}
                  </td>
                );
              }

              if (key === "status") {
                return (
                  <td key={key} className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        item.status === "ENABLE"
                          ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                          : "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                      }`}
                    >
                      {item.status === "ENABLE"
                        ? "Hoạt động"
                        : "Ngưng hoạt động"}
                    </span>
                  </td>
                );
              }

              if (key === "createdAt" || key === "updatedAt") {
                return (
                  <td key={key} className={cellClass}>
                    {item[key] ? formatDateTime(item[key]) : "-"}
                  </td>
                );
              }

              return (
                <td key={key} className={cellClass}>
                  {item[key] || "-"}
                </td>
              );
            })}
            <td className="px-4 py-3 text-right whitespace-nowrap">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="rounded-md p-2 text-indigo-600 transition hover:bg-indigo-50 cursor-pointer"
                  title="Chỉnh sửa chi nhánh"
                  aria-label={`Chỉnh sửa ${item.viettelBranchCode}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteModal(item)}
                  className="rounded-md p-2 text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                  title="Xóa chi nhánh"
                  aria-label={`Xóa ${item.viettelBranchCode}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Quản lý chi nhánh Viettel
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Dữ liệu hiển thị tất cả chi nhánh Viettel của hệ thống.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm chi nhánh
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <p className="text-sm font-medium text-slate-500">
            Tổng chi nhánh Viettel
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {totalItems}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm hover:shadow-md transition">
          <p className="text-sm font-medium text-emerald-700">Đang hoạt động</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-900">
            {activeItems}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:col-span-2 xl:col-span-1 hover:shadow-md transition">
          <p className="text-sm font-medium text-amber-700">Kết quả lọc</p>
          <p className="mt-3 text-3xl font-semibold text-amber-900">
            {filteredRows.length}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-medium text-gray-900">
              Danh sách chi nhánh Viettel
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã, tên..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-72 border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {branchColumns.map(([key, label]) => (
                  <th
                    key={key}
                    className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
                <th className="px-4 py-2 text-right font-semibold text-gray-700 whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            {renderTableBody()}
          </table>
        </div>
      </div>

      <BranchModel
        open={openAdd}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        mode={mode}
        initialValues={selectedItem}
      />
    </div>
  );
}

export default BranchList;
