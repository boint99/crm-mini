import { PRISMA } from '../configs/db.config.js'
import { StatusCodes } from 'http-status-codes'

/**
 * Middleware phân quyền động - So khớp HTTP Method và API Path của request với cơ sở dữ liệu
 */
export const dynamicPermissionMiddleware = async (req, res, next) => {
  try {
    const accountId = req.user?.userId // Lấy từ authMiddleware đã xác thực trước đó
    
    // Ghép baseUrl và path để lấy đầy đủ đường dẫn ví dụ: /api/company
    let currentPath = (req.baseUrl || '') + (req.path || '')
    // Loại bỏ dấu gạch chéo cuối nếu có để đồng bộ định dạng so sánh (trừ trang chủ "/")
    if (currentPath.endsWith('/') && currentPath.length > 1) {
      currentPath = currentPath.slice(0, -1)
    }
    
    const currentMethod = req.method

    if (!accountId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Tài khoản chưa được xác thực.'
      })
    }

    // Bypass kiểm tra quyền cho tài khoản superadmin (accountId = 1) để tránh khóa hệ thống
    if (Number(accountId) === 1) {
      return next()
    }

    // 1. Lấy thông tin tài khoản kèm danh sách các quyền đang hoạt động (ENABLE và chưa bị xóa mềm)
    const accountData = await PRISMA.aCCOUNTS.findFirst({
      where: {
        accountId: Number(accountId),
        status: 'ENABLE',
        deletedAt: null,
        accountRoles: {
          some: {
            deletedAt: null,
            role: {
              status: 'ENABLE',
              deletedAt: null,
              rolePermissions: {
                some: {
                  deletedAt: null,
                  OR: [
                    { revokedAt: null },
                    { revokedAt: { gt: new Date() } }
                  ],
                  permission: {
                    status: 'ENABLE',
                    deletedAt: null
                  }
                }
              }
            }
          }
        }
      },
      include: {
        accountRoles: {
          where: { deletedAt: null },
          include: {
            role: {
              include: {
                rolePermissions: {
                  where: {
                    deletedAt: null,
                    OR: [
                      { revokedAt: null },
                      { revokedAt: { gt: new Date() } }
                    ]
                  },
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!accountData) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Tài khoản không có quyền hạn hoạt động trong hệ thống.'
      })
    }

    // Trích xuất phẳng tất cả các permissions của tài khoản
    const userPermissions = accountData.accountRoles
      .flatMap(ar => ar.role.rolePermissions)
      .map(rp => rp.permission)
      .filter(p => p !== null && p !== undefined)

    // 2. So khớp động URL và HTTP Method
    const hasPermission = userPermissions.some(permission => {
      if (!permission.apiPath || !permission.method) return false

      // Chuẩn hóa apiPath trong DB bằng cách bỏ dấu gạch chéo cuối nếu có
      let dbPath = permission.apiPath.trim()
      if (dbPath.endsWith('/') && dbPath.length > 1) {
        dbPath = dbPath.slice(0, -1)
      }

      // Chuyển đổi các tham số động dạng :id, :companyId thành regex [^/]+
      // Escape các ký tự đặc biệt của Regex ngoại trừ ký tự :
      const pathPattern = dbPath
        .replace(/[.+^${}()|[\]\\]/g, '\\$&') // escape regex chars
        .replace(/:[a-zA-Z0-9_]+/g, '[^/]+')  // map Express route params
      
      const regExp = new RegExp(`^${pathPattern}$`, 'i')

      const methodMatches = permission.method.toUpperCase() === currentMethod.toUpperCase()
      const pathMatches = regExp.test(currentPath) ||
        currentPath.startsWith(dbPath + '/') ||
        currentPath === dbPath

      return methodMatches && pathMatches
    })

    if (!hasPermission) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Tài khoản không được cấp phép thực hiện hành động này trên tài nguyên.'
      })
    }

    next()
  } catch (error) {
    console.error('Dynamic Authorization Error:', error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Lỗi hệ thống khi kiểm tra quyền hạn.'
    })
  }
}
