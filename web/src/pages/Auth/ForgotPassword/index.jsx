import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { authAPI } from '@/api/auth'
import { toast } from 'react-toastify'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, KeyRound } from 'lucide-react'
import styles from '../AuthLayout.module.css'
import logoImg from '@/assets/images/logo.png'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
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

  const emailValue = useWatch({ control, name: 'email' })
  const passwordValue = useWatch({ control, name: 'password' })

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
       
      console.error('Lỗi đặt lại mật khẩu:', err)
      toast.error(err?.response?.data?.message || err?.message || 'Đặt lại mật khẩu thất bại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.loginCardInner}>
      {/* Logo ở đầu card quên mật khẩu */}
      <div className={styles.avatarHeader}>
        <div className={styles.avatarCircle} style={{ background: '#ffffff', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <img src={logoImg} alt="Logo" className="w-full h-full object-contain p-1" />
        </div>
      </div>

      <h2 className={styles.welcomeTitle}>
        {step === 1 ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
      </h2>
      <p className={styles.welcomeSubtitle}>
        {step === 1
          ? 'Nhập email tài khoản của bạn để nhận mã xác thực OTP'
          : 'Nhập mã OTP đã nhận và thiết lập mật khẩu mới'
        }
      </p>

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className={styles.form}>
          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                disabled={isLoading}
                className={styles.inputWithIcon}
                placeholder="Địa chỉ Email"
                {...register('email', {
                  required: 'Vui lòng nhập Email!',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Định dạng email không hợp lệ!'
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
              'Gửi mã xác thực OTP'
            )}
          </button>

          <div className={styles.registerLink}>
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
            >
              <ArrowLeft size={16} />
              Quay lại đăng nhập
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit(handleResetPassword)} className={styles.form}>
          <div className="rounded-xl bg-indigo-50/70 border border-indigo-100/50 p-3 text-xs text-indigo-900 space-y-1">
            <p className="font-semibold">Mã OTP đã được gửi thành công!</p>
            <p className="opacity-90">Hệ thống đã gửi mã OTP về địa chỉ email: <strong>{emailValue}</strong></p>
          </div>

          {/* Mã xác thực OTP */}
          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <KeyRound size={18} className={styles.inputIcon} />
              <input
                id="otp"
                type="text"
                maxLength={6}
                disabled={isLoading}
                className={styles.inputWithIcon}
                placeholder="Mã OTP gồm 6 chữ số"
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
            </div>
            {errors.otp && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', paddingLeft: '0.5rem' }}>
                {errors.otp.message}
              </p>
            )}
          </div>

          {/* Mật khẩu mới */}
          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                disabled={isLoading}
                className={styles.passwordInputWithIcon}
                placeholder="Mật khẩu mới"
                {...register('password', {
                  required: 'Vui lòng điền mật khẩu mới!',
                  minLength: {
                    value: 8,
                    message: 'Mật khẩu mới phải có tối thiểu 8 ký tự!'
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

          {/* Nhập lại mật khẩu mới */}
          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                disabled={isLoading}
                className={styles.passwordInputWithIcon}
                placeholder="Nhập lại mật khẩu mới"
                {...register('confirmPassword', {
                  required: 'Vui lòng nhập lại mật khẩu mới!',
                  validate: (value) =>
                    value === passwordValue || 'Nhập lại mật khẩu không trùng khớp!'
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
                Đang xử lý...
              </span>
            ) : (
              'Đặt lại mật khẩu'
            )}
          </button>

          <div className={styles.registerLink} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            {timer > 0 ? (
              <span className="text-xs text-slate-500 font-medium">Gửi lại mã OTP sau {timer} giây</span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className={styles.registerButton}
              >
                Gửi lại mã OTP
              </button>
            )}

            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer mt-1"
              disabled={isLoading}
            >
              <ArrowLeft size={14} />
              Thay đổi địa chỉ Email
            </button>
          </div>
        </form>
      )}
      <div className={styles.copyrightText}>
        © 2026 IT-Helpdesk System
      </div>
    </div>
  )
}
