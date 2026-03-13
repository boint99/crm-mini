import { Link, useLocation, useNavigate } from 'react-router-dom'

function NotFound() {
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className="min-h-[70vh] w-full p-6">
            <div className="mx-auto max-w-3xl">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-indigo-600">404</p>
                            <h1 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
                                Trang web không tồn tại!
                            </h1>
                        </div>

                        <div className="shrink-0">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <span className="text-xl font-bold">?</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link
                            to="/"
                            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                            Về Dashboard
                        </Link>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 cursor-pointer"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotFound
