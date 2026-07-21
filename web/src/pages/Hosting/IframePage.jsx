import { useState, useEffect } from 'react'
import { ExternalLink, RefreshCw, Globe, Clock, ArrowUpRight } from 'lucide-react'

function IframePage({ title, url }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const domain = url.replace(/^https?:\/\//, '')

  const handleOpen = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="iframe-page">
      {/* Header bar */}
      <div className="iframe-header">
        <div className="iframe-header-left">
          <div className="iframe-header-dot" />
          <h1 className="iframe-header-title">{title}</h1>
          <span className="iframe-header-badge">cPanel</span>
        </div>
        <div className="iframe-header-actions">
          <span className="iframe-clock">
            <Clock size={14} />
            {currentTime.toLocaleTimeString('vi-VN')}
          </span>
        </div>
      </div>

      {/* Portal content */}
      <div className="iframe-portal">
        <div className="iframe-portal-card">
          {/* Decorative background */}
          <div className="iframe-portal-bg" />

          {/* Icon */}
          <div className="iframe-portal-icon">
            <Globe size={40} />
          </div>

          {/* Info */}
          <h2 className="iframe-portal-title">{title} — cPanel</h2>
          <p className="iframe-portal-domain">{domain}</p>
          <p className="iframe-portal-desc">
            Quản lý hosting, tên miền, email, database và các dịch vụ web hosting thông qua cPanel.
          </p>

          {/* Action button */}
          <button onClick={handleOpen} className="iframe-portal-btn">
            <ExternalLink size={18} />
            <span>Mở cPanel</span>
            <ArrowUpRight size={14} className="iframe-portal-btn-arrow" />
          </button>

          {/* Quick links */}
          <div className="iframe-portal-links">
            <a href={`${url}/login`} target="_blank" rel="noopener noreferrer" className="iframe-portal-link">
              Đăng nhập
            </a>
          </div>
        </div>

        {/* Info note */}
        <div className="iframe-portal-note">
          <p>
            <strong>Lưu ý:</strong> cPanel sẽ mở trong tab mới do chính sách bảo mật của server không cho phép nhúng trực tiếp.
          </p>
        </div>
      </div>
    </div>
  )
}

export default IframePage
