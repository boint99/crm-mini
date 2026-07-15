# Remove DB compose dependency Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove compose dependency constraints to allow external database connections.

---

### Task 1: Update docker-compose.prod.yml
- **Files**:
  - `[docker-compose.prod.yml](file:///d:/Workspase/15. Code/crm-mini/docker-compose.prod.yml)`

- [ ] **Step 1: Remove depends_on: - db from backend service**
  Modify `docker-compose.prod.yml` to remove the `depends_on` block from the `backend` service.

- [ ] **Step 2: Commit and push changes**
