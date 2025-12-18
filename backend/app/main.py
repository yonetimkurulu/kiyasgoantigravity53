import sys
import os

# Fix path for Vercel: Add 'backend' folder to sys.path so 'app' imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title="KıyasGO AI Engine",
    description="Legal, Scalable Data Collection & AI Decision Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "https://kiyasgo.com",
    "https://www.kiyasgo.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "system": "KıyasGO AI Engine",
        "status": "online",
        "version": "1.0.0",
        "legal_mode": True
    }

app.include_router(api_router, prefix="/api/v1")
