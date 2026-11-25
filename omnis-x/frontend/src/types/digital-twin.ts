/**
 * OMNIS-X Cyber-Physical Digital Twin Data Contracts & Types.
 * Matches backend Pydantic schemas and database models.
 */

export type OperationalStatus = 
  | "OPERATIONAL"
  | "DEGRADED"
  | "FAILED"
  | "OFFLINE"
  | "MAINTENANCE";

export type CriticalityLevel = 
  | "MISSION_CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type EntityType = 
  | "CAMPUS"
  | "BUILDING"
  | "FLOOR"
  | "ROOM"
  | "LABORATORY"
  | "CLASSROOM"
  | "LECTURE_HALL"
  | "DATA_CENTRE"
  | "SUBSTATION"
  | "GENERATOR"
  | "TRANSFORMER"
  | "DISTRIBUTION_PANEL"
  | "FEEDER"
  | "UPS"
  | "CHILLER"
  | "AHU"
  | "WORKSTATION"
  | "GPU_CLUSTER"
  | "SWITCH_CORE"
  | "SWITCH_MDF"
  | "SWITCH_IDF"
  | "PROJECTOR"
  | "POWER_METER"
  | "ACADEMIC_ACTIVITY"
  | "FACULTY"
  | "STUDENT_SECTION";

export type RelationshipType = 
  | "SUPPLIES_POWER_TO"
  | "CONNECTED_TO_NETWORK"
  | "CONTAINS"
  | "LOCATED_IN"
  | "USES_EQUIPMENT"
  | "ASSIGNED_TO_ROOM"
  | "TAUGHT_BY"
  | "ATTENDED_BY"
  | "MAINTAINED_BY"
  | "BACKED_UP_BY";

export type ProvenanceSourceType = 
  | "REAL"
  | "SYNTHETIC"
  | "REPORTED"
  | "STUDENT_REPORTED"
  | "ESTIMATED";

export interface CampusEntity {
  entity_id: string;
  entity_type: EntityType;
  name: string;
  description: string;
  parent_entity_id: string | null;
  location: string;
  criticality: CriticalityLevel;
  operational_status: OperationalStatus;
  metadata_json: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface OperationalState {
  entity_id: string;
  current_status: OperationalStatus;
  health_score: number;
  active_incident_count: number;
  degraded_dependencies_count?: number;
  last_evaluated?: string;
}

export interface EntityRelationship {
  relationship_id: string;
  source_id: string;
  target_id: string;
  relationship_type: RelationshipType;
  is_essential: boolean;
  redundancy_available: boolean;
  dependency_strength: number;
  propagation_policy: string;
  metadata_json: Record<string, any>;
}

export interface TelemetryEvent {
  id?: number;
  event_id: string;
  entity_id: string;
  metric_name: string;
  value: number;
  unit: string;
  timestamp: string;
  source_type: ProvenanceSourceType;
  source_id: string;
  quality: number;
  raw_payload?: Record<string, any>;
}

export interface Incident {
  incident_id: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "DETECTED" | "ANALYZING" | "RECOMMENDATION_READY" | "AWAITING_APPROVAL" | "APPROVED" | "EXECUTING" | "RESOLVED" | "VERIFIED" | "REJECTED";
  root_cause_entity_id: string;
  reported_by: string;
  source_type: ProvenanceSourceType;
  created_at: string;
  updated_at?: string;
  affected_entities?: string[];
  recommendations?: any[];
  work_orders?: any[];
}

export interface WorkOrder {
  work_order_id: string;
  incident_id: string;
  title: string;
  description: string;
  department: string;
  assigned_to_user_id: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "DISPATCHED" | "IN_PROGRESS" | "COMPLETED" | "VERIFIED" | "CANCELED";
  priority: "EMERGENCY" | "HIGH" | "MEDIUM" | "ROUTINE";
  created_at: string;
}

export interface CampusOverview {
  total_entities: number;
  operational_count: number;
  degraded_count: number;
  failed_count: number;
  campus_resilience_index: number;
  active_incident_count: number;
  system_state: "NOMINAL" | "DEGRADED" | "CRITICAL";
}

/* Spatial Models for Architectural Floor Plan */

export interface Point2D {
  x: number;
  y: number;
}

export interface SpatialRoom {
  entityId: string;
  name: string;
  code: string;
  category: "LAB" | "CLASSROOM" | "AUDITORIUM" | "FACILITY" | "CORRIDOR" | "RISER" | "DATA_CENTER";
  floorId: string; // 'FLOOR-G' | 'FLOOR-1' | 'FLOOR-2'
  polygon: Point2D[];
  labelPosition: Point2D;
  areaSqm: number;
  doors?: { x: number; y: number; width: number; angle: number }[];
  equipmentAnchors?: { entityId: string; x: number; y: number; type: EntityType }[];
}

export interface SpatialWall {
  id: string;
  points: [Point2D, Point2D];
  thickness: number;
  type: "EXTERIOR" | "INTERIOR" | "GLASS" | "PARTITION";
}

export interface SpatialEquipment {
  entityId: string;
  name: string;
  type: EntityType;
  x: number;
  y: number;
  floorId: string;
  roomId: string;
  status?: OperationalStatus;
  primaryMetric?: { name: string; value: number; unit: string };
}

export interface FloorPlanData {
  floorId: string;
  name: string;
  level: number;
  viewBox: { width: number; height: number };
  rooms: SpatialRoom[];
  walls: SpatialWall[];
  equipment: SpatialEquipment[];
}

export type ActiveLayerId = 
  | "ARCHITECTURAL"
  | "OPERATIONAL_STATUS"
  | "ELECTRICAL_GRID"
  | "NETWORK_TOPOLOGY"
  | "ENVIRONMENTAL_HEATMAP"
  | "ACADEMIC_TIMETABLE"
  | "INCIDENT_BLAST_RADIUS";
