import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginThunk, clearError } from '@/redux/slice/authSlice'
import { selectIsAuthLoading, selectAuthError, selectIsAuthenticated } from '@/redux/selectors/authSelectors'
import { toast } from 'react-toastify'
import styles from './LoginPage.module.css'
import bgLogin from "@/assets/images/banner_image.png";

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoading = useSelector(selectIsAuthLoading)
  const error = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

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
    <div className={styles.loginContainer}>
      {/* Ảnh nền toàn màn hình */}
      <div className={styles.backgroundImage}>
        <img src={bgLogin} alt="Background" />
        <div className={styles.overlay}></div>
      </div>

      {/* Form login bên phải */}
      <div className={styles.loginFormWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <h1 className={styles.logo}>IT-HELPDESK</h1>
            <p className={styles.subtitle}>Đăng nhập / Đăng ký để tiếp tục</p>
          </div>

          <h2 className={styles.title}>Đăng nhập</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorMessage}>
                {typeof error === 'string' ? error : error.message || 'Đăng nhập thất bại!'}
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={styles.input}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="password">
                Mật khẩu
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className={styles.passwordInput}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePassword}
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/auth/forgot-password')}
                className={styles.forgotPassword}
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.loginButton}
            >
              {isLoading ? (
                <span className={styles.loadingSpinner}>
                  <svg className={styles.spinner} viewBox="0 0 24 24">
                    <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>

            <div className={styles.registerLink}>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/register')}
                className={styles.registerButton}
              >
                Đăng ký
              </button>
            </div>
          </form>

          <div className={styles.footerText}>
            PROFESSIONAL SUPPORT &amp; TECHNICAL SOLUTIONS
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage