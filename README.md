# 🏢 CRM Mini / IT-Helpdesk System

Hệ thống **CRM Mini / IT-Helpdesk** là giải pháp quản trị tổng thể cho doanh nghiệp, hỗ trợ quản lý sơ đồ tổ chức nhân sự, hạ tầng mạng (VLAN/IP), tài khoản người dùng và phân quyền động bảo mật cao theo chuẩn RESTful API.

---

## 🌟 Tính Năng Nổi Bật

### 🔑 1. Xác thực & Bảo mật (JWT Authentication & Authorization)
* **Cơ chế Token Kép (Dual-Token):** Access Token (thời hạn ngắn, gửi qua Bearer Header) & Refresh Token (thời hạn dài, lưu trong `HttpOnly`, `SameSite=Lax` Cookie).
* **Cấp lại Token Tự động (Auto-Refresh):** Axios Interceptor trên Frontend tự động xoay vòng Access Token mượt mà khi hết hạn.
* **Phân quyền Động (Dynamic RBAC Middleware):** Phân quyền dựa trên vai trò (Role) và quyền hạn (Permission) được cấu hình linh hoạt theo từng API Path & HTTP Method.
* **Đặc quyền Superadmin:** Tài khoản Superadmin (`accountId = 1`) tự động bypass kiểm tra quyền để đảm bảo hệ thống luôn hoạt động an toàn.
* **Bộ Kiểm thử Bảo mật JWT (Automated JWT Test Suite):** Script kiểm thử tự động 12+ kịch bản bảo mật JWT bằng lệnh `yarn test:jwt`.

### 🏢 2. Sơ đồ Tổ chức & Nhân sự (HR & Organizational Structure)
* **Công ty (Companies):** Quản lý thông tin các công ty thành viên.
* **Đơn vị & Phòng ban (Org Units / Departments):** Quản lý cây sơ đồ tổ chức.
* **Chi nhánh (Branches):** Quản lý các chi nhánh trực thuộc.
* **Chức vụ (Positions):** Quản lý danh mục vị trí công việc.
* **Nhân viên (Employees):** Quản lý hồ sơ nhân viên, tự động liên kết với tài khoản hệ thống qua Email.

### 🌐 3. Quản lý Hạ tầng Mạng (Network Infrastructure)
* **Dải mạng VLAN (VLANs):** Quản lý danh sách VLAN, tên dải mạng và ghi chú.
* **Địa chỉ IP (IP Addresses):** Quản lý danh sách IP, trạng thái (AVAILABLE, ASSIGNED, ACTIVE, INACTIVE), tự động kiểm tra cú pháp IPv4, Subnet Mask (CIDR) và Default Gateway.

### 🤝 4. Quản lý Thuê ngoài & Đối tác (Outsources)
* Quản lý thông tin chi nhánh và nhân viên đối tác Viettel (**Viettel Employees & Branches**).

### 📘 5. Tài liệu API Trực quan (Swagger / OpenAPI 3.0)
* Tự động tạo giao diện API Documentation chuẩn OpenAPI 3.0 tại route `/api/docs/v1` tích hợp nút **Authorize** testing trực tiếp bằng Bearer Token.

---

## 🛠️ Công Nghệ Sử Dụng

### Backend Ecosystem
* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js v5
* **Database & ORM:** PostgreSQL + Prisma ORM v7 (sử dụng `@prisma/adapter-pg` & `pg.Pool` duy trì connection pool ổn định)
* **Authentication:** JSON Web Token (`jsonwebtoken`), Bcrypt password hashing
* **Validation:** Custom Validation Engines + UUIDv7
* **Documentation:** `swagger-ui-express` & `swagger-jsdoc`

### Frontend Ecosystem
* **Core:** React v19 + Vite v7 (Build siêu tốc với `@vitejs/plugin-react-swc`)
* **State Management:** Redux Toolkit v2
* **Routing:** React Router v7
* **HTTP Client:** Axios với Request/Response Interceptors tự động refresh token
* **UI Components & Icons:** Lucide React, TailwindCSS v4, React Toastify, Recharts

### DevOps & Deployment
* **Containerization:** Docker & Docker Compose (Multi-container cho Web, Backend và PostgreSQL 16)

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
crm-mini/
├── .claude/                   # Tài liệu tham khảo & Hướng dẫn kỹ thuật
├── db/                        # Script SQL khởi tạo cơ sở dữ liệu
├── docker/                    # Dockerfile cho Backend & Frontend
├── prisma/                    # Schema cơ sở dữ liệu Prisma
│   └── schema.prisma
├── src/                       # Mã nguồn Backend (Express.js)
│   ├── configs/               # Cấu hình DB, CORS, Env, Swagger
│   ├── docs/                  # File định nghĩa API YAML (OpenAPI 3.0)
│   ├── middleware/            # Auth, Error & Phân quyền động Middleware
│   ├── modules/               # Các module tính năng (auth, accounts, employees, vlans, ips, ...)
│   ├── routes/                # Registry tuyến đường RESTful API
│   ├── scripts/               # CLI Scripts (create-superadmin, test-auth-jwt)
│   ├── utils/                 # Utilities (JWT helpers, ApiError, SuccessResponse, constants)
│   └── server.js              # Entry Point Backend Server
├── web/                       # Mã nguồn Frontend Application (React + Vite)
│   ├── src/
│   │   ├── api/               # API Clients (Axios services)
│   │   ├── components/        # UI Components & Layouts (MainLayout, AuthLayout, ...)
│   │   ├── pages/             # Các trang giao diện (Dashboard, Auth, Organizations, Networks, ...)
│   │   ├── redux/             # Redux Slices & Store Configuration
│   │   └── utils/             # Axios Interceptors, Cookies, Navigation Helpers
│   └── vite.config.js         # Cấu hình Vite & Proxy
├── docker-compose.yml         # File Docker Compose môi trường Development
├── package.json               # Package configuration & Scripts của Backend
└── README.md                  # Tài liệu hướng dẫn dự án
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 📋 Yêu cầu tiên quyết
* **Node.js:** phiên bản `>= 20.0.0`
* **Package Manager:** `yarn` hoặc `npm`
* **Database:** PostgreSQL `>= 15` (hoặc Docker Desktop)

---

### 1️⃣ Thiết lập Môi trường (`.env`)

Tạo file `.env` tại thư mục gốc của dự án (`crm-mini/.env`) dựa theo mẫu dưới đây:

```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=YourPassword123
DB_NAME=DB_CRM
DB_PORT=5432
DB_HOST=localhost

DATABASE_URL="postgresql://postgres:YourPassword123@localhost:5432/DB_CRM?schema=public"

# Server Port
PORT_BE=8017
HOST=0.0.0.0

# JWT Configuration
JWT_ACCESS_SECRET=d384844321edc165126e4cc1a6048c9bd7afd00be2665c481a3a486fc90d8645
JWT_EXPIRES=5m
JWT_REFRESH_SECRET=d8c090768d02594e733aa94da701d98eeaff8c4582d05cb89a395cd5a234b59d
JWT_REFRESH_EXPIRES=7d

# Environment & Frontend API Prefix
VITE_API_URL=/api
NODE_ENV=development
```

---

### 2️⃣ Cài đặt Dependencies

**Cài đặt cho Backend (Thư mục gốc):**
```bash
yarn install
# hoặc: npm install
```

**Cài đặt cho Frontend (`web/`):**
```bash
cd web
yarn install
cd ..
```

---

### 3️⃣ Khởi tạo Cơ sở Dữ liệu & Tài khoản Superadmin

**Đồng bộ Schema vào PostgreSQL:**
```bash
npx prisma db push
```

**Khởi tạo Tài khoản Superadmin mặc định:**
```bash
npm run create-superadmin -- --email=admin@crm.com --password=password123
```

---

### 4️⃣ Khởi động Hệ thống (Development)

**Chạy Backend Server (Port 8017):**
```bash
yarn dev
```
*(Backend sẽ chạy tại `http://localhost:8017` và Swagger Docs tại `http://localhost:8017/api/docs/v1`)*

**Chạy Frontend Client (Port 5173):**
Mở một cửa sổ Terminal mới:
```bash
cd web
yarn dev
```
*(Frontend sẽ chạy tại `http://localhost:5173`)*

---

## 🧪 Kiểm Thử Hệ Thống (Testing)

Dự án đi kèm bộ script tự động kiểm thử 12 kịch bản bảo mật JWT (Access Token, Refresh Token, Revocation, Auth Guards):

```bash
yarn test:jwt
```

**Danh sách test case được tự động kiểm tra:**
* `TC-01`: Đăng nhập thiếu Email ➔ HTTP 400
* `TC-02`: Đăng nhập thiếu Password ➔ HTTP 400
* `TC-03`: Email không tồn tại ➔ HTTP 401
* `TC-04`: Sai mật khẩu ➔ HTTP 401
* `TC-05`: Truy cập Protected API không có Token ➔ HTTP 401 (`MISSING_TOKEN`)
* `TC-06`: Access Token sai định dạng/chữ ký ➔ HTTP 401 (`INVALID_TOKEN`)
* `TC-07`: Đăng nhập hợp lệ ➔ HTTP 200, trả về AccessToken & Cookie RefreshToken
* `TC-08`: Truy cập Protected API bằng Access Token hợp lệ ➔ HTTP 200
* `TC-09`: Dùng Refresh Token thay cho Access Token ➔ HTTP 401
* `TC-10`: Cấp lại Access Token mới bằng Refresh Token ➔ HTTP 200
* `TC-11`: Đăng xuất tài khoản (Logout) ➔ HTTP 200
* `TC-12`: Dùng Refresh Token đã bị thu hồi ➔ HTTP 401

---

## 🐋 Chạy Bằng Docker Compose

Nếu muốn chạy toàn bộ hệ thống (Web + Backend + Database PostgreSQL) trong môi trường Docker:

```bash
# Khởi động toàn bộ dịch vụ
docker compose up -d

# Xem log hệ thống
docker compose logs -f
```

---

## 📌 Danh Sách API Endpoints Chính (RESTful Standard)

| Đường dẫn (Route) | Phương thức | Mô tả | Phân quyền |
| :--- | :---: | :--- | :--- |
| `/api/auth/login` | `POST` | Đăng nhập hệ thống | Public |
| `/api/auth/refresh-token` | `POST` | Cấp lại Access Token mới qua Cookie | Public |
| `/api/auth/logout` | `POST` | Đăng xuất tài khoản hiện tại | Auth Token |
| `/api/auth/profile` | `GET` / `PUT` | Lấy / Cập nhật thông tin cá nhân | Auth Token |
| `/api/companies` | `GET` / `POST` / `PUT` / `DELETE` | Quản lý Công ty | Auth + Dynamic RBAC |
| `/api/organizations` | `GET` / `POST` / `PUT` / `DELETE` | Quản lý Đơn vị / Phòng ban | Auth + Dynamic RBAC |
| `/api/branches` | `GET` / `POST` / `PUT` / `DELETE` | Quản lý Chi nhánh | Auth + Dynamic RBAC |
| `/api/positions` | `GET` / `POST` / `PUT` / `DELETE` | Quản lý Chức vụ | Auth + Dynamic RBAC |
| `/api/employees` | `GET` / `POST` / `PUT` / `DELETE` | Quản lý Nhân viên | Auth + Dynamic RBAC |
| `/api/accounts` | `GET` / `POST` / `PUT` / `DELETE` | Quản lý Tài khoản người dùng | Auth + Dynamic RBAC |
| `/api/roles` | `GET` / `POST` / `PUT` / `DELETE` | Quản lý Vai trò (Roles) | Auth + Dynamic RBAC |
| `/api/permissions` | `GET` / `POST` / `PUT` / `DELETE` | Quản lý Quyền hạn (Permissions) | Auth + Dynamic RBAC |
| `/api/account-roles` | `GET` / `POST` / `DELETE` | Gán / Gỡ vai trò tài khoản | Auth + Dynamic RBAC |
| `/api/vlans` | `GET` / `POST` / `PUT` / `DELETE` | Quản lý Dải mạng VLAN | Auth + Dynamic RBAC |
| `/api/ip-addresses` | `GET` / `POST` / `PUT` / `DELETE` | Quản lý Địa chỉ IP | Auth + Dynamic RBAC |
| `/api/viettel-employees` | `GET` / `POST` / `PUT` / `DELETE` | Quản lý Nhân viên Viettel | Auth + Dynamic RBAC |
| `/api/viettel-branches` | `GET` / `POST` / `PUT` / `DELETE` | Quản lý Chi nhánh Viettel | Auth + Dynamic RBAC |
| `/api/docs/v1` | `GET` | Giao diện Swagger UI Documentation | Public |

---