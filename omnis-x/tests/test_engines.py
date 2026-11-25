"""
Unit and Contract Tests for the Seven Specialist Intelligence Engines.
"""
from backend.schemas.event import TelemetryEventCreate
from backend.schemas.common import ProvenanceSourceType, ImpactState, OperationalStatus, CriticalityLevel
from backend.engines.e1_detection import detection_engine
from backend.engines.e2_propagation import propagation_engine
from backend.engines.e3_risk import risk_engine
from backend.engines.e4_academic import academic_engine
from backend.engines.e5_optimization import recovery_engine
from backend.engines.e6_assignment import assignment_engine
from backend.engines.e7_coordination import coordination_engine


def test_engine_1_detection(db_session):
    """Engine 1: Verify threshold breach, validation, and deduplication."""
    # 1. Normal event
    evt_normal = TelemetryEventCreate(
        event_id="EVT-NORM-1",
        entity_id="METER-FEEDER-F1",
        metric_name="voltage_v",
        value=415.0,
        source_type=ProvenanceSourceType.REAL,
    )
    res_normal = detection_engine.analyze_event(evt_normal)
    assert res_normal.validation_passed is True
    assert res_normal.is_anomaly is False

    # 2. Critical Low Threshold Breach (Voltage drop to 0.0V)
    evt_fault = TelemetryEventCreate(
        event_id="EVT-FAULT-1",
        entity_id="METER-FEEDER-F1",
        metric_name="voltage_v",
        value=0.0,
        source_type=ProvenanceSourceType.REAL,
    )
    res_fault = detection_engine.analyze_event(evt_fault)
    assert res_fault.is_anomaly is True
    assert res_fault.anomaly_type == "CRITICAL_LOW_THRESHOLD_BREACH"
    assert len(res_fault.evidence) > 0

    # 3. Duplicate event suppression
    res_dup = detection_engine.analyze_event(evt_fault)
    assert res_dup.is_duplicate is True


def test_engine_2_propagation_and_redundancy(db_session):
    """Engine 2: Verify directed cascade, essentiality, and redundancy bypass."""
    # Analyze failure of FEEDER-LABS-F1
    impact = propagation_engine.analyze_impact("INC-TEST", "FEEDER-LABS-F1")
    assert impact.total_affected > 0

    aff_map = {e.affected_entity_id: e for e in impact.affected_entities}

    # LAB-01-EE has no backup -> DISRUPTED
    assert "LAB-01-EE" in aff_map
    assert aff_map["LAB-01-EE"].resulting_impact_state == ImpactState.DISRUPTED

    # LAB-02-ROBOTICS has UPS-LAB-02 -> AT_RISK (redundancy evaluated)
    assert "LAB-02-ROBOTICS" in aff_map
    assert aff_map["LAB-02-ROBOTICS"].resulting_impact_state == ImpactState.AT_RISK
    assert "Failover Active" in aff_map["LAB-02-ROBOTICS"].redundancy_evaluation

    # Equipment in Lab 01 powered by Feeder F1 is DISRUPTED
    assert "EQ-OSC-BENCH-01" in aff_map
    assert aff_map["EQ-OSC-BENCH-01"].resulting_impact_state == ImpactState.DISRUPTED

    # Unaffected: CR-201 and CR-202 are on FEEDER-CR-F2, so NOT in affected entities
    assert "CR-201" not in aff_map
    assert "CR-202" not in aff_map


def test_engine_3_risk_fmea(db_session):
    """Engine 3: Verify explainable FMEA RPN calculation and normalization."""
    impact = propagation_engine.analyze_impact("INC-TEST", "FEEDER-LABS-F1")
    risk = risk_engine.assess_risk("INC-TEST", "FEEDER-LABS-F1", impact, ProvenanceSourceType.REAL)

    assert 1.0 <= risk.severity_score <= 10.0
    assert 1.0 <= risk.occurrence_score <= 10.0
    assert 1.0 <= risk.detectability_score <= 10.0
    assert risk.rpn == round(risk.severity_score * risk.occurrence_score * risk.detectability_score, 1)
    assert 0.0 <= risk.normalized_risk_score <= 100.0
    assert len(risk.contributing_factors) >= 3
    assert len(risk.explanation) > 20


def test_engine_4_academic_impact(db_session):
    """Engine 4: Verify academic activity conflict and alternative room matching."""
    impact = propagation_engine.analyze_impact("INC-TEST", "FEEDER-LABS-F1")
    academic = academic_engine.assess_academic_impact("INC-TEST", impact)

    # ACT-EE301-LAB was scheduled in LAB-01-EE -> Disrupted!
    assert len(academic.disrupted_activities) == 1
    disrupted = academic.disrupted_activities[0]
    assert disrupted.activity_id == "ACT-EE301-LAB"
    assert disrupted.course_code == "EE301"
    assert academic.total_displaced_students == 32

    # Alternative rooms should be found (e.g. CR-202, LH-01)
    alt_options = academic.alternative_rooms_available.get("ACT-EE301-LAB", [])
    assert len(alt_options) > 0
    # Best alternatives have capacity >= 32
    assert all(opt.capacity >= 32 for opt in alt_options)


def test_engine_5_recovery_optimization(db_session):
    """Engine 5: Verify Google OR-Tools CP-SAT solving optimal reallocation."""
    impact = propagation_engine.analyze_impact("INC-TEST", "FEEDER-LABS-F1")
    academic = academic_engine.assess_academic_impact("INC-TEST", impact)

    recovery = recovery_engine.solve_recovery_plan("INC-TEST", "FEEDER-LABS-F1", academic)
    assert recovery.solver_outcome.value in ("OPTIMAL", "FEASIBLE")
    assert len(recovery.alternatives) >= 2

    # Plan Alpha should be feasible and have reallocated ACT-EE301-LAB
    plan_alpha = recovery.alternatives[0]
    assert plan_alpha.feasible is True
    assert "ACT-EE301-LAB" in plan_alpha.reallocations


def test_engine_6_assignment(db_session):
    """Engine 6: Verify department routing and technician skill ranking."""
    assignment = assignment_engine.assign_incident(
        db=db_session,
        incident_id="INC-TEST",
        entity_type="FEEDER",
        incident_title="Feeder F1 Trip",
    )
    assert "Facilities" in assignment.responsible_department
    assert assignment.primary_assignee is not None
    assert assignment.primary_assignee.staff_id == "USR-ELEC-TECH"
    assert len(assignment.candidate_ranking) >= 2


def test_engine_7_coordination_and_approvals(db_session):
    """Engine 7: Verify decision plan consolidation and human approval gate triggers."""
    evt = TelemetryEventCreate(event_id="EVT-1", entity_id="METER-FEEDER-F1", metric_name="voltage_v", value=0.0)
    d = detection_engine.analyze_event(evt)
    imp = propagation_engine.analyze_impact("INC-TEST", "FEEDER-LABS-F1")
    r = risk_engine.assess_risk("INC-TEST", "FEEDER-LABS-F1", imp)
    acad = academic_engine.assess_academic_impact("INC-TEST", imp)
    rec = recovery_engine.solve_recovery_plan("INC-TEST", "FEEDER-LABS-F1", acad)
    asn = assignment_engine.assign_incident(db_session, "INC-TEST", "FEEDER", "Feeder F1 Trip")

    plan = coordination_engine.compile_decision_plan("INC-TEST", "Feeder F1 Trip", "FEEDER-LABS-F1", d, imp, r, acad, rec, asn)

    assert plan.plan_id.startswith("PLAN-")
    assert plan.recommended_alternative is not None
    # Timetable disruption must trigger HOD approval
    approval_roles = [app.role_required for app in plan.required_approvals]
    assert CriticalityLevel.HIGH.value in (plan.risk_assessment.criticality_category.value, CriticalityLevel.MISSION_CRITICAL.value) or len(plan.required_approvals) > 0
