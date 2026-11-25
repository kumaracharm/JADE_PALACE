"""
Engine 6: Responsibility and Task Assignment.
Implements rule-based department routing (RACI framework) and technician
skill matching, workload balancing, and response SLA evaluation.
"""
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from backend.models.user import UserModel
from backend.schemas.common import RoleEnum
from backend.schemas.engines import AssignmentRecommendation, AssigneeCandidate

# Department mapping based on incident domain & entity type
DOMAIN_DEPARTMENT_ROUTING = {
    "ELECTRICAL": "Facilities & Physical Plant",
    "NETWORK": "Campus IT Systems",
    "PHYSICAL": "Facilities & Physical Plant",
    "ACADEMIC": "Academic Deanery",
    "FEEDER": "Facilities & Physical Plant",
    "SUBSTATION": "Facilities & Physical Plant",
    "DISTRIBUTION_PANEL": "Facilities & Physical Plant",
    "SWITCH_MDF": "Campus IT Systems",
    "SWITCH_IDF": "Campus IT Systems",
}


class TaskAssignmentEngine:
    """
    RACI routing and skill-based technician ranking engine.
    """

    def determine_department(self, entity_type: str, incident_title: str) -> str:
        """Determines responsible institutional department."""
        for key, dept in DOMAIN_DEPARTMENT_ROUTING.items():
            if key in entity_type.upper() or key in incident_title.upper():
                return dept
        return "Facilities & Physical Plant"

    def rank_candidates(
        self,
        db: Session,
        department: str,
        required_skills: List[str],
    ) -> List[AssigneeCandidate]:
        """
        Ranks department technicians using:
        Suitability = SkillsMatchScore (0-50) + WorkloadScore (0-30) + Availability (20).
        """
        users = db.query(UserModel).filter(
            UserModel.role.in_([RoleEnum.STAFF.value, RoleEnum.FACILITY_MANAGER.value, RoleEnum.IT_ADMIN.value]),
            UserModel.is_active == True,
        ).all()

        candidates: List[AssigneeCandidate] = []

        for user in users:
            # Match department
            is_same_dept = (user.department == department) or ("Facilities" in str(user.department) and "Facilities" in department)
            if not is_same_dept:
                continue

            # Hardcoded demo skills lookup or profile metadata
            skills = []
            active_tasks = 1
            if user.user_id == "USR-ELEC-TECH":
                skills = ["High Voltage", "Circuit Breakers", "Switchgear", "Power Distribution", "Safety Interlocks"]
                active_tasks = 1
            elif user.user_id == "USR-ELEC-TECH-2":
                skills = ["Internal Wiring", "Relays", "Lighting"]
                active_tasks = 3
            elif user.user_id == "USR-IT-ADMIN":
                skills = ["Switching", "VLAN", "Fiber Optic", "Routing", "SNMP"]
                active_tasks = 1
            else:
                skills = ["General Maintenance"]
                active_tasks = 2

            # Compute skill overlap
            matched = [s for s in skills if any(req.lower() in s.lower() for req in required_skills)]
            skill_score = min(len(matched) * 20.0, 50.0)

            # Workload penalty (-10 per task, base 30)
            workload_score = max(30.0 - (active_tasks * 10.0), 5.0)

            # Availability bonus
            avail_score = 20.0

            suitability = round(skill_score + workload_score + avail_score, 1)

            candidates.append(
                AssigneeCandidate(
                    staff_id=user.user_id,
                    name=user.full_name,
                    role=RoleEnum(user.role),
                    department=user.department or department,
                    matched_skills=matched if matched else skills[:2],
                    current_active_tasks=active_tasks,
                    suitability_score=suitability,
                    is_available=True,
                )
            )

        candidates.sort(key=lambda c: c.suitability_score, reverse=True)
        return candidates

    def assign_incident(
        self,
        db: Session,
        incident_id: str,
        entity_type: str,
        incident_title: str,
    ) -> AssignmentRecommendation:
        department = self.determine_department(entity_type, incident_title)

        required_skills = ["High Voltage", "Circuit Breakers"] if "FEEDER" in entity_type or "POWER" in incident_title.upper() else ["Network", "Switching"]
        candidates = self.rank_candidates(db, department, required_skills)

        primary = candidates[0] if candidates else None
        backup = candidates[1] if len(candidates) > 1 else None

        reason = (
            f"Incident involving {entity_type} automatically routed to {department}. "
            f"Primary technician {primary.name if primary else 'Unassigned'} selected with highest suitability score ({primary.suitability_score if primary else 0}/100) "
            f"based on matching skills ({primary.matched_skills if primary else 'N/A'}) and low active task load."
        )

        return AssignmentRecommendation(
            incident_id=incident_id,
            responsible_department=department,
            primary_assignee=primary,
            backup_assignee=backup,
            candidate_ranking=candidates,
            routing_reason=reason,
            sla_target_minutes=45,
        )


assignment_engine = TaskAssignmentEngine()
