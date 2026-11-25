"""
SQLAlchemy Models for Entities, Relationships, and Operational States.
"""
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Float,
    Integer,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from backend.database import Base


class EntityModel(Base):
    __tablename__ = "entities"

    entity_id = Column(String(64), primary_key=True, index=True)
    entity_type = Column(String(32), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    parent_entity_id = Column(String(64), ForeignKey("entities.entity_id"), nullable=True, index=True)
    location = Column(String(128), nullable=True)
    criticality = Column(String(32), default="MEDIUM", nullable=False)
    operational_status = Column(String(32), default="OPERATIONAL", nullable=False)
    metadata_json = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Self-referential hierarchy
    parent = relationship("EntityModel", remote_side=[entity_id], backref="children")

    # Outgoing and Incoming Relationships
    outgoing_relationships = relationship(
        "RelationshipModel",
        foreign_keys="RelationshipModel.source_id",
        back_populates="source_entity",
        cascade="all, delete-orphan",
    )
    incoming_relationships = relationship(
        "RelationshipModel",
        foreign_keys="RelationshipModel.target_id",
        back_populates="target_entity",
        cascade="all, delete-orphan",
    )

    # Operational state relation
    operational_state = relationship(
        "OperationalStateModel",
        back_populates="entity",
        uselist=False,
        cascade="all, delete-orphan",
    )


class RelationshipModel(Base):
    __tablename__ = "relationships"

    relationship_id = Column(String(64), primary_key=True, index=True)
    source_id = Column(String(64), ForeignKey("entities.entity_id"), nullable=False, index=True)
    target_id = Column(String(64), ForeignKey("entities.entity_id"), nullable=False, index=True)
    relationship_type = Column(String(64), nullable=False, index=True)
    is_essential = Column(Boolean, default=True, nullable=False)
    redundancy_available = Column(Boolean, default=False, nullable=False)
    dependency_strength = Column(Float, default=1.0, nullable=False)
    propagation_policy = Column(String(32), default="DEFAULT", nullable=False)
    metadata_json = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    source_entity = relationship("EntityModel", foreign_keys=[source_id], back_populates="outgoing_relationships")
    target_entity = relationship("EntityModel", foreign_keys=[target_id], back_populates="incoming_relationships")


class OperationalStateModel(Base):
    __tablename__ = "operational_states"

    entity_id = Column(String(64), ForeignKey("entities.entity_id"), primary_key=True, index=True)
    current_status = Column(String(32), default="OPERATIONAL", nullable=False)
    last_observation_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    health_score = Column(Float, default=100.0, nullable=False)
    active_incident_count = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    entity = relationship("EntityModel", back_populates="operational_state")
