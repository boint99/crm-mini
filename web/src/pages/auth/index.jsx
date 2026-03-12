import { Navigate, Outlet, useLocation } from 'react-router-dom'

function isAuthenticated() {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token')
    const user = localStorage.getItem('user')
    return Boolean(token || user)
}

function Auth() {
    const location = useLocation()

    // Nếu đã đăng nhập mà vẫn vào /auth/* thì đá về trang chủ
    if (isAuthenticated()) {
        return <Navigate to="/" replace state={{ from: location }} />
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="mb-6 text-center">
                    <h1 className="text-xl font-semibold text-gray-900">CRM Mini</h1>
                    <p className="mt-1 text-sm text-gray-500">Đăng nhập / Đăng ký để tiếp tục</p>
                </div>
                <Outlet />
            </div>
        </div>
    )
}

export default Auth