import { useState, useEffect } from 'react'
import { ExternalLink, RefreshCw, FileCode, Clock, ShieldCheck } from 'lucide-react'

export default function ApiDocs() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [iframeKey, setIframeKey] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const docUrl = '/api/docs/v1'

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1)
  }

  const handleOpenNewTab = () => {
    window.open(docUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="iframe-page">
      {/* Header bar */}
      <div className="iframe-header">
        <div className="iframe-header-left">
          <div className="iframe-header-dot" />
          <h1 className="iframe-header-title">API Documentation (Swagger)</h1>
          <span className="iframe-header-badge">Swagger UI v1</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
            <ShieldCheck size={12} />
            Hỗ trợ Đăng nhập & Test API (Bearer Token)
          </span>
        </div>

        <div className="iframe-header-actions">
          <span className="iframe-clock mr-2 hidden md:inline-flex">
            <Clock size={14} />
            {currentTime.toLocaleTimeString('vi-VN')}
          </span>
          <button
            onClick={handleRefresh}
            className="iframe-btn iframe-btn-ghost"
            title="Tải lại trang"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Tải lại</span>
          </button>
          <button
            onClick={handleOpenNewTab}
            className="iframe-btn iframe-btn-primary"
            title="Mở trong tab mới"
          >
            <ExternalLink size={14} />
            <span>Mở tab mới</span>
          </button>
        </div>
      </div>

      {/* Embedded iframe container */}
      <div className="iframe-container">
        <iframe
          key={iframeKey}
          src={docUrl}
          title="CRM API Documentation"
          className="iframe-embed"
        />
      </div>
    </div>
  )
}
