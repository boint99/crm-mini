import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authAPI } from '@/api/auth'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'
import styles from '../AuthLayout.module.css'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(0)

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      otp: '',
      password: '',
      confirmPassword: ''
    },
    mode: 'onTouched'
  })

  const emailValue = watch('email')
  const passwordValue = watch('password')

  // Handle countdown for resending OTP
  useEffect(() => {
    let interval = null
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [timer])

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()
    const isValidEmail = await trigger('email')
    if (!isValidEmail) return

    const email = getValues('email')
    setIsLoading(true)
    try {
      await authAPI.generateOtp(email.trim(), 'RESET_PASSWORD')
      setStep(2)
      setTimer(30)
      toast.success('Mã OTP đã được gửi thành công!')
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Không thể gửi OTP!'
      toast.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (data) => {
    const { email, otp, password, confirmPassword } = data

    setIsLoading(true)
    try {
      const result = await authAPI.forgotPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword: password.trim(),
        reNewPassword: confirmPassword.trim(),
        action: 'RESET_PASSWORD'
      })

      if (result) {
        toast.success('Đặt lại mật khẩu thành công!')
        navigate('/auth/login', { replace: true })
      } else {
        toast.error('Đặt lại mật khẩu thất bại!')
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Lỗi đặt lại mật khẩu:', err)
      toast.error(err?.response?.data?.message || err?.message || 'Đặt lại mật khẩu thất bại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h2 className={styles.title}>Đặt lại mật khẩu</h2>

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className={styles.form}>
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="p-1.5 rounded-md hover:bg-black/5 text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-700">Quay lại đăng nhập</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              Địa chỉ Email tài khoản
            </label>
            <input
              id="email"
              type="email"
              disabled={isLoading}
              className={styles.input}
              placeholder="you@example.com"
              {...register('email', {
                required: 'Vui lòng nhập Email!',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Định dạng email không hợp lệ!'
                }
              })}
            />
            {errors.email && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.email.message}
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
                Đang gửi yêu cầu...
              </span>
            ) : (
              'Gửi mã OTP'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(handleResetPassword)} className={styles.form}>
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="p-1.5 rounded-md hover:bg-black/5 text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-700">Thay đổi Email</span>
          </div>

          <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4 text-xs text-indigo-800 space-y-1">
            <p className="font-semibold">Mã OTP đã được gửi về Email.</p>
            <p>Hệ thống đã gửi mã OTP về Email: <strong>{emailValue}</strong></p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="otp">
              Mã xác thực OTP (6 chữ số)
            </label>
            <input
              id="otp"
              type="text"
              maxLength={6}
              disabled={isLoading}
              className={`${styles.input} text-center tracking-widest font-bold text-lg`}
              placeholder="000000"
              {...register('otp', {
                required: 'Vui lòng nhập mã OTP!',
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, '')
                },
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'Mã OTP phải gồm 6 chữ số!'
                }
              })}
            />
            {errors.otp && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.otp.message}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">
              Mật khẩu mới
            </label>
            <input
              id="password"
              type="password"
              disabled={isLoading}
              className={styles.input}
              placeholder="••••••••"
              {...register('password', {
                required: 'Vui lòng điền mật khẩu mới!',
                minLength: {
                  value: 8,
                  message: 'Mật khẩu mới phải có tối thiểu 8 ký tự!'
                }
              })}
            />
            {errors.password && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="confirmPassword">
              Nhập lại mật khẩu mới
            </label>
            <input
              id="confirmPassword"
              type="password"
              disabled={isLoading}
              className={styles.input}
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Vui lòng nhập lại mật khẩu mới!',
                validate: (value) =>
                  value === passwordValue || 'Nhập lại mật khẩu không trùng khớp!'
              })}
            />
            {errors.confirmPassword && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
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
                Đang xử lý...
              </span>
            ) : (
              'Đặt lại mật khẩu'
            )}
          </button>

          <div className={styles.registerLink}>
            {timer > 0 ? (
              <span>Gửi lại mã OTP sau {timer} giây</span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className={styles.registerButton}
              >
                Gửi lại mã OTP
              </button>
            )}
          </div>
        </form>
      )}
    </>
  )
}
