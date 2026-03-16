function Loading() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
            <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
                {/* glow */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="absolute left-1/3 top-1/3 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/15 blur-3xl" />
                </div>

                <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur sm:p-10">
                    <div className="flex items-center gap-4">
                        {/* spinner */}
                        <div className="relative h-14 w-14">
                            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-400 border-r-fuchsia-400" />
                            <div className="absolute inset-2 rounded-full bg-white/5" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs font-semibold tracking-widest text-white/60">
                                CRM MINI
                            </p>
                            <h1 className="mt-1 truncate text-xl font-semibold">
                                Đang tải dữ liệu…
                            </h1>
                            <p className="mt-1 text-sm text-white/60">
                                Chuẩn bị mọi thứ để bạn vào làm việc ngay.
                            </p>
                        </div>
                    </div>

                    {/* faux progress */}
                    <div className="mt-7">
                        <div className="flex items-center justify-between text-xs text-white/60">
                            <span>Khởi tạo phiên</span>
                            <span className="font-mono">sync</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div className="h-full w-1/2 animate-[loadingbar_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-300" />
                        </div>
                        <p className="mt-3 text-xs text-white/50">
                            Tip: Bạn có thể mở sidebar để điều hướng nhanh.
                        </p>
                    </div>

                    {/* keyframes via tailwind arbitrary animation above */}
                    <style>
                        {`
              @keyframes loadingbar {
                0% { transform: translateX(-120%); }
                50% { transform: translateX(30%); }
                100% { transform: translateX(220%); }
              }
            `}
                    </style>
                </div>
            </div>
        </div>
    )
}

export default Loading
