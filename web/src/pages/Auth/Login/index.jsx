
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginThunk, clearError } from '@/redux/slice/authSlice'
import { selectIsAuthLoading, selectAuthError, selectIsAuthenticated } from '@/redux/selectors/authSelectors'
import { toast } from 'react-toastify'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import styles from '../AuthLayout.module.css'
import logoImg from '@/assets/images/logo.png'

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
    } catch {
      // noop
    }
  }

  return (
    <div className={styles.loginCardInner}>
      {/* Logo ở đầu card đăng nhập */}
      <div className={styles.avatarHeader}>
        <div className={styles.avatarCircle} style={{ background: '#ffffff', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <img src={logoImg} alt="Logo" className="w-full h-full object-contain p-1" />
        </div>
      </div>

      <h2 className={styles.welcomeTitle}>Welcome Back</h2>
      <p className={styles.welcomeSubtitle}>Sign in to manage employees, accounts and networks</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorMessage}>
            {typeof error === 'string' ? error : error.message || 'Đăng nhập thất bại!'}
          </div>
        )}

        {/* Input Email với icon Mail */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <Mail size={18} className={styles.inputIcon} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={styles.inputWithIcon}
              placeholder="admin@vienthongact.vn"
              required
            />
          </div>
        </div>

        {/* Input Mật khẩu với icon Lock và nút hiển thị mật khẩu */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={styles.passwordInputWithIcon}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.togglePasswordBtn}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
            <span>Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => navigate('/auth/forgot-password')}
            className={styles.forgotPassword}
          >
            Forgot password?
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
              Signing In...
            </span>
          ) : (
            'Sign In'
          )}
        </button>

        <div className={styles.dividerRow}>
          <span className={styles.dividerLine}></span>
          <span className={styles.dividerText}>or</span>
          <span className={styles.dividerLine}></span>
        </div>

        <button
          type="button"
          onClick={() => toast.info('Đăng nhập Google hiện chưa được hỗ trợ.')}
          className={styles.googleButton}
        >
          <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className={styles.registerLink}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/auth/register')}
            className={styles.registerButton}
          >
            Sign Up
          </button>
        </div>
      </form>
      <div className={styles.copyrightText}>
        © 2026 IT-Helpdesk System
      </div>
    </div>
  )
}

export default LoginPage