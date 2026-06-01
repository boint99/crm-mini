import LoadingItem from "@/components/ui/LoadingItem";
import { dispatchWithToast } from "@/components/ui/dispatchWithToast";
import { useAppDispatch } from "@/hook/useAppDispatch";
import AddEmployeeModal from "@/pages/Organizations/Employees/Action/EmployeeModel";
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  selectEmployees,
  selectLoading,
  updateEmployee,
} from "@/redux/slice/employeesSlice";
import { formatDateTime } from "@/utils/contants";
import { CUSTOM_MESSAGES } from "@/utils/contants";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { headerTableEmployees } from "@/utils/headerTable";

const employeeColumns = Object.entries(headerTableEmployees);

function Employees() {
  const [openAdd, setOpenAdd] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("create");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const dispatchAsync = useAppDispatch();
  const dispatch = useDispatch();
  const employees = useSelector(selectEmployees);
  const loading = useSelector(selectLoading);

  useEffect(() => {
    dispatchAsync(getEmployees());
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((employee) => {
      const hay = [
        employee.employeeId,
        employee.employeeCode,
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.phone,
        employee.orgUnit?.unitName,
        employee.orgUnit?.parentUnit?.unitName,
        employee.position?.positionName,
        employee.viettel?.viettelCode,
        employee.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [employees, query]);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (employee) => employee.status === "ENABLE",
  ).length;

  const openCreateModal = () => {
    setMode("create");
    setSelectedEmployee(null);
    setOpenAdd(true);
  };

  const openEditModal = (employee) => {
    setMode("edit");
    setSelectedEmployee(employee);
    setOpenAdd(true);
  };

  const openDeleteModal = (employee) => {
    setMode("delete");
    setSelectedEmployee(employee);
    setOpenAdd(true);
  };

  const handleCloseModal = () => {
    setOpenAdd(false);
    setSelectedEmployee(null);
    setMode("create");
  };

  const handleSubmit = async (payload) => {
    if (mode === "delete") {
      await dispatchWithToast({
        dispatch,
        action: deleteEmployee,
        payload,
        messages: CUSTOM_MESSAGES.delete,
      });
      handleCloseModal();
      return;
    }

    if (mode === "edit") {
      await dispatchWithToast({
        dispatch,
        action: updateEmployee,
        payload,
        messages: CUSTOM_MESSAGES.update,
      });
      handleCloseModal();
      return;
    }

    await dispatchWithToast({
      dispatch,
      action: createEmployee,
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
            <td colSpan={employeeColumns.length + 1}>
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
            <td colSpan={employeeColumns.length + 1}>
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
                <Users className="h-10 w-10" />
                <p className="text-sm font-medium">
                  Không có dữ liệu nhân viên
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className="divide-y divide-gray-200 bg-white">
        {filteredRows.map((employee, rowIndex) => (
          <tr key={employee.id} className="hover:bg-gray-50">
            {employeeColumns.map(([key]) => {
              const cellClass = "px-4 py-3 text-gray-700 whitespace-nowrap";
              if (key === "employeeCode") {
                return (
                  <td
                    key={key}
                    className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {employee.employeeCode}
                  </td>
                );
              }

              if (key === "name") {
                return (
                  <td key={key} className={cellClass}>
                    {employee.firstName || "-"} {employee.lastName || ""}
                  </td>
                );
              }

              if (key === "email") {
                return (
                  <td key={key} className={cellClass}>
                    {employee.email || "-"}
                  </td>
                );
              }

              if (key === "birthday") {
                return (
                  <td key={key} className={cellClass}>
                    {employee.birthDate
                      ? formatDateTime(employee.birthDate).split(" ")[0]
                      : "-"}
                  </td>
                );
              }

              if (key === "unit") {
                const parentName = employee.unit?.parentUnit?.unitName;
                const unitName = employee.unit?.unitName;
                const hierarchy =
                  parentName && unitName
                    ? `${parentName} > ${unitName}`
                    : unitName;
                return (
                  <td key={key} className={cellClass}>
                    {/* {hierarchy || employee.orgUnit.unitName || "-"} */}
                  </td>
                );
              }

              if (key === "parentUnit") {
                return (
                  <td key={key} className={cellClass}>
                    {employee.orgUnit?.parentUnit?.unitName || employee.orgUnit?.unitName || "-"}
                  </td>
                );
              }

              if (key === "position") {
                return (
                  <td key={key} className={cellClass}>
                    {employee.position?.positionName || "-"}
                  </td>
                );
              }

              if (key === "viettel") {
                return (
                  <td key={key} className={cellClass}>
                    {employee?.viettel?.viettelCode || "-"}
                  </td>
                );
              }

              if (key === "status") {
                return (
                  <td key={key} className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        employee.status === "ENABLE"
                          ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                          : "bg-gray-50 text-gray-700 ring-1 ring-gray-500/20"
                      }`}
                    >
                      {employee.status === "ENABLE"
                        ? "Hoạt động"
                        : "Ngưng hoạt động"}
                    </span>
                  </td>
                );
              }

              if (key === "createdAt" || key === "updatedAt") {
                return (
                  <td key={key} className={cellClass}>
                    {employee[key] ? formatDateTime(employee[key]) : "-"}
                  </td>
                );
              }

              return (
                <td key={key} className={cellClass}>
                  {employee[key] || "-"}
                </td>
              );
            })}
            <td className="px-4 py-3 text-right whitespace-nowrap">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(employee)}
                  className="rounded-md p-2 text-indigo-600 transition hover:bg-indigo-50 cursor-pointer"
                  title="Chỉnh sửa"
                  aria-label={`Chỉnh sửa ${employee.employeeCode}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteModal(employee)}
                  className="rounded-md p-2 text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                  title="Xóa"
                  aria-label={`Xóa ${employee.employeeCode}`}
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
            Quản lý nhân viên
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Dữ liệu hiển thị tất cả nhân viên.
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
          <p className="text-sm font-medium text-slate-500">Tổng nhân viên</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {totalEmployees}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">Đang hoạt động</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-900">
            {activeEmployees}
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
              Danh sách nhân viên
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã, tên, email, điện thoại..."
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
                {employeeColumns.map(([key, label]) => (
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

      <AddEmployeeModal
        open={openAdd}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        mode={mode}
        initialValues={selectedEmployee}
      />
    </div>
  );
}

export default Employees;
