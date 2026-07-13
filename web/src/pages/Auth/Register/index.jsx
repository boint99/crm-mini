import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authAPI } from '@/api/auth'
import { toast } from 'react-toastify'
import styles from '../AuthLayout.module.css'

function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
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

  const passwordValue = watch('password')

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
    <>
      <h2 className={styles.title}>Đăng ký tài khoản</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {errorMsg && (
          <div className={styles.errorMessage}>
            {errorMsg}
          </div>
        )}

        {/* Hàng Họ và Tên */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="lastName">
              Họ và tên đệm
            </label>
            <input
              id="lastName"
              type="text"
              disabled={isLoading}
              className={styles.input}
              placeholder="Nguyễn Văn"
              {...register('lastName', {
                required: 'Vui lòng nhập họ và tên đệm!'
              })}
            />
            {errors.lastName && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="firstName">
              Tên
            </label>
            <input
              id="firstName"
              type="text"
              disabled={isLoading}
              className={styles.input}
              placeholder="A"
              {...register('firstName', {
                required: 'Vui lòng nhập tên!'
              })}
            />
            {errors.firstName && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.firstName.message}
              </p>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">
            Địa chỉ Email
          </label>
          <input
            id="email"
            type="email"
            disabled={isLoading}
            className={styles.input}
            placeholder="you@example.com"
            {...register('email', {
              required: 'Vui lòng nhập email!',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Địa chỉ email không hợp lệ!'
              }
            })}
          />
          {errors.email && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">
            Mật khẩu
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              disabled={isLoading}
              className={styles.passwordInput}
              placeholder="••••••••"
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
              className={styles.togglePassword}
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
          {errors.password && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="confirmPassword">
            Nhập lại mật khẩu
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              disabled={isLoading}
              className={styles.passwordInput}
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Vui lòng nhập lại mật khẩu!',
                validate: (value) =>
                  value === passwordValue || 'Mật khẩu xác nhận không trùng khớp!'
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.togglePassword}
            >
              {showConfirmPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
          {errors.confirmPassword && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`${styles.loginButton} mt-2`}
        >
          {isLoading ? (
            <span className={styles.loadingSpinner}>
              <svg className={styles.spinner} viewBox="0 0 24 24">
                <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang đăng ký...
            </span>
          ) : (
            'Đăng ký'
          )}
        </button>

        <div className={styles.registerLink}>
          Đã có tài khoản?{' '}
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className={styles.registerButton}
          >
            Đăng nhập
          </button>
        </div>
      </form>
    </>
  )
}

export default RegisterPage