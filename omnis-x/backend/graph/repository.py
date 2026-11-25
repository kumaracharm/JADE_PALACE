"""
Graph Repository and In-Memory NetworkX Computational Representation.
The database is the persistent source of truth. NetworkX is derived in-memory.
"""
import threading
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional, Set
import networkx as nx
from sqlalchemy.orm import Session
from backend.models.entity import EntityModel, RelationshipModel
from backend.schemas.common import RelationshipType, OperationalStatus, CriticalityLevel, EntityType
from backend.schemas.entity import GraphNodeInfo, GraphEdgeInfo, CampusGraphExport

logger = logging.getLogger(__name__)


class GraphRepository:
    """
    Thread-safe repository managing the in-memory NetworkX DiGraph representation of the campus.
    Reconstructed from the relational database at startup and whenever mutations are committed.
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(GraphRepository, cls).__new__(cls)
                cls._instance._graph = nx.DiGraph()
                cls._instance._last_rebuilt = None
                cls._instance._entity_cache = {}
            return cls._instance

    @property
    def graph(self) -> nx.DiGraph:
        """Returns the in-memory NetworkX DiGraph."""
        return self._graph

    @property
    def last_rebuilt(self) -> Optional[datetime]:
        return self._last_rebuilt

    def build_graph_from_db(self, db: Session) -> nx.DiGraph:
        """
        Atomically reads all entities and relationships from the database
        and constructs a validated NetworkX DiGraph.
        """
        with self._lock:
            new_graph = nx.DiGraph()
            entities = db.query(EntityModel).all()
            relationships = db.query(RelationshipModel).all()

            logger.info("Building NetworkX graph from DB: %d entities, %d relationships", len(entities), len(relationships))

            entity_ids: Set[str] = set()
            new_entity_cache = {}

            # 1. Add nodes
            for e in entities:
                entity_ids.add(e.entity_id)
                node_data = {
                    "name": e.name,
                    "entity_type": e.entity_type,
                    "description": e.description or "",
                    "parent_entity_id": e.parent_entity_id,
                    "location": e.location or "",
                    "criticality": e.criticality,
                    "operational_status": e.operational_status,
                    "metadata": e.metadata_json or {},
                    "updated_at": e.updated_at.isoformat() if e.updated_at else None,
                }
                new_graph.add_node(e.entity_id, **node_data)
                new_entity_cache[e.entity_id] = node_data

            # 2. Add edges with reference validation
            valid_edge_count = 0
            for r in relationships:
                if r.source_id not in entity_ids:
                    logger.warning("Relationship %s references missing source_id %s; skipping edge", r.relationship_id, r.source_id)
                    continue
                if r.target_id not in entity_ids:
                    logger.warning("Relationship %s references missing target_id %s; skipping edge", r.relationship_id, r.target_id)
                    continue

                edge_data = {
                    "relationship_id": r.relationship_id,
                    "relationship_type": r.relationship_type,
                    "is_essential": r.is_essential,
                    "redundancy_available": r.redundancy_available,
                    "dependency_strength": r.dependency_strength,
                    "propagation_policy": r.propagation_policy,
                    "metadata": r.metadata_json or {},
                }
                new_graph.add_edge(r.source_id, r.target_id, **edge_data)
                valid_edge_count += 1

            self._graph = new_graph
            self._entity_cache = new_entity_cache
            self._last_rebuilt = datetime.utcnow()
            logger.info("NetworkX graph successfully reconstructed: %d nodes, %d edges", len(new_graph.nodes), valid_edge_count)
            return self._graph

    def rebuild(self, db: Session) -> nx.DiGraph:
        """Explicit trigger to rebuild the graph from persisted database state."""
        return self.build_graph_from_db(db)

    def get_node(self, entity_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve node attributes by entity ID."""
        if entity_id in self._graph:
            return dict(self._graph.nodes[entity_id])
        return None

    def get_downstream_dependencies(
        self,
        entity_id: str,
        relationship_types: Optional[Set[str]] = None,
        max_depth: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Traverses outgoing edges from entity_id up to max_depth.
        Returns list of (source, target, edge_data, depth).
        """
        if entity_id not in self._graph:
            return []

        visited = set()
        queue = [(entity_id, 0)]
        results = []

        while queue:
            curr_node, depth = queue.pop(0)
            if max_depth is not None and depth >= max_depth:
                continue

            for successor in self._graph.successors(curr_node):
                edge_data = self._graph.get_edge_data(curr_node, successor)
                rel_type = edge_data.get("relationship_type")
                if relationship_types and rel_type not in relationship_types:
                    continue

                results.append({
                    "source_id": curr_node,
                    "target_id": successor,
                    "edge_data": edge_data,
                    "depth": depth + 1,
                })

                if successor not in visited:
                    visited.add(successor)
                    queue.append((successor, depth + 1))

        return results

    def get_upstream_dependencies(self, entity_id: str) -> List[Dict[str, Any]]:
        """Returns immediate and transitive upstream dependencies feeding entity_id."""
        if entity_id not in self._graph:
            return []

        results = []
        for predecessor in self._graph.predecessors(entity_id):
            edge_data = self._graph.get_edge_data(predecessor, entity_id)
            results.append({
                "source_id": predecessor,
                "target_id": entity_id,
                "edge_data": edge_data,
            })
        return results

    def check_redundancy(self, target_id: str, failed_source_id: str) -> bool:
        """
        Checks if target_id has an alternative functional power/network path
        when failed_source_id is down.
        """
        if target_id not in self._graph:
            return False

        # Look at incoming edges
        for predecessor in self._graph.predecessors(target_id):
            if predecessor == failed_source_id:
                continue

            edge_data = self._graph.get_edge_data(predecessor, target_id)
            rel_type = edge_data.get("relationship_type")
            pred_node = self._graph.nodes.get(predecessor, {})

            # Redundancy through backup or secondary operational supply
            if rel_type in (RelationshipType.BACKED_UP_BY.value, RelationshipType.SUPPLIES_POWER_TO.value):
                if pred_node.get("operational_status") == OperationalStatus.OPERATIONAL.value:
                    return True

        return False

    def export_graph_dto(self) -> CampusGraphExport:
        """Exports the graph in a format ready for API serialization."""
        nodes = []
        for n_id, data in self._graph.nodes(data=True):
            nodes.append(
                GraphNodeInfo(
                    id=n_id,
                    label=data.get("name", n_id),
                    type=EntityType(data.get("entity_type", EntityType.ROOM.value)),
                    criticality=CriticalityLevel(data.get("criticality", CriticalityLevel.MEDIUM.value)),
                    status=OperationalStatus(data.get("operational_status", OperationalStatus.OPERATIONAL.value)),
                    parent_id=data.get("parent_entity_id"),
                    metadata=data.get("metadata", {}),
                )
            )

        edges = []
        for u, v, data in self._graph.edges(data=True):
            edges.append(
                GraphEdgeInfo(
                    id=data.get("relationship_id", f"{u}->{v}"),
                    source=u,
                    target=v,
                    type=RelationshipType(data.get("relationship_type", RelationshipType.CONTAINS.value)),
                    is_essential=data.get("is_essential", True),
                    redundancy_available=data.get("redundancy_available", False),
                    dependency_strength=data.get("dependency_strength", 1.0),
                    propagation_policy=data.get("propagation_policy", "DEFAULT"),
                )
            )

        return CampusGraphExport(
            nodes=nodes,
            edges=edges,
            total_nodes=len(nodes),
            total_edges=len(edges),
        )


# Global singleton instance
graph_repository = GraphRepository()
