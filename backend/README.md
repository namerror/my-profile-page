# Running Locally
This guide will help you set up and run the backend server locally.
## Starting the Backend Server
In the `backend` directory, run:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
## Migrating the Database
To apply database migrations, use Alembic. In the `backend` directory, run:
```bash
alembic upgrade head
```
To create a new migration after modifying the models, run:
```bash
alembic revision --autogenerate -m "Your migration message"
```
Remember to review the generated migration script before applying it.