import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, Users, Package } from "lucide-react";

/* ── Mock data ─────────────────────────────────────── */
const sparkSales    = [30,45,28,60,52,70,65];
const sparkRevenue  = [20,35,50,40,60,55,80];
const sparkVisitors = [60,50,70,45,80,55,65];
const sparkStock    = [40,55,45,60,50,70,60];

const revenueChartData = [
  { name: "Sun", sales: 200, revenue: 100 },
  { name: "Mon", sales: 450, revenue: 300 },
  { name: "Tue", sales: 600, revenue: 380 },
  { name: "Wed", sales: 800, revenue: 500 },
  { name: "Thu", sales: 700, revenue: 450 },
  { name: "Fri", sales: 1100, revenue: 700 },
  { name: "Sat", sales: 900, revenue: 600 },
];

const salesByCategory = [
  { name: "Electronics", value: 45 },
  { name: "Fashion",     value: 30 },
  { name: "Household",   value: 25 },
];
const PIE_COLORS = ["#6366f1", "#60a5fa", "#a5b4fc"];

const recentSales = [
  { name: "Bamboo Watch",    category: "Accessories", price: "$65.00",  status: "SHIPPED" },
  { name: "Black Watch",     category: "Accessories", price: "$72.00",  status: "PENDING" },
  { name: "Blue Band",       category: "Fitness",     price: "$79.00",  status: "SHIPPED" },
  { name: "Blue T-Shirt",    category: "Clothing",    price: "$29.00",  status: "SHIPPED" },
  { name: "Bracelet",        category: "Accessories", price: "$15.00",  status: "CANCELLED" },
];

const topProducts = [
  { name: "Bamboo Watch",  price: "$65.00", stars: 4, reviews: 7 },
  { name: "Black Watch",   price: "$72.00", stars: 4, reviews: 6 },
  { name: "Blue Band",     price: "$29.00", stars: 4, reviews: 5 },
  { name: "Bracelet",      price: "$15.00", stars: 4, reviews: 3 },
];

/* ── Sub-components ─────────────────────────────────── */
function Sparkline({ data, color }) {
  return (
    <ResponsiveContainer width={80} height={40}>
      <AreaChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2}
          fill={`url(#sg-${color.replace('#','')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatusBadge({ status }) {
  const map = {
    SHIPPED:   "bg-emerald-100 text-emerald-700",
    PENDING:   "bg-amber-100 text-amber-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

function Stars({ count, reviews }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} viewBox="0 0 20 20" className={`h-3.5 w-3.5 ${i < count ? "text-amber-400" : "text-gray-200"}`} fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {reviews && <span className="text-xs text-slate-400">({reviews})</span>}
    </div>
  );
}

/* ── Stat Card ──────────────────────────────────────── */
function StatCard({ label, value, change, up, sparkData, color, Icon, iconColor }) {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`stat-icon ${iconColor}`}>
            <Icon size={22} className="text-white" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-500" : "text-red-400"}`}>
            {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {change}
          </span>
          <Sparkline data={sparkData} color={color} />
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────── */
export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Modern E-Commerce Dashboard V1</h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sales"    value="120"  change="+12%" up sparkData={sparkSales}    color="#6366f1" Icon={ShoppingCart} iconColor="blue" />
        <StatCard label="Revenue"  value="$450" change="+20%" up sparkData={sparkRevenue}  color="#22c55e" Icon={DollarSign}   iconColor="green" />
        <StatCard label="Visitors" value="360"  change="+24%" up sparkData={sparkVisitors} color="#f97316" Icon={Users}        iconColor="orange" />
        <StatCard label="Stock"    value="164"  change="+30%" up sparkData={sparkStock}    color="#a855f7" Icon={Package}      iconColor="purple" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Revenue Overview */}
        <div className="xl:col-span-2 dashboard-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Revenue Overview</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                  Sales
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                  Revenue
                </span>
              </div>
              <select className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white cursor-pointer">
                <option>Last Week</option>
                <option>Last Month</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 30px rgba(0,0,0,.08)", fontSize: 13 }}
                cursor={{ stroke: "#e2e8f0" }}
              />
              <Area type="monotone" dataKey="sales" stroke="#818cf8" strokeWidth={2.5}
                fill="url(#salesGrad)" dot={false} />
              <Area type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={2.5}
                fill="url(#revenueGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category */}
        <div className="dashboard-card p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3}>
                {salesByCategory.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 13, boxShadow: "0 8px 30px rgba(0,0,0,.08)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2.5">
            {salesByCategory.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2.5 text-sm text-slate-600">
                <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                <span className="font-medium">{item.name}</span>
                <span className="ml-auto font-semibold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Recent Sales */}
        <div className="xl:col-span-2 dashboard-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="font-semibold text-slate-800">Recent Sales</h3>
            <button className="text-sm text-indigo-500 hover:text-indigo-600 font-medium cursor-pointer transition-colors">
              View all
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Category</th>
                <th className="px-5 py-3 text-left font-medium">Price</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentSales.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Package size={14} className="text-indigo-500" />
                      </div>
                      <span className="font-medium text-slate-700">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{row.category}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">{row.price}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div className="dashboard-card overflow-hidden">
          <div className="px-5 py-4">
            <h3 className="font-semibold text-slate-800">Top Products</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {topProducts.map((p) => (
              <div key={p.name} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/80 transition-colors">
                <div className="h-11 w-11 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                  <Package size={18} className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                  <Stars count={p.stars} reviews={p.reviews} />
                </div>
                <span className="text-sm font-bold text-slate-800">{p.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
