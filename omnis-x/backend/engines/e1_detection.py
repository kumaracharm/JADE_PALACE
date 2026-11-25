"""
Engine 1: Event and Anomaly Detection.
Performs deterministic threshold checking, EWMA statistical drift analysis,
source provenance validation, and sliding-window event deduplication.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Tuple
import math
from backend.schemas.common import ProvenanceSourceType
from backend.schemas.event import TelemetryEventCreate
from backend.schemas.engines import DetectionResult, DetectionEvidence

# Known metric operational thresholds (nominal, min_warning, max_warning, min_critical, max_critical)
METRIC_THRESHOLDS = {
    "voltage_v": {"min_critical": 360.0, "min_warning": 390.0, "nominal": 415.0, "max_warning": 435.0, "max_critical": 450.0},
    "current_a": {"max_warning": 350.0, "max_critical": 400.0, "nominal": 150.0},
    "active_power_kw": {"max_warning": 160.0, "max_critical": 180.0, "nominal": 80.0},
    "temperature_c": {"max_warning": 45.0, "max_critical": 60.0, "nominal": 24.0},
    "network_latency_ms": {"max_warning": 50.0, "max_critical": 150.0, "nominal": 5.0},
    "packet_loss_pct": {"max_warning": 2.0, "max_critical": 10.0, "nominal": 0.0},
}


class AnomalyDetectionEngine:
    """
    Deterministic telemetry event validator and anomaly detection engine.
    """

    def __init__(self, ewma_alpha: float = 0.2, ewma_z_threshold: float = 3.0):
        self.ewma_alpha = ewma_alpha
        self.ewma_z_threshold = ewma_z_threshold
        # In-memory tracking for EWMA state: (entity_id, metric) -> (mean, variance)
        self._ewma_state: Dict[Tuple[str, str], Tuple[float, float]] = {}
        # Sliding window for deduplication: event_id -> timestamp
        self._recent_events: Dict[str, datetime] = {}

    def is_duplicate(self, event_id: Optional[str], window_seconds: int = 300) -> bool:
        """Checks whether event_id was observed within sliding window."""
        if not event_id:
            return False
        now = datetime.utcnow()
        # Clean expired events
        expired = [eid for eid, t in self._recent_events.items() if (now - t).total_seconds() > window_seconds]
        for eid in expired:
            del self._recent_events[eid]

        if event_id in self._recent_events:
            return True
        self._recent_events[event_id] = now
        return False

    def validate_event(self, event: TelemetryEventCreate) -> Tuple[bool, Optional[str]]:
        """Validates payload sanity, timestamp plausibility, and provenance source."""
        now = datetime.utcnow()
        if event.timestamp > now + timedelta(minutes=5):
            return False, "Future timestamp exceeds allowed clock drift (5 min)"
        if event.timestamp < now - timedelta(days=30):
            return False, "Timestamp older than maximum historical ingestion window (30 days)"
        if math.isnan(event.value) or math.isinf(event.value):
            return False, "Telemetry value is NaN or Inf"
        if not event.entity_id or not event.metric_name:
            return False, "Entity ID and metric name cannot be empty"
        return True, None

    def evaluate_thresholds(self, metric_name: str, value: float) -> Tuple[bool, Optional[str], Optional[DetectionEvidence]]:
        """Evaluates value against static engineering thresholds."""
        thresholds = METRIC_THRESHOLDS.get(metric_name.lower())
        if not thresholds:
            return False, None, None

        min_crit = thresholds.get("min_critical")
        max_crit = thresholds.get("max_critical")
        min_warn = thresholds.get("min_warning")
        max_warn = thresholds.get("max_warning")
        nominal = thresholds.get("nominal", 0.0)

        if min_crit is not None and value <= min_crit:
            ev = DetectionEvidence(
                metric_name=metric_name,
                observed_value=value,
                expected_value=nominal,
                threshold=min_crit,
                deviation=round(value - nominal, 2),
                detection_method="CRITICAL_LOW_THRESHOLD",
            )
            return True, "CRITICAL_LOW_THRESHOLD_BREACH", ev

        if max_crit is not None and value >= max_crit:
            ev = DetectionEvidence(
                metric_name=metric_name,
                observed_value=value,
                expected_value=nominal,
                threshold=max_crit,
                deviation=round(value - nominal, 2),
                detection_method="CRITICAL_HIGH_THRESHOLD",
            )
            return True, "CRITICAL_HIGH_THRESHOLD_BREACH", ev

        if min_warn is not None and value <= min_warn:
            ev = DetectionEvidence(
                metric_name=metric_name,
                observed_value=value,
                expected_value=nominal,
                threshold=min_warn,
                deviation=round(value - nominal, 2),
                detection_method="WARNING_LOW_THRESHOLD",
            )
            return True, "WARNING_LOW_THRESHOLD_BREACH", ev

        if max_warn is not None and value >= max_warn:
            ev = DetectionEvidence(
                metric_name=metric_name,
                observed_value=value,
                expected_value=nominal,
                threshold=max_warn,
                deviation=round(value - nominal, 2),
                detection_method="WARNING_HIGH_THRESHOLD",
            )
            return True, "WARNING_HIGH_THRESHOLD_BREACH", ev

        return False, None, None

    def evaluate_ewma(self, entity_id: str, metric_name: str, value: float) -> Tuple[bool, Optional[DetectionEvidence]]:
        """Updates EWMA statistics and checks for multi-sigma variance drift."""
        key = (entity_id, metric_name)
        if key not in self._ewma_state:
            # Initialize with first observation
            self._ewma_state[key] = (value, 1.0)
            return False, None

        mean, variance = self._ewma_state[key]
        std_dev = math.sqrt(variance) if variance > 0 else 1.0
        delta = value - mean
        z_score = abs(delta) / std_dev if std_dev > 0.0001 else 0.0

        # Update EWMA mean and variance
        new_mean = (1 - self.ewma_alpha) * mean + self.ewma_alpha * value
        new_variance = (1 - self.ewma_alpha) * variance + self.ewma_alpha * (delta ** 2)
        self._ewma_state[key] = (new_mean, max(new_variance, 0.01))

        if z_score >= self.ewma_z_threshold:
            ev = DetectionEvidence(
                metric_name=metric_name,
                observed_value=value,
                expected_value=round(mean, 2),
                threshold=round(mean + self.ewma_z_threshold * std_dev, 2),
                deviation=round(delta, 2),
                detection_method=f"EWMA_Z_SCORE_{round(z_score, 1)}",
            )
            return True, ev

        return False, None

    def analyze_event(self, event: TelemetryEventCreate) -> DetectionResult:
        """
        Processes an incoming telemetry event through validation, dedup,
        threshold detection, and EWMA drift detection.
        """
        event_id = event.event_id or f"EVT-{event.entity_id}-{int(datetime.utcnow().timestamp()*1000)}"

        # 1. Validation
        valid, err = self.validate_event(event)
        if not valid:
            return DetectionResult(
                event_id=event_id,
                entity_id=event.entity_id,
                is_anomaly=False,
                confidence=0.0,
                provenance_source=event.source_type,
                validation_passed=False,
                validation_error=err,
            )

        # 2. Deduplication check
        if self.is_duplicate(event.event_id):
            return DetectionResult(
                event_id=event_id,
                entity_id=event.entity_id,
                is_anomaly=False,
                confidence=1.0,
                provenance_source=event.source_type,
                is_duplicate=True,
                validation_passed=True,
                validation_error="Duplicate event suppressed within sliding window",
            )

        evidence_list = []
        is_anomaly = False
        anomaly_type = None

        # 3. Threshold Analysis
        thresh_anomaly, thresh_type, thresh_ev = self.evaluate_thresholds(event.metric_name, event.value)
        if thresh_anomaly and thresh_ev:
            is_anomaly = True
            anomaly_type = thresh_type
            evidence_list.append(thresh_ev)

        # 4. EWMA Drift Analysis
        ewma_anomaly, ewma_ev = self.evaluate_ewma(event.entity_id, event.metric_name, event.value)
        if ewma_anomaly and ewma_ev:
            is_anomaly = True
            anomaly_type = anomaly_type or "STATISTICAL_EWMA_DRIFT"
            evidence_list.append(ewma_ev)

        # Confidence based on provenance source and data quality
        source_confidence = {
            ProvenanceSourceType.REAL: 1.0,
            ProvenanceSourceType.SYNTHETIC: 0.85,
            ProvenanceSourceType.ESTIMATED: 0.65,
            ProvenanceSourceType.REPORTED: 0.50,
        }.get(event.source_type, 0.5)

        overall_confidence = round(source_confidence * event.quality, 2)

        return DetectionResult(
            event_id=event_id,
            entity_id=event.entity_id,
            is_anomaly=is_anomaly,
            anomaly_type=anomaly_type,
            confidence=overall_confidence,
            provenance_source=event.source_type,
            evidence=evidence_list,
            validation_passed=True,
        )


detection_engine = AnomalyDetectionEngine()
