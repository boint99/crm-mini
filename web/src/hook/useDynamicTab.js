import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { NAV_GROUPS } from '@/utils/menuConfig'
import logoImg from '@/assets/images/logo.png'

/**
 * Custom Hook để thay đổi động Tiêu đề (Title) và Biểu tượng (Favicon) trên Tab trình duyệt
 * @param {string} title - Tiêu đề của trang
 * @param {string} [faviconUrl] - Đường dẫn biểu tượng Logo (Favicon)
 */
export function useDynamicTab(title, faviconUrl = logoImg) {
  useEffect(() => {
    if (title) {
      document.title = title
    }

    if (faviconUrl) {
      let link = document.querySelector('link[rel*=\'icon\']')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'shortcut icon'
        document.head.appendChild(link)
      }
      link.href = faviconUrl
    }
  }, [title, faviconUrl])
}

// Phẳng hóa tất cả menu item từ sidebar
const ALL_SIDEBAR_ITEMS = NAV_GROUPS.flatMap((g) => g.items || [])

// Các trang bổ sung ngoài menu chính
const EXTRA_ROUTES = [
  { path: '/organizations/organization', label: 'Cây sơ đồ tổ chức' },
  { path: '/profile', label: 'Thông tin cá nhân' },
  { path: '/not-permission', label: 'Không có quyền truy cập' },
  { path: '/auth/login', label: 'Đăng nhập' },
  { path: '/auth/register', label: 'Đăng ký' },
  { path: '/auth/forgot-password', label: 'Quên mật khẩu' }
]

/**
 * Tự động đồng bộ Tiêu đề Tab trình duyệt và Favicon dựa theo menu Sidebar đang chọn
 */
export function useAutoSidebarTab() {
  const location = useLocation()

  useEffect(() => {
    const currentPath = location.pathname

    // Tìm trong danh sách Sidebar
    let menuItem = ALL_SIDEBAR_ITEMS.find((item) => item.path === currentPath)
    if (!menuItem) {
      // Tìm trong các sub-children của sidebar nếu có
      for (const groupItem of ALL_SIDEBAR_ITEMS) {
        if (groupItem.children) {
          const sub = groupItem.children.find((c) => c.path === currentPath)
          if (sub) {
            menuItem = sub
            break
          }
        }
      }
    }

    // Nếu không có trong Sidebar, tìm trong danh sách các route bổ sung
    const extraItem = EXTRA_ROUTES.find((item) => item.path === currentPath)

    const pageLabel = menuItem?.label || extraItem?.label || 'Helpdesk'

    // Đặt Tiêu đề Tab và Favicon
    document.title = `${pageLabel}`

    let link = document.querySelector('link[rel*=\'icon\']')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'shortcut icon'
      document.head.appendChild(link)
    }
    link.href = logoImg
  }, [location])
}

export default useDynamicTab
