# Dynamic .env Generation & React ESLint Fixes Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve ESLint errors in the frontend preventing build/lint verification.

---

### Task 1: Fix ESLint errors in Flyout and Navigation Components
- **Files**:
  - `[Flyout.jsx](file:///d:/Workspase/15. Code/crm-mini/web/src/components/navigate/Flyout.jsx)`
  - `[NavGroupCollapsed.jsx](file:///d:/Workspase/15. Code/crm-mini/web/src/components/navigate/NavGroupCollapsed.jsx)`

- [ ] **Step 1: Update Flyout.jsx to use useLayoutEffect**
  Modify `Flyout.jsx` to import and use `useLayoutEffect` for measuring DOM nodes.

- [ ] **Step 2: Update NavGroupCollapsed.jsx to use state callback ref**
  Modify `NavGroupCollapsed.jsx` to replace `btnRef` with `anchorEl` state and `ref={setAnchorEl}`.

---

### Task 2: Escape entity characters in pages
- **Files**:
  - `[Login/index.jsx](file:///d:/Workspase/15. Code/crm-mini/web/src/pages/Auth/Login/index.jsx)`
  - `[Dashboard/index.jsx](file:///d:/Workspase/15. Code/crm-mini/web/src/pages/Dashboard/index.jsx)`

- [ ] **Step 1: Fix Login/index.jsx unescaped entities**
  Wrap unescaped strings in JSX quotes/braces.

- [ ] **Step 2: Fix Dashboard/index.jsx unescaped entities**
  Wrap unescaped strings in JSX quotes/braces.

---

### Task 3: Defer synchronous setState inside useEffects
- **Files**:
  - `[Networks/index.jsx](file:///d:/Workspase/15. Code/crm-mini/web/src/pages/Networks/index.jsx)`
  - `[Organization/index.jsx](file:///d:/Workspase/15. Code/crm-mini/web/src/pages/Organizations/Organization/index.jsx)`

- [ ] **Step 1: Defer state update in Networks/index.jsx**
  Wrap `setSelectedVlanId` call in `Promise.resolve().then(...)`.

- [ ] **Step 2: Defer state updates in Organization/index.jsx**
  Wrap all synchronous `setState` calls inside `useEffect` with `Promise.resolve().then(...)`.
