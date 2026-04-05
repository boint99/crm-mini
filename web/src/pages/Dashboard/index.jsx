import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, Users, Package } from "lucide-react";

/* ── Mock data ─────────────────────────────────────── */
const sparkSales    = [30,45,28,60,52,70,65];
const sparkRevenue  = [20,35,50,40,60,55,80];
const sparkVisitors = [60,50,70,45,80,55,65];
const sparkStock    = [40,55,45,60,50,70,60];

const revenueData = [
  { day: "MON", revenue: 60, profit: 20 },
  { day: "TUE", revenue: 50, profit: 30 },
  { day: "WED", revenue: 80, profit: 45 },
  { day: "THU", revenue: 75, profit: 50 },
  { day: "FRI", revenue: 65, profit: 35 },
  { day: "SAT", revenue: 55, profit: 20 },
  { day: "SUN", revenue: 70, profit: 40 },
];

const salesByCategory = [
  { name: "Electronics", value: 45 },
  { name: "Fashion",     value: 30 },
  { name: "Household",   value: 25 },
];
const PIE_COLORS = ["#2563eb", "#60a5fa", "#bfdbfe"];

const recentSales = [
  { name: "Bamboo Watch",    category: "Accessories", price: "$65.00",  status: "INSTOCK" },
  { name: "Black Watch",     category: "Accessories", price: "$72.00",  status: "INSTOCK" },
  { name: "Blue Band",       category: "Fitness",     price: "$79.00",  status: "LOWSTOCK" },
  { name: "Blue T-Shirt",    category: "Clothing",    price: "$29.00",  status: "INSTOCK" },
  { name: "Bracelet",        category: "Accessories", price: "$15.00",  status: "OUTOFSTOCK" },
];

const topProducts = [
  { name: "Bamboo Watch",  price: "$65", stars: 5 },
  { name: "Black Watch",   price: "$72", stars: 4 },
  { name: "Blue Band",     price: "$79", stars: 3 },
  { name: "Blue T-Shirt",  price: "$29", stars: 5 },
];

/* ── Sub-components ─────────────────────────────────── */
function Sparkline({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2}
          fill={`url(#sg-${color})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatusBadge({ status }) {
  const map = {
    INSTOCK:    "bg-green-100 text-green-700",
    LOWSTOCK:   "bg-orange-100 text-orange-700",
    OUTOFSTOCK: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={`h-4 w-4 ${i < count ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ── Stat Card ──────────────────────────────────────── */
function StatCard({ label, value, change, up, sparkData, color, Icon }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <span className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-green-500" : "text-red-400"}`}>
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {change}
        </span>
      </div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      <Sparkline data={sparkData} color={color} />
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────── */
export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800">E-Commerce Dashboard</h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sales"    value="120"  change="+12%" up sparkData={sparkSales}    color="#2563eb" Icon={ShoppingCart} />
        <StatCard label="Revenue"  value="$450" change="+20%" up sparkData={sparkRevenue}  color="#2563eb" Icon={DollarSign} />
        <StatCard label="Visitors" value="360"  change="+24%" up sparkData={sparkVisitors} color="#ef4444" Icon={Users} />
        <StatCard label="Stock"    value="164"  change="+30%" up sparkData={sparkStock}    color="#2563eb" Icon={Package} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Revenue Overview */}
        <div className="xl:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Revenue Overview</h3>
            <select className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option>Last Week</option>
              <option>Last Month</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueData} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 12 }}
                cursor={{ fill: "#f8fafc" }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4,4,0,0]} />
              <Bar dataKey="profit"  name="Profit"  fill="#bfdbfe" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3}>
                {salesByCategory.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {salesByCategory.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                {item.name}
                <span className="ml-auto font-medium text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Recent Sales */}
        <div className="xl:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Recent Sales</h3>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-400">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              Search
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Category</th>
                <th className="px-5 py-3 text-left font-medium">Price</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentSales.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-700">{row.name}</td>
                  <td className="px-5 py-3 text-slate-500">{row.category}</td>
                  <td className="px-5 py-3 text-slate-700">{row.price}</td>
                  <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Top Products</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {topProducts.map((p) => (
              <div key={p.name} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Package size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                  <Stars count={p.stars} />
                </div>
                <span className="text-sm font-semibold text-slate-800">{p.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
