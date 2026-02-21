# Agent Overview

This project is a reusable portfolio generator built as a monorepo with a Next.js frontend and a FastAPI backend. It is evolving from a personal portfolio to a generator for other users.

## Architecture Map
- Frontend entrypoint: `frontend/app/page.tsx`
- Admin dashboard: `frontend/app/admin/dashboard/page.tsx` (accessed at `/admin/dashboard`)
- Backend models: `backend/app/models_db.py` (Project, Skill, Activity, Learning, User, etc.)
- Backend API routes: `backend/app/api/` (one file per model)
- Backend schemas: `backend/app/schemas.py` (Pydantic models for request/response validation)
- Backend CRUD logic: `backend/app/crud.py`
- Auth logic: `backend/app/api/auth.py`

## Roles And Access
- Public users can view pages but cannot modify content.
- Admin access is configured via environment variables and used to manage content.
- Admin UI is in the Next.js app, and the backend enforces access for protected endpoints.

## Key Data Flows
- Frontend requests projects, skills, activities, learning resources, and related data from backend endpoints in `backend/app/api/`.
- Authenticated admin requests are required for any content changes.

## Environments And Deployment Notes
- Development is local, but the database connects to production.
- Vercel deployment for the frontend is automated per commit; no manual steps needed in this branch.

## Agent Constraints
- Do not touch `backend/alembic.ini` or any files in `backend/alembic/versions/`.
- Do not touch `backend/vercel.json`.
- Do not modify `frontend/app/package-lock.json` or `backend/requirements.txt` without explicit permission.

## Agent Logging
- Log after every session in `docs/agent-logs/`.
- Follow `docs/agent-logs/README.md`.
