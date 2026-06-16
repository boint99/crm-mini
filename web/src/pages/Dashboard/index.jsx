import { useNavigate } from "react-router-dom";
import { Settings, Hammer, Users, Network, Trash2, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  const comingSoonFeatures = [
    {
      title: "Báo cáo & Phân tích nhân sự",
      desc: "Biểu đồ trực quan hóa dữ liệu nhân viên, phân bố phòng ban và tình hình nhân sự toàn công ty.",
      icon: Users,
      color: "from-blue-500 to-indigo-500",
      glow: "rgba(59, 130, 246, 0.15)",
    },
    {
      title: "Giám sát tài nguyên mạng",
      desc: "Thống kê tình trạng cấp phát dải IP, quản lý VLAN và cảnh báo xung đột mạng tự động.",
      icon: Network,
      color: "from-purple-500 to-pink-500",
      glow: "rgba(168, 85, 247, 0.15)",
    },
    {
      title: "Quy trình bàn giao (Offboarding)",
      desc: "Theo dõi tiến độ thu hồi tài khoản nội bộ, thiết bị mạng và kiểm tra các công việc đang chờ.",
      icon: Trash2,
      color: "from-amber-500 to-orange-500",
      glow: "rgba(245, 158, 11, 0.15)",
    },
  ];

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 overflow-hidden rounded-2xl bg-slate-950/40 border border-slate-900">
      {/* Decorative gradient glowing circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
        {/* Animated Icon Container */}
        <div className="relative flex items-center justify-center w-28 h-28 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-md">
          <Settings
            size={56}
            className="text-indigo-400 animate-spin"
            style={{ animationDuration: "10s" }}
          />
          <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg border border-indigo-400/40">
            <Hammer size={20} className="text-white animate-bounce" style={{ animationDuration: "2.5s" }} />
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 uppercase">
            Tính năng đang phát triển
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Trang Dashboard Đang Nâng Cấp
          </h2>
          <p className="text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Hệ thống Dashboard đang được thiết kế lại để mang đến các biểu đồ phân tích trực quan nhất về dữ liệu nhân sự và hạ tầng mạng của CRM.
          </p>
        </div>

        {/* Navigation Action */}
        <div>
          <button
            onClick={() => navigate("/organizations/employees")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-indigo-500/20 cursor-pointer border border-indigo-400/30 group"
          >
            Quản lý nhân sự
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Coming Soon Features Grid */}
      <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full mt-16">
        {comingSoonFeatures.map((feat) => {
          const IconComponent = feat.icon;
          return (
            <div
              key={feat.title}
              className="relative overflow-hidden rounded-2xl bg-slate-900/50 hover:bg-slate-900/85 border border-slate-800/80 hover:border-slate-700/60 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:scale-[1.02] cursor-default p-6"
              style={{
                boxShadow: `inset 0 0 20px ${feat.glow}, 0 4px 30px rgba(0,0,0,0.1)`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${feat.color} text-white shadow-md`}>
                  <IconComponent size={22} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 group-hover:text-indigo-400 transition-colors">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                {feat.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
