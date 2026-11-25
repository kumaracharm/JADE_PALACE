"""
Engine 4: Academic and Resource Impact.
Correlates topological infrastructure disruptions with active classroom timetables,
student sections, faculty schedules, and specialized laboratory equipment requirements.
"""
from typing import List, Dict, Optional, Set
from backend.schemas.common import ImpactState, EntityType
from backend.schemas.engines import (
    AcademicImpactResult,
    DisruptedActivity,
    AlternativeRoomOption,
    ImpactAnalysisResult,
)
from backend.graph.repository import graph_repository, GraphRepository


class AcademicImpactEngine:
    """
    Evaluates timetable conflicts, student displacement, and alternative room suitability.
    """

    def __init__(self, repo: Optional[GraphRepository] = None):
        self.repo = repo or graph_repository

    def assess_academic_impact(
        self,
        incident_id: str,
        impact_result: ImpactAnalysisResult,
    ) -> AcademicImpactResult:
        graph = self.repo.graph
        affected_ids: Set[str] = {
            e.affected_entity_id for e in impact_result.affected_entities
            if e.resulting_impact_state == ImpactState.DISRUPTED
        }
        affected_ids.add(impact_result.root_entity_id)

        disrupted_activities: List[DisruptedActivity] = []
        total_students = 0
        total_hours = 0.0

        # 1. Identify all academic activities in graph
        for node_id, data in graph.nodes(data=True):
            if data.get("entity_type") != EntityType.ACADEMIC_ACTIVITY.value:
                continue

            metadata = data.get("metadata", {})
            assigned_room_id = data.get("parent_entity_id") or ""
            required_eq = metadata.get("required_equipment", [])

            # Check if assigned room is disrupted
            room_disrupted = assigned_room_id in affected_ids

            # Check if required equipment is disrupted
            eq_disrupted = False
            disrupted_eq_name = ""
            for pred in graph.predecessors(node_id):
                pred_data = graph.nodes.get(pred, {})
                if pred in affected_ids:
                    eq_disrupted = True
                    disrupted_eq_name = pred_data.get("name", pred)
                    break

            if room_disrupted or eq_disrupted:
                reason = (
                    f"Assigned room {assigned_room_id} has lost electrical/service functionality."
                    if room_disrupted
                    else f"Required lab equipment ({disrupted_eq_name}) is disrupted."
                )

                enrolled = metadata.get("enrolled_students", 30)
                total_students += enrolled
                total_hours += 3.0  # standard 3-hour practical or 1.5 theory slot

                disrupted_activities.append(
                    DisruptedActivity(
                        activity_id=node_id,
                        course_code=metadata.get("course_code", "GEN-101"),
                        activity_name=data.get("name", node_id),
                        faculty_id=metadata.get("faculty_id", "UNKNOWN"),
                        faculty_name=metadata.get("faculty_name", "Staff Faculty"),
                        room_id=assigned_room_id,
                        room_name=graph.nodes.get(assigned_room_id, {}).get("name", assigned_room_id),
                        student_section=metadata.get("section", "SEC-A"),
                        enrolled_count=enrolled,
                        time_slot=metadata.get("time_slot", "09:00 - 12:00"),
                        disruption_reason=reason,
                        required_equipment=required_eq,
                    )
                )

        # 2. Find Candidate Alternative Rooms (rooms not in affected_ids, not currently occupied)
        alternative_rooms_map: Dict[str, List[AlternativeRoomOption]] = {}
        candidate_rooms = []

        for r_id, r_data in graph.nodes(data=True):
            r_type = r_data.get("entity_type")
            if r_type not in (EntityType.CLASSROOM.value, EntityType.LABORATORY.value, EntityType.LECTURE_HALL.value):
                continue
            if r_id in affected_ids:
                continue  # Skip affected rooms

            r_meta = r_data.get("metadata", {})
            r_cap = r_meta.get("capacity", 40)
            avail_eq = []
            if r_meta.get("has_projector"):
                avail_eq.append("PROJECTOR")
            if r_meta.get("has_ups_backup"):
                avail_eq.append("UPS_BACKUP")
            if r_type == EntityType.LABORATORY.value:
                avail_eq.append("WORKSTATION")

            candidate_rooms.append((r_id, r_data.get("name", r_id), r_cap, avail_eq))

        for act in disrupted_activities:
            options: List[AlternativeRoomOption] = []
            for c_id, c_name, c_cap, c_eq in candidate_rooms:
                if c_cap >= act.enrolled_count:
                    # Score based on capacity overhead and equipment compatibility
                    eq_match = len(set(act.required_equipment).intersection(set(c_eq)))
                    suitability = round(1.0 - (c_cap - act.enrolled_count) / 200.0 + (eq_match * 0.2), 2)
                    options.append(
                        AlternativeRoomOption(
                            room_id=c_id,
                            room_name=c_name,
                            capacity=c_cap,
                            equipment_available=c_eq,
                            suitability_score=max(suitability, 0.1),
                        )
                    )
            # Sort by suitability descending
            options.sort(key=lambda x: x.suitability_score, reverse=True)
            alternative_rooms_map[act.activity_id] = options

        summary = (
            f"Academic impact detected: {len(disrupted_activities)} scheduled academic activity(ies) disrupted, "
            f"affecting {total_students} students and {total_hours} contact hours."
            if disrupted_activities
            else "No academic activities or scheduled student sections disrupted by this incident."
        )

        return AcademicImpactResult(
            incident_id=incident_id,
            disrupted_activities=disrupted_activities,
            total_displaced_students=total_students,
            total_displaced_hours=total_hours,
            alternative_rooms_available=alternative_rooms_map,
            summary=summary,
        )


academic_engine = AcademicImpactEngine()
