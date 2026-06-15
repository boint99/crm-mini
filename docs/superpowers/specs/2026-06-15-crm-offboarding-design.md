# Design Specification: Employee Offboarding Task Management

This document outlines the architecture, database changes, and API contracts for managing employee deactivation/offboarding tasks.

## 1. Requirement & Workflow

The offboarding workflow for an employee consists of the following steps:
1. **Create Offboarding Task**: Receive a request to offboard an employee.
2. **Deactivate Internal Accounts**: Automatically disable linked internal `ACCOUNTS` (status = `DISABLED`, `isLogin` = `false`).
3. **Deactivate Viettel Account**: Automatically disable linked outsource accounts in `VIETTEL_EMPLOYEES` (status = `DISABLED`).
4. **Asset Return Check**: Check if the employee has any assigned devices/IPs in the `IPS` table.
   - If yes: The asset step is set to `PENDING`, the overall task is marked `PENDING`, and the reason is recorded as `"Chưa xử lý xong phần tài sản (IP/VLAN)"`.
   - If no: The step is marked `COMPLETED` (or `NOT_APPLICABLE`).
5. **Completion**: Once all steps are resolved, the overall task status changes to `COMPLETED`.

---

## 2. Proposed Changes

### 2.1. Database Schema (`prisma/schema.prisma`)
Add a new model `OFFBOARDING_TASKS` and a new enum `TASK_STEP_STATUS` to track the deactivation checklist:

```prisma
enum TASK_STEP_STATUS {
  PENDING
  PROCESSING
  COMPLETED
  NOT_APPLICABLE
}

model OFFBOARDING_TASKS {
  id                    String           @unique @map("ID") @db.Uuid
  taskId                Int              @id @default(autoincrement()) @map("TASK_ID")
  employeeId            Int              @map("EMPLOYEE_ID")
  employeeIdDisable     Int              @map("EMPLOYEE_ID_DISABLE")
  internalAccountStatus TASK_STEP_STATUS @default(PENDING) @map("INTERNAL_ACCOUNT_STATUS")
  assetsStatus          TASK_STEP_STATUS @default(PENDING) @map("ASSETS_STATUS")
  viettelAccountStatus  TASK_STEP_STATUS @default(PENDING) @map("VIETTEL_ACCOUNT_STATUS")
  status                TASK_STEP_STATUS @default(PENDING) @map("STATUS")
  pendingReason         String?          @map("PENDING_REASON") @db.VarChar(255)
  createdAt             DateTime         @default(now()) @map("CREATED_AT") @db.Timestamp(6)
  updatedAt             DateTime?        @updatedAt @map("UPDATED_AT") @db.Timestamp(6)
  deletedAt             DateTime?        @map("DELETED_AT") @db.Timestamp(6)

  employee              EMPLOYEES        @relation(fields: [employeeId], references: [employeeId])
  employeeDisable       EMPLOYEES        @relation("EmployeeDisable", fields: [employeeIdDisable], references: [employeeId])

  @@map("OFFBOARDING_TASKS")
}
```

Add the relation back to the `EMPLOYEES` model in `prisma/schema.prisma`:
```prisma
model EMPLOYEES {
  ...
  offboardingTasks OFFBOARDING_TASKS[]
}
```

---

### 2.2. Backend APIs (`src/modules/offboarding/`)

#### 1. POST `/api/offboarding/create`
- **Goal**: Initiate the deactivation process for an employee.
- **Request Body**:
  ```json
  {
    "employeeId": 12
  }
  ```
- **Handler Logic**:
  - Verify employee exists.
  - Create a new `OFFBOARDING_TASKS` record.
  - Check for `ACCOUNTS` link -> if yes, set `internalAccountStatus = PENDING`, else `NOT_APPLICABLE`.
  - Check for `VIETTEL_EMPLOYEES` link -> if yes, set `viettelAccountStatus = PENDING`, else `NOT_APPLICABLE`.
  - Check for assigned `IPS` records -> if yes, set `assetsStatus = PENDING` and `pendingReason = "Chưa xử lý xong phần tài sản (IP/VLAN)"`, else `COMPLETED`.

#### 2. POST `/api/offboarding/process`
- **Goal**: Execute deactivation actions and check current pending blocks.
- **Request Body**:
  ```json
  {
    "taskId": 1
  }
  ```
- **Handler Logic**:
  - If `internalAccountStatus` is `PENDING`, disable the account (`status = DISABLED`, `isLogin = false`), and update step to `COMPLETED`.
  - If `viettelAccountStatus` is `PENDING`, disable the Viettel employee account (`status = DISABLED`), and update step to `COMPLETED`.
  - If `assetsStatus` is `PENDING`, check if there are still active IPs assigned to the employee. If none are found (assets returned), update `assetsStatus` to `COMPLETED` and clear `pendingReason`.
  - If all steps are resolved, update overall status to `COMPLETED`.

#### 3. GET `/api/offboarding/list`
- **Goal**: List all offboarding tasks with filters (`status`, `employeeId`).

---

#### 4. GET `/api/offboarding/comments`
- **Goal**: List all comments for a specific offboarding task.
- **Request Body**:
  ```json
  {
    "taskId": 1
  }
  ```
- **Handler Logic**:
  - Verify offboarding task exists.
  - Return all comments associated with the task.


#### 5. POST `/api/offboarding/comment`
- **Goal**: Add, edit, or delete a comment to a specific offboarding task.
- **Request Body**:
  ```json
  {
    "taskId": 1,
    "action": "add" | "edit" | "delete",
    "comment": "This is a comment.",
    "commentId": null
  }
  ```
- **Handler Logic**:
  - Verify offboarding task exists.
  - If action is "add", create a new comment associated with the task.
  - If action is "edit", edit a comment associated with the task.
  - If action is "delete", delete a comment associated with the task.
  - Return the created/updated/deleted comment.

#### 6. POST `/api/offboarding/complete/edit-employee-info`
- **Goal**: Edit employee information.
- **Request Body**:
  ```json
  {
    "taskId": "uuidv7",
    "employeeId": 1,
    "name": "John Doe",
    "phoneNumber": "1234567890",
    "phoneNumber": "1234567890",
    "email": "[EMAIL_ADDRESS]",
    "birthday": "1990-01-01",
    "departmentId": 1,
    "positionId": 1,
    "workTypeId": 1,
    "status": "DISABLED",
    "decision":"
    [Link_TASK_ID_Thông tin bàn giao]
    "
  }
  ```
- **Handler Logic**:
  - Verify offboarding task exists.
  - Verify employee exists.
  - Edit employee information.
  - Return the updated employee information.

## 3. Verification Plan

- Write integration tests to check the creation of an offboarding task.
- Test that updating asset status changes the task to `COMPLETED` when no IPs are assigned.
