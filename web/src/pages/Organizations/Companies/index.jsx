import LoadingItem from "@/components/ui/LoadingItem";
import { dispatchWithToast } from "@/components/ui/dispatchWithToast";
import { useAppDispatch } from "@/hook/useAppDispatch";
import CompanyModel from "@/pages/Organizations/Companies/Action/CompanyModel";
import UploadCompanyModel from "@/pages/Organizations/Companies/Action/UploadCompanyModel";
import {
  createCompany,
  deleteCompany,
  getCompanies,
  selectCompanies,
  selectLoading,
  updateCompany,
} from "@/redux/slice/companiesSilce";
import { formatDateTime, CUSTOM_MESSAGES } from "@/utils/contants";
import { Building2, CloudUpload, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { headerTableCompany } from "@/utils/headerTable";

const companyColumns = Object.entries(headerTableCompany);

function Companies() {
  const [openModal, setOpenModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("create");
  const [selectedCompany, setSelectedCompany] = useState(null);

  const dispatchAsync = useAppDispatch();
  const dispatch = useDispatch();
  const companiesItems = useSelector(selectCompanies);
  const loading = useSelector(selectLoading);

  useEffect(() => {
    dispatchAsync(getCompanies());
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companiesItems;
    return companiesItems.filter((company) => {
      const hay = [
        company.companyId?.toString(),
        company.companyName,
        company.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [companiesItems, query]);

  const totalCompanies = companiesItems.length;
  const activeCompanies = companiesItems.filter(
    (company) => company.status === "ENABLE",
  ).length;

  const openCreateModal = () => {
    setMode("create");
    setSelectedCompany(null);
    setOpenModal(true);
  };

  const openEditModal = (company) => {
    setMode("edit");
    setSelectedCompany(company);
    setOpenModal(true);
  };

  const openDeleteModal = (company) => {
    setMode("delete");
    setSelectedCompany(company);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCompany(null);
    setMode("create");
  };

  const handleSubmit = async (payload) => {
    if (mode === "delete") {
      await dispatchWithToast({
        dispatch,
        action: deleteCompany,
        payload,
        messages: CUSTOM_MESSAGES.delete,
      });
      handleCloseModal();
      return;
    }

    if (mode === "edit") {
      await dispatchWithToast({
        dispatch,
        action: updateCompany,
        payload,
        messages: CUSTOM_MESSAGES.update,
      });
      handleCloseModal();
      return;
    }

    await dispatchWithToast({
      dispatch,
      action: createCompany,
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
            <td colSpan={companyColumns.length + 1}>
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
            <td colSpan={companyColumns.length + 1}>
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
                <Building2 className="h-10 w-10 text-gray-300" />
                <p className="text-sm font-medium">Không có dữ liệu công ty</p>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className="divide-y divide-gray-200 bg-white">
        {filteredRows.map((company, rowIndex) => (
          <tr key={company.id} className="hover:bg-gray-50 transition duration-150">
            {companyColumns.map(([key]) => {
              const cellClass = "px-4 py-3 text-gray-700 whitespace-nowrap";

              if (key === "index") {
                return (
                  <td
                    key={key}
                    className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap"
                  >
                    {rowIndex + 1}
                  </td>
                );
              }

              if (key === "status") {
                return (
                  <td key={key} className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        company.status === "ENABLE"
                          ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                          : "bg-gray-50 text-gray-700 ring-1 ring-gray-500/20"
                      }`}
                    >
                      {company.status === "ENABLE"
                        ? "Hoạt động"
                        : "Ngưng hoạt động"}
                    </span>
                  </td>
                );
              }

              if (key === "createdAt" || key === "updatedAt") {
                return (
                  <td key={key} className={cellClass}>
                    {company[key] ? formatDateTime(company[key]) : "-"}
                  </td>
                );
              }

              return (
                <td key={key} className={cellClass}>
                  {company[key] || "-"}
                </td>
              );
            })}
            <td className="px-4 py-3 text-right whitespace-nowrap">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(company)}
                  className="rounded-md p-2 text-indigo-600 transition hover:bg-indigo-50 cursor-pointer"
                  title="Chỉnh sửa"
                  aria-label={`Chỉnh sửa ${company.companyName}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteModal(company)}
                  className="rounded-md p-2 text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                  title="Xóa"
                  aria-label={`Xóa ${company.companyName}`}
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
          <h2 className="text-2xl font-bold text-gray-900">
            DANH SÁCH CÔNG TY
          </h2>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm
        </button>
      </div>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
            />
          </div>
          <div
              onClick={() => setOpenUploadModal(true)}
              className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50 transition"
              title="Import Excel"
            >
              <Upload className="h-6 w-6 text-gray-400 hover:text-primary transition" />
            </div>
          </div>
        <div>Tổng: {filteredRows.length}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {companyColumns.map(([key, label]) => (
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

      <CompanyModel
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        mode={mode}
        initialValues={selectedCompany}
      />
      <UploadCompanyModel
        open={openUploadModal}
        onClose={() => {
          setOpenUploadModal(false);
          dispatchAsync(getCompanies());
        }}
        onSubmit={async (payload) => {
          await dispatch(createCompany(payload)).unwrap();
        }}
      />
    </div>
  );
}

export default Companies;
