"""
Tests for Database Initialization and Idempotent Seeding.
"""
from backend.models.entity import EntityModel, RelationshipModel, OperationalStateModel
from backend.models.user import UserModel, RoleModel
from backend.seeds.seed_data import seed_database
from backend.schemas.common import OperationalStatus


def test_database_initialization(db_session):
    """Verify that all core tables exist and are queryable."""
    assert db_session.query(EntityModel).count() > 0
    assert db_session.query(RelationshipModel).count() > 0
    assert db_session.query(OperationalStateModel).count() > 0
    assert db_session.query(UserModel).count() > 0
    assert db_session.query(RoleModel).count() > 0


def test_idempotent_seeding(db_session):
    """Verify that repeated seed execution does not create duplicate records."""
    count_entities_1 = db_session.query(EntityModel).count()
    count_rels_1 = db_session.query(RelationshipModel).count()
    count_users_1 = db_session.query(UserModel).count()

    # Re-run seed
    seed_database(db_session, reset_operational=False)

    count_entities_2 = db_session.query(EntityModel).count()
    count_rels_2 = db_session.query(RelationshipModel).count()
    count_users_2 = db_session.query(UserModel).count()

    assert count_entities_1 == count_entities_2
    assert count_rels_1 == count_rels_2
    assert count_users_1 == count_users_2


def test_seed_preserves_live_operational_state(db_session):
    """Verify that idempotent seed does NOT wipe live operational statuses when reset_operational=False."""
    entity = db_session.query(EntityModel).filter_by(entity_id="FEEDER-LABS-F1").first()
    assert entity is not None
    # Simulate an active incident altering operational status
    entity.operational_status = OperationalStatus.UNAVAILABLE.value
    db_session.commit()

    # Re-run seed
    seed_database(db_session, reset_operational=False)

    re_queried = db_session.query(EntityModel).filter_by(entity_id="FEEDER-LABS-F1").first()
    assert re_queried.operational_status == OperationalStatus.UNAVAILABLE.value
