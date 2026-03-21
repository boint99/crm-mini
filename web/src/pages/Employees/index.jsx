import { employeesAPI } from '@/api/employeesAPI'
import { useMemo, useState } from 'react'
import AddEmployeeModal from '@/pages/Employees/AddEmployeeModal'

function Employees() {
  const [openAdd, setOpenAdd] = useState(false)
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState(employeesAPI)

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((e) => {
      const hay = [
        e.EMPLOYEE_CODE,
        e.FIRST_NAME,
        e.LAST_NAME,
        e.EMAIL,
        e.PHONE,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, rows])

  const handleCreate = (payload) => {
    const maxId = rows.reduce((m, r) => Math.max(m, Number(r.EMPLOYEE_ID) || 0), 0)
    const next = {
      EMPLOYEE_ID: maxId + 1,
      ...payload,
    }
    setRows((prev) => [next, ...prev])
    setOpenAdd(false)
  }

  return (
    <div >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Quản lý nhân viên
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setOpenAdd(true)}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
        >
          + Thêm nhân viên
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Danh sách nhân viên</p>
          </div>
          <div className="flex items-center gap-2">
            <label className='text-sm font-medium text-gray-900'>Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm theo mã, tên, email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
                <th className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  STT
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  MaNV
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  MaVT
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Họ
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Tên
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Số điện thoại
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Email
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Ngày sinh
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Unit ID
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="px-4 py-2 text-right font-semibold text-gray-700 whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredRows.map((emp) => (
                <tr key={emp.EMPLOYEE_ID} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {emp.EMPLOYEE_ID}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                    {emp.EMPLOYEE_CODE}
                  </td>
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {emp.VT_CODE ?? '-'}
                  </td>
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {emp.FIRST_NAME}
                  </td>
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {emp.LAST_NAME}
                  </td>
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {emp.PHONE || '-'}
                  </td>
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {emp.EMAIL || '-'}
                  </td>
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {emp.BIRTH_DATE}
                  </td>
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {emp.UNIT_ID ?? '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${emp.STATUS === 'ENABLE'
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                        : 'bg-gray-50 text-gray-700 ring-1 ring-gray-500/20'
                        }`}
                    >
                      {emp.STATUS === 'ENABLE' ? 'Hoạt động' : emp.STATUS}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap space-x-2">
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition cursor-pointer"
                    >
                      Sửa
                    </button>

                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-medium text-rose-600 bg-rose-50 rounded-md hover:bg-rose-100 transition cursor-pointer"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddEmployeeModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}

export default Employees