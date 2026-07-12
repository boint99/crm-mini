import { X, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { useState, useRef } from 'react'
import Modal from 'react-modal'
import { employeesAPI } from '@/api/employeesAPI'
import { customStyles } from '@/utils/contants'
import { toast } from 'react-toastify'

const modalStyles = {
  ...customStyles,
  content: {
    ...customStyles.content,
    maxWidth: '896px', // Wide for preview table
    maxHeight: '85vh',
    overflow: 'auto'
  }
}

export default function ImportEmployeeModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null)
  const [stage, setStage] = useState(1) // 1: upload, 2: preview/validate, 3: result
  const [loading, setLoading] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [importedCount, setImportedCount] = useState(0)
  const fileInputRef = useRef(null)

  const hasErrorFor = (errors, keywords) => {
    if (!errors || errors.length === 0) return false
    return errors.some((err) =>
      keywords.some((kw) => err.toLowerCase().includes(kw.toLowerCase()))
    )
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Vui lòng chọn một tệp CSV!')
      return
    }

    setLoading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const csvText = event.target.result
        try {
          const res = await employeesAPI.importPreview({ csvText })
          if (res.data) {
            setImportResult(res.data)
            setStage(2)
          } else {
            toast.error('Không thể xử lý dữ liệu xem trước!')
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Lỗi xử lý file từ server!')
        } finally {
          setLoading(false)
        }
      }
      reader.readAsText(file)
    } catch (err) {
      toast.error('Không thể đọc tệp tin!')
      setLoading(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!importResult || !importResult.records) return

    const validRecords = importResult.records.filter((r) => r.isValid)
    if (validRecords.length === 0) {
      toast.warning('Không có bản ghi hợp lệ nào để nhập!')
      return
    }

    setLoading(true)
    try {
      const res = await employeesAPI.importConfirm({ records: validRecords })
      if (res.data && res.data.success) {
        setImportedCount(res.data.count)
        setStage(3)
        onImportSuccess?.()
      } else {
        toast.error('Nhập dữ liệu thất bại!')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi nhập dữ liệu vào DB!')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setStage(1)
    setImportResult(null)
    setImportedCount(0)
    onClose()
  }

  const downloadSampleTemplate = () => {
    const csvContent =
      'employeeCode,firstName,lastName,email,phone,birthDate,unitCode,positionName,status,description\n' +
      'EMP999,Nguyễn,Văn Khách,khach.nguyen@company.com,0987654321,1995-05-15,TEST_DEPT_OK,Trưởng phòng,ENABLE,Nhân viên thử nghiệm nhập hàng loạt'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'mau_import_nhan_vien.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={modalStyles}
      ariaHideApp={false}
    >
      <div className="p-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
          <h3 className="text-xl font-bold text-gray-900">
            Nhập nhân sự hàng loạt (CSV)
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {stage === 1 && (
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <h4 className="text-sm font-semibold text-slate-800 mb-1">
                Hướng dẫn định dạng file nhập:
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Hệ thống chỉ chấp nhận file định dạng **CSV** ngăn cách bằng dấu phẩy. Các cột bắt buộc:
                <code className="bg-slate-200 px-1 py-0.5 rounded mx-1 text-rose-600 font-mono">employeeCode</code> (đúng 6 ký tự),
                <code className="bg-slate-200 px-1 py-0.5 rounded mx-1 text-rose-600 font-mono">firstName</code>,
                <code className="bg-slate-200 px-1 py-0.5 rounded mx-1 text-rose-600 font-mono">lastName</code>,
                <code className="bg-slate-200 px-1 py-0.5 rounded mx-1 text-rose-600 font-mono">unitCode</code> (mã phòng ban).
              </p>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
              >
                Tải xuống file mẫu CSV
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
                importResult && importResult.summary.invalidCount > 0
                  ? 'border-rose-400 bg-rose-50/20 hover:bg-rose-50 hover:border-rose-500'
                  : 'border-gray-300 hover:bg-slate-50 hover:border-primary'
              }`}
            >
              <Upload className={`h-10 w-10 ${importResult && importResult.summary.invalidCount > 0 ? 'text-rose-400' : 'text-gray-400'}`} />
              <div className="text-center">
                <p className={`text-sm font-medium ${importResult && importResult.summary.invalidCount > 0 ? 'text-rose-900' : 'text-gray-700'}`}>
                  {file ? file.name : 'Kéo thả hoặc nhấp để chọn tệp CSV'}
                </p>
                <p className={`text-xs mt-1 ${importResult && importResult.summary.invalidCount > 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                  {importResult && importResult.summary.invalidCount > 0
                    ? `Tệp tin chứa ${importResult.summary.invalidCount} lỗi cần chỉnh sửa!`
                    : file ? `${(file.size / 1024).toFixed(1)} KB` : 'Chấp nhận file .csv lên tới 5MB'}
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading || !file}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-indigo-600 disabled:opacity-50 cursor-pointer"
              >
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                Tải lên & Xem trước
              </button>
            </div>
          </div>
        )}

        {stage === 2 && importResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div>
                <h4 className="text-sm font-bold text-blue-900">
                  Kết quả phân tích & xác thực tệp dữ liệu:
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  Tổng số dòng phân tích: <span className="font-semibold">{importResult.summary.total}</span>. 
                  Hợp lệ: <span className="font-semibold text-emerald-600">{importResult.summary.validCount}</span>. 
                  Có lỗi: <span className="font-semibold text-rose-600">{importResult.summary.invalidCount}</span>.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">
                  <CheckCircle2 className="h-3 w-3" /> {importResult.summary.validCount} Hợp lệ
                </span>
                {importResult.summary.invalidCount > 0 && (
                  <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-medium">
                    <AlertCircle className="h-3 w-3" /> {importResult.summary.invalidCount} Lỗi
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-96">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-bold text-gray-700">Dòng</th>
                    <th className="px-4 py-2.5 text-left font-bold text-gray-700">Mã NV</th>
                    <th className="px-4 py-2.5 text-left font-bold text-gray-700">Họ & Tên</th>
                    <th className="px-4 py-2.5 text-left font-bold text-gray-700">Ngày sinh</th>
                    <th className="px-4 py-2.5 text-left font-bold text-gray-700">Email</th>
                    <th className="px-4 py-2.5 text-left font-bold text-gray-700">Phòng Ban</th>
                    <th className="px-4 py-2.5 text-left font-bold text-gray-700">Chức Vụ</th>
                    <th className="px-4 py-2.5 text-left font-bold text-gray-700">Trạng Thái</th>
                    <th className="px-4 py-2.5 text-left font-bold text-gray-700">Chi tiết Lỗi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {importResult.records.map((rec, index) => {
                    const codeError = hasErrorFor(rec.errors, ['mã nhân viên', 'employeecode'])
                    const nameError = hasErrorFor(rec.errors, ['họ nhân viên', 'tên nhân viên', 'firstname', 'lastname'])
                    const emailError = hasErrorFor(rec.errors, ['email'])
                    const dateError = hasErrorFor(rec.errors, ['ngày sinh', 'birthdate'])
                    const unitError = hasErrorFor(rec.errors, ['mã đơn vị', 'phòng ban', 'unitcode'])
                    const posError = hasErrorFor(rec.errors, ['chức vụ', 'position'])

                    return (
                      <tr
                        key={index}
                        className={rec.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/30 hover:bg-rose-50'}
                      >
                        <td className="px-4 py-2.5 font-medium text-gray-500">{rec.rowNumber}</td>
                        <td className={`px-4 py-2.5 font-bold ${codeError ? 'border border-rose-500 bg-rose-50 text-rose-900 rounded' : 'text-gray-900'}`}>
                          {rec.employeeCode}
                        </td>
                        <td className={`px-4 py-2.5 ${nameError ? 'border border-rose-500 bg-rose-50 text-rose-900 rounded' : 'text-gray-700'}`}>
                          {rec.firstName} {rec.lastName}
                        </td>
                        <td className={`px-4 py-2.5 ${dateError ? 'border border-rose-500 bg-rose-50 text-rose-900 rounded' : 'text-gray-600'}`}>
                          {rec.birthDate || '-'}
                        </td>
                        <td className={`px-4 py-2.5 ${emailError ? 'border border-rose-500 bg-rose-50 text-rose-900 rounded' : 'text-gray-600'}`}>
                          {rec.email || '-'}
                        </td>
                        <td className={`px-4 py-2.5 ${unitError ? 'border border-rose-500 bg-rose-50 text-rose-900 rounded' : 'text-gray-600'}`}>
                          {rec.unitCode}
                        </td>
                        <td className={`px-4 py-2.5 ${posError ? 'border border-rose-500 bg-rose-50 text-rose-900 rounded' : 'text-gray-600'}`}>
                          {rec.positionName || '-'}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              rec.isValid
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {rec.isValid ? 'Hợp lệ' : 'Lỗi'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-rose-600 font-medium">
                          {rec.errors && rec.errors.length > 0 ? (
                            <ul className="list-disc pl-3 space-y-0.5">
                              {rec.errors.map((err, errIdx) => (
                                <li key={errIdx}>{err}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-emerald-600 font-normal">Sẵn sàng nhập</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setStage(1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Quay lại
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={loading || importResult.summary.validCount === 0}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-indigo-600 disabled:opacity-50 cursor-pointer"
                >
                  {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  Xác nhận nhập ({importResult.summary.validCount} bản ghi)
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === 3 && (
          <div className="text-center py-10 space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-gray-900">Nhập dữ liệu thành công!</h4>
              <p className="text-sm text-gray-500">
                Đã thêm thành công <span className="font-semibold text-emerald-600">{importedCount}</span> nhân sự mới vào hệ thống.
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-indigo-600 cursor-pointer"
              >
                Đóng & Làm mới
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
