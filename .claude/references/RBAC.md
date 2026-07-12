# RBAC — Role-Based Access Control

> Authorization design process for any project — backend agnostic, frontend agnostic.
> Applicable to web apps, mobile apps, API services, and internal tools.

---

## 1. What is RBAC?

**Role-Based Access Control** = grant permissions based on ROLES rather than assigning permissions directly to individual users.

```
User  →  Role(s)  →  Permission(s)  →  Resource × Action
(who)    (role)       (what they can do)  (on what)
```

### Quick model comparison

| Model | When to use | Example |
|---|---|---|
| **ACL** (Access Control List) | Small apps, few users, highly personalized permissions | `userId=42 can edit project=99` |
| **RBAC** ⭐ | Medium-large apps, clear roles, easy to audit | `role=manager can edit project` |
| **ABAC** (Attribute-Based) | Permissions depend on dynamic context (time, IP, owner) | `edit only if owner + within business hours` |
| **ReBAC** (Relationship-Based) | Social graphs, sharing | `friend of a friend can view post` |

**Default to RBAC.** Simple, auditable, scales well. When RBAC isn't enough → add ABAC scope (e.g. `member.canEdit + isOwner`) rather than rewriting everything.

---

## 2. Three Core Concepts

### 2.1. User
An individual or service account — the entity that logs into the system.

### 2.2. Role
A collection of permissions. **Never assign permissions directly to a user** — always go through a role.

Standard roles for a commercial SaaS:
- `super_admin` — full access, **only 1-2 accounts** (founder, on-call). Bypasses all checks.
- `admin` — manages operations, no access to billing/owner-level settings.
- `manager` / `teacher` / `agent` — domain-specific roles.
- `user` / `member` / `customer` — regular end users.
- `guest` / `viewer` — read-only, no login required (or limited login).

### 2.3. Permission
A specific action on a specific resource type. Standard format:

```
<resource>.<action>
```

Examples:
- `users.create`, `users.update`, `users.delete`, `users.list`
- `orders.read`, `orders.refund`, `orders.cancel`
- `reports.export`, `reports.view_revenue`
- `system.manage_roles`, `system.view_audit_log`

**Common actions**: `create`, `read`, `update`, `delete`, `list`, `export`, `approve`, `reject`, `assign`, `manage`.

---

## 3. Standard Database Schema
- create database [database.sql]

### 5.1. Authorize middleware

### 5.2. Usage template

```pseudocode
router.POST("/api/users",             authorize("users.create"),  handleCreateUser)
router.PATCH("/api/users/:id",        authorize("users.update"),  handleUpdateUser)
router.DELETE("/api/users/:id",       authorize("users.delete"),  handleDeleteUser)
router.POST("/api/orders/:id/refund", authorize("orders.refund"), handleRefund)
```

### 5.3. ABAC scope when needed

When RBAC alone isn't sufficient (e.g. a student can only edit their own project):

```pseudocode
function handleUpdateProject(req, res):
    project = repo.getProject(req.params.id)
    user = req.user

    // RBAC already passed middleware "projects.update"
    // Still need ABAC check: must be staff OR owner
    isStaff = "staff" in user.roles or "admin" in user.roles
    isOwner = project.ownerId == user.id

    if not (isStaff or isOwner):
        return res.status(403)

    // Continue with logic
```

---

## 6. Frontend Implementation — UI Gate

The frontend receives the **current user's permission list** from the `/api/me` endpoint and stores it in state.

### 6.1. usePermission hook

```pseudocode
function usePermission():
    user = useAuth()

    return {
        can: (permission) => {
            if "super_admin" in user.roles:
                return true
            return permission in user.permissions
        },
        canAny: (...permissions) => permissions.some(p => can(p)),
        canAll: (...permissions) => permissions.every(p => can(p)),
        hasRole: (role) => role in user.roles,
    }
```

### 6.2. Usage in components

```pseudocode
function UserList():
    { can } = usePermission()

    return (
        <table>
            ... rows ...
        </table>

        { can("users.create") && <button onClick={openCreateModal}>Create user</button> }

        { can("users.delete") && (
            <button onClick={handleDelete} className="text-red-500">Delete</button>
        ) }
    )
```

### 6.3. Route gate

```pseudocode
<Route path="/admin/billing" element={
    <RequirePermission permission="billing.view" fallback={<Forbidden />}>
        <BillingPage />
    </RequirePermission>
} />
```

**Important**: route gates only hide links — BE must still check when a user navigates directly via URL.

---

## 7. Common Patterns

### 7.1. Super admin escape hatch
1-2 root accounts that bypass all checks. Used to rescue the system when data is broken. **Never grant automatically** — seed once during setup only.

### 7.2. Role inheritance

- thực hiện quản lý LINk API để phần quyền theo cấp độ và userper_admin là quyền cao nhất(default)