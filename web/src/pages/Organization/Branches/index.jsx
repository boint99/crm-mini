import LoadingItem from "@/components/ui/LoadingItem";
import { dispatchWithToast } from "@/components/ui/dispatchWithToast";
import { useAppDispatch } from "@/hook/useAppDispatch";
import BranchModel from "@/pages/Organization/Branches/action/BranchModel";
import {
  createBranch,
  deleteBranch,
  getBranches,
  selectBranches,
  selectLoading,
  updateBranch,
} from "@/redux/slice/branchesSlice";
import { formatDateTime, CUSTOM_MESSAGES } from "@/utils/contants";
import { Building2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { headerTableBranch } from "@/utils/headerTable";

const branchColumns = Object.entries(headerTableBranch);

function Branches() {
  const [openModal, setOpenModal] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("create");
  const [selectedBranch, setSelectedBranch] = useState(null);

  const dispatchAsync = useAppDispatch();
  const dispatch = useDispatch();
  const branches = useSelector(selectBranches);
  const loading = useSelector(selectLoading);

  useEffect(() => {
    dispatchAsync(getBranches());
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((branch) => {
      const hay = [
        branch.BRANCH_ID,
        branch.BRANCH_NAME,
        branch.BRANCH_CODE,
        branch.LOCATION,
        branch.STATUS,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [branches, query]);

  const totalBranches = branches.length;
  const activeBranches = branches.filter(
    (branch) => branch.STATUS === "ENABLE",
  ).length;

  const openCreateModal = () => {
    setMode("create");
    setSelectedBranch(null);
    setOpenModal(true);
  };

  const openEditModal = (branch) => {
    setMode("edit");
    setSelectedBranch(branch);
    setOpenModal(true);
  };

  const openDeleteModal = (branch) => {
    setMode("delete");
    setSelectedBranch(branch);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBranch(null);
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
      return;
    }

    await dispatchWithToast({
      dispatch,
      action: createBranch,
      payload,
      messages: CUSTOM_MESSAGES.create,
    });
    handleCloseModal();
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
                <Building2 className="h-10 w-10" />
                <p className="text-sm font-medium">
                  Không có dữ liệu chi nhánh
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className="divide-y divide-gray-200 bg-white">
        {filteredRows.map((branch, rowIndex) => (
          <tr key={branch.BRANCH_ID} className="hover:bg-gray-50">
            {branchColumns.map(([key]) => {
              const cellClass = "px-4 py-3 text-gray-700 whitespace-nowrap";

              if (key === "INDEX") {
                return (
                  <td key={key} className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {rowIndex + 1}
                  </td>
                );
              }

              if (key === "STATUS") {
                return (
                  <td key={key} className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        branch.STATUS === "ENABLE"
                          ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                          : "bg-gray-50 text-gray-700 ring-1 ring-gray-500/20"
                      }`}
                    >
                      {branch.STATUS === "ENABLE" ? "Hoạt động" : "Ngưng hoạt động"}
                    </span>
                  </td>
                );
              }

              if (key === "CREATED_AT" || key === "UPDATED_AT") {
                return (
                  <td key={key} className={cellClass}>
                    {branch[key] ? formatDateTime(branch[key]) : "-"}
                  </td>
                );
              }

              if (key === "ORG_UNIT") {
                return (
                  <td key={key} className={cellClass}>
                    {branch.ORG_UNIT_ID ?? "-"}
                  </td>
                );
              }

              return (
                <td key={key} className={cellClass}>
                  {branch[key] || "-"}
                </td>
              );
            })}
            <td className="px-4 py-3 text-right whitespace-nowrap">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(branch)}
                  className="rounded-md p-2 text-indigo-600 transition hover:bg-indigo-50 cursor-pointer"
                  title="Chỉnh sửa"
                  aria-label={`Chỉnh sửa ${branch.BRANCH_NAME}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteModal(branch)}
                  className="rounded-md p-2 text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                  title="Xóa"
                  aria-label={`Xóa ${branch.BRANCH_NAME}`}
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
            Quản lý chi nhánh
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Dữ liệu hiển thị tất cả chi nhánh.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tổng chi nhánh</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {totalBranches}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">Đang hoạt động</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-900">
            {activeBranches}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:col-span-2 xl:col-span-1">
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
              Danh sách chi nhánh
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, địa điểm..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
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
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        mode={mode}
        initialValues={selectedBranch}
      />
    </div>
  );
}

export default Branches;
