function RegisterPage() {
    return (
        <form className="space-y-4">
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700" htmlFor="name">
                    Họ và tên
                </label>
                <input
                    id="name"
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    placeholder="Nguyễn Văn A"
                />
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    placeholder="you@example.com"
                />
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                    Mật khẩu
                </label>
                <input
                    id="password"
                    type="password"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    placeholder="••••••••"
                />
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                    Nhập lại mật khẩu
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    placeholder="••••••••"
                />
            </div>

            <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
                Đăng ký
            </button>

            <p className="pt-2 text-center text-xs text-gray-600">
                Đã có tài khoản?{' '}
                <a href="/auth/login" className="font-medium text-gray-900 hover:underline">
                    Đăng nhập
                </a>
            </p>
        </form>
    )
}

export default RegisterPage