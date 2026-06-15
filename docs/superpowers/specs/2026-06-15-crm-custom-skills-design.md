# Design Specification: CRM Custom Agent Skills

This document defines the custom skills (agent guidelines) that will be placed under `.agent/skills/` to guide the AI development of the CRM-Mini system. It ensures that the AI complies with database models, frontend UX standards, and API structures.

## 1. CRM Custom Skills Overview

To enforce strict architectural and design patterns across the application, we will create three custom skills in the CRM project:
1. **Database Rules (`crm-databases`)**: Rules for database schema queries, Prisma usage, and soft delete constraints.
2. **UI/UX Standards (`crm-ui-standards`)**: Frontend guidelines for Tailwind styling, React layout consistency, routing permissions, and page structures.
3. **API Integration (`crm-api-integration`)**: Patterns for ExpressJS controllers, service classes, JWT authentication, and dynamic authorization middleware.
4. **Rules (`crm-rule`)**: Patterns for 7-Phase Pipeline, strict validation, and code quality.

---

## 2. Proposed Skills Content

### 2.1. Skill 1: Database Rules (`crm-databases`)
- **Path**: `.agent/skills/crm-databases/SKILL.md`
- **Key Guidelines**:
  - **Prisma Client**: Always import the shared instance from `../../configs/db.config.js` (e.g., `import { PRISMA } from ...`). Never instantiate a new `PrismaClient()`.
  - **Table Schema Mapping**: Database tables are mapped to UPPERCASE table names (e.g., `employee` maps to `EMPLOYEES` table, `account` maps to `ACCOUNTS` table).
  - **Soft Delete Compliance**:
    - Active queries MUST include `deletedAt: null` and `status: 'ENABLE'` in their where clauses.
    - Soft delete instead of hard delete: update `deletedAt: new Date()` and `status: 'DISABLED'`.
  - **Tree/Hierarchical Queries**: `ORG_UNITS` is self-referential (`parentUnitId` points to `orgUnitId`). Ensure recursive queries or tree-resolving logic handles this structure without infinite loops.
  - **UUID Compliance**:
    - All UUID fields must be generated using `uuidv7()` or `v7()`. Never use `uuid()` or `v4()`. (Reference `db.js`)

### 2.2. Skill 2: UI/UX Standards (`crm-ui-standards`)
- **Path**: `.agent/skills/crm-ui-standards/SKILL.md`
- **Key Guidelines**:
  - **Tech Stack**: React + TailwindCSS + Redux Toolkit.
  - **Layout & Responsiveness**:
    - Use `MainLayout` with a collapsible sidebar for dashboard navigation.
    - Viewports must be responsive from mobile to desktop sizes.
  - **Theme & Aesthetics**:
    - Avoid raw colors. Use Slate/Indigo/Emerald gradients and curated HSL palettes.
    - Add transition effects (`transition-all duration-200`) on buttons, links, and list rows on hover.
  - **Access Protection**:
    - Protect routes with `<ProtectedRoute>` wrapper.
    - For unauthorized routes, redirect to `/not-permission` page.

### 2.3. Skill 3: API Integration (`crm-api-integration`)
- **Path**: `.agent/skills/crm-api-integration/SKILL.md`
- **Key Guidelines**:
  - **OOP Controller & Service Pattern**:
    - Do NOT use static methods. Define classes and export their instances:
      ```javascript
      class CompanyController { ... }
      export const companyController = new CompanyController();
      ```
  - **Express Routes & Middleware**:
    - Protected routes must use `authMiddleware` first, followed by `dynamicPermissionMiddleware` for RBAC.
  - **Standardized Response Formats**:
    - Success: `{ success: true, message: '...', data: ... }`
    - Failure: `{ success: false, message: '...', code: 'ERROR_CODE' }`
    - HTTP Status Codes must come from the `http-status-codes` library.

---

## 3. Verification & Execution Plan

We will create the skills files one by one. Once created, we will verify that the AI understands them by writing tests or asking the subagent to draft components following these guidelines.
