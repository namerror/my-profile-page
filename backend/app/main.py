from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import *
# from .db.session import engine
# from .db.base import Base
from .api import projects, skills, auth, learnings, contact, categories
import os
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

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}

''' Hardcoded Data - Used for Testing Only '''
# hardcoded skills
_skill_frontend = Skill(name="Frontend")
_skill_nextjs = Skill(name="Next.js", parent=_skill_frontend)
_skill_blockchain = Skill(name="Blockchain")
_skill_solana = Skill(name="Solana", parent=_skill_blockchain)
_skill_python = Skill(name="Python")

# hardcoded projects
_projects: list[Project] = [
    Project(id=1, name="HackProof", description="A decentralized voting system for hacking projects", is_completed=True, skills=[_skill_frontend, _skill_solana]),
    Project(id=2, name="Portfolio", description="My own portfolio page that you're currently viewing", is_completed=False, skills=[_skill_frontend, _skill_python]),
]

# ''' Routing '''
# @app.get("/", response_model=list[Project])
# def list_projects():
#     return _projects