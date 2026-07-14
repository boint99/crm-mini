import { useEffect, useState } from 'react'
import { authAPI } from '@/api/auth'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '@/redux/slice/authSlice'
import {
  User,
  KeyRound,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Save,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'



function stringToColor(str) {
  if (!str) return 'hsl(220, 60%, 55%)';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 50%)`;
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Data States
  const [profile, setProfile] = useState(null)
  
  // Edit Profile States
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState('')
  
  // Change Password States
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Visibility States
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const fullName = (lastName || firstName) ? `${lastName} ${firstName}`.trim() : 'Super Admin'
  const initials = getInitials(fullName)
  const avatarColor = '#12312b'

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await authAPI.getProfile()
      const data = res.data
      setProfile(data)
      
      // Populate fields
      if (data.employee) {
        setFirstName(data.employee.firstName || '')
        setLastName(data.employee.lastName || '')
        setPhone(data.employee.phone || '')
      }
      setAvatar(data.avatar || '')
    } catch (error) {
      toast.error('Không thể tải thông tin hồ sơ!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await authAPI.updateProfile({
        firstName,
        lastName,
        phone,
        avatar
      })
      setProfile(updated.data)
      toast.success('Cập nhật hồ sơ thành công!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật hồ sơ thất bại!')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự!')
      return
    }
    
    setSaving(true)
    try {
      await authAPI.changePassword({ oldPassword, newPassword })
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      dispatch(logout())
      navigate('/auth/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mật khẩu cũ không chính xác!')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Cài đặt cá nhân</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý thông tin hồ sơ và mật khẩu tài khoản của bạn.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Left Nav */}
        <div className="md:col-span-1">
          <nav className="flex flex-col gap-1.5 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User size={18} />
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition cursor-pointer ${
                activeTab === 'password'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <KeyRound size={18} />
              Đổi mật khẩu
            </button>
          </nav>
        </div>

        {/* Right Content */}
        <div className="md:col-span-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Thông tin cá nhân</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Cập nhật họ tên, ảnh đại diện và số điện thoại.</p>
                </div>

                {/* Avatar Display */}
                <div className="flex items-center gap-4">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="User avatar"
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-indigo-50 shadow-sm"
                    />
                  ) : (
                    <div
                      className="h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-4 ring-indigo-50 shadow-sm"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Ảnh đại diện</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Ảnh hồ sơ hiện tại của tài khoản.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ & Tên lót</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email tài khoản</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail size={16} className="text-slate-400" />
                      </div>
                      <input
                        type="text"
                        disabled
                        value={profile?.accountName || ''}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 py-2 text-sm text-slate-500 cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Phone size={16} className="text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Info (Read-Only) */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                    <Building2 size={16} className="text-indigo-500" />
                    Thông tin vị trí & đơn vị làm việc
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Chi nhánh</span>
                      <span className="font-semibold text-slate-700">
                        {profile?.employee?.orgUnit?.branch?.branchName || 'Chưa cập nhật'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Đơn vị / Phòng ban</span>
                      <span className="font-semibold text-slate-700">
                        {profile?.employee?.orgUnit?.unitName || 'Chưa cập nhật'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Chức danh / Vị trí</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Briefcase size={14} className="text-slate-400" />
                        {profile?.employee?.position?.positionName || 'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end pt-4 border-t border-slate-50">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            )}

            {/* PASSWORD TAB */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Đổi mật khẩu</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Đặt mật khẩu mới để bảo vệ tài khoản.</p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 pl-3 pr-10 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu mới</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 pl-3 pr-10 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">Độ dài tối thiểu 8 ký tự.</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 pl-3 pr-10 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-50">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                    Cập nhật mật khẩu
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
