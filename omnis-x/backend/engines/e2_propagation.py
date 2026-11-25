"""
Engine 2: Graph Impact Propagation.
Performs directed dependency cascade traversal from failed or degraded root entities,
applying relationship-specific propagation rules, redundancy bypass verification,
and impact classification without conflating spatial containment with functional dependency.
"""
from datetime import datetime
from typing import List, Dict, Set, Optional
from backend.graph.repository import graph_repository, GraphRepository
from backend.graph.rules import PropagationRules
from backend.schemas.common import ImpactState, OperationalStatus, RelationshipType
from backend.schemas.engines import ImpactAnalysisResult, AffectedEntity


class GraphImpactPropagationEngine:
    """
    Deterministic cascade impact traversal engine.
    """

    def __init__(self, repo: Optional[GraphRepository] = None):
        self.repo = repo or graph_repository

    def analyze_impact(
        self,
        incident_id: str,
        root_entity_id: str,
        initial_status: OperationalStatus = OperationalStatus.UNAVAILABLE,
        max_depth: int = 10,
    ) -> ImpactAnalysisResult:
        """
        Traces downstream blast radius across directed dependency edges.
        """
        graph = self.repo.graph
        if root_entity_id not in graph:
            return ImpactAnalysisResult(
                incident_id=incident_id,
                root_entity_id=root_entity_id,
                affected_entities=[],
                impact_depth=0,
                total_affected=0,
            )

        root_node_data = graph.nodes[root_entity_id]
        affected_map: Dict[str, AffectedEntity] = {}

        # Track impact states assigned during traversal
        node_impact_states: Dict[str, ImpactState] = {
            root_entity_id: ImpactState.DISRUPTED
        }

        # Queue holds: (curr_entity_id, depth, path_so_far)
        queue = [(root_entity_id, 0, [root_entity_id])]
        visited_edges: Set[str] = set()
        max_reached_depth = 0

        while queue:
            curr_id, depth, path = queue.pop(0)
            max_reached_depth = max(max_reached_depth, depth)
            if depth >= max_depth:
                continue

            curr_impact = node_impact_states.get(curr_id, ImpactState.DISRUPTED)
            curr_node = graph.nodes.get(curr_id, {})
            curr_op_status = OperationalStatus(curr_node.get("operational_status", OperationalStatus.OPERATIONAL.value))

            # Traverse outgoing edges
            for successor_id in graph.successors(curr_id):
                edge_id = f"{curr_id}->{successor_id}"
                if edge_id in visited_edges:
                    continue
                visited_edges.add(edge_id)

                edge_data = graph.get_edge_data(curr_id, successor_id)
                succ_node = graph.nodes.get(successor_id, {})
                succ_op_status = OperationalStatus(succ_node.get("operational_status", OperationalStatus.OPERATIONAL.value))

                # Check if successor has active redundancy alternative
                has_redundancy = self.repo.check_redundancy(successor_id, failed_source_id=curr_id)

                # Evaluate rule-based propagation
                should_propagate, impact_state, reason, red_eval = PropagationRules.evaluate_edge_propagation(
                    source_id=curr_id,
                    target_id=successor_id,
                    edge_data=edge_data,
                    source_impact_state=curr_impact,
                    source_operational_status=curr_op_status,
                    target_operational_status=succ_op_status,
                    has_active_redundancy=has_redundancy,
                )

                if should_propagate:
                    new_path = path + [successor_id]
                    node_impact_states[successor_id] = impact_state

                    affected_entity = AffectedEntity(
                        originating_incident_id=incident_id,
                        source_entity_id=curr_id,
                        affected_entity_id=successor_id,
                        relationship_path=new_path,
                        propagation_reason=reason,
                        dependency_type=edge_data.get("relationship_type", "UNKNOWN"),
                        redundancy_evaluation=red_eval,
                        resulting_impact_state=impact_state,
                        confidence=edge_data.get("dependency_strength", 1.0),
                    )

                    # Keep worst-case impact if reached through multiple paths
                    if successor_id in affected_map:
                        prev = affected_map[successor_id]
                        if impact_state == ImpactState.DISRUPTED and prev.resulting_impact_state != ImpactState.DISRUPTED:
                            affected_map[successor_id] = affected_entity
                    else:
                        affected_map[successor_id] = affected_entity

                    # Continue cascade if disrupted or affected
                    if impact_state in (ImpactState.DISRUPTED, ImpactState.AFFECTED):
                        queue.append((successor_id, depth + 1, new_path))

        affected_list = list(affected_map.values())
        return ImpactAnalysisResult(
            incident_id=incident_id,
            root_entity_id=root_entity_id,
            affected_entities=affected_list,
            impact_depth=max_reached_depth,
            total_affected=len(affected_list),
            analyzed_at=datetime.utcnow(),
        )


propagation_engine = GraphImpactPropagationEngine()
