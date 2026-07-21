# Danh sách Test Case Đăng nhập và Xác thực JWT (JWT Auth Test Matrix)

Tài liệu này liệt kê chi tiết toàn bộ các kịch bản kiểm thử (Test Cases) cho tính năng **Đăng nhập**, **Xác thực JWT (Access Token / Refresh Token)**, **Khóa tài khoản**, và **Bảo vệ API** trong hệ thống CRM Mini.

---

## 1. Danh sách Kịch bản Kiểm thử (Test Cases)

| Mã TC | Tên Kịch bản | Điều kiện / Dữ liệu vào | Kết quả kỳ vọng (Expected Output) | HTTP Status |
|---|---|---|---|---|
| **TC-01** | Đăng nhập thiếu Email | `body: { password: "123" }` | Trả về message `Email is required!` | `400 Bad Request` |
| **TC-02** | Đăng nhập thiếu Password | `body: { email: "admin@crm.com" }` | Trả về message `Password is required!` | `400 Bad Request` |
| **TC-03** | Email chưa tồn tại | `body: { email: "unknown@crm.com", password: "123" }` | Trả về message `Invalid email or password!` | `401 Unauthorized` |
| **TC-04** | Sai mật khẩu (< 5 lần) | Email đúng, Sai mật khẩu 1-4 lần | Trả về message `Invalid email or password!`, tăng `failedAttempts` trong DB | `401 Unauthorized` |
| **TC-05** | Khóa tài khoản khi nhập sai >= 5 lần | Nhập sai mật khẩu 5 lần liên tiếp | Trả về message `Account is temporarily locked. Please try again after 5 minute(s).` | `401 Unauthorized` |
| **TC-06** | Tài khoản bị vô hiệu hóa | Account có `status = 'DISABLED'` | Trả về message `Account is not active!` | `401 Unauthorized` |
| **TC-07** | Tài khoản chưa kích hoạt | Account có `isLogin = false` | Trả về message `Account is not activated!` | `401 Unauthorized` |
| **TC-08** | **Đăng nhập thành công (Happy Path)** | Email & Mật khẩu chính xác | Trả về `accessToken`, `refreshToken` (trong body + Set-Cookie), `id`, `username`, `email` | `200 OK` |
| **TC-09** | Gọi Protected API không có Token | Không gửi `Authorization` header | Trả về `code: "MISSING_TOKEN"` | `401 Unauthorized` |
| **TC-10** | Gọi Protected API với Access Token sai chữ ký | `Authorization: Bearer invalid_token_xyz` | Trả về `code: "INVALID_TOKEN"` | `401 Unauthorized` |
| **TC-11** | Gọi Protected API với Access Token hết hạn | Token đã quá thời gian `JWT_EXPIRES` (5m) | Trả về `code: "TOKEN_EXPIRED"` | `401 Unauthorized` |
| **TC-12** | Dùng Refresh Token để gọi Protected API | `Authorization: Bearer <refresh_token>` | Trả về `code: "INVALID_TOKEN_TYPE"` | `401 Unauthorized` |
| **TC-13** | **Cấp lại Access Token mới qua Refresh Token** | `POST /api/auth/refresh-token` với `refreshToken` hợp lệ | Trả về `accessToken` mới | `200 OK` |
| **TC-14** | Refresh Token đã bị thu hồi / Đăng xuất | Dùng `refreshToken` đã được gọi `/logout` | Trả về message `Refresh token has been revoked or expired!` | `401 Unauthorized` |
| **TC-15** | **Đăng xuất (Logout)** | `POST /api/auth/logout` | Đánh dấu xóa `refreshToken` trong DB, xóa cookie `refreshToken` | `200 OK` |
| **TC-16** | **Đăng xuất tất cả thiết bị (Logout All)** | `POST /api/auth/logout-all` | Thu hồi toàn bộ Refresh Tokens của account trong DB | `200 OK` |

---

## 2. Cách Chạy Script Kiểm thử Tự động (Automated Test Runner)

Dự án đã tích hợp script tự động chạy qua HTTP client trong [src/scripts/test-auth-jwt.js](file:///d:/Workspase/15.%20Code/crm-mini/src/scripts/test-auth-jwt.js).

### Lệnh thực hiện:
```bash
npm run test:jwt
```

> [!NOTE]
> Đảm bảo server backend đang chạy (`npm run dev`) trước khi thực hiện lệnh test.
