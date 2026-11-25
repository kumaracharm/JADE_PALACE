"""
Tests for Security, Role-Based Access Control (RBAC), and Audit Trail.
"""
from backend.schemas.common import RoleEnum


def test_auth_token_issuance(client):
    """Verify /auth/token issues valid access token for seed user."""
    resp = client.post("/api/v1/auth/token", json={"username": "principal", "password": "Password123!"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == RoleEnum.PRINCIPAL.value


def test_student_restricted_from_admin_endpoints(client, auth_headers):
    """Verify student cannot access executive audit logs or simulations (403 Forbidden)."""
    headers = auth_headers(RoleEnum.STUDENT, "USR-STUDENT-01")

    # 1. Audit trail should be 403 Forbidden for students
    resp_audit = client.get("/api/v1/audit", headers=headers)
    assert resp_audit.status_code == 403

    # 2. Simulation creation should be 403 Forbidden for students
    resp_sim = client.post(
        "/api/v1/simulations",
        headers=headers,
        json={"name": "Illegal Student Chaos", "target_entity_id": "SUBSTATION-01"},
    )
    assert resp_sim.status_code == 403


def test_student_incident_scope_privacy(client, auth_headers):
    """Verify student cannot view incidents submitted by other users."""
    student_headers = auth_headers(RoleEnum.STUDENT, "USR-STUDENT-01")

    # Principal creates an incident
    principal_headers = auth_headers(RoleEnum.PRINCIPAL, "USR-PRINCIPAL")
    resp_create = client.post(
        "/api/v1/incidents",
        headers=principal_headers,
        json={
            "title": "Confidential Executive Issue",
            "description": "Sensitive server fault.",
            "root_entity_id": "SW-MDF-CORE",
        },
    )
    assert resp_create.status_code == 200
    incident_id = resp_create.json()["incident_id"]

    # Student attempts to inspect this incident -> 403 Forbidden
    resp_get = client.get(f"/api/v1/incidents/{incident_id}", headers=student_headers)
    assert resp_get.status_code == 403
    assert "Student privacy guardrail" in resp_get.json()["detail"]


def test_audit_log_recorded(client, auth_headers):
    """Verify sensitive operations generate audit log entries."""
    admin_headers = auth_headers(RoleEnum.PRINCIPAL, "USR-PRINCIPAL")
    # Report an incident
    client.post(
        "/api/v1/incidents",
        headers=admin_headers,
        json={"title": "Audited Test Incident", "description": "Desc", "root_entity_id": "FEEDER-LABS-F1"},
    )

    # Check audit log
    resp_audit = client.get("/api/v1/audit", headers=admin_headers)
    assert resp_audit.status_code == 200
    logs = resp_audit.json()
    assert len(logs) > 0
    assert any("INCIDENT_REPORTED" in l["action"] for l in logs)
