import axios from 'axios'
import { axiosClean } from '@/utils/axiosConfig'

export const authAPI = {
  // GET REGISTER
  register: async (payload) => {
    const res = await axios.post(`/auth/register`, payload)
    return res.data
  },

  // LOGIN
  login: async (payload) => {
    const res = await axios.post(`/auth/login`, payload)
    return res.data
  },

  // RESET PASSWORD
  resetPassword: async (payload) => {
    const res = await axios.patch(`/auth/reset-password`, payload)
    return res.data
  },

  // GENERATE OTP
  generateOtp: async (email) => {
    const res = await axios.post(`/otp/generate`, { EMAIL: email })
    return res.data
  },

  // REFRESH TOKEN — dùng axiosClean (không có interceptor) để tránh vòng lặp 401
  refreshToken: async () => {
    const res = await axiosClean.post(`/auth/refresh-token`)
    return res.data
  },

  // LOGOUT
  logout: async () => {
    const res = await axios.post(`/auth/logout`)
    return res.data
  },

  // LOGOUT ALL
  logoutAll: async () => {
    const res = await axios.post(`/auth/logout-all`)
    return res.data
  }
}



