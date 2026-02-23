import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import projects, skills, auth, learnings, contact, categories, activities, user
from dotenv import load_dotenv

load_dotenv()
ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app = FastAPI()

# Allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins = ALLOWED_ORIGINS,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

# create tables for dev
# Base.metadata.create_all(bind=engine)

app.include_router(projects.router)
app.include_router(skills.router)
app.include_router(learnings.router)
app.include_router(auth.router)
app.include_router(contact.router)
app.include_router(categories.router)
app.include_router(activities.router)
app.include_router(user.router)

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}