"""
SQLAlchemy Models for Incidents, Work Orders, Approvals, Simulations, and State History.
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


class IncidentModel(Base):
    __tablename__ = "incidents"

    incident_id = Column(String(64), primary_key=True, index=True)
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    root_entity_id = Column(String(64), ForeignKey("entities.entity_id"), nullable=False, index=True)
    status = Column(String(32), default="REPORTED", nullable=False, index=True)
    priority = Column(String(32), default="MEDIUM", nullable=False)
    source_type = Column(String(32), default="REPORTED", nullable=False)
    source_id = Column(String(64), nullable=True)
    reported_by_user_id = Column(String(64), nullable=True)
    metadata_json = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    root_entity = relationship("EntityModel", foreign_keys=[root_entity_id])
    history = relationship("StateHistoryModel", back_populates="incident", cascade="all, delete-orphan")
    work_orders = relationship("WorkOrderModel", back_populates="incident", cascade="all, delete-orphan")
    approvals = relationship("ApprovalModel", back_populates="incident", cascade="all, delete-orphan")
    affected_entities = relationship("IncidentEntityModel", back_populates="incident", cascade="all, delete-orphan")
    recovery_alternatives = relationship("RecoveryAlternativeModel", back_populates="incident", cascade="all, delete-orphan")


class IncidentEntityModel(Base):
    __tablename__ = "incident_entities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String(64), ForeignKey("incidents.incident_id"), nullable=False, index=True)
    entity_id = Column(String(64), ForeignKey("entities.entity_id"), nullable=False, index=True)
    impact_state = Column(String(32), nullable=False)
    propagation_path = Column(JSON, default=list, nullable=False)
    reason = Column(Text, nullable=False)
    detected_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    incident = relationship("IncidentModel", back_populates="affected_entities")
    entity = relationship("EntityModel")


class StateHistoryModel(Base):
    __tablename__ = "state_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String(64), ForeignKey("incidents.incident_id"), nullable=True, index=True)
    entity_id = Column(String(64), ForeignKey("entities.entity_id"), nullable=True, index=True)
    from_status = Column(String(32), nullable=False)
    to_status = Column(String(32), nullable=False)
    changed_by_user_id = Column(String(64), nullable=True)
    changed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    note = Column(Text, nullable=True)

    incident = relationship("IncidentModel", back_populates="history")


class RecoveryAlternativeModel(Base):
    __tablename__ = "recovery_alternatives"

    alternative_id = Column(String(64), primary_key=True, index=True)
    incident_id = Column(String(64), ForeignKey("incidents.incident_id"), nullable=False, index=True)
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    recovery_time_minutes = Column(Integer, nullable=False)
    estimated_cost_usd = Column(Float, nullable=False)
    disruption_penalty = Column(Float, nullable=False)
    residual_risk_score = Column(Float, nullable=False)
    composite_rank_score = Column(Float, nullable=False)
    reallocations_json = Column(JSON, default=dict, nullable=False)
    steps_json = Column(JSON, default=list, nullable=False)
    feasible = Column(Boolean, default=True, nullable=False)
    infeasibility_reasons_json = Column(JSON, default=list, nullable=False)
    is_recommended = Column(Boolean, default=False, nullable=False)

    incident = relationship("IncidentModel", back_populates="recovery_alternatives")


class WorkOrderModel(Base):
    __tablename__ = "work_orders"

    work_order_id = Column(String(64), primary_key=True, index=True)
    incident_id = Column(String(64), ForeignKey("incidents.incident_id"), nullable=False, index=True)
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    assigned_department = Column(String(64), nullable=False, index=True)
    assigned_to_user_id = Column(String(64), nullable=True)
    target_entity_id = Column(String(64), ForeignKey("entities.entity_id"), nullable=False)
    status = Column(String(32), default="CREATED", nullable=False, index=True)
    priority = Column(String(32), default="HIGH", nullable=False)
    estimated_hours = Column(Float, default=2.0, nullable=False)
    actual_hours = Column(Float, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    incident = relationship("IncidentModel", back_populates="work_orders")
    target_entity = relationship("EntityModel")


class ApprovalModel(Base):
    __tablename__ = "approvals"

    approval_id = Column(String(64), primary_key=True, index=True)
    incident_id = Column(String(64), ForeignKey("incidents.incident_id"), nullable=False, index=True)
    plan_id = Column(String(64), nullable=True)
    required_role = Column(String(32), nullable=False)
    approved_by_user_id = Column(String(64), nullable=True)
    status = Column(String(32), default="PENDING", nullable=False)
    comments = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    incident = relationship("IncidentModel", back_populates="approvals")


class RecommendationModel(Base):
    __tablename__ = "recommendations"

    recommendation_id = Column(String(64), primary_key=True, index=True)
    incident_id = Column(String(64), ForeignKey("incidents.incident_id"), nullable=False, index=True)
    plan_json = Column(JSON, default=dict, nullable=False)
    status = Column(String(32), default="ACTIVE", nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class SimulationModel(Base):
    __tablename__ = "simulations"

    simulation_id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    target_entity_id = Column(String(64), nullable=False)
    injected_failure_type = Column(String(64), nullable=False)
    parameters = Column(JSON, default=dict, nullable=False)
    status = Column(String(32), default="CREATED", nullable=False)
    results = Column(JSON, default=dict, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    executed_at = Column(DateTime, nullable=True)
