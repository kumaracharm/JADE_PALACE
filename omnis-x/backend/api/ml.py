"""
ML Lab Live Inference and Model Management API Endpoints.
Connects trained ML resilience models to the real-time event pipeline.
"""
import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from backend.security.auth import get_current_user
from backend.models.user import UserModel

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ML_LAB_DIR = os.path.join(BASE_DIR, "ml_lab")
MODELS_DIR = os.path.join(ML_LAB_DIR, "models")
REPORTS_DIR = os.path.join(ML_LAB_DIR, "reports")

# Model registry map
MODEL_FILES = {
    "equipment_failure": "equipment_failure_model.joblib",
    "it_infrastructure": "it_anomaly_model.joblib",
    "transport_delay": "transport_delay_model.joblib",
    "electrical_grid": "electrical_anomaly_model.joblib",
}

# Cache loaded artifacts
_LOADED_MODELS: Dict[str, Any] = {}


def _get_model(model_key: str):
    if model_key not in MODEL_FILES:
        raise HTTPException(status_code=400, detail=f"Unknown model key '{model_key}'. Valid: {list(MODEL_FILES.keys())}")
    
    if model_key not in _LOADED_MODELS:
        file_path = os.path.join(MODELS_DIR, MODEL_FILES[model_key])
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Model artifact not found at {file_path}")
        _LOADED_MODELS[model_key] = joblib.load(file_path)
    
    return _LOADED_MODELS[model_key]


class PredictRequest(BaseModel):
    model_type: str = Field(..., description="equipment_failure, it_infrastructure, transport_delay, or electrical_grid")
    entity_id: Optional[str] = Field(None, description="Target campus twin entity id")
    features: Dict[str, float] = Field(..., description="Dictionary of input feature values")


class PredictResponse(BaseModel):
    model_type: str
    target_entity_id: Optional[str]
    prediction: Any
    confidence: Optional[float] = None
    class_probabilities: Optional[Dict[str, float]] = None
    features_used: List[str]
    provenance: str = "SYNTHETIC DEMONSTRATION"
    model_version: str = "1.0.0"
    evaluation_metric: Optional[str] = None


@router.get("/models")
def list_models():
    """
    Lists metadata, algorithms, input features, and evaluation metrics for all 4 trained models.
    """
    summary_path = os.path.join(REPORTS_DIR, "model_metrics.json")
    metrics_data = {}
    if os.path.exists(summary_path):
        import json
        with open(summary_path, "r") as f:
            metrics_data = json.load(f)

    models_info = []
    for key, filename in MODEL_FILES.items():
        artifact = _get_model(key)
        meta = artifact.get("metadata", {})
        models_info.append({
            "model_key": key,
            "filename": filename,
            "model_type": meta.get("type", "Unknown"),
            "features": artifact.get("features", []),
            "target": meta.get("target", "target"),
            "classes": [str(c) for c in artifact.get("classes", [])] if "classes" in artifact else None,
            "metrics": metrics_data.get("models", {}).get(key)
            or metrics_data.get("models", {}).get(key.replace("grid", "infrastructure"))
            or {},
        })

    return {
        "status": "READY",
        "total_models": len(models_info),
        "models": models_info,
    }


@router.post("/predict", response_model=PredictResponse)
def run_prediction(req: PredictRequest):
    """
    Executes live model inference for a single entity feature payload.
    Enforces schema validation, handles missing features with nominal defaults,
    and returns probabilities and prediction provenance.
    """
    artifact = _get_model(req.model_type)
    model = artifact["model"]
    expected_features = artifact["features"]

    # Fill missing features with defaults
    input_row = {}
    for f in expected_features:
        if f in req.features:
            input_row[f] = float(req.features[f])
        else:
            input_row[f] = 0.0

    df = pd.DataFrame([input_row])[expected_features]

    # Run inference
    pred = model.predict(df)[0]
    confidence = None
    class_probs = None

    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(df)[0]
        confidence = float(np.max(probs))
        classes = [str(c) for c in model.classes_]
        class_probs = {cls_name: round(float(p), 4) for cls_name, p in zip(classes, probs)}

    # Convert numpy types to python types for clean json serialization
    if isinstance(pred, (np.integer, np.floating)):
        pred = float(pred)
    elif isinstance(pred, np.ndarray):
        pred = pred.tolist()
    else:
        pred = str(pred)

    return PredictResponse(
        model_type=req.model_type,
        target_entity_id=req.entity_id,
        prediction=pred,
        confidence=round(confidence, 4) if confidence is not None else None,
        class_probabilities=class_probs,
        features_used=expected_features,
        provenance="SYNTHETIC DEMONSTRATION",
        model_version="1.0.0",
        evaluation_metric="Stratified Holdout Evaluation",
    )
