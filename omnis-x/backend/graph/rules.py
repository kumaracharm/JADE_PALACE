"""
OMNIS-X Graph Propagation Rules.
Defines explicit causal propagation semantics per relationship type,
distinguishing physical failure propagation from spatial containment and administrative links.
"""
from typing import Tuple, Optional, Dict, Any, List
from backend.schemas.common import RelationshipType, ImpactState, OperationalStatus


class PropagationRules:
    """
    Deterministic rule evaluator for graph edge traversal during incident cascade analysis.
    """

    # Edges that actively propagate operational failure
    FAILURE_PROPAGATING_TYPES = {
        RelationshipType.SUPPLIES_POWER_TO.value,
        RelationshipType.CONNECTED_TO_NETWORK.value,
        RelationshipType.USES_EQUIPMENT.value,
        RelationshipType.ASSIGNED_TO_ROOM.value,
    }

    # Edges that represent structural or organizational context and MUST NOT propagate failure
    NON_PROPAGATING_TYPES = {
        RelationshipType.LOCATED_IN.value,
        RelationshipType.CONTAINS.value,
        RelationshipType.TAUGHT_BY.value,
        RelationshipType.ATTENDED_BY.value,
        RelationshipType.MAINTAINED_BY.value,
    }

    # Redundancy indicator
    REDUNDANCY_TYPES = {
        RelationshipType.BACKED_UP_BY.value,
    }

    @classmethod
    def evaluate_edge_propagation(
        cls,
        source_id: str,
        target_id: str,
        edge_data: Dict[str, Any],
        source_impact_state: ImpactState,
        source_operational_status: OperationalStatus,
        target_operational_status: OperationalStatus,
        has_active_redundancy: bool = False,
    ) -> Tuple[bool, ImpactState, str, str]:
        """
        Evaluates whether a failure at source propagates across the edge to target.

        Returns:
            (should_propagate, resulting_impact, reason, redundancy_evaluation)
        """
        rel_type = edge_data.get("relationship_type")
        is_essential = edge_data.get("is_essential", True)
        dependency_strength = edge_data.get("dependency_strength", 1.0)
        propagation_policy = edge_data.get("propagation_policy", "DEFAULT")

        # 1. Non-propagating edges (e.g. LOCATED_IN, CONTAINS)
        if rel_type in cls.NON_PROPAGATING_TYPES or propagation_policy == "NONE":
            return (
                False,
                ImpactState.UNAFFECTED,
                f"Relationship '{rel_type}' is spatial or organizational context and does not propagate failure.",
                "N/A",
            )

        # 2. Source is unaffected or normal
        if source_impact_state in (ImpactState.UNAFFECTED, ImpactState.UNDETERMINED) and source_operational_status == OperationalStatus.OPERATIONAL:
            return (
                False,
                ImpactState.UNAFFECTED,
                "Source entity is operational.",
                "Normal",
            )

        # 3. Check redundancy
        if has_active_redundancy:
            return (
                True,
                ImpactState.AT_RISK,
                f"Active redundancy available for {target_id}. Running on backup route; resilience reduced.",
                "Redundancy Verified - Primary Failed, Failover Active",
            )

        # 4. Check essentiality
        if not is_essential:
            return (
                True,
                ImpactState.AFFECTED,
                f"Non-essential dependency '{rel_type}' failed; target experiencing degraded functionality.",
                "Non-essential Dependency",
            )

        # 5. Essential failure propagation based on relationship type
        if rel_type == RelationshipType.SUPPLIES_POWER_TO.value:
            return (
                True,
                ImpactState.DISRUPTED,
                f"Electrical power loss from upstream source {source_id}.",
                "No Redundant Power Source Available",
            )
        elif rel_type == RelationshipType.CONNECTED_TO_NETWORK.value:
            return (
                True,
                ImpactState.DISRUPTED,
                f"Network uplink failure through upstream switch {source_id}.",
                "Single Uplink, No Secondary Route",
            )
        elif rel_type == RelationshipType.USES_EQUIPMENT.value:
            return (
                True,
                ImpactState.DISRUPTED,
                f"Required laboratory/classroom equipment {source_id} is unavailable.",
                "Required Equipment Critical to Activity",
            )
        elif rel_type == RelationshipType.ASSIGNED_TO_ROOM.value:
            return (
                True,
                ImpactState.DISRUPTED,
                f"Assigned room {source_id} is unavailable or disrupted.",
                "Spatial Facility Disrupted",
            )
        else:
            return (
                False,
                ImpactState.UNDETERMINED,
                f"Unclassified propagation rule for relationship type '{rel_type}'.",
                "Indeterminate",
            )
