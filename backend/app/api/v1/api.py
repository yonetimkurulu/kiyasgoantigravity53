from fastapi import APIRouter
from app.api.v1.endpoints import analysis, collect

api_router = APIRouter()

api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(collect.router, prefix="/collect", tags=["collect"])
