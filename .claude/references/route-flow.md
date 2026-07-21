# Quy chuẩn Thiết kế và Đặt Route (Routing Standards)

Tài liệu này định nghĩa quy chuẩn thiết kế, đặt tên và quản lý route cho dự án CRM Mini ở cả **Backend (Express)** và **Frontend (React)**. Việc tuân thủ quy chuẩn này giúp hệ thống nhất quán, dễ bảo trì và tương thích hoàn toàn với hệ thống phân quyền động (RBAC).

---

## 1. Backend RESTful API (`/api/...`)

Tất cả các API endpoint phải tuân thủ triệt để kiến trúc RESTful. Không sử dụng các đường dẫn dạng hành động (RPC-style) như `/create`, `/update`, hoặc `/delete`.

### 1.1. Nguyên tắc đặt tên tài nguyên (Resource Naming)
* **Luôn dùng danh từ số nhiều (Plural Nouns)** đại diện cho tập hợp tài nguyên.
* **Viết thường (lowercase)**, phân cách bằng dấu gạch ngang (kebab-case) nếu tên tài nguyên gồm nhiều từ.
* **Không dùng tiếng Việt**, không viết tắt tùy tiện.

| Tài nguyên | Định dạng Sai (RPC/Singular) | Định dạng Đúng (RESTful Plural) |
|---|---|---|
| Công ty | `/api/company` | `/api/companies` |
| Chi nhánh | `/api/branch` | `/api/branches` |
| Địa chỉ IP | `/api/ipaddress`, `/api/ipAddress` | `/api/ip-addresses` |
| Tài khoản | `/api/account` | `/api/accounts` |
| Phân quyền | `/api/permission` | `/api/permissions` |

### 1.2. Ánh xạ các phương thức HTTP (HTTP Method Mapping)

Dùng HTTP Methods hoặc HTTPS để xác định hành động thay vì đưa hành động vào URL.

| Hành động | HTTP Method | Đường dẫn API | Vị trí ID | Mô tả |
|---|---|---|---|---|
| **Lấy danh sách** | `GET` | `/api/companies` | Lọc qua Query parameters | Lấy danh sách công ty |
| **Lấy chi tiết** | `GET` | `/api/companies/:id` | Route parameter (`:id`) | Lấy thông tin 1 công ty |
| **Tạo mới** | `POST` | `/api/companies` | Trong Request Body | Tạo công ty mới |
| **Cập nhật toàn bộ** | `PUT` | `/api/companies/:id` | Route parameter (`:id`) | Cập nhật toàn bộ thông tin |
| **Cập nhật một phần** | `PATCH` | `/api/companies/:id` | Route parameter (`:id`) | Cập nhật một số trường |
| **Xóa** | `DELETE` | `/api/companies/:id` | Route parameter (`:id`) | Xóa (mềm/cứng) tài nguyên |

> [!WARNING]
> * **KHÔNG** đặt URL dạng: `POST /api/companies/create` hoặc `POST /api/companies/update`.
> * Đối với `PUT`, `PATCH`, `DELETE`, tham số `id` **BẮT BUỘC** phải nằm trên URL parameter (`:id`), không truyền ngầm trong Request Body.

---

## 2. Phân quyền động và Ánh xạ Cơ sở dữ liệu (RBAC Integration)

Hệ thống phân quyền động sử dụng [dynamicPermissionMiddleware](file:///d:/Workspase/15.%20Code/crm-mini/src/middleware/permission.middleware.js) để so khớp động yêu cầu HTTP và HTTPS hiện tại với danh sách quyền của tài khoản lưu trong bảng `PERMISSIONS`.

### 2.1. Cách định nghĩa Quyền trong Database
Khi cấu hình quyền truy cập cho một API trong bảng `PERMISSIONS`, cột `API_PATH` và `METHOD` phải khớp chính xác với thiết kế route:
* Đường dẫn tĩnh: `/api/companies`
* Đường dẫn động: `/api/companies/:id` (hoặc `/api/companies/:companyId`)

### 2.2. Cơ chế So khớp tự động
Middleware sẽ tự động biên dịch các tham số động dạng `:param` thành Regex để so sánh:
* Khai báo trong DB: `API_PATH = /api/companies/:id` và `METHOD = PUT`.
* Yêu cầu từ Client: `PUT /api/companies/15`.
* Kết quả: **Khớp thành công** (Regex chuyển đổi `:id` thành `[^/]+`).

---

## 3. Cấu trúc mã nguồn Backend (Module Routes)

Mỗi module trong [src/modules/](file:///d:/Workspase/15.%20Code/crm-mini/src/modules/) có file định nghĩa router riêng đặt tên dạng `<module>.routes.js`.

### 3.1. Ví dụ cấu trúc file Router chuẩn: `src/modules/company/company.routes.js`
```javascript
import express from 'express'
import companyValidate from './company.validate.js'
import { companyController } from './company.controller.js'

const Router = express.Router()

// GET - Lấy danh sách công ty
Router.get('/', companyController.lists)

// GET - Lấy chi tiết công ty theo ID
Router.get('/:id', companyController.getDetail)

// POST - Tạo mới công ty
Router.post('/', companyValidate.create, companyController.create)

// PUT - Cập nhật thông tin công ty theo ID
Router.put('/:id', companyValidate.update, companyController.update)

// DELETE - Xóa công ty theo ID
Router.delete('/:id', companyValidate.delete, companyController.delete)

export const companyRoutes = Router
```

### 3.2. Đăng ký tại Router gốc: `src/routes/index.js`
```javascript
import express from 'express'
import { companyRoutes } from '../modules/company/company.routes.js'
import { authMiddleware } from '../modules/auth/auth.middleware.js'
import { dynamicPermissionMiddleware } from '../middleware/permission.middleware.js'

const Router = express.Router()

// Đăng ký module kèm Middleware bảo vệ và phân quyền động
Router.use('/companies', authMiddleware, dynamicPermissionMiddleware, companyRoutes)

export const APIs_Routes = Router
```

---

## 4. Frontend Client Routing (`web/src/routes/...`)

Frontend sử dụng React Router v6 để điều hướng trang. Route frontend cần đồng bộ logic về mặt ngữ nghĩa với API Backend.

### 4.1. Quy chuẩn đặt URL Frontend
* Sử dụng chữ thường, định dạng kebab-case.
* URL cấu trúc theo phân cấp quản trị:
  * Trang danh sách: `/organizations/companies`
  * Trang chi tiết/chỉnh sửa: `/organizations/companies/:id`
  * Trang cá nhân: `/profile`

### 4.2. Cấu trúc định nghĩa Route: `web/src/routes/index.jsx`
Tất cả các trang phải được tải dưới dạng **lazy load** để cải thiện tốc độ tải trang ban đầu, và được bọc bởi các component bảo mật và loading:
* `ProtectedRoute`: Chặn truy cập trái phép khi chưa đăng nhập.
* `WithSpinner` (`Suspense`): Hiển thị trạng thái tải khi đang import component.

```jsx
import { lazy, Suspense } from 'react'
import MainLayout from '@/components/layouts/MainLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Loading from '@/components/ui/Loading'

const Companies = lazy(() => import('@/pages/Organizations/Companies'))
const CompanyDetail = lazy(() => import('@/pages/Organizations/Companies/Detail'))

const WithSpinner = ({ children }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
)

const routes = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'organizations/companies',
        element: (
          <WithSpinner>
            <Companies />
          </WithSpinner>
        )
      },
      {
        path: 'organizations/companies/:id',
        element: (
          <WithSpinner>
            <CompanyDetail />
          </WithSpinner>
        )
      }
    ]
  }
]

export default routes
```

### 4.3. Đồng bộ Menu Configuration (`web/src/utils/menuConfig.js`)
Các mục menu hiển thị ở thanh điều hướng Sidebar phải cấu hình chính xác thuộc tính `path` tương ứng với khai báo ở Route:
```javascript
export const NAV_GROUPS = [
  {
    group: 'Organizations',
    items: [
      {
        id: 'companies',
        label: 'Companies',
        icon: Building2,
        path: '/organizations/companies'
      }
    ]
  }
]
```

### 4.4. Cập nhạt thông tin API-DOCS
API: /api/docs/v1
Cập nhật các api dã được thiện hiện không được sót thông tin

### 4.5 . Thực hiện đúng và đủ. Nếu thì thì hỏi lại tránh sai sót