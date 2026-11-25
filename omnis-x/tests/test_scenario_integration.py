"""
End-to-End Integration Scenario Test.
Executes the complete Electronics Laboratory Power Failure Scenario:
1. Detect incident on FEEDER-LABS-F1.
2. Traverse graph dependencies and isolate blast radius.
3. Identify affected rooms (LAB-01-EE disrupted, LAB-02-ROBOTICS protected by UPS).
4. Identify disrupted academic activities (ACT-EE301-LAB).
5. Solve constraint-based recovery reallocation (Plan Alpha to CR-202).
6. Assign responsible technician (Rajesh Patel).
7. Trigger and fulfill HOD/Facility Manager approvals.
8. Execute work order and closed-loop verification.
"""
from backend.schemas.common import RoleEnum, IncidentStatus, WorkOrderStatus, ImpactState


def test_electronics_laboratory_power_failure_complete_scenario(client, auth_headers):
    # Credentials
    principal_headers = auth_headers(RoleEnum.PRINCIPAL, "USR-PRINCIPAL")
    hod_headers = auth_headers(RoleEnum.HOD, "USR-FACULTY-SHARMA")
    tech_headers = auth_headers(RoleEnum.STAFF, "USR-ELEC-TECH")

    # Step 1: Ingest Telemetry Anomaly
    event_payload = {
        "event_id": "EVT-MODBUS-F1-001",
        "entity_id": "METER-FEEDER-F1",
        "metric_name": "voltage_v",
        "value": 0.0,
        "source_type": "REAL",
    }
    resp_event = client.post("/api/v1/events", json=event_payload, headers=principal_headers)
    assert resp_event.status_code == 200
    detection = resp_event.json()
    assert detection["is_anomaly"] is True
    assert detection["anomaly_type"] == "CRITICAL_LOW_THRESHOLD_BREACH"

    # Step 2: Report Incident on FEEDER-LABS-F1
    inc_payload = {
        "incident_id": "INC-2026-EE-001",
        "title": "Feeder F1 Sub-bus Electrical Power Loss",
        "description": "Zero voltage reported on Feeder F1 telemetry meter. First floor labs power disrupted.",
        "root_entity_id": "FEEDER-LABS-F1",
        "priority": "HIGH",
        "source_type": "REAL",
    }
    resp_inc = client.post("/api/v1/incidents", json=inc_payload, headers=principal_headers)
    assert resp_inc.status_code == 200
    inc_data = resp_inc.json()
    assert inc_data["status"] == IncidentStatus.REPORTED.value

    # Step 3: Trigger Specialist Intelligence Engines Analysis
    resp_analyze = client.post(f"/api/v1/incidents/{inc_data['incident_id']}/analyze", headers=principal_headers)
    assert resp_analyze.status_code == 200
    plan = resp_analyze.json()

    # Step 4: Verify Graph Impact Propagation Findings
    affected = plan["impact_analysis"]["affected_entities"]
    aff_dict = {a["affected_entity_id"]: a for a in affected}

    # LAB-01-EE has no backup -> DISRUPTED
    assert "LAB-01-EE" in aff_dict
    assert aff_dict["LAB-01-EE"]["resulting_impact_state"] == ImpactState.DISRUPTED.value

    # LAB-02-ROBOTICS has UPS -> AT_RISK (Not disrupted)
    assert "LAB-02-ROBOTICS" in aff_dict
    assert aff_dict["LAB-02-ROBOTICS"]["resulting_impact_state"] == ImpactState.AT_RISK.value

    # Step 5: Verify Academic Timetable Impact
    academic = plan["academic_impact"]
    assert len(academic["disrupted_activities"]) == 1
    disrupted_act = academic["disrupted_activities"][0]
    assert disrupted_act["activity_id"] == "ACT-EE301-LAB"
    assert disrupted_act["enrolled_count"] == 32

    # Step 6: Verify CP-SAT Recovery Optimization
    recovery = plan["recovery_optimization"]
    assert recovery["solver_outcome"] in ("OPTIMAL", "FEASIBLE")
    rec_alt = plan["recommended_alternative"]
    assert rec_alt is not None
    assert rec_alt["feasible"] is True
    # Reallocated to an available room (e.g. CR-202)
    assert "ACT-EE301-LAB" in rec_alt["reallocations"]

    # Step 7: Verify Assignment Routing
    assignment = plan["assignment"]
    assert "Facilities" in assignment["responsible_department"]
    assert assignment["primary_assignee"]["name"] == "Rajesh Patel"

    # Step 8: Verify Approvals Required
    required_roles = [app["role_required"] for app in plan["required_approvals"]]
    assert RoleEnum.HOD.value in required_roles or RoleEnum.FACILITY_MANAGER.value in required_roles

    # Step 9: HOD Approves Academic Reallocation
    resp_approve = client.post(
        f"/api/v1/incidents/{inc_data['incident_id']}/approve",
        headers=hod_headers,
        json={"plan_id": plan["plan_id"], "comments": "Approved emergency reallocation to CR-202"},
    )
    assert resp_approve.status_code == 200

    # If Facility Manager approval is also required, approve with Principal (super-approval)
    inc_after_first = resp_approve.json()
    if inc_after_first["status"] == IncidentStatus.AWAITING_APPROVAL.value:
        client.post(
            f"/api/v1/incidents/{inc_data['incident_id']}/approve",
            headers=principal_headers,
            json={"plan_id": plan["plan_id"], "comments": "Executive sign-off"},
        )

    # Step 10: Check Work Order Created & Dispatched
    resp_wo = client.get("/api/v1/work-orders", headers=tech_headers)
    assert resp_wo.status_code == 200
    work_orders = resp_wo.json()
    matching_wo = [wo for wo in work_orders if wo["incident_id"] == inc_data["incident_id"]][0]
    assert matching_wo["status"] == WorkOrderStatus.ASSIGNED.value

    # Step 11: Technician Updates Work Order to IN_PROGRESS then COMPLETED
    client.patch(
        f"/api/v1/work-orders/{matching_wo['work_order_id']}",
        headers=tech_headers,
        json={"status": WorkOrderStatus.IN_PROGRESS.value},
    )

    client.patch(
        f"/api/v1/work-orders/{matching_wo['work_order_id']}",
        headers=tech_headers,
        json={
            "status": WorkOrderStatus.COMPLETED.value,
            "actual_hours": 1.25,
            "resolution_notes": "Replaced faulty fuse cartridge on Feeder F1 panel; 415V restored.",
        },
    )

    # Verify incident advanced to VERIFICATION
    resp_inc_verify = client.get(f"/api/v1/incidents/{inc_data['incident_id']}", headers=principal_headers)
    assert resp_inc_verify.json()["status"] == IncidentStatus.VERIFICATION.value

    # Step 12: Closed-Loop Verification
    resp_close = client.post(
        f"/api/v1/incidents/{inc_data['incident_id']}/verify",
        headers=principal_headers,
        params={"note": "Telemetry confirms 415.2V on Modbus meter. Normal load resumed."},
    )
    assert resp_close.status_code == 200
    assert resp_close.json()["status"] == IncidentStatus.CLOSED.value

    # Verify Entity is back to OPERATIONAL
    resp_entity = client.get("/api/v1/campus/entities/FEEDER-LABS-F1", headers=principal_headers)
    assert resp_entity.json()["operational_status"] == "OPERATIONAL"
