"""
Security Audit Logging Service.
Records security-sensitive operations, human approvals, and state overrides.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from backend.models.user import AuditLogModel


class AuditService:
    """
    Append-only security and governance audit trail.
    """

    @staticmethod
    def log_action(
        db: Session,
        action: str,
        user_id: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLogModel:
        log = AuditLogModel(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details,
            ip_address=ip_address,
            timestamp=datetime.utcnow(),
        )
        db.add(log)
        db.commit()
        return log


audit_service = AuditService()
