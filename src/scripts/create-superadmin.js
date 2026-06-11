import { PRISMA } from '../configs/db.config.js'
import bcrypt from 'bcrypt'
import readline from 'readline'
import { saltRoundsPassword } from '../utils/constants.js'

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close()
    resolve(ans)
  }))
}

async function createSuperAdmin() {
  try {
    console.log('\n=================================================')
    console.log('⚡ KHỞI TẠO / PHỤC HỒI TÀI KHOẢN SUPERADMIN ⚡')
    console.log('=================================================\n')

    // 1. Nhập thông tin tài khoản từ terminal hoặc lấy từ đối số (arguments)
    const args = process.argv.slice(2)
    let email = ''
    let password = ''
    let isResetRequested = false

    // Hỗ trợ truyền qua args dạng: npm run create-superadmin -- --email=admin@crm.com --password=password123 --reset
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith('--email=')) {
        email = args[i].split('=')[1]
      } else if (args[i] === '--email' && args[i + 1]) {
        email = args[i + 1]
      }
      if (args[i].startsWith('--password=')) {
        password = args[i].split('=')[1]
      } else if (args[i] === '--password' && args[i + 1]) {
        password = args[i + 1]
      }
      if (args[i] === '--reset') {
        isResetRequested = true
      }
    }

    // 2. Kiểm tra xem tài khoản ID = 1 đã tồn tại hay chưa (bao gồm cả tài khoản bị xóa mềm/disabled)
    const existingSuperAdmin = await PRISMA.aCCOUNTS.findFirst({
      where: { accountId: 1 }
    })

    if (existingSuperAdmin) {
      const isCurrentlyActive = existingSuperAdmin.status === 'ENABLE' && 
                                 existingSuperAdmin.isLogin === true && 
                                 existingSuperAdmin.deletedAt === null

      if (isCurrentlyActive && !isResetRequested) {
        console.log(`ℹ️ Tài khoản Superadmin (ID = 1, email: ${existingSuperAdmin.accountName}) đã tồn tại và đang hoạt động bình thường.`)
        console.log('💡 Để đặt lại mật khẩu cho tài khoản này, vui lòng chạy lệnh với tham số --reset:')
        console.log('   npm run create-superadmin -- --reset --password=MatKhauMoi123\n')
        process.exit(0)
      }

      // Trường hợp tài khoản bị vô hiệu hóa, bị xóa mềm hoặc người dùng yêu cầu reset mật khẩu
      console.log(`⚠️ Phát hiện tài khoản Superadmin đã tồn tại (Trạng thái: ${existingSuperAdmin.status}, Kích hoạt đăng nhập: ${existingSuperAdmin.isLogin}).`)
      
      if (!password) {
        password = await askQuestion('👉 Nhập mật khẩu mới để đặt lại: ')
      }
      password = password.trim()

      if (!password) {
        console.error('❌ Lỗi: Mật khẩu đặt lại không được để trống!')
        process.exit(1)
      }
      if (password.length < 8) {
        console.error('❌ Lỗi: Mật khẩu mới phải có độ dài tối thiểu 8 ký tự!')
        process.exit(1)
      }

      console.log('🔄 Đang mã hóa mật khẩu mới...')
      const hashedPassword = await bcrypt.hash(password, saltRoundsPassword)

      console.log('🔄 Đang kích hoạt lại và đặt lại mật khẩu cho Superadmin...')
      await PRISMA.aCCOUNTS.update({
        where: { accountId: 1 },
        data: {
          password: hashedPassword,
          status: 'ENABLE',
          isLogin: true,
          deletedAt: null // Phục hồi nếu bị xóa mềm
        }
      })

      console.log('\n=============================================')
      console.log('🎉 ĐÃ PHỤC HỒI & ĐẶT LẠI MẬT KHẨU SUPERADMIN THÀNH CÔNG!')
      console.log(`📧 Email đăng nhập: ${existingSuperAdmin.accountName}`)
      console.log('🆔 ID Tài khoản: 1')
      console.log('=============================================\n')
      process.exit(0)
    }

    // 3. Nếu chưa tồn tại, thực hiện tạo mới hoàn toàn
    if (!email) {
      email = await askQuestion('👉 Nhập email đăng nhập (ví dụ: superadmin@crm.com): ')
    }
    if (!password) {
      password = await askQuestion('👉 Nhập mật khẩu (tối thiểu 8 ký tự): ')
    }

    email = email.trim().toLowerCase()
    password = password.trim()

    if (!email || !password) {
      console.error('❌ Lỗi: Email và mật khẩu không được để trống!')
      process.exit(1)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('❌ Lỗi: Định dạng email không hợp lệ!')
      process.exit(1)
    }

    if (password.length < 8) {
      console.error('❌ Lỗi: Mật khẩu phải có độ dài tối thiểu 8 ký tự!')
      process.exit(1)
    }

    // Kiểm tra trùng lặp email với các tài khoản khác
    const duplicateAccount = await PRISMA.aCCOUNTS.findFirst({
      where: { accountName: email }
    })
    if (duplicateAccount) {
      console.error(`❌ Lỗi: Email "${email}" đã được đăng ký bởi một tài khoản khác!`)
      process.exit(1)
    }

    console.log('🔄 Đang mã hóa mật khẩu...')
    const hashedPassword = await bcrypt.hash(password, saltRoundsPassword)

    console.log('🔄 Đang thiết lập vai trò mặc định (ADMIN_ROLE)...')
    const adminRole = await PRISMA.rOLES.upsert({
      where: { roleId: 1 },
      update: {},
      create: {
        roleId: 1,
        roleCode: 'ADMIN_ROLE',
        roleName: 'ADMIN_ROLE',
        description: 'Quyền quản trị tối cao của hệ thống (Bypass check)',
        status: 'ENABLE'
      }
    })

    console.log('🔄 Đang tạo tài khoản superadmin với ID = 1...')
    const superAdmin = await PRISMA.aCCOUNTS.create({
      data: {
        accountId: 1,
        accountName: email,
        password: hashedPassword,
        isLogin: true,
        status: 'ENABLE',
        description: 'Tài khoản Super Admin mặc định của hệ thống'
      }
    })

    console.log('🔄 Đang liên kết tài khoản với vai trò ADMIN_ROLE...')
    await PRISMA.aCCOUNT_ROLES.create({
      data: {
        accountId: superAdmin.accountId,
        roleId: adminRole.roleId
      }
    })

    console.log('\n=============================================')
    console.log('🎉 KHỞI TẠO TÀI KHOẢN SUPERADMIN THÀNH CÔNG!')
    console.log(`📧 Email: ${email}`)
    console.log(`🆔 ID Tài khoản: ${superAdmin.accountId}`)
    console.log(`🛠️ Vai trò: ${adminRole.roleName} (ID: ${adminRole.roleId})`)
    console.log('=============================================\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Lỗi: Có lỗi xảy ra trong quá trình khởi tạo:', error)
    process.exit(1)
  }
}

createSuperAdmin()
