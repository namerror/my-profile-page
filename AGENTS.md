# Agent Guidance

This repo is a monorepo with a Next.js frontend and a FastAPI backend. Use this file as the shared source of truth for all coding agents.

## Repo Map
- `frontend/` Next.js 15 app (App Router)
- `backend/` FastAPI app with Alembic migrations
- `.github/` GitHub config and Copilot instructions
- `README.md` Project overview and setup steps
- `AGENT_OVERVIEW.md` Agent reference: structure, flows, and constraints

## Common Commands
- Frontend dev: `cd frontend && npm run dev`
- Frontend lint: `cd frontend && npm run lint`
- Activate backend venv: `source .venv/bin/activate`
- Backend dev: `cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Backend generate migration files: `cd backend && alembic revision --autogenerate -m "migration message"`
- Backend migrations: `cd backend && alembic upgrade head`

## Environment And Secrets
- Never commit secrets.
- Backend config lives in `backend/.env`.
- Frontend config lives in `frontend/.env.local`.
- Follow the templates documented in `README.md`.

## Conventions
- Prefer minimal, targeted edits.
- Frontend changes should be in `frontend/app/` and follow existing patterns, only make necessary changes in css styles.
- Keep diffs small and avoid large refactors without asking.
- Match existing patterns in each app.
- Ask for clarification if unsure about any aspect of the codebase or requirements before making changes.
- Log changes after every session in `docs/agent-logs/` per `docs/agent-logs/README.md`.

## Do Not
- Do not modify `frontend/app/package-lock.json` or `backend/requirements.txt`, if a new package needs to be added, ask for permission.
- Do not add new dependencies without confirming.
- Do not generate large files or code dumps unless requested.
- Do not make changes to environment variables or secrets without explicit instructions.
- Do not run commands that could change the state/file sturecture of the repo (like migrations) without permission.
- Do not make requests to backend endpoints. Web-based testing should be done manually by a human to verify changes.
- Do not touch `backend/alembic.ini` or any files in `backend/alembic/versions/`.
- Do not touch `backend/vercel.json`.

## Verification
- Run the smallest relevant check when requested or when changes are risky.
- If you cannot run a command, say so and explain what to run.
