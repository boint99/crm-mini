function LoginPage() {
    return (
        <form className="space-y-4">
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

            <div className="flex items-center justify-between text-xs text-gray-600">
                <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-3 w-3" />
                    <span>Ghi nhớ đăng nhập</span>
                </label>
                <button type="button" className="text-gray-900 hover:underline">
                    Quên mật khẩu?
                </button>
            </div>

            <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
                Đăng nhập
            </button>

            <p className="pt-2 text-center text-xs text-gray-600">
                Chưa có tài khoản?{' '}
                <a href="/auth/register" className="font-medium text-gray-900 hover:underline">
                    Đăng ký
                </a>
            </p>
        </form>
    )
}

export default LoginPage