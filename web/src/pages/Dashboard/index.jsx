function StatCard({ label, value, subtext }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      {subtext ? (
        <div className="mt-1 text-xs text-gray-500">{subtext}</div>
      ) : null}
    </div>
  )
}

function Dashboard() {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-600">
            Tổng quan nhanh hoạt động hôm nay.
          </p>
        </div>
        <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Tạo khách hàng
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Khách hàng" value="128" subtext="+12 tuần này" />
        <StatCard label="Đơn hàng" value="34" subtext="+5 hôm nay" />
        <StatCard label="Doanh thu" value="₫24.5M" subtext="+8% so với tuần trước" />
        <StatCard label="Công việc" value="9" subtext="3 sắp đến hạn" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Hoạt động gần đây
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {[
              { title: 'Tạo khách hàng: Nguyễn Văn A', time: '10 phút trước' },
              { title: 'Cập nhật đơn hàng #1024', time: '1 giờ trước' },
              { title: 'Thêm sản phẩm mới: Gói Pro', time: 'Hôm qua' },
            ].map((item) => (
              <div key={item.title} className="px-4 py-3">
                <div className="text-sm text-gray-900">{item.title}</div>
                <div className="mt-1 text-xs text-gray-500">{item.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Cần làm</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              'Gọi lại khách hàng tiềm năng',
              'Gửi báo giá cho công ty B',
              'Kiểm tra tồn kho',
            ].map((t) => (
              <label key={t} className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1" />
                <span className="text-gray-700">{t}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard