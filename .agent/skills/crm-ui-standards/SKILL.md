---
name: crm-ui-standards
description: Use when building React components, styling layouts with TailwindCSS, handling routing permissions, and adding animations or UI states in the CRM web project
---

# CRM UI/UX Standards

## Overview
Ensures a modern, premium, and unified interface using React, TailwindCSS, and Redux, with consistent responsive layouts, smooth micro-animations, and permission-aware routing.

## When to Use
- Building or modifying pages in `web/src/pages/`.
- Designing UI widgets, charts, and tables.
- Adding animations, dark mode variables, or custom Tailwind classes.

## Core Rules

### 1. Typography & Colors
- Use high-quality Google Fonts (e.g., Inter, Roboto, Outfit) instead of default browser sans-serif.
- Use sleek, curated dark/light HSL palettes (e.g., Slate, Slate-900, Indigo, Emerald) instead of pure raw colors.
- Keep colors harmonious, using gradients for highlights.

### 2. Interactions & Micro-animations
- Add smooth hover transitions (`transition-all duration-200`) to interactive components (buttons, links, tables, grid elements).
- Hover states should slightly scale (`hover:scale-[1.01]` or `hover:scale-105`), darken backgrounds, or increase shadows.

### 3. Responsive Layout & MainLayout
- Pages must look premium on viewports ranging from 320px mobile to 1440px+ screens.
- Use the collapsible `MainLayout` sidebar configuration for the internal panel views.
- Use card-based grid structures with flex/grid containers.

### 4. Page Protection & Navigation Permissions
- Wrap protected views in the `<ProtectedRoute>` component.
- If a user lacks the specific permission to access a route, programmatically redirect them to `/not-permission`.

## Common Mistakes
- Hardcoding generic colors (e.g., `bg-red-500`, `text-blue-500`) without matching the theme.
- Neglecting layout alignment on smaller mobile viewports.
