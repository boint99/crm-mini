import { useEffect, useState } from "react";
import AcctionModal from "@/pages/Organization/AcctionModal";
import { useAppDispatch } from "@/hook/useAppDispatch";
import { getCompanies, selectCompanies, selectLoading } from "@/redux/slice";
import { useSelector } from "react-redux";
import LoadingItem from "@/components/ui/LoadingItem";
import NotDataTable from "@/components/ui/NotDataTable";
import { formatDateTime } from "@/utils/contants";
import { Pencil, Trash } from "lucide-react";
import { headerTableCompany } from "@/utils/headerTable";

const companyColumns = Object.entries(headerTableCompany);

function Companies() {
  const [openModal, setOpenModal] = useState(false);
  const [action, setAction] = useState(null);
  const [selectItem, setSelectItem] = useState(null);

  const companiesItems = useSelector(selectCompanies);
  const loading = useSelector(selectLoading);
  const dispatchAsync = useAppDispatch();

  useEffect(() => {
    dispatchAsync(getCompanies());
  }, []);

  const handleAction = (action) => {
    switch (action) {
      case "edit":
        setAction("edit");
        break;
      case "create":
        setAction("create");
        setOpenModal(true);
        break;
      case "delete":
        setAction("delete");
        break;
      default:
        break;
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Danh sách công ty
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            handleAction("create");
          }}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
        >
          + Thêm công ty
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-medium text-gray-900">
              Danh sách công ty
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-900">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo ID, tên, trạng thái..."
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
                {companyColumns.map(([key, label]) => (
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
            {loading === true ? (
              <tbody>
                <tr>
                  <td colSpan={companyColumns.length + 1}>
                    <LoadingItem />
                  </td>
                </tr>
              </tbody>
            ) : !companiesItems?.length ? (
              <NotDataTable colSpan={companyColumns.length + 1} />
            ) : (
              <tbody className="divide-y divide-gray-200 bg-white">
                {companiesItems?.map((company, rowIndex) => {
                  return (
                    <tr key={company.COMPANY_ID} className="hover:bg-gray-50">
                      {companyColumns.map(([key]) => {
                        const cellClass =
                          "px-4 py-2 text-gray-700 whitespace-nowrap";

                        if (key === "INDEX") {
                          return (
                            <td
                              key={key}
                              className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap"
                            >
                              {rowIndex + 1}
                            </td>
                          );
                        }

                        if (key === "STATUS") {
                          return (
                            <td
                              key={key}
                              className="px-4 py-2 whitespace-nowrap"
                            >
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  company.STATUS === "ENABLE"
                                    ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                                    : "bg-gray-50 text-gray-700 ring-1 ring-gray-500/20"
                                }`}
                              >
                                {company.STATUS === "ENABLE"
                                  ? "Hoạt động"
                                  : "Ngừng hoạt động"}
                              </span>
                            </td>
                          );
                        }
                        if (key === "CREATED_AT" || key === "UPDATED_AT") {
                          return (
                            <td key={key} className={cellClass}>
                              {formatDateTime(company[key])}
                            </td>
                          );
                        }
                        return (
                          <td key={key} className={cellClass}>
                            {company[key]}
                          </td>
                        );
                      })}
                      <td className="px-4 py-2 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => {
                            handleAction("edit");
                            setOpenModal(true);
                            setSelectItem(company);
                          }}
                          type="button"
                          className="px-2.5 py-1 text-xs font-medium text-indigo-600 rounded-md hover:bg-indigo-100 transition cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleAction("delete");
                            setOpenModal(true);
                            setSelectItem(company);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 rounded-md hover:bg-rose-100 transition cursor-pointer"
                        >
                          <Trash className="w-4 h-4 bg-none" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
      </div>
      <AcctionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        action={action}
        item={selectItem}
      />
    </div>
  );
}

export default Companies;
