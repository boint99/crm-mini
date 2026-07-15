# Dynamic .env Generation in GitHub Actions Implementation Plan (Updated)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix cache error by removing lockfile cache configuration, change `npm ci` to `npm install` for frontend dependencies, and generate `.env` & `web/.env` dynamically using repository secrets.

---

### Task 1: Update .github/workflows/action.yml

**Files:**
- Modify: `[action.yml](file:///d:/Workspase/15. Code/crm-mini/.github/workflows/action.yml)`

- [ ] **Step 1: Disable setup-node cache and fix npm ci**
  In `.github/workflows/action.yml`, remove `cache: 'npm'` from setup-node and change `npm ci` to `npm install` for the frontend dependencies.

- [ ] **Step 2: Update env creation in setup job to use repository secrets**
  Replace `${{ env.VAR }}` references with `${{ secrets.VAR }}` in the `.env` generation step of the `setup` job, and add the `web/.env` creation step.

- [ ] **Step 3: Add env creation steps to the deploy job**
  Add the `.env` generation, `server.sh` execution, and `web/.env` creation steps to the `deploy` job.

- [ ] **Step 4: Commit and push changes**
