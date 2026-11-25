"""
Campus Digital Twin and Graph API Endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.entity import EntityRead, RelationshipRead, CampusGraphExport
from backend.services.campus_service import campus_service
from backend.graph.repository import graph_repository
from backend.security.auth import get_current_user
from backend.models.user import UserModel

router = APIRouter(prefix="/campus", tags=["Campus & Graph"])


@router.get("/entities", response_model=List[EntityRead])
def get_entities(
    entity_type: Optional[str] = None,
    parent_entity_id: Optional[str] = None,
    criticality: Optional[str] = None,
    operational_status: Optional[str] = None,
    limit: int = 200,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Retrieve catalog of physical, electrical, IT, and academic twin entities."""
    return campus_service.list_entities(
        db=db,
        entity_type=entity_type,
        parent_entity_id=parent_entity_id,
        criticality=criticality,
        operational_status=operational_status,
        limit=limit,
        offset=offset,
    )


@router.get("/entities/{entity_id}", response_model=EntityRead)
def get_entity_by_id(
    entity_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Get single twin entity by canonical identifier."""
    return campus_service.get_entity(db, entity_id)


@router.get("/relationships", response_model=List[RelationshipRead])
def get_relationships(
    relationship_type: Optional[str] = None,
    source_id: Optional[str] = None,
    target_id: Optional[str] = None,
    limit: int = 300,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Retrieve directed relationships linking physical, spatial, and academic entities."""
    return campus_service.list_relationships(
        db=db,
        relationship_type=relationship_type,
        source_id=source_id,
        target_id=target_id,
        limit=limit,
    )


@router.get("/graph", response_model=CampusGraphExport)
def get_campus_graph(
    current_user: UserModel = Depends(get_current_user),
):
    """Exports full in-memory NetworkX directed dependency graph."""
    return campus_service.export_graph()


@router.get("/entities/{entity_id}/dependencies")
def get_entity_dependencies(
    entity_id: str,
    direction: str = Query("both", pattern="^(upstream|downstream|both)$"),
    current_user: UserModel = Depends(get_current_user),
):
    """Query upstream power/network sources and downstream dependent facilities/activities."""
    return campus_service.get_entity_dependencies(entity_id=entity_id, direction=direction)


@router.post("/graph/rebuild")
def rebuild_graph(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Explicitly reload and reconstruct in-memory NetworkX graph from database records."""
    g = graph_repository.rebuild(db)
    return {
        "status": "SUCCESS",
        "nodes_loaded": len(g.nodes),
        "edges_loaded": len(g.edges),
        "rebuilt_at": graph_repository.last_rebuilt,
    }
