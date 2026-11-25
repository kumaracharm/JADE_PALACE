"""
Campus Health Overview and Audit Log API Endpoints.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models.entity import EntityModel, OperationalStateModel
from backend.models.incident import IncidentModel, IncidentEntityModel, WorkOrderModel
from backend.models.user import AuditLogModel
from backend.schemas.user import AuditLogRead
from backend.schemas.common import OperationalStatus, IncidentStatus, WorkOrderStatus
from backend.security.auth import get_current_user, require_roles
from backend.models.user import UserModel
from backend.schemas.common import RoleEnum

from backend.graph.repository import graph_repository
import networkx as nx

router = APIRouter(tags=["Analytics & Governance"])


@router.get("/analytics/overview")
def get_campus_health_overview(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Aggregates executive institutional health indices, active incidents,
    critical infrastructure status, and active work orders.
    """
    total_entities = db.query(EntityModel).count()
    operational_entities = db.query(EntityModel).filter(
        EntityModel.operational_status == OperationalStatus.OPERATIONAL.value
    ).count()
    unavailable_entities = db.query(EntityModel).filter(
        EntityModel.operational_status == OperationalStatus.UNAVAILABLE.value
    ).count()
    degraded_entities = db.query(EntityModel).filter(
        EntityModel.operational_status == OperationalStatus.DEGRADED.value
    ).count()

    campus_health_index = round((operational_entities / total_entities * 100.0), 2) if total_entities > 0 else 100.0

    active_incidents = db.query(IncidentModel).filter(
        IncidentModel.status.notin_([
            IncidentStatus.CLOSED.value,
            IncidentStatus.RESOLVED.value,
            IncidentStatus.REJECTED.value,
            IncidentStatus.DUPLICATE.value,
        ])
    ).count()

    pending_approvals = db.query(IncidentModel).filter(
        IncidentModel.status == IncidentStatus.AWAITING_APPROVAL.value
    ).count()

    active_work_orders = db.query(WorkOrderModel).filter(
        WorkOrderModel.status.in_([
            WorkOrderStatus.CREATED.value,
            WorkOrderStatus.ASSIGNED.value,
            WorkOrderStatus.IN_PROGRESS.value,
        ])
    ).count()

    return {
        "campus_health_index": campus_health_index,
        "total_twin_entities": total_entities,
        "operational_entities": operational_entities,
        "unavailable_entities": unavailable_entities,
        "degraded_entities": degraded_entities,
        "active_incidents": active_incidents,
        "pending_human_approvals": pending_approvals,
        "active_work_orders": active_work_orders,
        "system_status": "NORMAL" if unavailable_entities == 0 else "RESILIENCE_ALERT",
    }


@router.get("/audit", response_model=List[AuditLogRead])
def get_audit_trail(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(
        require_roles([RoleEnum.PRINCIPAL, RoleEnum.FACILITY_MANAGER, RoleEnum.IT_ADMIN])
    ),
):
    """Immutable audit trail for institutional governance and compliance inspection."""
    return db.query(AuditLogModel).order_by(AuditLogModel.timestamp.desc()).limit(limit).all()


@router.get("/analytics/resilience-index")
def get_institutional_resilience_index(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Calculates transparent 0-100 Institutional Resilience Index.
    Evaluates:
    - Infrastructure Health (20%)
    - IT & Cyber Availability (15%)
    - Academic Continuity (20%)
    - Critical Asset Availability (15%)
    - Dependency Redundancy (15%)
    - Recovery Readiness (15%)
    """
    total_ents = db.query(EntityModel).count()
    op_ents = db.query(EntityModel).filter(
        EntityModel.operational_status == OperationalStatus.OPERATIONAL.value
    ).count()

    # 1. Infrastructure Health
    infra_ents = db.query(EntityModel).filter(
        EntityModel.entity_type.in_(["SUBSTATION", "GENERATOR", "DISTRIBUTION_PANEL", "FEEDER", "UPS"])
    ).all()
    infra_op = sum(1 for e in infra_ents if e.operational_status == OperationalStatus.OPERATIONAL.value)
    infra_score = round((infra_op / len(infra_ents) * 100.0) if infra_ents else 100.0, 1)

    # 2. IT & Cyber Availability
    it_ents = db.query(EntityModel).filter(
        EntityModel.entity_type.in_(["DATA_CENTRE", "NETWORK_SWITCH", "GPU_CLUSTER"])
    ).all()
    it_op = sum(1 for e in it_ents if e.operational_status == OperationalStatus.OPERATIONAL.value)
    it_score = round((it_op / len(it_ents) * 100.0) if it_ents else 100.0, 1)

    # 3. Academic Continuity
    acad_ents = db.query(EntityModel).filter(
        EntityModel.entity_type.in_(["CLASSROOM", "LECTURE_HALL", "LABORATORY"])
    ).all()
    acad_op = sum(1 for e in acad_ents if e.operational_status == OperationalStatus.OPERATIONAL.value)
    acad_score = round((acad_op / len(acad_ents) * 100.0) if acad_ents else 100.0, 1)

    # 4. Critical Asset Availability
    crit_ents = db.query(EntityModel).filter(
        EntityModel.criticality.in_(["CRITICAL", "MISSION_CRITICAL", "HIGH"])
    ).all()
    crit_op = sum(1 for e in crit_ents if e.operational_status == OperationalStatus.OPERATIONAL.value)
    crit_score = round((crit_op / len(crit_ents) * 100.0) if crit_ents else 100.0, 1)

    # 5. Dependency Redundancy
    graph = graph_repository.graph
    redundant_count = 0
    total_evaluated_edges = 0
    for node in graph.nodes:
        preds = list(graph.predecessors(node))
        if preds and any(graph_repository.check_redundancy(node, p) for p in preds):
            redundant_count += 1
        total_evaluated_edges += 1
    redundancy_score = round((redundant_count / total_evaluated_edges * 100.0) if total_evaluated_edges else 85.0, 1)

    # 6. Recovery Readiness
    open_wos = db.query(WorkOrderModel).filter(
        WorkOrderModel.status.in_([WorkOrderStatus.CREATED.value, WorkOrderStatus.ASSIGNED.value])
    ).count()
    recovery_score = max(50.0, round(100.0 - (open_wos * 8.0), 1))

    # Composite Score calculation
    composite_score = round(
        infra_score * 0.20 +
        it_score * 0.15 +
        acad_score * 0.20 +
        crit_score * 0.15 +
        redundancy_score * 0.15 +
        recovery_score * 0.15,
        1
    )

    # Active incidents penalty
    active_incidents = db.query(IncidentModel).filter(
        IncidentModel.status.notin_([
            IncidentStatus.RESOLVED.value,
            IncidentStatus.CLOSED.value,
            IncidentStatus.REJECTED.value,
            IncidentStatus.DUPLICATE.value
        ])
    ).all()
    incident_penalty = sum(8.0 if inc.severity == "CRITICAL" else 4.0 for inc in active_incidents)
    final_score = max(10.0, min(100.0, round(composite_score - incident_penalty, 1)))

    negative_contributors = []
    if infra_score < 90:
        negative_contributors.append({"dimension": "Infrastructure", "impact": -10, "reason": "Electrical feeders or panels degraded/unavailable"})
    if it_score < 90:
        negative_contributors.append({"dimension": "Cyber/IT", "impact": -8, "reason": "Core networking switch experiencing latency or outage"})
    if active_incidents:
        negative_contributors.append({"dimension": "Incident Burden", "impact": -round(incident_penalty, 1), "reason": f"{len(active_incidents)} active incident(s) undergoing investigation"})
    if not negative_contributors:
        negative_contributors.append({"dimension": "None", "impact": 0, "reason": "All institutional infrastructure and academic sectors operating nominal"})

    trend_points = [
        {"timestamp": "06:00", "score": 97.5},
        {"timestamp": "09:00", "score": 96.0},
        {"timestamp": "12:00", "score": 94.8},
        {"timestamp": "15:00", "score": 95.2},
        {"timestamp": "18:00", "score": 94.0},
        {"timestamp": "21:00", "score": final_score},
    ]

    return {
        "overall_resilience_score": final_score,
        "rating": "EXCELLENT" if final_score >= 90 else "GOOD" if final_score >= 75 else "DEGRADED" if final_score >= 60 else "CRITICAL",
        "provenance": "SYNTHETIC DEMONSTRATION BASELINE",
        "scoring_method": "Multi-Criteria Weighted Institutional Reliability Matrix (WIRM-8)",
        "domains": {
            "infrastructure_health": {"score": infra_score, "weight": 0.20},
            "it_availability": {"score": it_score, "weight": 0.15},
            "academic_continuity": {"score": acad_score, "weight": 0.20},
            "critical_asset_availability": {"score": crit_score, "weight": 0.15},
            "dependency_redundancy": {"score": redundancy_score, "weight": 0.15},
            "recovery_readiness": {"score": recovery_score, "weight": 0.15},
        },
        "negative_contributors": negative_contributors,
        "trend_24h": trend_points,
    }


@router.get("/analytics/spof")
def get_single_points_of_failure(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Single Point of Failure (SPOF) Graph Discovery.
    Evaluates in-memory NetworkX directed graph for articulation points,
    bridges, and high-centrality nodes lacking active redundancy.
    """
    graph = graph_repository.graph
    undirected = graph.to_undirected()
    
    # 1. NetworkX articulation points (nodes that if removed increase connected components)
    raw_articulation = list(nx.articulation_points(undirected)) if nx.is_connected(undirected) else []

    # 2. Centrality metrics
    in_deg = dict(graph.in_degree())
    out_deg = dict(graph.out_degree())
    
    spof_candidates = []
    for node_id in graph.nodes:
        node_data = graph.nodes[node_id]
        successors = list(graph.successors(node_id))
        has_redundancy = (len(successors) > 0 and all(graph_repository.check_redundancy(succ, node_id) for succ in successors))
        downstream_count = len(list(nx.descendants(graph, node_id)))
        
        # Risk score calculation based on downstream blast radius and redundancy
        is_art = node_id in raw_articulation
        risk_level = "CRITICAL" if (is_art and not has_redundancy and downstream_count > 3) else "HIGH" if (downstream_count > 2 and not has_redundancy) else "MODERATE"
        
        if is_art or downstream_count >= 2:
            spof_candidates.append({
                "entity_id": node_id,
                "name": node_data.get("name", node_id),
                "entity_type": node_data.get("entity_type", "UNKNOWN"),
                "criticality": node_data.get("criticality", "STANDARD"),
                "is_articulation_point": is_art,
                "has_active_redundancy": has_redundancy,
                "downstream_dependent_count": downstream_count,
                "downstream_entities": list(nx.descendants(graph, node_id))[:6],
                "spof_risk_level": risk_level,
                "recommended_mitigation": "Install dual-feed automatic transfer switch (ATS)" if "FEEDER" in node_id or "SUBSTATION" in node_id else "Configure redundant spine switch trunking"
            })

    # Sort by downstream dependent count descending
    spof_candidates.sort(key=lambda x: (x["spof_risk_level"] == "CRITICAL", x["downstream_dependent_count"]), reverse=True)

    return {
        "total_graph_nodes": len(graph.nodes),
        "total_graph_edges": len(graph.edges),
        "total_spofs_detected": len(spof_candidates),
        "high_risk_spofs": [s for s in spof_candidates if s["spof_risk_level"] in ["CRITICAL", "HIGH"]],
        "all_candidates": spof_candidates,
    }

