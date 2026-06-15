---
name: crm-api-integration
description: Use when designing ExpressJS routes, writing controller classes, implementing services, or configuring JWT authentication and dynamic permissions in the CRM backend
---

# CRM API Integration Rules

## Overview
Ensures that Express controllers, services, authentication middleware, and RBAC follow clean, class-based object-oriented design and standardized response envelopes.

## When to Use
- Building controllers, routes, and services inside `src/modules/`.
- Adding authorization rules, dynamic permission checks, or JWT handling.
- Documenting API responses.

## Core Rules

### 1. Object-Oriented Controller & Service Pattern
- **Do NOT** export static classes or plain functions.
- Define classes and export a singleton instance of the controller/service:
  ```javascript
  class CompanyController {
    async list(req, res) {
      // ...
    }
  }
  export const companyController = new CompanyController();
  ```

### 2. Authentication & Permission Middleware
- Protected API routes must chain `authMiddleware` first, then `dynamicPermissionMiddleware` to evaluate permissions against request url and method:
  ```javascript
  router.use(authMiddleware);
  router.use(dynamicPermissionMiddleware);
  ```

### 3. Response Standard Envelopes
- API endpoints must return structured JSON formats:
  - **Success (200/201)**:
    ```json
    {
      "success": true,
      "message": "Retrieval successful",
      "data": { ... }
    }
    ```
  - **Failure (4xx/5xx)**:
    ```json
    {
      "success": false,
      "message": "Invalid parameters",
      "code": "VALIDATION_ERROR"
    }
    ```
- Always import status codes from the `http-status-codes` library (e.g. `StatusCodes.OK`, `StatusCodes.BAD_REQUEST`).

## Common Mistakes
- Exporting single functions instead of class instances.
- Hardcoding numeric status codes (e.g. `res.status(200)`).
