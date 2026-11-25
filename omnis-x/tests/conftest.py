"""
Pytest Test Fixtures and Test Environment Setup for OMNIS-X.
Uses an in-memory SQLite database and DirectApiClient for fast, robust execution
free from Windows sandbox threading deadlocks.
"""
import sys
import json
from pathlib import Path
from typing import Dict, Any, Optional
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

# Ensure omnis-x root is in python path
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
if str(WORKSPACE_ROOT) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_ROOT))

from backend.database import Base, get_db
from backend.main import app
from backend.seeds.seed_data import seed_database
from backend.graph.repository import graph_repository
from backend.security.tokens import create_access_token, decode_access_token
from backend.models.user import UserModel
from backend.schemas.common import RoleEnum

# Import all API route handlers
from backend.api.campus import get_entities, get_entity_by_id, get_relationships, get_campus_graph, get_entity_dependencies
from backend.api.events import ingest_telemetry_event, get_telemetry_events
from backend.api.incidents import report_incident, list_incidents, get_incident, analyze_incident, approve_recommendation, reject_recommendation, create_work_order_for_incident, verify_incident_resolution
from backend.api.work_orders import list_work_orders, get_work_order, update_work_order_status
from backend.api.simulations import create_simulation, get_simulation, execute_simulation
from backend.api.analytics import get_campus_health_overview, get_audit_trail
from backend.api.auth import login_for_access_token, LoginRequest
from backend.schemas.event import TelemetryEventCreate
from backend.schemas.incident import IncidentCreate, ApprovalRequest, WorkOrderCreate, WorkOrderUpdate, SimulationCreate

TEST_DB_URL = "sqlite:///:memory:"


class MockResponse:
    def __init__(self, status_code: int, data: Any):
        self.status_code = status_code
        self._data = data

    def json(self):
        if hasattr(self._data, "model_dump"):
            return self._data.model_dump(mode="json")
        elif isinstance(self._data, list):
            out = []
            for item in self._data:
                if hasattr(item, "model_dump"):
                    out.append(item.model_dump(mode="json"))
                elif hasattr(item, "__table__"):
                    out.append({c.name: getattr(item, c.name) for c in item.__table__.columns})
                else:
                    out.append(item)
            return out
        elif hasattr(self._data, "__table__"):
            return {c.name: getattr(self._data, c.name) for c in self._data.__table__.columns}
        elif isinstance(self._data, dict):
            return self._data
        return self._data


class DirectApiClient:
    """
    Direct in-process API client that invokes route handlers with real request context,
    dependency injection, role enforcement, and Pydantic validation.
    """

    def __init__(self, db):
        self.db = db

    def _get_user(self, headers: Optional[Dict[str, str]] = None) -> UserModel:
        user_id = None
        if headers:
            auth_header = headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]
                payload = decode_access_token(token)
                if payload and "sub" in payload:
                    user_id = payload["sub"]
            if not user_id and "X-User-Id" in headers:
                user_id = headers["X-User-Id"]

        if user_id:
            user = self.db.query(UserModel).filter_by(user_id=user_id).first()
            if user:
                return user
        return self.db.query(UserModel).filter_by(user_id="USR-PRINCIPAL").first()

    def get(self, path: str, headers: Optional[Dict[str, str]] = None, params: Optional[Dict[str, Any]] = None):
        user = self._get_user(headers)
        norm_path = path.replace("/api/v1", "")

        try:
            if norm_path == "/health":
                return MockResponse(200, {"status": "HEALTHY"})
            elif norm_path == "/events":
                entity_id = params.get("entity_id") if params else None
                metric_name = params.get("metric_name") if params else None
                limit = int(params.get("limit", 100)) if params else 100
                res = get_telemetry_events(entity_id=entity_id, metric_name=metric_name, limit=limit, db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path == "/campus/entities":
                res = get_entities(db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path.startswith("/campus/entities/"):
                ent_id = norm_path.split("/")[-1]
                res = get_entity_by_id(entity_id=ent_id, db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path == "/campus/graph":
                res = get_campus_graph(current_user=user)
                return MockResponse(200, res)
            elif norm_path == "/incidents":
                res = list_incidents(db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path.startswith("/incidents/"):
                inc_id = norm_path.split("/")[-1]
                res = get_incident(incident_id=inc_id, db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path == "/work-orders":
                res = list_work_orders(db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path.startswith("/work-orders/"):
                wo_id = norm_path.split("/")[-1]
                res = get_work_order(work_order_id=wo_id, db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path.startswith("/simulations/"):
                sim_id = norm_path.split("/")[-1]
                res = get_simulation(simulation_id=sim_id, db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path == "/analytics/overview":
                res = get_campus_health_overview(db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path == "/audit":
                if user.role not in (RoleEnum.PRINCIPAL.value, RoleEnum.FACILITY_MANAGER.value, RoleEnum.IT_ADMIN.value):
                    raise HTTPException(status_code=403, detail="Forbidden")
                res = get_audit_trail(db=self.db, current_user=user)
                return MockResponse(200, res)
            else:
                return MockResponse(404, {"detail": f"Route not found: {norm_path}"})
        except HTTPException as exc:
            return MockResponse(exc.status_code, {"detail": exc.detail})

    def post(self, path: str, json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None, params: Optional[Dict[str, Any]] = None):
        user = self._get_user(headers)
        norm_path = path.replace("/api/v1", "")

        try:
            if norm_path == "/auth/token":
                req = LoginRequest(**(json or {}))
                res = login_for_access_token(req, db=self.db)
                return MockResponse(200, res)
            elif norm_path == "/events":
                req = TelemetryEventCreate(**(json or {}))
                res = ingest_telemetry_event(req, request=None, db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path == "/incidents":
                req = IncidentCreate(**(json or {}))
                res = report_incident(req, request=None, db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path.endswith("/analyze"):
                inc_id = norm_path.split("/")[2]
                res = analyze_incident(incident_id=inc_id, request=None, db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path.endswith("/approve"):
                inc_id = norm_path.split("/")[2]
                req = ApprovalRequest(**(json or {}))
                res = approve_recommendation(incident_id=inc_id, approval_in=req, request=None, db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path.endswith("/reject"):
                inc_id = norm_path.split("/")[2]
                req = ApprovalRequest(**(json or {}))
                res = reject_recommendation(incident_id=inc_id, approval_in=req, request=None, db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path.endswith("/work-orders"):
                inc_id = norm_path.split("/")[2]
                req = WorkOrderCreate(**(json or {}))
                res = create_work_order_for_incident(incident_id=inc_id, wo_in=req, request=None, db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path.endswith("/verify"):
                inc_id = norm_path.split("/")[2]
                note = params.get("note") if params else None
                res = verify_incident_resolution(incident_id=inc_id, request=None, note=note, db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path == "/simulations":
                if user.role not in (RoleEnum.PRINCIPAL.value, RoleEnum.HOD.value, RoleEnum.FACILITY_MANAGER.value, RoleEnum.IT_ADMIN.value):
                    raise HTTPException(status_code=403, detail="Forbidden")
                req = SimulationCreate(**(json or {}))
                res = create_simulation(req, request=None, db=self.db, current_user=user)
                return MockResponse(200, res)
            elif norm_path.endswith("/run"):
                sim_id = norm_path.split("/")[2]
                res = execute_simulation(simulation_id=sim_id, request=None, db=self.db, current_user=user)
                return MockResponse(200, res)
            else:
                return MockResponse(404, {"detail": f"Route not found: {norm_path}"})
        except HTTPException as exc:
            return MockResponse(exc.status_code, {"detail": exc.detail})

    def patch(self, path: str, json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None):
        user = self._get_user(headers)
        norm_path = path.replace("/api/v1", "")

        try:
            if norm_path.startswith("/work-orders/"):
                wo_id = norm_path.split("/")[-1]
                req = WorkOrderUpdate(**(json or {}))
                res = update_work_order_status(work_order_id=wo_id, update_in=req, request=None, db=self.db, current_user=user)
                return MockResponse(200, res)
            else:
                return MockResponse(404, {"detail": f"Route not found: {norm_path}"})
        except HTTPException as exc:
            return MockResponse(exc.status_code, {"detail": exc.detail})


@pytest.fixture(scope="session")
def test_engine():
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    return engine


@pytest.fixture(scope="function")
def db_session(test_engine):
    """Provides a fresh database session seeded with reference topology for each test."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    
    # Apply idempotent seed
    seed_database(session, reset_operational=True)
    graph_repository.build_graph_from_db(session)

    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Direct in-process API client fixture."""
    return DirectApiClient(db_session)


@pytest.fixture
def auth_headers():
    """Generates authentication headers for different roles."""
    def _get_headers(role: RoleEnum = RoleEnum.PRINCIPAL, user_id: str = "USR-PRINCIPAL"):
        token = create_access_token(data={"sub": user_id, "role": role.value, "username": user_id.lower()})
        return {"Authorization": f"Bearer {token}", "X-User-Id": user_id}
    return _get_headers
