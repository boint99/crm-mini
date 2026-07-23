
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginThunk, clearError } from '@/redux/slice/authSlice'
import { selectIsAuthLoading, selectAuthError, selectIsAuthenticated } from '@/redux/selectors/authSelectors'
import { toast } from 'react-toastify'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import styles from '../AuthLayout.module.css'
import logoImg from '@/assets/images/logo.png'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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
    dispatch(clearError())

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

        <div className="flex justify-end">
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


        <div className={styles.registerLink}>
          {'Don\'t have an account?'}{' '}
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