"""
OMNIS-X ML Lab — Live Inference Demonstration.
Loads trained models from backend/ml_lab/models/ and generates structured
predictions for four representative OMNIS-X physical, IT, transit, and electrical entities.
Outputs predictions with confidence probabilities, input features, and provenance metadata.
"""

import os
import joblib
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")


def demo_equipment_prediction():
    artifact_path = os.path.join(MODELS_DIR, "equipment_failure_model.joblib")
    artifact = joblib.load(artifact_path)
    model = artifact["model"]
    features = artifact["features"]
    
    # Example: Lab 02 Autonomous Robotics GPU Cluster operating under heavy load
    sample_data = {
        "temperature_c": [68.5],
        "vibration_mm_s": [4.8],
        "pressure_bar": [3.9],
        "rotational_speed_rpm": [3100.0],
        "operating_hours": [7850.0],
        "maintenance_history": [1],  # Due soon
    }
    df = pd.DataFrame(sample_data)[features]
    pred = model.predict(df)[0]
    proba = model.predict_proba(df)[0]
    classes = list(model.classes_)
    confidence = float(np.max(proba))
    
    print("=" * 72)
    print("DEMO PREDICTION 1: LABORATORY EQUIPMENT FAILURE")
    print("=" * 72)
    print(f"Target Entity       : EQ-GPU-CLUSTER (Robotics & AI Laboratory 102)")
    print(f"Model Architecture  : {artifact['metadata']['type']}")
    print(f"Provenance Label    : SYNTHETIC DEMONSTRATION")
    print(f"Input Features      :")
    for k, v in sample_data.items():
        print(f"  • {k:<22}: {v[0]}")
    print(f"Predicted Condition : {pred}")
    print(f"Confidence Score    : {confidence * 100:.2f}%")
    print(f"Class Probabilities :")
    for cls_name, p in zip(classes, proba):
        print(f"  - {cls_name:<16}: {p * 100:.2f}%")
    print()


def demo_it_prediction():
    artifact_path = os.path.join(MODELS_DIR, "it_anomaly_model.joblib")
    artifact = joblib.load(artifact_path)
    model = artifact["model"]
    features = artifact["features"]
    
    # Example: Campus Main Distribution Frame Switch during student registration rush
    sample_data = {
        "cpu_usage": [88.5],
        "memory_usage": [91.2],
        "network_latency_ms": [84.6],
        "packet_loss": [2.8],
        "disk_usage": [78.4],
        "request_rate": [1850.0],
    }
    df = pd.DataFrame(sample_data)[features]
    pred = model.predict(df)[0]
    proba = model.predict_proba(df)[0]
    classes = list(model.classes_)
    confidence = float(np.max(proba))
    
    print("=" * 72)
    print("DEMO PREDICTION 2: IT INFRASTRUCTURE & NETWORK ANOMALY")
    print("=" * 72)
    print(f"Target Entity       : SW-MDF-CORE (Campus Core Distribution Frame)")
    print(f"Model Architecture  : {artifact['metadata']['type']}")
    print(f"Provenance Label    : SYNTHETIC DEMONSTRATION")
    print(f"Input Features      :")
    for k, v in sample_data.items():
        print(f"  • {k:<22}: {v[0]}")
    print(f"Predicted Condition : {pred}")
    print(f"Confidence Score    : {confidence * 100:.2f}%")
    print(f"Class Probabilities :")
    for cls_name, p in zip(classes, proba):
        print(f"  - {cls_name:<16}: {p * 100:.2f}%")
    print()


def demo_transport_prediction():
    artifact_path = os.path.join(MODELS_DIR, "transport_delay_model.joblib")
    artifact = joblib.load(artifact_path)
    model = artifact["model"]
    features = artifact["features"]
    
    # Example: Evening peak commute route with moderate rain
    sample_data = {
        "traffic_density": [0.84],
        "rainfall": [18.5],
        "road_condition": [2],  # Wet
        "departure_time": [17.5],  # 5:30 PM
        "historical_travel_time": [30.0],
    }
    df = pd.DataFrame(sample_data)[features]
    delay_pred = float(model.predict(df)[0])
    total_est = sample_data["historical_travel_time"][0] + delay_pred
    
    print("=" * 72)
    print("DEMO PREDICTION 3: CAMPUS TRANSIT & SHUTTLE DELAY")
    print("=" * 72)
    print(f"Target Route        : ROUTE-METRO-SHUTTLE (Metro Station to Campus North Gate)")
    print(f"Model Architecture  : {artifact['metadata']['type']}")
    print(f"Provenance Label    : SYNTHETIC DEMONSTRATION")
    print(f"Input Features      :")
    for k, v in sample_data.items():
        print(f"  • {k:<22}: {v[0]}")
    print(f"Predicted Delay     : {delay_pred:.1f} minutes")
    print(f"Estimated Travel Time: {total_est:.1f} minutes (Baseline: {sample_data['historical_travel_time'][0]} min)")
    print()


def demo_electrical_prediction():
    artifact_path = os.path.join(MODELS_DIR, "electrical_anomaly_model.joblib")
    artifact = joblib.load(artifact_path)
    model = artifact["model"]
    features = artifact["features"]
    
    # Example: Feeder Bus F1 during high air conditioning + lab load with poor power factor
    sample_data = {
        "voltage": [382.4],
        "current": [545.0],
        "power_load_kw": [340.0],
        "transformer_temperature": [81.5],
        "power_factor": [0.76],
    }
    df = pd.DataFrame(sample_data)[features]
    pred = model.predict(df)[0]
    proba = model.predict_proba(df)[0]
    classes = list(model.classes_)
    confidence = float(np.max(proba))
    
    print("=" * 72)
    print("DEMO PREDICTION 4: ELECTRICAL GRID & FEEDER CONDITION")
    print("=" * 72)
    print(f"Target Entity       : FEEDER-LABS-F1 (Engineering Block Main Feeder Bus)")
    print(f"Model Architecture  : {artifact['metadata']['type']}")
    print(f"Provenance Label    : SYNTHETIC DEMONSTRATION")
    print(f"Input Features      :")
    for k, v in sample_data.items():
        print(f"  • {k:<22}: {v[0]}")
    print(f"Predicted Condition : {pred}")
    print(f"Confidence Score    : {confidence * 100:.2f}%")
    print(f"Class Probabilities :")
    for cls_name, p in zip(classes, proba):
        print(f"  - {cls_name:<16}: {p * 100:.2f}%")
    print("=" * 72)


def main():
    print("\n" + "#" * 72)
    print("  OMNIS-X INSTITUTIONAL DIGITAL TWIN — ML INFERENCE DEMONSTRATION")
    print("  NOTICE: ALL DATA & PREDICTIONS ARE DERIVED FROM SYNTHETIC BENCHMARKS")
    print("#" * 72 + "\n")
    
    demo_equipment_prediction()
    demo_it_prediction()
    demo_transport_prediction()
    demo_electrical_prediction()


if __name__ == "__main__":
    main()
