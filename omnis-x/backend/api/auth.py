"""
Authentication & Identity API Endpoints.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models.user import UserModel
from backend.schemas.user import UserRead, Token
from backend.schemas.common import RoleEnum
from backend.seeds.seed_data import hash_password
from backend.security.tokens import create_access_token
from backend.security.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/token", response_model=Token)
def login_for_access_token(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticates user credentials and issues signed JWT bearer token.
    """
    user = db.query(UserModel).filter_by(username=login_data.username, is_active=True).first()
    if not user or user.hashed_password != hash_password(login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.user_id, "role": user.role, "username": user.username}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=RoleEnum(user.role),
        user_id=user.user_id,
        username=user.username,
        department=user.department,
    )


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: UserModel = Depends(get_current_user)):
    """Returns profile and institutional role permissions of authenticated user."""
    return current_user
