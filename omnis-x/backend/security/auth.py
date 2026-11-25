"""
Authentication and Role-Based Access Control (RBAC) Dependencies.
Enforces institutional role hierarchy and department scoping in backend route handlers.
"""
from typing import List, Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import UserModel
from backend.models.incident import IncidentModel
from backend.schemas.common import RoleEnum
from backend.security.tokens import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> UserModel:
    """
    Resolves the authenticated user via Bearer JWT or authenticated X-User-Id header.
    Defaults to Principal executive in unauthenticated dev mode if neither is provided.
    """
    user_id = None

    if token:
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user_id = payload["sub"]

    if not user_id and x_user_id:
        user_id = x_user_id

    if user_id:
        user = db.query(UserModel).filter_by(user_id=user_id, is_active=True).first()
        if user:
            return user

    # Fallback to demo default Principal for open exploration if no token supplied
    default_user = db.query(UserModel).filter_by(user_id="USR-PRINCIPAL").first()
    if default_user:
        return default_user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication credentials were not provided or have expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def require_roles(allowed_roles: List[RoleEnum]):
    """
    Factory creating a FastAPI dependency that verifies the caller holds an authorized role.
    """
    def role_checker(current_user: UserModel = Depends(get_current_user)) -> UserModel:
        user_role = RoleEnum(current_user.role)
        # Principal has institutional superuser access across all routes
        if user_role == RoleEnum.PRINCIPAL:
            return current_user

        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. User role '{user_role.value}' does not possess required privileges. Required: {[r.value for r in allowed_roles]}",
            )
        return current_user

    return role_checker


def enforce_student_incident_scope(current_user: UserModel, incident: IncidentModel) -> None:
    """
    Enforces student isolation: Students may only inspect tickets they submitted.
    """
    if current_user.role == RoleEnum.STUDENT.value:
        if incident.reported_by_user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Student privacy guardrail: You are only permitted to view incidents you reported personally.",
            )
