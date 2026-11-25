"""
Unit and Integration Tests for ML Lab and Innovation Endpoints.
Verifies model metadata, live inference, Institutional Resilience Index,
and Single Point of Failure (SPOF) graph discovery.
"""
import pytest
from backend.schemas.common import RoleEnum
from backend.models.user import UserModel
from backend.api.ml import list_models, run_prediction, PredictRequest
from backend.api.analytics import get_institutional_resilience_index, get_single_points_of_failure


def test_ml_models_catalog():
    """Verify all 4 models are cataloged with schemas and metrics."""
    result = list_models()
    assert result["status"] == "READY"
    assert result["total_models"] == 4
    model_keys = [m["model_key"] for m in result["models"]]
    assert "equipment_failure" in model_keys
    assert "it_infrastructure" in model_keys
    assert "transport_delay" in model_keys
    assert "electrical_grid" in model_keys


def test_ml_live_inference_equipment():
    """Verify live inference on equipment failure model."""
    req = PredictRequest(
        model_type="equipment_failure",
        entity_id="EQ-GPU-CLUSTER",
        features={
            "temperature_c": 75.0,
            "vibration_mm_s": 5.2,
            "pressure_bar": 3.8,
            "rotational_speed_rpm": 3200.0,
            "operating_hours": 8500.0,
            "maintenance_history": 1,
        }
    )
    res = run_prediction(req)
    assert res.model_type == "equipment_failure"
    assert res.target_entity_id == "EQ-GPU-CLUSTER"
    assert res.prediction in ["CRITICAL_FAILURE", "WARNING", "NORMAL"]
    assert res.confidence is not None
    assert 0.0 <= res.confidence <= 1.0
    assert res.provenance == "SYNTHETIC DEMONSTRATION"


def test_ml_live_inference_it_anomaly():
    """Verify live inference on IT infrastructure anomaly model."""
    req = PredictRequest(
        model_type="it_infrastructure",
        entity_id="SW-MDF-CORE",
        features={
            "cpu_usage": 92.0,
            "memory_usage": 94.5,
            "network_latency_ms": 115.0,
            "packet_loss": 5.5,
            "disk_usage": 80.0,
            "request_rate": 2100.0,
        }
    )
    res = run_prediction(req)
    assert res.model_type == "it_infrastructure"
    assert res.prediction in ["FAULT", "DEGRADED", "NORMAL"]
    assert res.confidence is not None


def test_institutional_resilience_index(db_session):
    """Verify calculation of multi-criteria 0-100 resilience index."""
    principal_user = db_session.query(UserModel).filter_by(role=RoleEnum.PRINCIPAL.value).first()
    res = get_institutional_resilience_index(db=db_session, current_user=principal_user)
    assert "overall_resilience_score" in res
    assert 0.0 <= res["overall_resilience_score"] <= 100.0
    assert res["rating"] in ["EXCELLENT", "GOOD", "DEGRADED", "CRITICAL"]
    assert "infrastructure_health" in res["domains"]
    assert "it_availability" in res["domains"]
    assert "academic_continuity" in res["domains"]
    assert len(res["trend_24h"]) > 0


def test_single_points_of_failure_discovery(db_session):
    """Verify graph SPOF discovery identifies articulation points and critical nodes."""
    principal_user = db_session.query(UserModel).filter_by(role=RoleEnum.PRINCIPAL.value).first()
    res = get_single_points_of_failure(db=db_session, current_user=principal_user)
    assert "total_graph_nodes" in res
    assert res["total_graph_nodes"] > 0
    assert "total_spofs_detected" in res
    assert len(res["all_candidates"]) > 0
    
    # Substation or Main Panel should be identified as a critical SPOF
    entity_ids = [c["entity_id"] for c in res["all_candidates"]]
    assert any("SUBSTATION" in eid or "PANEL" in eid or "FEEDER" in eid for eid in entity_ids)
