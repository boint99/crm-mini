# Kế Hoạch Module & Chức Năng - Trello Clone (Admin + User)

## 0. Kiến Trúc & Tech Stack

### Infra (Docker hoá toàn bộ)
| Thành phần | Công nghệ | Vai trò |
|-----------|-----------|---------|
| Database | PostgreSQL | Dữ liệu chính (user) |

### Application
| Layer | Stack | Người dùng |
|-------|-------|-----------|
| Backend API | Node.js | Phục vụ cả Admin & User (REST API) |
| User App | React.js | Người dùng cuối dùng CRM |

### Frontend
- **User App (React)** — `app.domain.com` — toàn bộ chức năng CRM.
---

## 1. Mô Hình Phân Quyền (RBAC)

Hệ thống có **1 tầng quyền**:

### Tầng A — System Role (toàn cục)
| Role | Mô tả |
|------|-------|
| `SUPER_ADMIN` | Toàn quyền hệ thống |

### Các User thành viên được phần quyền từ SUPER_ADMIN đăng nhập bằng email

---

# PHẦN I — USER APP (React) — Người dùng cuối

## 2. Authentication & User Management
- Đăng ký / Đăng nhập / Đăng xuất
- Quên mật khẩu / Đổi mật khẩu
- Hồ sơ cá nhân + Avatar
- Cài đặt notification cá nhân

## 3. Management
- Tạo / sửa / xoá workspace
- Phân quyền: Owner / WS_Admin / Member / Guest
- Cài đặt workspace (tên, logo, visibility)


## 4. Quản lý quyền users
- thêm/xóa/sửa / search / filter/ sort / phân trang
- email đăng ký

## 5. quản lý Network
- tạo Network
- đổi tên Network
- xóa Network

## 6. quản lý Contact
- quản lý danh ba tức nhân viên
