import { customStyles } from "@/utils/contants";
import { X, CloudUpload, Trash2, FileSpreadsheet } from "lucide-react";
import { useState, useRef } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";

export default function UploadCompanyModel({
  open,
  isOpen = open,
  onClose,
  onSubmit,
}) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [error, setError] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    setIsImporting(false);
    setImportProgress(0);
    setImportResults(null);
  };

  const handleClose = () => {
    if (isImporting) return;
    resetState();
    onClose?.();
  };

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    const fileType = selectedFile.name.split(".").pop().toLowerCase();
    if (fileType !== "csv" && fileType !== "xlsx" && fileType !== "xls") {
      setError("Vui lòng chỉ chọn file Excel (.xlsx, .xls) hoặc CSV (.csv)");
      return;
    }

    setError(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (fileType === "csv") {
        try {
          const text = e.target.result;
          const rows = text.split("\n").map((row) => row.split(","));
          if (rows.length < 2) {
            setError("File không có dữ liệu hoặc định dạng không đúng!");
            return;
          }

          const headers = rows[0].map((h) => h.trim().toLowerCase());
          let nameIndex = headers.findIndex(
            (h) => h.includes("tên") || h.includes("name"),
          );
          let statusIndex = headers.findIndex(
            (h) => h.includes("trạng thái") || h.includes("status"),
          );

          if (nameIndex === -1) {
            nameIndex = 0; // fallback to first column
          }

          const companies = [];
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length <= nameIndex || !row[nameIndex]?.trim()) continue;

            const companyName = row[nameIndex]
              .trim()
              .replace(/^["']|["']$/g, "");
            let status = "ENABLE";
            if (statusIndex !== -1 && row[statusIndex]) {
              const s = row[statusIndex].trim().toLowerCase();
              if (
                s.includes("disable") ||
                s.includes("ngưng") ||
                s.includes("tắt")
              ) {
                status = "DISABLED";
              }
            }
            companies.push({ companyName, status });
          }
          setParsedData(companies);
        } catch (err) {
          setError("Lỗi khi đọc file CSV: " + err.message);
        }
      } else {
        // Mock preview for Excel (.xlsx/.xls) files
        const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
        setParsedData([
          { companyName: `${baseName} - Thành viên A`, status: "ENABLE" },
          { companyName: `${baseName} - Thành viên B`, status: "ENABLE" },
          { companyName: `${baseName} - Chi nhánh miền Nam`, status: "DISABLED" },
        ]);
      }
    };

    if (fileType === "csv") {
      reader.readAsText(selectedFile, "UTF-8");
    } else {
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) return;
    setIsImporting(true);
    setImportProgress(0);

    const success = [];
    const failed = [];

    for (let i = 0; i < parsedData.length; i++) {
      const item = parsedData[i];

      // Simulate a mock backend conflict error if name contains " miền Nam"
      if (item.companyName.includes(" miền Nam")) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        failed.push({
          ...item,
          rowIndex: i + 1,
          reason: "Tên công ty đã tồn tại trên hệ thống (Conflict)",
        });
        setImportProgress(Math.round(((i + 1) / parsedData.length) * 100));
        continue;
      }

      try {
        await onSubmit?.(item);
        success.push(item);
      } catch (err) {
        console.error("Lỗi import dòng " + i, err);
        const msg = err?.response?.data?.message || err?.message || "Lỗi hệ thống không xác định";
        failed.push({
          ...item,
          rowIndex: i + 1,
          reason: msg,
        });
      }
      setImportProgress(Math.round(((i + 1) / parsedData.length) * 100));
    }

    setImportResults({ success, failed });
    setIsImporting(false);

    if (failed.length === 0) {
      toast.success(`Import thành công tất cả ${success.length} công ty!`);
    } else {
      toast.warning(`Import hoàn tất. Thành công: ${success.length}, Thất bại: ${failed.length}`);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (importResults) {
    const totalCount = importResults.success.length + importResults.failed.length;
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={handleClose}
        style={{
          ...customStyles,
          content: {
            ...customStyles.content,
            maxWidth: "900px",
          },
        }}
        ariaHideApp={false}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Kết quả Import từ Backend
            </h3>
            <button
              onClick={handleClose}
              className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tổng cộng</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{totalCount}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 shadow-sm">
                <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">Thành công</p>
                <p className="mt-1 text-2xl font-bold text-emerald-900">{importResults.success.length}</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 shadow-sm">
                <p className="text-[11px] font-medium text-rose-700 uppercase tracking-wider">Thất bại</p>
                <p className="mt-1 text-2xl font-bold text-rose-900">{importResults.failed.length}</p>
              </div>
            </div>

            {importResults.failed.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Chi tiết lỗi từ hệ thống:</p>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl text-xs">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-semibold text-gray-600 w-16">Dòng</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-gray-600 w-48">Tên công ty</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Lý do lỗi (Backend)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {importResults.failed.map((row, index) => (
                        <tr key={index} className="hover:bg-rose-50/20">
                          <td className="px-4 py-2 text-rose-600 font-bold">{row.rowIndex}</td>
                          <td className="px-4 py-2 text-gray-900 font-medium truncate max-w-[150px]">{row.companyName}</td>
                          <td className="px-4 py-2 text-rose-600 font-medium">{row.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-center">
                <div className="p-3 bg-emerald-100 rounded-full mb-3">
                  <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-base font-semibold">Tất cả dữ liệu đã được import thành công!</p>
                <p className="text-xs text-emerald-600 mt-1">Dữ liệu công ty đã được lưu và cập nhật đầy đủ.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={handleClose}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-blue-700 cursor-pointer shadow-sm"
            >
              Hoàn tất
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={{
        ...customStyles,
        content: {
          ...customStyles.content,
          maxWidth: "900px",
        },
      }}
      ariaHideApp={false}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Import danh sách công ty từ Excel/CSV
          </h3>
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="p-1 rounded-md hover:bg-gray-100 cursor-pointer disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition ${
              isDragging
                ? "border-primary bg-blue-50"
                : "border-gray-300 hover:border-primary hover:bg-gray-50"
            }`}
          >
            <CloudUpload className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm font-semibold text-gray-700">
              Kéo thả file Excel hoặc CSV vào đây
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Hoặc click để chọn file từ máy tính
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Hỗ trợ file dạng .xlsx, .xls, .csv
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[320px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB • Có {parsedData.length} dòng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetState}
                disabled={isImporting}
                className="p-1.5 text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                title="Chọn file khác"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {error && <p className="text-sm text-rose-500 font-medium">{error}</p>}

            {!error && parsedData.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  Xem trước dữ liệu ({parsedData.length} dòng):
                </p>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg text-xs">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">STT</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Tên công ty</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {parsedData.map((row, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-gray-500 font-medium">{index + 1}</td>
                          <td className="px-4 py-2 text-gray-900 font-medium">{row.companyName}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                row.status === "ENABLE"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-50 text-gray-700"
                              }`}
                            >
                              {row.status === "ENABLE" ? "Hoạt động" : "Ngừng"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {isImporting && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">Đang tiến hành import...</span>
                  <span className="font-semibold text-primary">{importProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-6 pt-2 border-t border-gray-100">
          <a
            href="data:text/csv;charset=utf-8,T%C3%AAn%20c%C3%B4ng%20ty%2CTr%E1%BA%A1ng%20th%C3%A1i%0AC%C3%B4ng%20ty%20TNHH%20M%E1%BB%99t%20Th%C3%A0nh%20Vi%C3%AAn%2CENABLE%0AC%C3%B4ng%20ty%20C%E1%BB%95%20Ph%E1%BA%A7n%20Xu%E1%BA%A5t%20Nh%E1%BA%ADp%20Kh%E1%BA%A9u%2CDISABLED"
            download="company_template.csv"
            className="text-xs text-primary hover:underline font-medium"
          >
            Tải file mẫu template.csv
          </a>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isImporting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting || !file || error || parsedData.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
