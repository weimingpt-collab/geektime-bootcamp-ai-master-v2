"""API routes"""

from fastapi import APIRouter

from .tags import router as tags_router
from .tickets import router as tickets_router

api_router = APIRouter()
api_router.include_router(tickets_router)
api_router.include_router(tags_router)

__all__ = ["api_router"]
