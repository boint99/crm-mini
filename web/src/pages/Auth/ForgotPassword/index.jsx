import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authAPI } from '@/api/auth'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'

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

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50'
  const labelClass = 'block text-sm font-medium text-gray-700'

  return (
    <div className="space-y-4">
      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-700">Quay lại đăng nhập</span>
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="email">
              Địa chỉ Email tài khoản
            </label>
            <input
              id="email"
              type="email"
              disabled={isLoading}
              className={inputClass}
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
              <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400 cursor-pointer transition-colors"
          >
            {isLoading ? 'Đang gửi yêu cầu...' : 'Gửi mã OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 cursor-pointer"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-700">Thay đổi Email</span>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-xs text-blue-800 space-y-2">
            <p className="font-semibold">Mã OTP đã được gửi về Email.</p>
            <p>Hệ thống đã gửi mã OTP về Email: <strong>{emailValue}</strong></p>
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="otp">
              Mã xác thực OTP (6 chữ số)
            </label>
            <input
              id="otp"
              type="text"
              maxLength={6}
              disabled={isLoading}
              className={`${inputClass} text-center tracking-widest font-bold text-lg`}
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
              <p className="text-xs text-rose-500 mt-1">{errors.otp.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="password">
              Mật khẩu mới
            </label>
            <input
              id="password"
              type="password"
              disabled={isLoading}
              className={inputClass}
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
              <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="confirmPassword">
              Nhập lại mật khẩu mới
            </label>
            <input
              id="confirmPassword"
              type="password"
              disabled={isLoading}
              className={inputClass}
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Vui lòng nhập lại mật khẩu mới!',
                validate: (value) =>
                  value === passwordValue || 'Nhập lại mật khẩu không trùng khớp!'
              })}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400 cursor-pointer transition-colors"
          >
            {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>

          <div className="text-center text-xs text-gray-500">
            {timer > 0 ? (
              <span>Gửi lại mã OTP sau {timer} giây</span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-gray-900 font-semibold hover:underline cursor-pointer"
              >
                Gửi lại mã OTP
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
