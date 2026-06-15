---
name: crm-rule
description: Use when starting a new task, brainstorming, planning, implementing features, testing, reviewing code, or completing branches in the CRM project to follow the standard 7-Phase Pipeline
---

# CRM Project Development Rules (7-Phase Pipeline)

## Overview
All development in the CRM project must strictly adhere to the 7-Phase Pipeline to ensure architectural integrity, high code quality, and structured validation.

## When to Use
- Starting any new feature, bug fix, or codebase change.
- Reviewing work progress or finishing development branch work.

---

## The 7-Phase Pipeline

### Phase 1: Brainstorming & Design (Brainstorming & SpeQ)
- **Rule**: Do NOT write any source code or initialize scaffolding until a design is proposed and approved.
- **Action**: Discuss requirements with the user, clarify ambiguities (one question at a time), write a design spec in `docs/superpowers/specs/`, and get explicit user approval.

### Phase 2: Environment Isolation (Using Git Worktrees)
- **Rule**: Keep the main workspace clean and isolate feature development.
- **Action**: Create a new git branch or worktree for implementation to avoid polluting the main source code base.

### Phase 3: Plan Writing (Writing Plans)
- **Rule**: Decompose the approved spec into micro-tasks (2-5 minutes per task) with clear files to modify/create and exact commands.
- **Action**: Create an implementation plan in `docs/superpowers/plans/` and a `task.md` artifact, outlining:
  - Exact file paths.
  - Expected command and verification checks.
  - No placeholders like "TODO" or "will implement later".

### Phase 4: Parallel Execution (Subagent Execution)
- **Rule**: Delegate tasks to specialized agents (implementer, spec-reviewer, code-reviewer) with narrow contexts.
- **Action**: Use the main agent to coordinate and orchestrate, dispatching subagents for separate isolated tasks.

### Phase 5: Test-Driven Development (TDD)
- **Rule**: Follow the RED-GREEN-REFACTOR cycle strictly.
- **Action**:
  1. Write a failing test first (RED).
  2. Run the test to confirm it fails.
  3. Write the minimal code required to pass the test (GREEN).
  4. Run the test to confirm it passes.
  5. Refactor the code and verify the test still passes.
  6. Commit changes.

### Phase 6: Two-Stage Code Review
- **Rule**: Code must be reviewed twice before completing the task.
- **Action**:
  - **Stage 1 (Spec Reviewer)**: Verify that the implementation matches all requirements in the design spec (neither more nor less).
  - **Stage 2 (Code Reviewer)**: Review the implementation for security vulnerabilities, code quality, readability, performance, and compliance with CRM custom skills.

### Phase 7: Finishing Branch (Finishing Branch)
- **Rule**: Verify the entire test suite and clean up the temporary workspace before merging.
- **Action**: Run all tests, ensure there are no lingering console logs/temporary files, merge/create PR, and present the final walkthrough with screenshots or demo links to the user.

---

## Custom Skill Compliance Checklist
When building CRM components, always cross-reference and adhere to the project's other custom skills:
- `crm-databases`: Prisma Client importing rules, UPPERCASE casing standard, soft delete rules (`deletedAt`, `status: 'ENABLE'`), tree resolvers.
- `crm-ui-standards`: Custom Tailwind configurations, responsive layout wrappers, page permission checks.
- `crm-api-integration`: OOP class-based controller and service export pattern, dynamic authorization route middleware, standardized JSON envelopes.
