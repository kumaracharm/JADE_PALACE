# OMNIS-X Machine Learning Lab (Synthetic Digital Twin Intelligence)

This laboratory module provides synthetic data generation, model training, evaluation, and inference demonstration for the **OMNIS-X Institutional Cyber-Physical Digital Twin**.

> **IMPORTANT NOTICE:**  
> All datasets generated in this module are purely **SYNTHETIC** and calibrated via physics-informed engineering equations. They are intended for decision-support algorithm validation, resilience stress-testing, and system demonstrations, and do not represent actual measured readings from a real institution.

---

## 1. Directory Structure

```
backend/ml_lab/
├── data/
│   ├── equipment_failure.csv           # 4,000 samples of mechanical & thermal telemetry
│   ├── it_infrastructure.csv           # 4,000 samples of datacenter & network telemetry
│   ├── transport_delay.csv             # 4,000 samples of campus transit & weather records
│   └── electrical_infrastructure.csv   # 4,000 samples of substation & feeder power telemetry
├── models/
│   ├── equipment_failure_model.joblib  # Trained RandomForestClassifier
│   ├── it_anomaly_model.joblib         # Trained HistGradientBoostingClassifier
│   ├── transport_delay_model.joblib    # Trained HistGradientBoostingRegressor
│   └── electrical_anomaly_model.joblib # Trained RandomForestClassifier
├── reports/
│   ├── dataset_manifest.json           # Schema, row counts, and class distributions
│   ├── model_metrics.json              # Full holdout test scores and baseline deltas
│   └── training_summary.json           # Compact performance scorecard
├── generate_data.py                    # Reproducible synthetic dataset generator (seed=42)
├── train_models.py                     # Stratified training pipeline with baseline comparison
├── predict_demo.py                     # Interactive 4-domain inference demonstration
└── README.md                           # Documentation and usage guide
```

---

## 2. Dataset Specifications & Domain Mapping

All datasets map directly to canonical entities in the OMNIS-X relational twin:

| Dataset | Canonical Entities | Features | Target Variable | Modeling Task |
| :--- | :--- | :--- | :--- | :--- |
| **A: Equipment Failure** | `EQ-GPU-CLUSTER`, `EQ-OSC-BENCH-01`, `UPS-LAB-02` in `LAB-01-EE`, `LAB-02-ROBOTICS` | `temperature_c`, `vibration_mm_s`, `pressure_bar`, `rotational_speed_rpm`, `operating_hours`, `maintenance_history` | `failure_label` (`NORMAL`, `WARNING`, `CRITICAL_FAILURE`) | Multiclass Classification |
| **B: IT Infrastructure** | `SW-MDF-CORE`, `SW-IDF-F1`, `SRV-ERP-01`, `SRV-LMS-01` | `cpu_usage`, `memory_usage`, `network_latency_ms`, `packet_loss`, `disk_usage`, `request_rate` | `fault_label` (`NORMAL`, `DEGRADED`, `FAULT`) | Multiclass Classification |
| **C: Transport Delay** | `ROUTE-CAMPUS-HOSTEL`, `ROUTE-METRO-SHUTTLE`, `ROUTE-CITY-FACULTY` | `traffic_density`, `rainfall`, `road_condition`, `departure_time`, `historical_travel_time` | `delay_minutes` (Continuous) | Regression |
| **D: Electrical Grid** | `FEEDER-LABS-F1`, `SUBSTATION-01`, `ATS-01`, `GEN-500KVA` in `ZONE-ENG-BLOCK` | `voltage`, `current`, `power_load_kw`, `transformer_temperature`, `power_factor` | `abnormal_condition_label` (`NORMAL`, `WARNING`, `CRITICAL`) | Multiclass Classification |

---

## 3. Strict Prevention of Data Leakage

1. **Feature Decoupling:** In the Transport Delay model, `actual_travel_time` and `delay_label` are strictly excluded from the feature matrix so that the regressor must infer delay solely from environmental and schedule priors.
2. **Latent Process Separation:** In Equipment and Electrical datasets, operational health is driven by multi-variable non-linear stress functions with stochastic noise, ensuring models learn realistic non-trivial boundaries rather than reverse-engineering an arithmetic identity.
3. **Stratified Splitting:** All classification pipelines utilize stratified 80/20 train/test holdouts with fixed random seeds (`random_state=42`) ensuring class distributions are identical across splits.

---

## 4. Execution Commands

From the workspace root (`d:\parallax\OMNIS-X\omnis-x`):

```bash
# 1. Generate synthetic CSV datasets
python backend/ml_lab/generate_data.py

# 2. Train and evaluate all 4 models
python backend/ml_lab/train_models.py

# 3. Run the live inference demonstration
python backend/ml_lab/predict_demo.py
```
