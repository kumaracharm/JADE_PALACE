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


class DemoLoginRequest(BaseModel):
    role: str  # SUPER_ADMIN, FACILITY_MANAGER, HOD_ACADEMIC, TECHNICIAN, STUDENT


DEMO_USERS_REGISTRY = [
    {
        "role": "SUPER_ADMIN",
        "role_title": "Super Admin",
        "username": "superadmin",
        "user_id": "USR-SUPER-ADMIN",
        "password": "AdminPassword!123",
        "full_name": "Dr. Arthur Vance",
        "title": "Director of Institutional Operations",
        "department": "Executive Leadership",
        "permissions": [
            "ALL_APPLICATIONS",
            "MANAGE_USERS",
            "SCENARIOS_CONTROL",
            "VIEW_ALL_INCIDENTS",
            "APPROVE_ALL_RECOVERY",
            "RESOLVE_INCIDENTS",
        ],
    },
    {
        "role": "FACILITY_MANAGER",
        "role_title": "Facility Manager",
        "username": "facility_mgr",
        "user_id": "USR-FACILITY-MGR",
        "password": "FacilityPass!123",
        "full_name": "Marcus Bennett",
        "title": "Chief Infrastructure Engineer",
        "department": "Facilities & Physical Plant",
        "permissions": [
            "VIEW_DIGITAL_TWIN",
            "VIEW_FACILITY_INCIDENTS",
            "ASSIGN_TECHNICIANS",
            "APPROVE_FACILITIES_RECOVERY",
        ],
    },
    {
        "role": "HOD_ACADEMIC",
        "role_title": "HOD / Academic Admin",
        "username": "hod_academic",
        "user_id": "USR-HOD-ACADEMIC",
        "password": "AcademicPass!123",
        "full_name": "Dr. Kavita Sharma",
        "title": "Head of Electrical & Computer Engineering",
        "department": "Academic Affairs",
        "permissions": [
            "VIEW_ACADEMIC_DISRUPTIONS",
            "VIEW_AFFECTED_CLASSES",
            "APPROVE_ROOM_RELOCATIONS",
            "APPROVE_TIMETABLE_CHANGES",
        ],
    },
    {
        "role": "TECHNICIAN",
        "role_title": "Technician",
        "username": "technician",
        "user_id": "USR-TECHNICIAN",
        "password": "TechPass!123",
        "full_name": "Rajesh Patel",
        "title": "Lead Electrical & Systems Specialist",
        "department": "Field Engineering Response",
        "permissions": [
            "VIEW_ASSIGNED_INCIDENTS",
            "UPDATE_WORK_PROGRESS",
            "SUBMIT_RESOLUTION_NOTES",
        ],
    },
    {
        "role": "STUDENT",
        "role_title": "Student",
        "username": "student",
        "user_id": "USR-STUDENT",
        "password": "StudentPass!123",
        "full_name": "Priya Verma",
        "title": "B.Tech Computer Science (L3)",
        "department": "Student Body",
        "permissions": [
            "ACCESS_GRIEVANCE_PWA",
            "SUBMIT_INCIDENT_REPORT",
            "TRACK_OWN_REPORTS",
        ],
    },
]


@router.post("/token")
def login_for_access_token(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticates user credentials and issues signed JWT bearer token.
    Supports username or user_id matching.
    """
    user = db.query(UserModel).filter(
        ((UserModel.username == login_data.username) | (UserModel.user_id == login_data.username)),
        UserModel.is_active == True,
    ).first()

    if not user or user.hashed_password != hash_password(login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.user_id, "role": user.role, "username": user.username}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.user_id,
        "username": user.username,
        "full_name": user.full_name,
        "department": user.department,
        "expires_in": 3600,
    }


@router.post("/demo-login")
def demo_role_login(
    req: DemoLoginRequest,
    db: Session = Depends(get_db),
):
    """
    Issues a valid cryptographic JWT token for any requested demo role.
    Enables frictionless live demonstration without manual password typing.
    """
    target_role = req.role.upper()
    registry_entry = next((u for u in DEMO_USERS_REGISTRY if u["role"] == target_role), None)
    if not registry_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown demo role '{req.role}'. Valid roles: {[u['role'] for u in DEMO_USERS_REGISTRY]}",
        )

    # Look up user in database or use registry fallback
    user = db.query(UserModel).filter(
        ((UserModel.user_id == registry_entry["user_id"]) | (UserModel.username == registry_entry["username"])),
        UserModel.is_active == True,
    ).first()

    user_id = user.user_id if user else registry_entry["user_id"]
    username = user.username if user else registry_entry["username"]
    full_name = user.full_name if user else registry_entry["full_name"]
    department = user.department if user else registry_entry["department"]

    access_token = create_access_token(
        data={"sub": user_id, "role": target_role, "username": username}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": target_role,
        "user_id": user_id,
        "username": username,
        "full_name": full_name,
        "department": department,
        "permissions": registry_entry["permissions"],
        "expires_in": 3600,
    }


@router.get("/demo-users")
def list_demo_users():
    """
    Lists all five documented demo user credentials and permission scopes for demonstration.
    """
    return {
        "disclaimer": "OFFICIAL OMNIS-X DEMONSTRATION CREDENTIALS • PASSWORDS HASHED VIA SHA-256",
        "demo_accounts": DEMO_USERS_REGISTRY,
    }


@router.get("/me")
def read_current_user(current_user: UserModel = Depends(get_current_user)):
    """Returns profile and institutional role permissions of authenticated user."""
    registry_entry = next((u for u in DEMO_USERS_REGISTRY if u["role"] == current_user.role or u["user_id"] == current_user.user_id), None)
    return {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "department": current_user.department,
        "permissions": registry_entry["permissions"] if registry_entry else ["VIEW_BASIC"],
    }
