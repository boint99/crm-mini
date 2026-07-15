import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function NotPermissionPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      {/* Glow Effect / Glass Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/50 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Shield Icon with concentric circles */}
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-50 rounded-full animate-ping opacity-20 duration-1000" />
          <div className="absolute inset-2 bg-rose-100/50 rounded-full" />
          <div className="relative w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-200">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          Truy cập bị từ chối
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          Tài khoản của bạn không có đủ quyền hạn để truy cập hoặc thực thi hành động trên tài nguyên này. Vui lòng liên hệ Quản trị viên hệ thống để biết thêm chi tiết.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 hover:opacity-95 transition cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Trở về trang chủ
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang trước
          </button>
        </div>
      </div>
    </div>
  )
}
