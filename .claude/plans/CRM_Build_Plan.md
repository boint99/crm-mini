# CRM Build Plan (Admin + User)

## Output 1: PRD

### Problem Statement
Team cần công cụ quản lý công việc kiểu Kanban tự host, có phân quyền rõ ràng và trang quản trị hệ thống riêng. Trello SaaS không cho kiểm soát dữ liệu/hạ tầng nội bộ.

### User Stories (MVP)
| # | As a... | I want to... | So that... |
|---|---------|--------------|------------|
| 1 | user | đăng ký/login (email+OAuth) | truy cập an toàn |
| 8 | supper_admin | khoá/xoá user, gán role | quản trị hệ thống |


---

## Output 2: Technical Plan

### Stack
- **Backend**: Node.js + Express
- **Frontend**: React (User App)
- **DB**: PostgreSQL + Prisma ORM

### File & Folder Structure (mới)
```
CRM-Mini/
  src/
    config/        # env, db,
    modules/
      auth/        # login
      account/
    middleware/    # authenticate, authorize, errorHandler
    db/            # prisma schema, migrations, seed
  prisma/schema.prisma

web/
  apps/       # React Vite - Trello UI
  packages/ui/     # shared components, usePermission hook


### Data Model (chính)
Cấu trúc database ['database.sql]

---