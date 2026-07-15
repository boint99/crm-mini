import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

/* ─── Stat Card ─── */
export function StatCard({ label, value, icon: Icon, accentColor = 'indigo', badge, badgeType, subtitle }) {
  const colors = {
    indigo: { border: 'bg-indigo-500', iconBg: 'bg-indigo-50', iconText: 'text-indigo-500' },
    emerald: { border: 'bg-emerald-500', iconBg: 'bg-emerald-50', iconText: 'text-emerald-500' },
    rose: { border: 'bg-rose-400', iconBg: 'bg-rose-50', iconText: 'text-rose-400' },
    amber: { border: 'bg-amber-500', iconBg: 'bg-amber-50', iconText: 'text-amber-500' },
    blue: { border: 'bg-blue-500', iconBg: 'bg-blue-50', iconText: 'text-blue-500' }
  }
  const c = colors[accentColor] || colors.indigo

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.border} rounded-l-2xl`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-3 mt-2">
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {badge && (
              <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                badgeType === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
              }`}>
                {badge}
              </span>
            )}
            {subtitle && <span className="text-xs text-slate-400 font-medium">{subtitle}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`h-12 w-12 rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-6 w-6 ${c.iconText}`} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Filter Dropdown ─── */
export function FilterDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = options.find((o) => o.value === value)?.label || label

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer"
      >
        <span className="truncate max-w-[180px]">{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 min-w-[220px] max-h-60 overflow-y-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5">
          <button
            type="button"
            onClick={() => { onChange(''); setIsOpen(false) }}
            className={`w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition cursor-pointer ${value === '' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-700'}`}
          >
            {label}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setIsOpen(false) }}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition cursor-pointer ${opt.value === value ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-700'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Status Badge ─── */
export function StatusBadge({ status, activeLabel = 'Đang hoạt động', inactiveLabel = 'Ngưng hoạt động' }) {
  const isActive = status === 'ENABLE' || status === 'ACTIVE'
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {activeLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 ring-1 ring-rose-200">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
      {inactiveLabel}
    </span>
  )
}

/* ─── Table Header ─── */
export function TableHeader({ children }) {
  return (
    <th className="sticky top-0 bg-slate-50/80 backdrop-blur-sm px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap z-10">
      {children}
    </th>
  )
}

export function TableHeaderRight({ children }) {
  return (
    <th className="sticky top-0 bg-slate-50/80 backdrop-blur-sm px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap z-10">
      {children}
    </th>
  )
}

/* ─── Search Bar ─── */
export function SearchBar({ value, onChange, placeholder = 'Tìm kiếm...' }) {
  return (
    <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 w-80">
        <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-400 outline-none w-full"
        />
      </div>
    </div>
  )
}

/* ─── Action Buttons ─── */
export function ActionButton({ icon: Icon, onClick, variant = 'edit', title }) {
  const styles = {
    edit: 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50',
    delete: 'text-slate-500 hover:text-rose-600 hover:bg-rose-50',
    warning: 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg p-2 transition cursor-pointer ${styles[variant] || styles.edit}`}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

/* ─── Pagination ─── */
export function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 3
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  return (
    <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between">
      <p className="text-sm text-slate-500">
        Trang <span className="font-semibold text-slate-700">{currentPage}</span> / {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {getPageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg text-sm font-semibold transition cursor-pointer ${
              p === currentPage
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* ─── Empty State ─── */
export function EmptyState({ icon: Icon, message }) {
  return (
    <tbody>
      <tr>
        <td colSpan={99}>
          <div className="flex h-48 flex-col items-center justify-center gap-3 text-slate-400">
            <Icon className="h-12 w-12 text-slate-300" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        </td>
      </tr>
    </tbody>
  )
}
