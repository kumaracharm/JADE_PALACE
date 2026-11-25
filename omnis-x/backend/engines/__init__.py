"""
Specialist Intelligence Engines Package Initialization.
Exports all seven deterministic engines.
"""
from backend.engines.e1_detection import AnomalyDetectionEngine, detection_engine
from backend.engines.e2_propagation import GraphImpactPropagationEngine, propagation_engine
from backend.engines.e3_risk import RiskAndCriticalityEngine, risk_engine
from backend.engines.e4_academic import AcademicImpactEngine, academic_engine
from backend.engines.e5_optimization import RecoveryOptimizationEngine, recovery_engine
from backend.engines.e6_assignment import TaskAssignmentEngine, assignment_engine
from backend.engines.e7_coordination import DecisionAndCoordinationEngine, coordination_engine

__all__ = [
    "AnomalyDetectionEngine",
    "detection_engine",
    "GraphImpactPropagationEngine",
    "propagation_engine",
    "RiskAndCriticalityEngine",
    "risk_engine",
    "AcademicImpactEngine",
    "academic_engine",
    "RecoveryOptimizationEngine",
    "recovery_engine",
    "TaskAssignmentEngine",
    "assignment_engine",
    "DecisionAndCoordinationEngine",
    "coordination_engine",
]
