"""
Tests for Ephemeral Simulation Sandbox and Isolation Guarantee.
"""
from backend.services.simulation_service import simulation_service
from backend.schemas.incident import SimulationCreate
from backend.models.entity import EntityModel, OperationalStateModel
from backend.graph.repository import graph_repository
from backend.schemas.common import OperationalStatus


def test_simulation_execution_and_isolation(db_session):
    """
    Verify Layer 5 simulation runs in isolated shadow memory buffer and
    NEVER mutates live operational twin database records or production graph.
    """
    # 1. Capture baseline live operational state
    target_id = "FEEDER-LABS-F1"
    baseline_db_entity = db_session.query(EntityModel).filter_by(entity_id=target_id).first()
    baseline_db_op = db_session.query(OperationalStateModel).filter_by(entity_id=target_id).first()
    assert baseline_db_entity.operational_status == OperationalStatus.OPERATIONAL.value
    assert baseline_db_op.current_status == OperationalStatus.OPERATIONAL.value
    assert graph_repository.graph.nodes[target_id]["operational_status"] == OperationalStatus.OPERATIONAL.value

    # 2. Define and run counterfactual simulation of complete Feeder failure
    sim_in = SimulationCreate(
        name="Catastrophic Feeder Trip Chaos Injection",
        description="Hypothetical complete feeder outage experiment.",
        target_entity_id=target_id,
        injected_failure_type="BREAKER_CATASTROPHIC_TRIP",
    )
    sim = simulation_service.create_simulation(db_session, sim_in)
    executed_sim = simulation_service.run_simulation(db_session, sim.simulation_id)

    # 3. Verify simulation executed and produced results
    assert executed_sim.status == "COMPLETED"
    assert executed_sim.results is not None
    assert executed_sim.results["shadow_blast_radius"] > 0
    assert executed_sim.results["displaced_students"] > 0

    # 4. CRITICAL ISOLATION GUARANTEE: Live database records must remain OPERATIONAL
    recheck_db_entity = db_session.query(EntityModel).filter_by(entity_id=target_id).first()
    recheck_db_op = db_session.query(OperationalStateModel).filter_by(entity_id=target_id).first()
    assert recheck_db_entity.operational_status == OperationalStatus.OPERATIONAL.value
    assert recheck_db_op.current_status == OperationalStatus.OPERATIONAL.value

    # Live in-memory graph must ALSO remain completely OPERATIONAL
    assert graph_repository.graph.nodes[target_id]["operational_status"] == OperationalStatus.OPERATIONAL.value
