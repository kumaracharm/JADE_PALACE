"""
SQLAlchemy Models for Users, Roles, and Audit Logs.
"""
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Integer,
    DateTime,
    JSON,
)
from backend.database import Base


class UserModel(Base):
    __tablename__ = "users"

    user_id = Column(String(64), primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    full_name = Column(String(128), nullable=False)
    role = Column(String(32), nullable=False, index=True)
    department = Column(String(64), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class RoleModel(Base):
    __tablename__ = "roles"

    role_id = Column(String(32), primary_key=True)
    name = Column(String(64), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    permissions_json = Column(JSON, default=list, nullable=False)


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), nullable=True, index=True)
    action = Column(String(64), nullable=False, index=True)
    entity_type = Column(String(64), nullable=True)
    entity_id = Column(String(64), nullable=True, index=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(64), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
