import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginThunk, clearError } from '@/redux/slice/authSlice'
import { selectIsAuthLoading, selectAuthError, selectIsAuthenticated } from '@/redux/selectors/authSelectors'
import { toast } from 'react-toastify'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoading = useSelector(selectIsAuthLoading)
  const error = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
    return () => {
      dispatch(clearError())
    }
  }, [isAuthenticated, navigate, dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    try {
      await dispatch(loginThunk({ email: email.trim(), password })).unwrap()
      toast.success('Đăng nhập thành công!')
      navigate('/', { replace: true })
    } catch (err) {
      // Bỏ qua hiển thị toast lỗi vì lỗi đã được hiển thị trên giao diện qua state error
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
          {typeof error === 'string' ? error : error.message || 'Đăng nhập thất bại!'}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700" htmlFor="password">
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50"
          placeholder="••••••••"
          required
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="h-3 w-3 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
          <span>Ghi nhớ đăng nhập</span>
        </label>
        <button type="button" className="text-gray-900 hover:underline">
                    Quên mật khẩu?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full rounded-lg bg-gray-900 px-4 py-2 text-base font-medium text-white hover:bg-gray-800 disabled:bg-gray-400 cursor-pointer transition-colors"
      >
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      <p className="pt-2 text-center text-xs text-gray-600">
        Chưa có tài khoản?{' '}
        <a href="/auth/register" className="font-medium text-gray-900 hover:underline">
          Đăng ký
        </a>
      </p>
    </form>
  )
}

export default LoginPage