 
import axios from 'axios'
import { getCookie } from './cookie'
import { navigateTo } from './navigateHelper'
import { ROOT_DOMAIN } from './contants'

// Set globally that axios requests should include credentials (cookies)
axios.defaults.withCredentials = true

// Set baseURL globally → tất cả API files chỉ cần dùng path tương đối (vd: '/auth/login')
axios.defaults.baseURL = ROOT_DOMAIN

// ===== AXIOS CLEAN INSTANCE (không có interceptor) =====
// Dùng riêng cho refresh-token call để tránh vòng lặp 401
export const axiosClean = axios.create({
  baseURL: ROOT_DOMAIN,
  withCredentials: true // Vẫn cần gửi HttpOnly refreshToken cookie
})

// Request Interceptor: Attach accessToken from cookie
axios.interceptors.request.use(
  (config) => {
    const token = getCookie('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Cờ chống nhiều request cùng refresh token đồng thời
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

// Response Interceptor: Handle 401 Unauthorized
axios.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Không gọi refresh token nếu request lỗi là chính API login hoặc refresh-token
      const isAuthUrl = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh-token')
      if (isAuthUrl) {
        return Promise.reject(error)
      }

      // Nếu đang refresh rồi thì xếp hàng chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axios(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Import authAPI lazily để tránh circular dependency
        const { authAPI } = await import('@/api/auth')

        // authAPI.refreshToken() trả về res.data = { success, data: { accessToken }, message }
        const response = await authAPI.refreshToken()

        // FIX Bug #2: response đã là res.data → truy cập trực tiếp response.success
        if (response?.success && response?.data?.accessToken) {
          const newAccessToken = response.data.accessToken

          // FIX Bug #3: Cookie TTL không cần 7 ngày, chỉ cần đủ cho JWT TTL
          // Dùng session cookie (không set expires) — tự xóa khi đóng browser
          // accessToken sẽ được refresh tự động khi hết hạn (5 phút)
          const { setCookie } = await import('./cookie')
          setCookie('accessToken', newAccessToken, 1) // 1 ngày — vừa đủ, sẽ auto refresh khi expired

          // Xử lý các request đang chờ
          processQueue(null, newAccessToken)

          // Retry original request with the new access token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return axios(originalRequest)
        } else {
          throw new Error('Refresh token response failed or token is missing')
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError)
        processQueue(refreshError, null)

        // If refresh token fails, log user out
        try {
          const { store } = await import('../redux/store')
          const { logout } = await import('../redux/slice/authSlice')
          store.dispatch(logout())
        } catch (logoutError) {
          // Fallback: xóa cookie thủ công nếu import store bị lỗi
          console.error('Logout dispatch failed:', logoutError)
          const { deleteCookie } = await import('./cookie')
          deleteCookie('accessToken')
          localStorage.removeItem('user')
        }

        // Redirect to login page (client-side, không reload)
        navigateTo('/auth/login')

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response?.status === 403) {
      navigateTo('/not-permission')
    }

    return Promise.reject(error)
  }
)

