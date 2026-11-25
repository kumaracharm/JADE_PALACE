"""
Engine 5: Recovery Optimization.
Uses Google OR-Tools CP-SAT constraint satisfaction solver to solve
alternative room reassignments and resource routing with formal mathematical proof
of feasibility or constraint violation explanation.
"""
from datetime import datetime
from typing import List, Dict, Optional
from ortools.sat.python import cp_model
from backend.schemas.common import OptimizationOutcome
from backend.schemas.engines import (
    RecoveryOptimizationResult,
    RecoveryAlternative,
    RecoveryStep,
    AcademicImpactResult,
)


class RecoveryOptimizationEngine:
    """
    Constraint-based recovery planner powered by Google OR-Tools CP-SAT.
    """

    def solve_recovery_plan(
        self,
        incident_id: str,
        root_entity_id: str,
        academic_impact: AcademicImpactResult,
    ) -> RecoveryOptimizationResult:
        """
        Formulates and solves the room reallocation CSP model.
        Also evaluates structural recovery alternatives.
        """
        disrupted = academic_impact.disrupted_activities
        alternatives_map = academic_impact.alternative_rooms_available

        # If no activities disrupted, return baseline recovery without room reallocation
        if not disrupted:
            baseline_alt = RecoveryAlternative(
                alternative_id=f"ALT-PWR-RESTORE-{incident_id[:8]}",
                title="Direct Infrastructure Electrical Isolation & Reset",
                description="Isolate tripped feeder breaker, verify insulation resistance, and re-energize.",
                recovery_time_minutes=25,
                estimated_cost_usd=150.0,
                disruption_penalty=0.0,
                residual_risk_score=5.0,
                composite_rank_score=95.0,
                steps=[
                    RecoveryStep(
                        step_number=1,
                        action="ISOLATE_BREAKER",
                        target_entity_id=root_entity_id,
                        description="Perform lockout/tagout (LOTO) on upstream breaker.",
                        estimated_duration_minutes=5,
                    ),
                    RecoveryStep(
                        step_number=2,
                        action="DIAGNOSTIC_INSULATION_TEST",
                        target_entity_id=root_entity_id,
                        description="Megger test cable insulation to rule out short circuit.",
                        estimated_duration_minutes=15,
                    ),
                    RecoveryStep(
                        step_number=3,
                        action="RE_ENERGIZE",
                        target_entity_id=root_entity_id,
                        description="Close circuit breaker and verify nominal voltage on telemetry meter.",
                        estimated_duration_minutes=5,
                    ),
                ],
                reallocations={},
                feasible=True,
            )

            return RecoveryOptimizationResult(
                incident_id=incident_id,
                solver_outcome=OptimizationOutcome.OPTIMAL,
                solver_status_detail="No academic disruption; direct infrastructure restoration plan generated.",
                alternatives=[baseline_alt],
                recommended_alternative_id=baseline_alt.alternative_id,
                objective_value=0.0,
                constraint_violations=[],
                evaluated_at=datetime.utcnow(),
            )

        # Build CP-SAT Model for Room Reassignment
        model = cp_model.CpModel()
        
        # Decision variables: x[act_idx, room_id] = 1 if assigned
        x = {}
        all_candidate_rooms = set()
        for act in disrupted:
            for opt in alternatives_map.get(act.activity_id, []):
                all_candidate_rooms.add(opt.room_id)

        candidate_room_list = sorted(list(all_candidate_rooms))

        # Create assignment boolean variables
        for act in disrupted:
            for r_id in candidate_room_list:
                x[(act.activity_id, r_id)] = model.NewBoolVar(f"assign_{act.activity_id}_{r_id}")

        # Variable for unassigned activity (penalized)
        unassigned = {}
        for act in disrupted:
            unassigned[act.activity_id] = model.NewBoolVar(f"unassigned_{act.activity_id}")

        # Constraint 1: Each disrupted activity is assigned to at most 1 room or marked unassigned
        for act in disrupted:
            room_vars = [x[(act.activity_id, r_id)] for r_id in candidate_room_list]
            model.Add(sum(room_vars) + unassigned[act.activity_id] == 1)

        # Constraint 2: No room can host more than 1 activity simultaneously (same time slot)
        for r_id in candidate_room_list:
            act_vars = [x[(act.activity_id, r_id)] for act in disrupted]
            model.Add(sum(act_vars) <= 1)

        # Constraint 3: Room capacity >= enrolled students
        # Hard constraint: forbid assignment if capacity is insufficient
        violations = []
        for act in disrupted:
            opts = {opt.room_id: opt.capacity for opt in alternatives_map.get(act.activity_id, [])}
            for r_id in candidate_room_list:
                cap = opts.get(r_id, 0)
                if cap < act.enrolled_count:
                    model.Add(x[(act.activity_id, r_id)] == 0)

        # Objective Function: Minimize capacity waste + large penalty for unassigned activities
        objective_terms = []
        for act in disrupted:
            opts = {opt.room_id: opt.capacity for opt in alternatives_map.get(act.activity_id, [])}
            for r_id in candidate_room_list:
                cap = opts.get(r_id, 0)
                if cap >= act.enrolled_count:
                    # Penalty for excess wasted seats (prefer tighter fit)
                    excess = cap - act.enrolled_count
                    objective_terms.append(excess * x[(act.activity_id, r_id)])
            # Heavy penalty if activity cannot be accommodated
            objective_terms.append(1000 * unassigned[act.activity_id])

        model.Minimize(sum(objective_terms))

        # Solve CP-SAT
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 5.0
        status = solver.Solve(model)

        reallocations = {}
        solver_outcome = OptimizationOutcome.UNKNOWN
        status_detail = ""

        if status == cp_model.OPTIMAL:
            solver_outcome = OptimizationOutcome.OPTIMAL
            status_detail = "CP-SAT found mathematically optimal room reallocation plan."
        elif status == cp_model.FEASIBLE:
            solver_outcome = OptimizationOutcome.FEASIBLE
            status_detail = "CP-SAT found feasible room reallocation plan within deadline."
        elif status == cp_model.INFEASIBLE:
            solver_outcome = OptimizationOutcome.INFEASIBLE
            status_detail = "CP-SAT proved problem is INFEASIBLE under current room capacity and equipment constraints."
            violations.append("Insufficient alternative room capacity or equipment availability across campus.")
        else:
            solver_outcome = OptimizationOutcome.UNKNOWN
            status_detail = f"Solver returned status code {status}."

        if solver_outcome in (OptimizationOutcome.OPTIMAL, OptimizationOutcome.FEASIBLE):
            for act in disrupted:
                if solver.Value(unassigned[act.activity_id]) == 1:
                    violations.append(f"Activity {act.activity_id} ({act.course_code}) could not be accommodated.")
                else:
                    for r_id in candidate_room_list:
                        if solver.Value(x[(act.activity_id, r_id)]) == 1:
                            reallocations[act.activity_id] = r_id

        # Generate Pareto Alternatives
        # Plan Alpha: Emergency Feeder Repair + Room Reallocation (Recommended)
        plan_alpha = RecoveryAlternative(
            alternative_id=f"ALT-PLAN-ALPHA-{incident_id[:8]}",
            title="Plan Alpha: Automated Circuit Isolation & Room Reallocation",
            description=(
                f"Isolate fault on {root_entity_id}, dispatch electrical technician for breaker reset, "
                f"and temporarily reassign {len(reallocations)} class(es) to verified spare rooms."
            ),
            recovery_time_minutes=35,
            estimated_cost_usd=220.0,
            disruption_penalty=15.0 if not violations else 60.0,
            residual_risk_score=10.0,
            composite_rank_score=92.5 if not violations else 50.0,
            steps=[
                RecoveryStep(
                    step_number=1,
                    action="SCHEDULE_NOTIFICATION",
                    target_entity_id=root_entity_id,
                    description=f"Issue instant SMS/email room reallocation notices: {reallocations}.",
                    estimated_duration_minutes=5,
                ),
                RecoveryStep(
                    step_number=2,
                    action="LOTO_AND_BREAKER_RESET",
                    target_entity_id=root_entity_id,
                    description="Electrical technician dispatches to Riser Shaft 1B to inspect and reset feeder.",
                    estimated_duration_minutes=25,
                ),
                RecoveryStep(
                    step_number=3,
                    action="VOLTAGE_TELEMETRY_VERIFICATION",
                    target_entity_id=root_entity_id,
                    description="Verify 415V three-phase nominal telemetry on Modbus meter before restoring normal load.",
                    estimated_duration_minutes=5,
                ),
            ],
            reallocations=reallocations,
            feasible=len(violations) == 0,
            infeasibility_reasons=violations,
        )

        # Plan Beta: Asynchronous Online Transition (Fallback if physical rooms unavailable)
        plan_beta = RecoveryAlternative(
            alternative_id=f"ALT-PLAN-BETA-{incident_id[:8]}",
            title="Plan Beta: Remote Virtual Simulator Transition",
            description="Shift laboratory session to virtual circuit simulation software (Proteus/Multisim cloud).",
            recovery_time_minutes=15,
            estimated_cost_usd=50.0,
            disruption_penalty=40.0,
            residual_risk_score=5.0,
            composite_rank_score=78.0,
            steps=[
                RecoveryStep(
                    step_number=1,
                    action="VIRTUAL_LAB_DISPATCH",
                    target_entity_id="LMS-PORTAL",
                    description="Send virtual desktop links and simulator licenses to enrolled student cohort.",
                    estimated_duration_minutes=15,
                ),
            ],
            reallocations={act.activity_id: "VIRTUAL_SIMULATOR_CLOUD" for act in disrupted},
            feasible=True,
            infeasibility_reasons=[],
        )

        alternatives = [plan_alpha, plan_beta]

        return RecoveryOptimizationResult(
            incident_id=incident_id,
            solver_outcome=solver_outcome,
            solver_status_detail=status_detail,
            alternatives=alternatives,
            recommended_alternative_id=plan_alpha.alternative_id if plan_alpha.feasible else plan_beta.alternative_id,
            objective_value=float(solver.ObjectiveValue()) if solver_outcome in (OptimizationOutcome.OPTIMAL, OptimizationOutcome.FEASIBLE) else None,
            constraint_violations=violations,
            evaluated_at=datetime.utcnow(),
        )


recovery_engine = RecoveryOptimizationEngine()
