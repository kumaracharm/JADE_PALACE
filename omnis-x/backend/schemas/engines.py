"""
Inter-Engine Data Contracts for OMNIS-X Specialist Intelligence Engines.
Strictly typed data exchange schemas ensuring deterministic reproducibility.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from backend.schemas.common import (
    ImpactState,
    CriticalityLevel,
    OptimizationOutcome,
    ProvenanceSourceType,
    RoleEnum,
)


# Engine 1 Contract
class DetectionEvidence(BaseModel):
    metric_name: str
    observed_value: float
    expected_value: Optional[float] = None
    threshold: Optional[float] = None
    deviation: Optional[float] = None
    detection_method: str = Field(..., description="e.g. THRESHOLD, EWMA, DEDUPLICATION")


class DetectionResult(BaseModel):
    event_id: str
    entity_id: str
    is_anomaly: bool
    anomaly_type: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    provenance_source: ProvenanceSourceType
    evidence: List[DetectionEvidence] = Field(default_factory=list)
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    is_duplicate: bool = False
    validation_passed: bool = True
    validation_error: Optional[str] = None


# Engine 2 Contract
class AffectedEntity(BaseModel):
    originating_incident_id: str
    source_entity_id: str
    affected_entity_id: str
    relationship_path: List[str]
    propagation_reason: str
    dependency_type: str
    redundancy_evaluation: str
    resulting_impact_state: ImpactState
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


class ImpactAnalysisResult(BaseModel):
    incident_id: str
    root_entity_id: str
    affected_entities: List[AffectedEntity] = Field(default_factory=list)
    impact_depth: int = 0
    total_affected: int = 0
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)


# Engine 3 Contract
class RiskFactor(BaseModel):
    name: str
    score: float = Field(..., description="Normalized score 1-10 or raw metric")
    description: str


class RiskAssessmentResult(BaseModel):
    incident_id: str
    entity_id: str
    severity_score: float = Field(..., ge=1.0, le=10.0, description="1 (negligible) to 10 (catastrophic)")
    occurrence_score: float = Field(..., ge=1.0, le=10.0, description="1 (extremely rare) to 10 (frequent)")
    detectability_score: float = Field(..., ge=1.0, le=10.0, description="1 (immediate detection) to 10 (hidden)")
    rpn: float = Field(..., description="Raw RPN = S * O * D (range 1-1000)")
    normalized_risk_score: float = Field(..., ge=0.0, le=100.0, description="Normalized 0-100 scale")
    criticality_category: CriticalityLevel
    contributing_factors: List[RiskFactor] = Field(default_factory=list)
    explanation: str
    assessed_at: datetime = Field(default_factory=datetime.utcnow)


# Engine 4 Contract
class DisruptedActivity(BaseModel):
    activity_id: str
    course_code: str
    activity_name: str
    faculty_id: str
    faculty_name: str
    room_id: str
    room_name: str
    student_section: str
    enrolled_count: int
    time_slot: str
    disruption_reason: str
    required_equipment: List[str] = Field(default_factory=list)


class AlternativeRoomOption(BaseModel):
    room_id: str
    room_name: str
    capacity: int
    equipment_available: List[str]
    suitability_score: float


class AcademicImpactResult(BaseModel):
    incident_id: str
    disrupted_activities: List[DisruptedActivity] = Field(default_factory=list)
    total_displaced_students: int = 0
    total_displaced_hours: float = 0.0
    alternative_rooms_available: Dict[str, List[AlternativeRoomOption]] = Field(default_factory=dict)
    summary: str


# Engine 5 Contract
class RecoveryStep(BaseModel):
    step_number: int
    action: str
    target_entity_id: str
    description: str
    estimated_duration_minutes: int


class RecoveryAlternative(BaseModel):
    alternative_id: str
    title: str
    description: str
    recovery_time_minutes: int
    estimated_cost_usd: float
    disruption_penalty: float
    residual_risk_score: float
    composite_rank_score: float
    steps: List[RecoveryStep] = Field(default_factory=list)
    reallocations: Dict[str, str] = Field(default_factory=dict, description="activity_id -> new_room_id")
    feasible: bool = True
    infeasibility_reasons: List[str] = Field(default_factory=list)


class RecoveryOptimizationResult(BaseModel):
    incident_id: str
    solver_outcome: OptimizationOutcome
    solver_status_detail: str
    alternatives: List[RecoveryAlternative] = Field(default_factory=list)
    recommended_alternative_id: Optional[str] = None
    objective_value: Optional[float] = None
    constraint_violations: List[str] = Field(default_factory=list)
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)


# Engine 6 Contract
class AssigneeCandidate(BaseModel):
    staff_id: str
    name: str
    role: RoleEnum
    department: str
    matched_skills: List[str]
    current_active_tasks: int
    suitability_score: float
    is_available: bool = True


class AssignmentRecommendation(BaseModel):
    incident_id: str
    responsible_department: str
    primary_assignee: Optional[AssigneeCandidate] = None
    backup_assignee: Optional[AssigneeCandidate] = None
    candidate_ranking: List[AssigneeCandidate] = Field(default_factory=list)
    routing_reason: str
    sla_target_minutes: int = 60


# Engine 7 Contract (Consolidated Decision Plan)
class RequiredApproval(BaseModel):
    role_required: RoleEnum
    approval_type: str
    reason: str
    threshold_triggered: str


class IncidentDecisionPlan(BaseModel):
    plan_id: str
    incident_id: str
    root_entity_id: str
    incident_title: str
    detection_summary: DetectionResult
    impact_analysis: ImpactAnalysisResult
    risk_assessment: RiskAssessmentResult
    academic_impact: AcademicImpactResult
    recovery_optimization: RecoveryOptimizationResult
    assignment: AssignmentRecommendation
    recommended_alternative: Optional[RecoveryAlternative] = None
    required_approvals: List[RequiredApproval] = Field(default_factory=list)
    outstanding_information: List[str] = Field(default_factory=list)
    evidence_confidence_notes: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)
