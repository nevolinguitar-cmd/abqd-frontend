# ABQD Frontend repo map (source of truth)

## 1) Production (app.abqd.ru) — STATIC ONLY
**Source of truth:** `frontend/`

URLs → files:
- `/auth/`        → `frontend/auth/index.html` (+ `frontend/assets/auth.js`)
- `/constructor/` → `frontend/constructor/index.html`
- `/dashboard/`   → `frontend/dashboard/index.html`
- `/tariffs/`     → `frontend/tariffs/index.html` (+ `frontend/assets/tariffs.js`)
- `/u/`           → `frontend/u/index.html` (+ `frontend/assets/profile-render.js`)
Shared:
- `frontend/assets/api.js`, `guard.js`, `theme.js`, `app.js`, `app.css`

**Deploy workflow copies ONLY `./frontend/` to prod.**

## 2) CRM app (React/Vite) — SOURCE ONLY
**Source:** `apps/crm/`
Contains `src/`, `public/`, `package.json`, `vite.config.js`.

⚠️ CRM does NOT affect `app.abqd.ru` until a dedicated deploy is configured.

## 3) Rules
- Never place Vite root files (`src/`, `public/`, `vite.config.js`, `package.json`) in repo root.
- Static production edits — only in `frontend/`.
- CRM edits — only in `apps/crm/`.
