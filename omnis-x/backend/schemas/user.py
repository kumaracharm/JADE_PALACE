"""
User, Authentication, and Audit Log Pydantic Schemas.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from backend.schemas.common import RoleEnum


class UserBase(BaseModel):
    user_id: str
    username: str
    email: str
    full_name: str
    role: RoleEnum
    department: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: RoleEnum
    user_id: str
    username: str
    department: Optional[str] = None


class TokenData(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    role: Optional[RoleEnum] = None
    department: Optional[str] = None


class AuditLogRead(BaseModel):
    id: int
    user_id: Optional[str] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
