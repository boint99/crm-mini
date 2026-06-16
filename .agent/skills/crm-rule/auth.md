#TRIỂN KHAI XÁC THỰC JWT & QUẢN LÝ NGƯỜI DÙNG

## 1. Vai trò & Ngữ cảnh

**Đặc biệt lưu ý về kiến trúc:**
- Yêu cầu thiết kế mã nguồn tuân thủ chặt chẽ mô hình Hướng đối tượng (OOP)
- Các Database Models và Services phải được thiết kế dưới dạng các Class và khởi tạo thông qua Object Instances (ví dụ: `new UserModel()`)
- Tuyệt đối không sử dụng các static methods
- Database: **PostgreSQL** với pool connection
- Token Strategy: **Access Token + Refresh Token** (cấu hình từ env variables)

---

## 2. Mục tiêu

Sau khi thực hiện quy trình, các module sau phải hoạt động hoàn hảo:
## backend
- **API Đăng ký (Register):** Tiếp nhận thông tin, kiểm tra tính duy nhất, mã hóa mật khẩu an toàn và lưu vào PostgreSQL. Yêu cầu API này phải public và không cần authentication.
  - Body input: { "email": "[EMAIL_ADDRESS]", "password": "password", "user_name": "admin", "empolyeeCode": "", "is_login": true, "otp": 123456 }
  - Response: { "success": true, "message": "Đăng ký thành công", "data": { "accessToken": "...", "refreshToken": "...", "id": 1, "username": "admin", "email": "[EMAIL_ADDRESS]" } }
- **API Đăng nhập (Login):** Xác thực danh tính, cấp phát **Access Token** + **Refresh Token**, lưu refresh token vào DB. Yêu cầu API này phải public và không cần authentication.
  - Body input: { "email": "[EMAIL_ADDRESS]", "password": "password" }
  - Response: { "success": true, "message": "Đăng nhập thành công", "data": { "accessToken": "...", "refreshToken": "...", "id": 1, "username": "admin", "email": "[EMAIL_ADDRESS]" } }
- **API Refresh Token:** Sử dụng refresh token hợp lệ để lấy access token mới. Yêu cầu API này phải public và không cần authentication.
- **API Kiểm tra kết nối:** Xác thực kết nối database và JWT. Yêu cầu API này phải public và không cần authentication.
  - Response: { "success": true, "message": "Kết nối thành công", "data": { "database": "connected", "jwt": "connected" } }
- **API Logout:** Revoke refresh token từ cơ sở dữ liệu. Yêu cầu API này phải public và không cần authentication.
- **Auth Middleware:** Lọc và bảo vệ các API dùng chung, chỉ cho phép các request có chứa JWT hợp lệ đi qua

## web
- Login thành công -> chuyển sang trang dashboard
- Register thành công -> chuyển sang trang login
- Khi reload trang web -> check token có hiệu lực không, nếu có -> chuyển sang trang dashboard, nếu không -> chuyển sang trang login
- Khi click nút logout -> Xóa token -> chuyển sang trang login
- khi đang ở page cụ thể mà token hết hạn -> chuyển sang trang login và không cho phép truy cập page cụ thể -> login thành công -> chuyển sang trang cụ thể trươc đó

## 3. Yêu cầu về cấu trúc file

```
src/modules/auth/
├── auth.controller.js
├── auth.routes.js
├── auth.services.js
└── auth.validator.js

```

---

## 3. Cấu hình Environment Variables

Tạo file `.env` với các biến sau:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# JWT Configuration
JWT_SECRET=your_super_secret_key_here_min_32_chars_needed
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars_needed

# Token Expiration (theo chuẩn JWT)
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server Configuration
PORT=8017
NODE_ENV=development
```

**Lưu ý:**
- `JWT_ACCESS_EXPIRY`: Access token ngắn hạn (15 phút - 1 giờ)
- `JWT_REFRESH_EXPIRY`: Refresh token dài hạn (7 ngày - 30 ngày)
- Secret keys phải có độ dài tối thiểu 32 ký tự



## 5. Các nguyên tắc nghiêm ngặt (Constraints)

✔️ **PHẢI TUÂN THỦ**

- ✅ **LUÔN LUÔN** khởi tạo object (instance) cho các thao tác model/service thay vì dùng hàm static
  ```javascript
  // ĐÚNG ✓
  const userModel = new UserModel();
  const user = await userModel.findByUsername(username);

  // SAI ✗
  const user = await UserModel.findByUsername(username); // Static method
  ```

- ✅ **LUÔN** sử dụng parameterized queries để tránh SQL Injection
  ```javascript
  // ĐÚNG ✓
  await database.query('SELECT * FROM users WHERE username = $1', [username]);

  // SAI ✗
  await database.query(`SELECT * FROM users WHERE username = '${username}'`);
  ```

- ✅ **LUÔN** sử dụng environment variables cho sensitive data
  ```javascript
  // ĐÚNG ✓
  const secret = process.env.JWT_SECRET;

  // SAI ✗
  const secret = 'my-secret-key-hardcoded';
  ```

---

❌ **TUYỆT ĐỐI KHÔNG**

- ❌ **KHÔNG** lưu mật khẩu dạng plain-text (chưa mã hóa) vào cơ sở dữ liệu
- ❌ **KHÔNG** hardcode Secret Key hoặc thông tin nhạy cảm trong file code
- ❌ **KHÔNG** trả về password hash cho client
- ❌ **KHÔNG** sử dụng static methods cho database operations
- ❌ **KHÔNG** xây dựng SQL queries từ string concatenation hoặc template literals

---

## 6. Testing Checklist

### 6.1 Register Tests

- [ ] Đăng ký thành công với dữ liệu hợp lệ
- [ ] Từ chối nếu email đã tồn tại (409)
- [ ] Từ chối nếu password không đủ mạnh (400)
- [ ] Từ chối nếu thiếu dữ liệu bắt buộc (400)
- [ ] Password được hash và lưu an toàn
- [ ] Email của user đang login phải bằng email của user trong database
- [ ] OTP phải được gửi từ email của user

### 6.2 Login Tests

- [ ] Đăng nhập thành công với credentials đúng
- [ ] Trả về access token + refresh token
- [ ] Từ chối nếu mail sai (401)
- [ ] Từ chối nếu password sai (401)
- [ ] Refresh token được lưu vào database
- [ ] accesstoken hết hạn lất token mới từ refresh token
- [ ] refresh token hết hạn chuyển sang trang login để lấy token mới và quy trình đăng nhập từ đầu chuyển sang page trước đó
### 6.3 Refresh Token Tests

- [ ] Lấy access token mới từ refresh token hợp lệ
- [ ] Từ chối nếu refresh token hết hạn
- [ ] Từ chối nếu refresh token đã bị revoke

### 6.4 Auth Middleware Tests

- [ ] Cho phép request nếu token hợp lệ
- [ ] Từ chối nếu token bị revoke (401)
- [ ] Từ chối nếu token hết hạn (401)
- [ ] Từ chối nếu thiếu Authorization header (401)

### 6.5 Logout Tests

- [ ] Logout thành công revoke token
- [ ] Logout all thành công revoke tất cả tokens

### 6.6 User admin@domain.com - Password: [PASSWORD]
- tài khoản này dùng để login vào hệ thống
- Không ai có quyền xóa, chỉnh sửa tài khoản này
- Disable tài khoản logoutall
---

## 12. Cấu trúc thư mục dự án

```
src/
├── config/
│   └── database.js
├── modules/
│   ├── accounts
│   └── auth
        |
        ├── auth.controller.js
        ├── auth.middleware.js
        ├── auth.routes.js
        ├── account.model.js
        └── refresh.token.model.js
├── middlewares/
│   └── auth.middleware.js
├── routes/
│   └── authRoutes.js
├── utils/
│   └── authentication.js
├── .env
├── .env.example
├── server.js
├── package.json
└── auth.md
```

---

## 7. Package Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.10.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.0.3",
    "express-rate-limit": "^6.7.0",
    "node-schedule": "^2.1.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

---

## 14. Lời kết

Quy trình này cung cấp một nền tảng **an toàn**, **bảo mật** và **dễ bảo trì** cho hệ thống xác thực JWT với:

✅ PostgreSQL database
✅ Access Token + Refresh Token strategy
✅ Revoke token functionality
✅ OOP pattern strict compliance
✅ Comprehensive error handling
✅ Security best practices

**Hãy tuân thủ chặt chẽ từng bước để đảm bảo chất lượng code!**