import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getCookie, setCookie, deleteCookie } from '@/utils/cookie'
import { authAPI } from '@/api/auth'
import { toast } from 'react-toastify'

// Helper to get initial user from localStorage
const getInitialUser = () => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

// Check if token exists in cookie for initial auth status
const checkIsAuthenticated = () => {
  return !!getCookie('accessToken')
}

// LOGIN THUNK
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // POST login to backend
      // authAPI.login() trả về res.data = { success, data: { accessToken, ...user }, message }
      const response = await authAPI.login(credentials)

      if (response.success && response.data) {
        const { accessToken, ...user } = response.data

        // Save accessToken into cookie (1 ngày — JWT sẽ tự refresh khi expired)
        setCookie('accessToken', accessToken, 1)

        // Save user details (non-sensitive) into localStorage
        localStorage.setItem('user', JSON.stringify(user))

        return user
      } else {
        return rejectWithValue(response.message || 'Login failed')
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

// LOGOUT THUNK
export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      // Call backend logout API to revoke refreshToken
      await authAPI.logout()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logout failed')
    } finally {
      // Always clear local auth cookies & localStorage regardless of backend response
      deleteCookie('accessToken')
      localStorage.removeItem('user')
    }
  }
)

const initialState = {
  user: getInitialUser(),
  isAuthenticated: checkIsAuthenticated(),
  isLoading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Local logout utility (called from Axios interceptor on 401 refresh failure)
    logout: (state) => {
      deleteCookie('accessToken')
      localStorage.removeItem('user')
      state.user = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
        state.error = null
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload
      })

      // LOGOUT
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
