---
name: crm-databases
description: Use when querying, modifying, or creating database schema migrations, Prisma models, soft delete filters, and tree relationships in the CRM project
---

# CRM Database Rules

## Overview
Ensures consistent database operations, proper Prisma client usage, soft delete compliance, and hierarchical tree resolutions in the PostgreSQL database.

## When to Use
- Writing raw SQL or Prisma client queries.
- Adding or modifying tables in `prisma/schema.prisma`.
- Fetching hierarchical structural data (e.g., organizational units tree).

## Core Rules

### 1. Prisma Client Import
- **Do NOT** instantiate new `PrismaClient()`.
- Always import the shared instance `PRISMA`:
  ```javascript
  import { PRISMA } from "../../configs/db.config.js";
  ```

### 2. Table and Field Naming
- Database tables are named in UPPERCASE in `prisma/schema.prisma` and mapped accordingly (e.g., `employee` maps to `EMPLOYEES` table).
- Prisma Client camel-cases the model names (e.g. `model EMPLOYEES` maps to `PRISMA.eMPLOYEES`, and `model ACCOUNTS` maps to `PRISMA.aCCOUNTS`). Keep this casing standard in your Prisma queries.

### 3. Soft Delete Compliance
- **Never** perform hard deletes (`PRISMA.model.delete`).
- Always perform soft deletes by updating `deletedAt` to the current timestamp and setting `status` to `DISABLED`:
  ```javascript
  await PRISMA.eMPLOYEES.update({
    where: { employeeId },
    data: {
      deletedAt: new Date(),
      status: "DISABLED"
    }
  });
  ```
- **Always** filter out soft-deleted items and disabled items when querying active data:
  ```javascript
  where: {
    deletedAt: null,
    status: "ENABLE"
  }
  ```

### 4. Hierarchical / Tree Queries
- `ORG_UNITS` can have a parent-child relationship via `parentUnitId` pointing to `orgUnitId`. Use recursive functions or depth-limiting resolvers to query this structure safely and avoid infinite recursion.

## Common Mistakes
- Using `prisma.delete()` directly.
- Forgetting to filter `deletedAt: null` in query filters.
