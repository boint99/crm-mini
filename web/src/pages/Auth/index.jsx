import { Outlet } from 'react-router-dom'


function Auth() {
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