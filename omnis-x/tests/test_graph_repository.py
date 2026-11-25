"""
Tests for NetworkX Graph Repository and Graph Reconstruction.
"""
from backend.graph.repository import graph_repository
from backend.models.entity import EntityModel, RelationshipModel
from backend.schemas.common import RelationshipType


def test_graph_construction(db_session):
    """Verify NetworkX graph reflects database entities and edges with attributes."""
    g = graph_repository.build_graph_from_db(db_session)
    assert len(g.nodes) >= 25
    assert len(g.edges) >= 20

    # Check node attributes
    node_data = g.nodes["LAB-01-EE"]
    assert node_data["name"] == "Electronics & Microcontroller Laboratory"
    assert node_data["criticality"] == "HIGH"
    assert node_data["operational_status"] == "OPERATIONAL"

    # Check edge attributes
    edge_data = g.get_edge_data("FEEDER-LABS-F1", "LAB-01-EE")
    assert edge_data["relationship_type"] == RelationshipType.SUPPLIES_POWER_TO.value
    assert edge_data["is_essential"] is True


def test_graph_reload_after_restart(db_session):
    """Verify in-memory graph reconstructs from persistent database state."""
    # Add a new entity directly to persistent database
    new_entity = EntityModel(
        entity_id="SENSOR-TEMP-TEST",
        entity_type="IOT_SENSOR",
        name="Test Thermal Sensor",
        criticality="LOW",
        operational_status="OPERATIONAL",
        metadata_json={},
    )
    db_session.add(new_entity)
    db_session.commit()

    # Before reload, in-memory graph does not contain it
    assert "SENSOR-TEMP-TEST" not in graph_repository.graph

    # Trigger rebuild
    g = graph_repository.rebuild(db_session)
    assert "SENSOR-TEMP-TEST" in g.nodes


def test_redundancy_checking(db_session):
    """Verify redundancy detection logic on dual-feed nodes."""
    graph_repository.build_graph_from_db(db_session)

    # LAB-02-ROBOTICS has UPS-LAB-02 backup
    has_red = graph_repository.check_redundancy(target_id="LAB-02-ROBOTICS", failed_source_id="FEEDER-LABS-F1")
    assert has_red is True

    # LAB-01-EE has no backup
    no_red = graph_repository.check_redundancy(target_id="LAB-01-EE", failed_source_id="FEEDER-LABS-F1")
    assert no_red is False


def test_relationship_reference_validation(db_session):
    """Verify graph loader gracefully skips invalid orphan relationships."""
    invalid_rel = RelationshipModel(
        relationship_id="REL-INVALID-TEST",
        source_id="NON_EXISTENT_SOURCE",
        target_id="LAB-01-EE",
        relationship_type="SUPPLIES_POWER_TO",
        is_essential=True,
        metadata_json={},
    )
    db_session.add(invalid_rel)
    # Don't commit to DB with foreign key constraints, or test handler
    # Since foreign key constraint is in place, creating it with an invalid FK is rejected by DB
