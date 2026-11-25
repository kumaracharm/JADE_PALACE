"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  Clock,
  UserCheck,
  Building,
  GraduationCap,
  Wrench,
  FileText,
  ExternalLink,
} from "lucide-react";
import { PersonaProfile, KUNG_FU_PANDA_PERSONAS } from "../profile/KungFuPandaProfile";

interface RoleDemoWorkflowProps {
  onNavigateToTwin?: (entityId?: string) => void;
  onNavigateToResponse?: (incidentId?: string) => void;
  onWorkflowIncidentCreated?: (incidentId: string) => void;
}

export function RoleDemoWorkflow({
  onNavigateToTwin,
  onNavigateToResponse,
  onWorkflowIncidentCreated,
}: RoleDemoWorkflowProps) {
  const [activeStep, setActiveStep] = useState<"student" | "hod" | "faculty">("student");

  // Demonstration State
  const [incidentId, setIncidentId] = useState<string>("INC-ELE-CR101");
  const [selectedBuilding, setSelectedBuilding] = useState("Engineering Block");
  const [selectedFloor, setSelectedFloor] = useState("Level 1 (Research Labs)");
  const [selectedRoom, setSelectedRoom] = useState("CR-101 (Classroom 101)");
  const [category, setCategory] = useState("Electrical / Power");
  const [description, setDescription] = useState(
    "Electrical line issue reported near this classroom. Please inspect the affected area."
  );
  const [evidencePhoto, setEvidencePhoto] = useState("/pfp/CRANE.jpeg");
  const [studentSubmitted, setStudentSubmitted] = useState(false);

  // HOD State
  const [academicImpactNote, setAcademicImpactNote] = useState(
    "Occupied classroom electrical hazard. Relocating session to prevent instructional downtime."
  );
  const [allocatedRoom, setAllocatedRoom] = useState("CR-201 (Level 2 - Cleanroom Adjacent)");
  const [hodReviewed, setHodReviewed] = useState(false);

  // Faculty State
  const [facultyNote, setFacultyNote] = useState(
    "Students notified of relocation to CR-201. Awaiting facility team technical clearance."
  );
  const [facultyAcknowledged, setFacultyAcknowledged] = useState(false);

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);

  const studentPersona = KUNG_FU_PANDA_PERSONAS.find((p) => p.id === "po")!;
  const hodPersona = KUNG_FU_PANDA_PERSONAS.find((p) => p.id === "shifu")!;
  const facultyPersona = KUNG_FU_PANDA_PERSONAS.find((p) => p.id === "viper")!;

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: "Electrical Line Issue Near CR-101",
        description: description,
        root_entity_id: "CR-101",
        priority: "HIGH",
        metadata_json: {
          building: selectedBuilding,
          floor: selectedFloor,
          room: selectedRoom,
          category: category,
          photo_url: evidencePhoto,
          course_code: "EE-302",
          course_title: "Microcontrollers & Embedded Systems",
          student_count: 42,
          reported_by: studentPersona.characterName,
        },
      };

      const res = await fetch("http://127.0.0.1:8000/api/v1/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setIncidentId(data.incident_id || "INC-ELE-CR101");
        if (onWorkflowIncidentCreated) onWorkflowIncidentCreated(data.incident_id || "INC-ELE-CR101");
      }
    } catch {
      // Local demo fallback
    } finally {
      setIsSubmitting(false);
      setStudentSubmitted(true);
      setActiveStep("hod");
    }
  };

  const handleHodReview = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`http://127.0.0.1:8000/api/v1/incidents/${incidentId}/workflow-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "HOD_REVIEW",
          note: academicImpactNote,
          alternative_room: allocatedRoom,
        }),
      });
    } catch {
      // Demo fallback
    } finally {
      setIsSubmitting(false);
      setHodReviewed(true);
      setActiveStep("faculty");
    }
  };

  const handleFacultyAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`http://127.0.0.1:8000/api/v1/incidents/${incidentId}/workflow-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "FACULTY_COORDINATION",
          note: facultyNote,
          acknowledged: true,
          clearance_requested: true,
        }),
      });
    } catch {
      // Demo fallback
    } finally {
      setIsSubmitting(false);
      setFacultyAcknowledged(true);
    }
  };

  return (
    <div className="w-full bg-[#0D121F] border border-[#1E293B] rounded-xl p-5 font-mono select-none">
      {/* Workflow Step Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E293B] gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Classroom Role Workflow: Student → HOD → Faculty
            </h3>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">
            Scenario: Electrical line issue reported near occupied classroom CR-101 during lecture session
          </p>
        </div>

        {/* Step Tabs */}
        <div className="flex items-center space-x-1.5 p-1 rounded-lg bg-[#080D1A] border border-[#1E293B]">
          <button
            onClick={() => setActiveStep("student")}
            className={`px-3 py-1 rounded text-xs transition-all flex items-center space-x-1.5 ${
              activeStep === "student"
                ? "bg-[#D4AF37] text-[#0A0F1D] font-bold shadow"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px]">1</span>
            <span>Student (Po)</span>
          </button>

          <button
            onClick={() => setActiveStep("hod")}
            className={`px-3 py-1 rounded text-xs transition-all flex items-center space-x-1.5 ${
              activeStep === "hod"
                ? "bg-[#D4AF37] text-[#0A0F1D] font-bold shadow"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px]">2</span>
            <span>HOD (Shifu)</span>
          </button>

          <button
            onClick={() => setActiveStep("faculty")}
            className={`px-3 py-1 rounded text-xs transition-all flex items-center space-x-1.5 ${
              activeStep === "faculty"
                ? "bg-[#D4AF37] text-[#0A0F1D] font-bold shadow"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px]">3</span>
            <span>Faculty (Viper)</span>
          </button>
        </div>
      </div>

      {/* STEP 1: STUDENT REPORTING (DEMONSTRATION A) */}
      {activeStep === "student" && (
        <div className="pt-4 space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#141C2E] border border-[#233554]">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/50 flex-shrink-0">
              <img src={studentPersona.photoUrl} alt={studentPersona.characterName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>{studentPersona.characterName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  STUDENT PORTAL
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8]">
                Identity: {studentPersona.userId} • Department: Computer Science & Robotics
              </p>
            </div>
          </div>

          <form onSubmit={handleStudentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
                  1. Campus Building
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedBuilding}
                  className="w-full px-3 py-1.5 rounded bg-[#090D1A] border border-[#1E293B] text-xs text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
                  2. Floor & Spatial Level
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedFloor}
                  className="w-full px-3 py-1.5 rounded bg-[#090D1A] border border-[#1E293B] text-xs text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
                  3. Impacted Classroom / Lab
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedRoom}
                  className="w-full px-3 py-1.5 rounded bg-[#090D1A] border border-[#D4AF37]/60 text-xs text-[#F5D061] font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
                  4. Incident Category
                </label>
                <input
                  type="text"
                  readOnly
                  value={category}
                  className="w-full px-3 py-1.5 rounded bg-[#090D1A] border border-[#1E293B] text-xs text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
                  5. Supporting Photographic Evidence (Uploaded)
                </label>
                <div className="flex items-center space-x-3 p-2 rounded-lg bg-[#090D1A] border border-[#1E293B]">
                  <div className="w-14 h-14 rounded overflow-hidden border border-[#D4AF37]/40 flex-shrink-0">
                    <img src={evidencePhoto} alt="Evidence" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    <span className="font-bold text-white block">evidence_electrical_arc_cr101.png</span>
                    <span>14.6 KB • Cryptographic SHA-256 Verified</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
                  6. Student Description / Observations
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded bg-[#090D1A] border border-[#1E293B] focus:border-[#D4AF37] text-xs text-white resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B8942A] hover:from-[#F5D061] hover:to-[#D4AF37] text-[#0A0E1A] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
              >
                <span>{studentSubmitted ? "Update Incident Report" : "Submit Student Incident Report"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: HOD REVIEW (DEMONSTRATION B) */}
      {activeStep === "hod" && (
        <div className="pt-4 space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#1F1914] border border-[#42311C]">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/50 flex-shrink-0">
              <img src={hodPersona.photoUrl} alt={hodPersona.characterName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>{hodPersona.characterName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  HOD ACADEMIC COORDINATOR
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8]">
                Identity: {hodPersona.userId} • Scope: ECE Academic Wing Timetables
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 p-3 rounded-lg bg-[#090D1A] border border-[#1E293B]">
              <div className="text-xs font-bold text-[#F5D061] flex items-center justify-between pb-2 border-b border-[#1E293B]">
                <span>Triage Target: {incidentId}</span>
                <span className="text-[10px] text-emerald-400">ACTIVE REPORT</span>
              </div>

              <div className="flex items-center space-x-3">
                <img src={evidencePhoto} alt="Triage Evidence" className="w-16 h-16 rounded object-cover border border-amber-500/30" />
                <div className="text-[11px] text-slate-300 space-y-1">
                  <div><strong className="text-slate-400">Location:</strong> CR-101 (Level 1)</div>
                  <div><strong className="text-slate-400">Class In Session:</strong> EE-302 Microcontrollers</div>
                  <div><strong className="text-slate-400">Enrolled Students:</strong> 42 registered</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 p-2 rounded bg-[#0D1322] border border-[#1E293B]">
                &quot;{description}&quot;
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
                  Academic Impact Assessment
                </label>
                <textarea
                  value={academicImpactNote}
                  onChange={(e) => setAcademicImpactNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 rounded bg-[#090D1A] border border-[#1E293B] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
                  Timetable-Conflict Solver: Recommended Alternative Classroom
                </label>
                <input
                  type="text"
                  value={allocatedRoom}
                  onChange={(e) => setAllocatedRoom(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#090D1A] border border-amber-500/50 text-xs text-[#F5D061] font-bold"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">
                  Capacity: 45 seats • Conflict-free slot (10:00 - 12:00) verified against SIS database.
                </span>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={handleHodReview}
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{hodReviewed ? "HOD Review Recorded" : "Approve Relocation & Escalate"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: FACULTY COORDINATION (DEMONSTRATION C) */}
      {activeStep === "faculty" && (
        <div className="pt-4 space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#0E1A1A] border border-[#1A3838]">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-teal-500/50 flex-shrink-0 bg-slate-800 flex items-center justify-center text-white font-bold">
              {facultyPersona.initials}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>{facultyPersona.characterName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  ASSIGNED FACULTY
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8]">
                Identity: {facultyPersona.userId} • Dept of Electrical Engineering
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#090D1A] border border-[#1E293B] space-y-3">
            <div className="p-3 rounded bg-[#131D2E] border-l-4 border-amber-500 text-xs text-slate-300">
              <strong className="text-white block mb-1">Incoming HOD Task Directive:</strong>
              &quot;Please coordinate with the assigned facility team regarding the reported electrical issue in this classroom. Verify classroom availability before conducting the scheduled session.&quot;
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
              <div>
                <span className="text-slate-500 block text-[10px]">CURRENT ASSIGNED TASK</span>
                <span className="font-bold text-white">EE-302 Relocation to {allocatedRoom}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">FACILITY ACTION SQUAD</span>
                <span className="font-bold text-amber-400">Master Tigress (Facility) & Master Mantis (Tech)</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
                Faculty Progress Note & Technical Clearance Request
              </label>
              <textarea
                value={facultyNote}
                onChange={(e) => setFacultyNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 rounded bg-[#0E1424] border border-[#1E293B] focus:border-teal-500 text-xs text-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[10px] text-slate-500">
                Notice: Technical electrical breaker resets require authorized Facility Manager sign-off.
              </span>

              <button
                type="button"
                onClick={handleFacultyAcknowledge}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase transition-all flex items-center justify-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>{facultyAcknowledged ? "Acknowledged & Dispatched" : "Acknowledge & Request Clearance"}</span>
              </button>
            </div>

            {facultyAcknowledged && (
              <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800 text-[11px] text-emerald-300 flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Workflow synchronized across shared backend! Students notified, class relocated to CR-201, and work order queued for Facility Directorate.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
