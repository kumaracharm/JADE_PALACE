"""
OMNIS-X ML Lab — Model Training and Rigorous Evaluation Pipeline.
Trains four lightweight, interpretable machine learning models using scikit-learn:
1. Equipment Failure Prediction (RandomForestClassifier)
2. IT Anomaly Detection (HistGradientBoostingClassifier)
3. Transport Delay Forecasting (HistGradientBoostingRegressor)
4. Electrical Grid Condition Assessment (RandomForestClassifier)

Enforces zero data leakage, stratified splits, baseline comparisons,
and comprehensive metrics reporting (Accuracy, F1, ROC-AUC, MAE, RMSE, R²).
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.dummy import DummyRegressor
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
    mean_absolute_error,
    root_mean_squared_error,
    r2_score,
)
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

RANDOM_STATE = 42

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


def train_equipment_model():
    """Model A: Equipment Failure Multiclass Classification."""
    print("\n--- Training Model A: Equipment Failure Classifier ---")
    data_path = os.path.join(DATA_DIR, "equipment_failure.csv")
    df = pd.read_csv(data_path)
    
    features = [
        "temperature_c",
        "vibration_mm_s",
        "pressure_bar",
        "rotational_speed_rpm",
        "operating_hours",
        "maintenance_history",
    ]
    target = "failure_label"
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )
    
    # Baseline: Logistic Regression with Scaling
    baseline_model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=1000, random_state=RANDOM_STATE))
    ])
    baseline_model.fit(X_train, y_train)
    y_base_pred = baseline_model.predict(X_test)
    base_acc = accuracy_score(y_test, y_base_pred)
    base_f1 = f1_score(y_test, y_base_pred, average="weighted")
    
    # Primary Model: Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        class_weight="balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    y_pred = rf_model.predict(X_test)
    y_proba = rf_model.predict_proba(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=rf_model.classes_).tolist()
    
    try:
        roc_auc = roc_auc_score(y_test, y_proba, multi_class="ovr", average="weighted")
    except Exception:
        roc_auc = None
        
    model_artifact = {
        "model": rf_model,
        "features": features,
        "classes": list(rf_model.classes_),
        "metadata": {
            "type": "RandomForestClassifier",
            "task": "equipment_failure_classification",
            "provenance": "SYNTHETIC_DATA_EXPERIMENT"
        }
    }
    artifact_path = os.path.join(MODELS_DIR, "equipment_failure_model.joblib")
    joblib.dump(model_artifact, artifact_path)
    
    metrics = {
        "model_name": "RandomForestClassifier (Equipment Failure)",
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "features": features,
        "classes": list(rf_model.classes_),
        "accuracy": round(acc, 4),
        "precision_weighted": round(prec, 4),
        "recall_weighted": round(rec, 4),
        "f1_weighted": round(f1, 4),
        "roc_auc_ovr": round(roc_auc, 4) if roc_auc else None,
        "confusion_matrix": cm,
        "baseline_comparison": {
            "baseline_model": "LogisticRegression (StandardScaled)",
            "baseline_accuracy": round(base_acc, 4),
            "baseline_f1": round(base_f1, 4),
            "accuracy_delta": round(acc - base_acc, 4)
        }
    }
    
    print(f"  Train: {len(X_train)} | Test: {len(X_test)}")
    print(f"  Accuracy: {acc:.4f} (Baseline: {base_acc:.4f}) | F1: {f1:.4f} | ROC-AUC: {roc_auc:.4f}")
    return metrics


def train_it_infrastructure_model():
    """Model B: IT Infrastructure Anomaly Multiclass Classification."""
    print("\n--- Training Model B: IT Infrastructure Anomaly Classifier ---")
    data_path = os.path.join(DATA_DIR, "it_infrastructure.csv")
    df = pd.read_csv(data_path)
    
    features = [
        "cpu_usage",
        "memory_usage",
        "network_latency_ms",
        "packet_loss",
        "disk_usage",
        "request_rate",
    ]
    target = "fault_label"
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )
    
    # Baseline: Logistic Regression
    baseline_model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=1000, random_state=RANDOM_STATE))
    ])
    baseline_model.fit(X_train, y_train)
    y_base_pred = baseline_model.predict(X_test)
    base_acc = accuracy_score(y_test, y_base_pred)
    base_f1 = f1_score(y_test, y_base_pred, average="weighted")
    
    # Primary Model: Random Forest with Class Weighting
    rf_it_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        class_weight="balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    rf_it_model.fit(X_train, y_train)
    y_pred = rf_it_model.predict(X_test)
    y_proba = rf_it_model.predict_proba(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=rf_it_model.classes_).tolist()
    
    try:
        roc_auc = roc_auc_score(y_test, y_proba, multi_class="ovr", average="weighted")
    except Exception:
        roc_auc = None
        
    model_artifact = {
        "model": rf_it_model,
        "features": features,
        "classes": list(rf_it_model.classes_),
        "metadata": {
            "type": "RandomForestClassifier",
            "task": "it_anomaly_classification",
            "provenance": "SYNTHETIC_DATA_EXPERIMENT"
        }
    }
    artifact_path = os.path.join(MODELS_DIR, "it_anomaly_model.joblib")
    joblib.dump(model_artifact, artifact_path)
    
    metrics = {
        "model_name": "RandomForestClassifier (IT Anomaly)",
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "features": features,
        "classes": list(rf_it_model.classes_),
        "accuracy": round(acc, 4),
        "precision_weighted": round(prec, 4),
        "recall_weighted": round(rec, 4),
        "f1_weighted": round(f1, 4),
        "roc_auc_ovr": round(roc_auc, 4) if roc_auc else None,
        "confusion_matrix": cm,
        "baseline_comparison": {
            "baseline_model": "LogisticRegression (StandardScaled)",
            "baseline_accuracy": round(base_acc, 4),
            "baseline_f1": round(base_f1, 4),
            "accuracy_delta": round(acc - base_acc, 4)
        }
    }
    
    print(f"  Train: {len(X_train)} | Test: {len(X_test)}")
    print(f"  Accuracy: {acc:.4f} (Baseline: {base_acc:.4f}) | F1: {f1:.4f} | ROC-AUC: {roc_auc:.4f}")
    return metrics


def train_transport_model():
    """Model C: Transport Delay Regression (delay_minutes)."""
    print("\n--- Training Model C: Transport Delay Regressor ---")
    data_path = os.path.join(DATA_DIR, "transport_delay.csv")
    df = pd.read_csv(data_path)
    
    # Strictly avoid target leakage: actual_travel_time & delay_label are excluded
    features = [
        "traffic_density",
        "rainfall",
        "road_condition",
        "departure_time",
        "historical_travel_time",
    ]
    target = "delay_minutes"
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE
    )
    
    # Baseline: Dummy Regressor (Mean predictor)
    dummy = DummyRegressor(strategy="mean")
    dummy.fit(X_train, y_train)
    y_dummy_pred = dummy.predict(X_test)
    base_mae = mean_absolute_error(y_test, y_dummy_pred)
    base_rmse = root_mean_squared_error(y_test, y_dummy_pred)
    base_r2 = r2_score(y_test, y_dummy_pred)
    
    # Primary Model: HistGradientBoostingRegressor
    reg_model = HistGradientBoostingRegressor(
        max_iter=120,
        max_depth=8,
        random_state=RANDOM_STATE
    )
    reg_model.fit(X_train, y_train)
    y_pred = reg_model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = root_mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    model_artifact = {
        "model": reg_model,
        "features": features,
        "metadata": {
            "type": "HistGradientBoostingRegressor",
            "task": "transport_delay_regression",
            "provenance": "SYNTHETIC_DATA_EXPERIMENT"
        }
    }
    artifact_path = os.path.join(MODELS_DIR, "transport_delay_model.joblib")
    joblib.dump(model_artifact, artifact_path)
    
    metrics = {
        "model_name": "HistGradientBoostingRegressor (Transport Delay)",
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "features": features,
        "target": target,
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2_score": round(r2, 4),
        "baseline_comparison": {
            "baseline_model": "DummyRegressor (Mean)",
            "baseline_mae": round(base_mae, 4),
            "baseline_rmse": round(base_rmse, 4),
            "baseline_r2": round(base_r2, 4),
            "mae_reduction": round(base_mae - mae, 4),
            "r2_improvement": round(r2 - base_r2, 4)
        }
    }
    
    print(f"  Train: {len(X_train)} | Test: {len(X_test)}")
    print(f"  MAE: {mae:.4f} min (Baseline: {base_mae:.4f}) | RMSE: {rmse:.4f} min | R²: {r2:.4f}")
    return metrics


def train_electrical_model():
    """Model D: Electrical Grid Operating Condition Multiclass Classifier."""
    print("\n--- Training Model D: Electrical Grid Condition Classifier ---")
    data_path = os.path.join(DATA_DIR, "electrical_infrastructure.csv")
    df = pd.read_csv(data_path)
    
    features = [
        "voltage",
        "current",
        "power_load_kw",
        "transformer_temperature",
        "power_factor",
    ]
    target = "abnormal_condition_label"
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )
    
    # Baseline: Logistic Regression
    baseline_model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=1000, random_state=RANDOM_STATE))
    ])
    baseline_model.fit(X_train, y_train)
    y_base_pred = baseline_model.predict(X_test)
    base_acc = accuracy_score(y_test, y_base_pred)
    base_f1 = f1_score(y_test, y_base_pred, average="weighted")
    
    # Primary Model: Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        class_weight="balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    y_pred = rf_model.predict(X_test)
    y_proba = rf_model.predict_proba(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=rf_model.classes_).tolist()
    
    try:
        roc_auc = roc_auc_score(y_test, y_proba, multi_class="ovr", average="weighted")
    except Exception:
        roc_auc = None
        
    model_artifact = {
        "model": rf_model,
        "features": features,
        "classes": list(rf_model.classes_),
        "metadata": {
            "type": "RandomForestClassifier",
            "task": "electrical_grid_condition_classification",
            "provenance": "SYNTHETIC_DATA_EXPERIMENT"
        }
    }
    artifact_path = os.path.join(MODELS_DIR, "electrical_anomaly_model.joblib")
    joblib.dump(model_artifact, artifact_path)
    
    metrics = {
        "model_name": "RandomForestClassifier (Electrical Grid)",
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "features": features,
        "classes": list(rf_model.classes_),
        "accuracy": round(acc, 4),
        "precision_weighted": round(prec, 4),
        "recall_weighted": round(rec, 4),
        "f1_weighted": round(f1, 4),
        "roc_auc_ovr": round(roc_auc, 4) if roc_auc else None,
        "confusion_matrix": cm,
        "baseline_comparison": {
            "baseline_model": "LogisticRegression (StandardScaled)",
            "baseline_accuracy": round(base_acc, 4),
            "baseline_f1": round(base_f1, 4),
            "accuracy_delta": round(acc - base_acc, 4)
        }
    }
    
    print(f"  Train: {len(X_train)} | Test: {len(X_test)}")
    print(f"  Accuracy: {acc:.4f} (Baseline: {base_acc:.4f}) | F1: {f1:.4f} | ROC-AUC: {roc_auc:.4f}")
    return metrics


def main():
    print("=== OMNIS-X ML LAB: MODEL TRAINING & EVALUATION ===")
    m_eq = train_equipment_model()
    m_it = train_it_infrastructure_model()
    m_tr = train_transport_model()
    m_el = train_electrical_model()
    
    all_metrics = {
        "timestamp": pd.Timestamp.now().isoformat(),
        "evaluation_standard": "Stratified 80/20 Holdout Evaluation with Baseline Comparison",
        "models": {
            "equipment_failure": m_eq,
            "it_infrastructure": m_it,
            "transport_delay": m_tr,
            "electrical_infrastructure": m_el,
        }
    }
    
    metrics_path = os.path.join(REPORTS_DIR, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(all_metrics, f, indent=2)
    print(f"\nModel Metrics saved -> {metrics_path}")
    
    summary = {
        "status": "COMPLETED",
        "models_trained": 4,
        "summary_table": [
            {
                "model": "Equipment Failure",
                "type": "Classification",
                "algorithm": m_eq["model_name"],
                "metric_1": f"Accuracy: {m_eq['accuracy']}",
                "metric_2": f"F1-Weighted: {m_eq['f1_weighted']}",
                "metric_3": f"ROC-AUC: {m_eq['roc_auc_ovr']}",
            },
            {
                "model": "IT Infrastructure",
                "type": "Classification",
                "algorithm": m_it["model_name"],
                "metric_1": f"Accuracy: {m_it['accuracy']}",
                "metric_2": f"F1-Weighted: {m_it['f1_weighted']}",
                "metric_3": f"ROC-AUC: {m_it['roc_auc_ovr']}",
            },
            {
                "model": "Transport Delay",
                "type": "Regression",
                "algorithm": m_tr["model_name"],
                "metric_1": f"MAE: {m_tr['mae']} min",
                "metric_2": f"RMSE: {m_tr['rmse']} min",
                "metric_3": f"R²: {m_tr['r2_score']}",
            },
            {
                "model": "Electrical Grid",
                "type": "Classification",
                "algorithm": m_el["model_name"],
                "metric_1": f"Accuracy: {m_el['accuracy']}",
                "metric_2": f"F1-Weighted: {m_el['f1_weighted']}",
                "metric_3": f"ROC-AUC: {m_el['roc_auc_ovr']}",
            },
        ]
    }
    
    summary_path = os.path.join(REPORTS_DIR, "training_summary.json")
    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"Training Summary saved -> {summary_path}")


if __name__ == "__main__":
    main()
