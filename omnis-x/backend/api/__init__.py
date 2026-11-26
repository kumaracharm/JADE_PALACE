"""
Main API Package Router Aggregation.
"""
from fastapi import APIRouter
from backend.api.campus import router as campus_router
from backend.api.events import router as events_router
from backend.api.incidents import router as incidents_router
from backend.api.work_orders import router as work_orders_router
from backend.api.simulations import router as simulations_router
from backend.api.analytics import router as analytics_router
from backend.api.auth import router as auth_router
from backend.api.ml import router as ml_router
from backend.api.demo import router as demo_router
from backend.api.inbox import router as inbox_router

api_router = APIRouter()

api_router.include_router(campus_router)
api_router.include_router(events_router)
api_router.include_router(incidents_router)
api_router.include_router(work_orders_router)
api_router.include_router(simulations_router)
api_router.include_router(analytics_router)
api_router.include_router(auth_router)
api_router.include_router(ml_router)
api_router.include_router(demo_router)
api_router.include_router(inbox_router)
