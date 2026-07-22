import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { authAPI } from '@/api/auth'
import { toast } from 'react-toastify'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import styles from '../AuthLayout.module.css'
import logoImg from '@/assets/images/logo.png'

function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    mode: 'onTouched'
  })

  const passwordValue = useWatch({ control, name: 'password' })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      await authAPI.register({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        password: data.password,
        confirmPassword: data.confirmPassword
      })
      toast.success('Đăng ký tài khoản thành công!')
      navigate('/auth/login')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Đăng ký thất bại!'
      setErrorMsg(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.loginCardInner}>
      {/* Logo ở đầu card đăng ký */}
      <div className={styles.avatarHeader}>
        <div className={styles.avatarCircle} style={{ background: '#ffffff', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <img src={logoImg} alt="Logo" className="w-full h-full object-contain p-1" />
        </div>
      </div>

      <h2 className={styles.welcomeTitle}>Đăng ký tài khoản</h2>
      <p className={styles.welcomeSubtitle}>Tạo tài khoản mới để truy cập và quản lý hệ thống của bạn</p>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {errorMsg && (
          <div className={styles.errorMessage}>
            {errorMsg}
          </div>
        )}

        {/* Hàng Họ và Tên */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                id="lastName"
                type="text"
                disabled={isLoading}
                className={styles.inputWithIcon}
                placeholder="Họ và tên đệm"
                {...register('lastName', {
                  required: 'Vui lòng nhập họ và tên đệm!'
                })}
              />
            </div>
            {errors.lastName && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', paddingLeft: '0.5rem' }}>
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                id="firstName"
                type="text"
                disabled={isLoading}
                className={styles.inputWithIcon}
                placeholder="Tên"
                {...register('firstName', {
                  required: 'Vui lòng nhập tên!'
                })}
              />
            </div>
            {errors.firstName && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', paddingLeft: '0.5rem' }}>
                {errors.firstName.message}
              </p>
            )}
          </div>
        </div>

        {/* Địa chỉ Email */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <Mail size={18} className={styles.inputIcon} />
            <input
              id="email"
              type="email"
              disabled={isLoading}
              className={styles.inputWithIcon}
              placeholder="you@example.com"
              {...register('email', {
                required: 'Vui lòng nhập email!',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Địa chỉ email không hợp lệ!'
                }
              })}
            />
          </div>
          {errors.email && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', paddingLeft: '0.5rem' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Mật khẩu */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              disabled={isLoading}
              className={styles.passwordInputWithIcon}
              placeholder="Mật khẩu"
              {...register('password', {
                required: 'Vui lòng nhập mật khẩu!',
                minLength: {
                  value: 8,
                  message: 'Mật khẩu phải tối thiểu 8 ký tự!'
                }
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.togglePasswordBtn}
              tabIndex="-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', paddingLeft: '0.5rem' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Nhập lại mật khẩu */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              disabled={isLoading}
              className={styles.passwordInputWithIcon}
              placeholder="Nhập lại mật khẩu"
              {...register('confirmPassword', {
                required: 'Vui lòng nhập lại mật khẩu!',
                validate: (value) =>
                  value === passwordValue || 'Mật khẩu xác nhận không trùng khớp!'
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.togglePasswordBtn}
              tabIndex="-1"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', paddingLeft: '0.5rem' }}>
              {errors.confirmPassword.message}
            </p>
          )}
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
              Đang tạo tài khoản...
            </span>
          ) : (
            'Đăng ký tài khoản'
          )}
        </button>

        <div className={styles.registerLink}>
          Đã có tài khoản?{' '}
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className={styles.registerButton}
          >
            Đăng nhập ngay
          </button>
        </div>
      </form>
      <div className={styles.copyrightText}>
        © 2026 IT-Helpdesk System
      </div>
    </div>
  )
}

export default RegisterPage