"""
Engine 3: Risk and Criticality Analysis.
Implements an explainable Failure Mode and Effects Analysis (FMEA) framework,
calculating Risk Priority Numbers (RPN = S * O * D) normalized to 0-100,
weighted by infrastructure criticality and blast radius size.
"""
from datetime import datetime
from typing import Optional, List
from backend.schemas.common import CriticalityLevel, ProvenanceSourceType, ImpactState
from backend.schemas.engines import RiskAssessmentResult, RiskFactor, ImpactAnalysisResult
from backend.graph.repository import graph_repository, GraphRepository


class RiskAndCriticalityEngine:
    """
    Explainable FMEA risk scoring engine.
    Scale definitions:
      Severity (1-10): Infrastructure tier and operational disruption extent.
      Occurrence (1-10): Frequency/likelihood based on equipment category and historical rate.
      Detectability (1-10): Speed and clarity of sensor telemetry (1=direct real-time sensor, 10=latent silent fault).
      Raw RPN: S * O * D (range 1 - 1000).
      Normalized Risk Score: RPN / 10.0 (range 0.1 - 100.0).
    """

    def __init__(self, repo: Optional[GraphRepository] = None):
        self.repo = repo or graph_repository

    def assess_risk(
        self,
        incident_id: str,
        root_entity_id: str,
        impact_result: ImpactAnalysisResult,
        provenance_source: ProvenanceSourceType = ProvenanceSourceType.REAL,
    ) -> RiskAssessmentResult:
        factors: List[RiskFactor] = []
        node_data = self.repo.get_node(root_entity_id) or {}
        criticality_str = node_data.get("criticality", CriticalityLevel.MEDIUM.value)

        # 1. Severity Score (1.0 to 10.0)
        base_severity_map = {
            CriticalityLevel.MISSION_CRITICAL.value: 8.5,
            CriticalityLevel.HIGH.value: 7.0,
            CriticalityLevel.MEDIUM.value: 5.0,
            CriticalityLevel.LOW.value: 3.0,
        }
        severity = base_severity_map.get(criticality_str, 5.0)

        # Escalate severity based on blast radius (total affected downstream entities)
        blast_radius = impact_result.total_affected
        disrupted_count = sum(1 for e in impact_result.affected_entities if e.resulting_impact_state == ImpactState.DISRUPTED)
        
        severity_adjustment = min(disrupted_count * 0.4, 1.5)
        severity = min(round(severity + severity_adjustment, 1), 10.0)

        factors.append(
            RiskFactor(
                name="Infrastructure Criticality & Blast Radius",
                score=severity,
                description=f"Asset criticality is {criticality_str}; blast radius encompasses {blast_radius} downstream entities ({disrupted_count} directly disrupted).",
            )
        )

        # 2. Occurrence Score (1.0 to 10.0)
        entity_type = node_data.get("entity_type", "UNKNOWN")
        # Electrical feeders, transformers, and switches have moderate operational trip frequencies
        occurrence_map = {
            "FEEDER": 4.5,
            "DISTRIBUTION_PANEL": 3.5,
            "SUBSTATION": 2.0,
            "SWITCH_IDF": 4.0,
            "SWITCH_MDF": 2.5,
            "WORKSTATION": 5.0,
        }
        occurrence = occurrence_map.get(entity_type, 4.0)
        factors.append(
            RiskFactor(
                name="Equipment Failure Likelihood",
                score=occurrence,
                description=f"Typical operational MTBF and failure probability for {entity_type} assets.",
            )
        )

        # 3. Detectability Score (1.0 to 10.0)
        # 1 = immediate high-precision hardware telemetry, 10 = latent or unmonitored
        detectability_map = {
            ProvenanceSourceType.REAL: 2.0,       # High-frequency Modbus / IoT meter
            ProvenanceSourceType.SYNTHETIC: 3.0,  # Controlled benchmark scenario
            ProvenanceSourceType.ESTIMATED: 5.5,  # Kalman / state estimator
            ProvenanceSourceType.REPORTED: 7.5,   # Human report requires manual triage
        }
        detectability = detectability_map.get(provenance_source, 4.0)
        factors.append(
            RiskFactor(
                name="Fault Detectability & Provenance",
                score=detectability,
                description=f"Fault signal origin: {provenance_source.value}. Direct hardware sensors offer rapid automated detection.",
            )
        )

        # 4. RPN Calculation & Normalization
        rpn = round(severity * occurrence * detectability, 1)
        normalized_score = round(rpn / 10.0, 1)  # 0.1 to 100.0

        # Category mapping
        if normalized_score >= 70.0:
            category = CriticalityLevel.MISSION_CRITICAL
        elif normalized_score >= 45.0:
            category = CriticalityLevel.HIGH
        elif normalized_score >= 20.0:
            category = CriticalityLevel.MEDIUM
        else:
            category = CriticalityLevel.LOW

        explanation = (
            f"FMEA RPN calculated at {rpn}/1000 (Normalized Risk Score: {normalized_score}/100, Tier: {category.value}). "
            f"Severity={severity} ({criticality_str} asset with {disrupted_count} disrupted entities), "
            f"Occurrence={occurrence} ({entity_type} hardware class), "
            f"Detectability={detectability} ({provenance_source.value} telemetry stream)."
        )

        return RiskAssessmentResult(
            incident_id=incident_id,
            entity_id=root_entity_id,
            severity_score=severity,
            occurrence_score=occurrence,
            detectability_score=detectability,
            rpn=rpn,
            normalized_risk_score=normalized_score,
            criticality_category=category,
            contributing_factors=factors,
            explanation=explanation,
            assessed_at=datetime.utcnow(),
        )


risk_engine = RiskAndCriticalityEngine()
