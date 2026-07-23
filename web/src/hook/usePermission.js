/**
 * usePermission — Hook kiểm tra quyền RBAC phía Frontend
 *
 * Lấy danh sách permissions từ API /api/auth/profile, cache trong state.
 * Super Admin (accountId === 1) luôn bypass mọi kiểm tra.
 */
import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { authAPI } from '@/api/auth'

export function usePermission() {
  const user = useSelector((state) => state.auth.user)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Fetch permissions từ API profile (1 lần sau khi đăng nhập)
  useEffect(() => {
    if (!isAuthenticated || loaded) return

    const fetchPermissions = async () => {
      setLoading(true)
      try {
        const res = await authAPI.getProfile()
        if (res.success && res.data?.permissions) {
          setPermissions(res.data.permissions)
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error)
      } finally {
        setLoading(false)
        setLoaded(true)
      }
    }

    fetchPermissions()
  }, [isAuthenticated, loaded])

  // Reset khi logout
  useEffect(() => {
    if (!isAuthenticated) {
      setPermissions([])
      setLoaded(false)
    }
  }, [isAuthenticated])

  /**
   * Kiểm tra quyền theo METHOD + API Path
   * @param {string} method - HTTP Method (GET, POST, PUT, DELETE, PATCH)
   * @param {string} apiPath - Đường dẫn API (ví dụ: /api/companies, /api/companies/:id)
   * @returns {boolean}
   */
  const can = useCallback((method, apiPath) => {
    // Super Admin bypass
    if (user?.id === 1) return true

    return permissions.some(
      (p) =>
        p.method?.toUpperCase() === method.toUpperCase() &&
        p.apiPath === apiPath
    )
  }, [user, permissions])

  /**
   * Kiểm tra user có vai trò cụ thể không
   * @param {string} roleCode - Mã vai trò (ADMIN_ROLE, MANAGER, ...)
   * @returns {boolean}
   */
  const hasRole = useCallback((_roleCode) => {
    if (user?.id === 1) return true
    // roles chưa được lưu trong login response hiện tại
    // Có thể mở rộng sau khi login response trả thêm roles
    return false
  }, [user])

  return { can, hasRole, permissions, loading }
}
