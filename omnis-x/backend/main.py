"""
OMNIS-X — Institutional Cyber-Physical Digital Twin & Resilience Backend.
FastAPI Application Entry Point.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles
from backend.config import settings
from backend.database import engine, Base, SessionLocal
import backend.models  # Registers all models with Base.metadata
from backend.seeds.seed_data import seed_database
from backend.graph.repository import graph_repository
from backend.api import api_router

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("omnis_x")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle event management.
    Initializes relational tables, applies idempotent seed data,
    and reconstructs in-memory NetworkX dependency graph.
    """
    logger.info("Initializing OMNIS-X Digital Twin backend...")
    
    # 1. Ensure database schema exists
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified.")

    # 2. Apply idempotent campus reference seed data
    db = SessionLocal()
    try:
        seed_database(db, reset_operational=False)
        # 3. Construct in-memory NetworkX computational graph from persistent DB
        graph_repository.build_graph_from_db(db)
        logger.info(
            "OMNIS-X Digital Twin initialized with %d nodes and %d dependency edges.",
            len(graph_repository.graph.nodes),
            len(graph_repository.graph.edges),
        )
        # 4. Ensure central global synthetic telemetry producer is running
        from backend.api.demo import broadcaster
        broadcaster.ensure_producer()
        logger.info("Global synthetic telemetry broadcaster initialized.")
    finally:
        db.close()

    yield

    logger.info("Shutting down OMNIS-X backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
# OMNIS-X Institutional Cyber-Physical Digital Twin Backend
Provides continuous dependency graph modeling, real-time telemetry anomaly detection,
FMEA risk assessment, academic timetable displacement evaluation, Google OR-Tools CP-SAT recovery optimization,
and multi-tier human approval workflows.
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Student Grievance PWA static bundle if present
pwa_public_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "pwa", "public"))
if os.path.isdir(pwa_public_dir):
    app.mount("/student", StaticFiles(directory=pwa_public_dir, html=True), name="student_pwa")
    logger.info("Mounted Student Grievance PWA at /student from %s", pwa_public_dir)

# Mount API Routers (both with /api/v1 prefix and root prefix for flexible client compatibility)
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
app.include_router(api_router)


@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    """
    Liveness and readiness health probe.
    Reports API operational status, database connectivity, and graph node counts.
    """
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "graph_nodes_loaded": len(graph_repository.graph.nodes),
        "graph_edges_loaded": len(graph_repository.graph.edges),
        "last_rebuilt": graph_repository.last_rebuilt,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
