"""
Campus Digital Twin Query and Explorer Service.
Provides high-performance access to entities, relationships, dependencies, and graph topological views.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.models.entity import EntityModel, RelationshipModel
from backend.schemas.entity import EntityRead, RelationshipRead, CampusGraphExport
from backend.graph.repository import graph_repository


class CampusService:
    """
    Service for querying physical, electrical, IT, and academic twin entities.
    """

    def list_entities(
        self,
        db: Session,
        entity_type: Optional[str] = None,
        parent_entity_id: Optional[str] = None,
        criticality: Optional[str] = None,
        operational_status: Optional[str] = None,
        limit: int = 200,
        offset: int = 0,
    ) -> List[EntityModel]:
        query = db.query(EntityModel)
        if entity_type:
            query = query.filter(EntityModel.entity_type == entity_type)
        if parent_entity_id:
            query = query.filter(EntityModel.parent_entity_id == parent_entity_id)
        if criticality:
            query = query.filter(EntityModel.criticality == criticality)
        if operational_status:
            query = query.filter(EntityModel.operational_status == operational_status)
        return query.offset(offset).limit(limit).all()

    def get_entity(self, db: Session, entity_id: str) -> EntityModel:
        entity = db.query(EntityModel).filter_by(entity_id=entity_id).first()
        if not entity:
            raise HTTPException(status_code=404, detail=f"Entity {entity_id} not found.")
        return entity

    def list_relationships(
        self,
        db: Session,
        relationship_type: Optional[str] = None,
        source_id: Optional[str] = None,
        target_id: Optional[str] = None,
        limit: int = 300,
    ) -> List[RelationshipModel]:
        query = db.query(RelationshipModel)
        if relationship_type:
            query = query.filter(RelationshipModel.relationship_type == relationship_type)
        if source_id:
            query = query.filter(RelationshipModel.source_id == source_id)
        if target_id:
            query = query.filter(RelationshipModel.target_id == target_id)
        return query.limit(limit).all()

    def get_entity_dependencies(
        self,
        entity_id: str,
        direction: str = "both",
    ) -> Dict[str, Any]:
        """Returns immediate and transitive upstream/downstream topological dependencies."""
        graph = graph_repository.graph
        if entity_id not in graph:
            raise HTTPException(status_code=404, detail=f"Entity {entity_id} not found in graph.")

        downstream = []
        upstream = []

        if direction in ("downstream", "both"):
            downstream = graph_repository.get_downstream_dependencies(entity_id)

        if direction in ("upstream", "both"):
            upstream = graph_repository.get_upstream_dependencies(entity_id)

        return {
            "entity_id": entity_id,
            "entity_name": graph.nodes[entity_id].get("name", entity_id),
            "entity_type": graph.nodes[entity_id].get("entity_type", "UNKNOWN"),
            "downstream_count": len(downstream),
            "upstream_count": len(upstream),
            "downstream_dependencies": downstream,
            "upstream_dependencies": upstream,
        }

    def export_graph(self) -> CampusGraphExport:
        return graph_repository.export_graph_dto()


campus_service = CampusService()
