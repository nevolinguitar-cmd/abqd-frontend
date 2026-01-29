# ABQD Frontend (Source of Truth)

## What is deployed to app.abqd.ru
**ONLY `frontend/` is deployed** by GitHub Actions (self-hosted runner).

- Repo path: `./frontend/`
- Deploy target (runner):
  - `main` -> `/var/www/abqd/prod/frontend`
  - `develop` -> `/var/www/abqd/stage/frontend`
- Nginx serves **/opt/abqd/static** which is a symlink to:
  - `/var/www/abqd/prod/frontend`

✅ So: changes outside `frontend/` DO NOT affect production pages on `app.abqd.ru`.

## Structure
- `frontend/` — static pages served on app.abqd.ru:
  - `/auth/`, `/constructor/`, `/dashboard/`, `/tariffs/`, `/u/`
  - shared JS/CSS in `frontend/assets/`
- `apps/crm/` — CRM (Vite/React). Not deployed to app.abqd.ru by current workflow.

## Rules
- No `*.bak*` artifacts in repo (workflow excludes them).
- Production static lives only in `frontend/`.
- CRM lives only in `apps/crm/`.

## Server mapping (prod)
- Served dir: `/opt/abqd/static` -> symlink -> `/var/www/abqd/prod/frontend`
- API: `https://api.abqd.ru/`
