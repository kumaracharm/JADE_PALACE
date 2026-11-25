"""
OMNIS-X ML Lab — Synthetic Institutional Dataset Generator.
Generates four reproducible, physics-informed synthetic datasets representing:
A) Equipment Failure (Laboratories)
B) IT Infrastructure (Network & Servers)
C) Transport Delays (Campus Transit)
D) Electrical Infrastructure (Substations & Feeders)

All datasets carry provenance="SYNTHETIC" and reference canonical OMNIS-X campus entities.
"""

import os
import json
import numpy as np
import pandas as pd

RANDOM_STATE = 42
NUM_SAMPLES = 4000

# Base output paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


def generate_equipment_failure_dataset(n_samples=NUM_SAMPLES, seed=RANDOM_STATE):
    """
    Dataset A: Equipment Mechanical & Thermal Degradation.
    Mapped to OMNIS-X laboratory assets.
    """
    np.random.seed(seed)
    
    equipments = [
        ("EQ-GPU-CLUSTER", "LAB-02-ROBOTICS"),
        ("EQ-OSC-BENCH-01", "LAB-01-EE"),
        ("EQ-PWR-BENCH-01", "LAB-01-EE"),
        ("UPS-LAB-02", "LAB-02-ROBOTICS"),
        ("EQ-CNC-MILL-01", "LAB-FABRICATION"),
        ("EQ-HVAC-CHILLER-01", "BLDG-ENG"),
        ("EQ-3D-PRINTER-01", "LAB-FABRICATION"),
    ]
    
    eq_indices = np.random.choice(len(equipments), size=n_samples)
    equipment_ids = [equipments[i][0] for i in eq_indices]
    laboratory_ids = [equipments[i][1] for i in eq_indices]
    
    # Baseline operating hours (100 to 12,000 hrs)
    operating_hours = np.random.uniform(100, 12000, size=n_samples).round(1)
    
    # Maintenance status: 0=Up to date (60%), 1=Due soon (25%), 2=Overdue (15%)
    maintenance_history = np.random.choice([0, 1, 2], p=[0.60, 0.25, 0.15], size=n_samples)
    
    # Rotational speed (RPM)
    rotational_speed_rpm = np.random.normal(loc=2400, scale=350, size=n_samples).clip(800, 3600).round(0)
    
    # Internal degradation factor (latent physics variable with noise)
    wear_factor = (
        (operating_hours / 12000.0) * 0.35 +
        (maintenance_history / 2.0) * 0.30 +
        np.random.normal(0, 0.1, size=n_samples)
    ).clip(0, 1)
    
    # Physical sensor readings driven by wear
    temperature_c = (25.0 + wear_factor * 50.0 + np.random.normal(0, 3.5, size=n_samples)).round(2)
    vibration_mm_s = (0.8 + wear_factor * 6.5 + np.random.normal(0, 0.4, size=n_samples)).clip(0.1, 12.0).round(3)
    pressure_bar = (1.5 + wear_factor * 2.8 + np.random.normal(0, 0.3, size=n_samples)).clip(0.5, 6.0).round(2)
    
    # Multiclass label assignment
    failure_label = []
    for w in wear_factor:
        if w < 0.38:
            failure_label.append("NORMAL")
        elif w < 0.62:
            failure_label.append("WARNING")
        else:
            failure_label.append("CRITICAL_FAILURE")
            
    df = pd.DataFrame({
        "equipment_id": equipment_ids,
        "laboratory_id": laboratory_ids,
        "temperature_c": temperature_c,
        "vibration_mm_s": vibration_mm_s,
        "pressure_bar": pressure_bar,
        "rotational_speed_rpm": rotational_speed_rpm,
        "operating_hours": operating_hours,
        "maintenance_history": maintenance_history,
        "failure_label": failure_label,
        "provenance": "SYNTHETIC"
    })
    
    out_path = os.path.join(DATA_DIR, "equipment_failure.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated Equipment Failure Dataset: {len(df)} rows -> {out_path}")
    return df


def generate_it_infrastructure_dataset(n_samples=NUM_SAMPLES, seed=RANDOM_STATE + 1):
    """
    Dataset B: Campus IT & Datacenter Telemetry.
    Mapped to OMNIS-X switches, routers, and application servers.
    """
    np.random.seed(seed)
    
    servers = [
        ("SW-MDF-CORE", "SVC-CORE-ROUTING"),
        ("SW-IDF-F1", "SVC-CAMPUS-WIFI"),
        ("SRV-ERP-01", "SVC-STUDENT-PORTAL"),
        ("SRV-LMS-01", "SVC-LEARNING-MANAGEMENT"),
        ("SRV-GPU-CLUSTER", "SVC-RESEARCH-GPU"),
        ("SRV-AUTH-01", "SVC-IDENTITY-LDAP"),
    ]
    
    srv_indices = np.random.choice(len(servers), size=n_samples)
    server_ids = [servers[i][0] for i in srv_indices]
    service_ids = [servers[i][1] for i in srv_indices]
    
    # Request rate (req/s)
    request_rate = np.random.exponential(scale=350, size=n_samples).clip(10, 3000).round(1)
    
    # Base load latent factor
    load_factor = (request_rate / 3000.0)
    
    # CPU Usage (%)
    cpu_usage = (15.0 + load_factor * 65.0 + np.random.normal(0, 8.0, size=n_samples)).clip(5.0, 99.9).round(1)
    
    # Memory Usage (%)
    memory_usage = (25.0 + load_factor * 55.0 + np.random.normal(0, 6.0, size=n_samples)).clip(10.0, 99.5).round(1)
    
    # Disk Usage (%)
    disk_usage = np.random.uniform(30.0, 95.0, size=n_samples).round(1)
    
    # Network Latency (ms) - spikes sharply under heavy memory/CPU saturation
    saturation = ((cpu_usage / 100.0) ** 2 + (memory_usage / 100.0) ** 2) / 2.0
    network_latency_ms = (2.0 + saturation * 120.0 + np.random.exponential(scale=5.0, size=n_samples)).clip(1.0, 450.0).round(2)
    
    # Packet Loss (%)
    packet_loss = np.where(
        saturation > 0.65,
        (saturation * 8.0 + np.random.exponential(scale=1.5, size=n_samples)).clip(0.0, 25.0),
        np.random.uniform(0.0, 0.4, size=n_samples)
    ).round(2)
    
    # Fault label assignment
    fault_label = []
    for cpu, mem, lat, pkt, dsk in zip(cpu_usage, memory_usage, network_latency_ms, packet_loss, disk_usage):
        if (cpu > 85.0 and lat > 110.0) or pkt > 2.5 or dsk > 88.0:
            fault_label.append("FAULT")
        elif cpu > 68.0 or mem > 72.0 or lat > 40.0 or pkt > 0.8:
            fault_label.append("DEGRADED")
        else:
            fault_label.append("NORMAL")
            
    df = pd.DataFrame({
        "server_id": server_ids,
        "service_id": service_ids,
        "cpu_usage": cpu_usage,
        "memory_usage": memory_usage,
        "network_latency_ms": network_latency_ms,
        "packet_loss": packet_loss,
        "disk_usage": disk_usage,
        "request_rate": request_rate,
        "fault_label": fault_label,
        "provenance": "SYNTHETIC"
    })
    
    out_path = os.path.join(DATA_DIR, "it_infrastructure.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated IT Infrastructure Dataset: {len(df)} rows -> {out_path}")
    return df


def generate_transport_delay_dataset(n_samples=NUM_SAMPLES, seed=RANDOM_STATE + 2):
    """
    Dataset C: Campus Transit & Shuttle Disruption.
    Mapped to OMNIS-X student/faculty bus routes.
    """
    np.random.seed(seed)
    
    routes = [
        "ROUTE-CAMPUS-HOSTEL",
        "ROUTE-METRO-SHUTTLE",
        "ROUTE-CITY-FACULTY",
        "ROUTE-RESEARCH-PARK",
    ]
    
    bus_route_ids = np.random.choice(routes, size=n_samples)
    
    # Departure time (hour of day: 7.0 to 21.0)
    departure_time = np.random.uniform(7.0, 21.0, size=n_samples).round(2)
    
    # Historical baseline travel time (minutes) by route
    base_times = {
        "ROUTE-CAMPUS-HOSTEL": 18.0,
        "ROUTE-METRO-SHUTTLE": 30.0,
        "ROUTE-CITY-FACULTY": 55.0,
        "ROUTE-RESEARCH-PARK": 40.0,
    }
    historical_travel_time = np.array([base_times[r] for r in bus_route_ids])
    
    # Environmental features
    rainfall_mm = np.random.exponential(scale=6.0, size=n_samples).clip(0.0, 80.0).round(1)
    
    # Road condition: 1=Dry, 2=Wet, 3=Congested/Potholes
    road_condition = np.where(rainfall_mm > 25.0, 3, np.where(rainfall_mm > 5.0, 2, 1))
    
    # Peak traffic multiplier based on hour of day (8-10 AM peak, 17-19 PM peak)
    is_am_peak = (departure_time >= 8.0) & (departure_time <= 10.0)
    is_pm_peak = (departure_time >= 17.0) & (departure_time <= 19.5)
    
    traffic_density = np.where(
        is_am_peak | is_pm_peak,
        np.random.uniform(0.65, 0.98, size=n_samples),
        np.random.uniform(0.15, 0.60, size=n_samples)
    ).round(2)
    
    # Physics delay calculation (non-trivial composite function)
    delay_minutes = (
        traffic_density * 18.0 +
        (rainfall_mm / 10.0) * 3.5 +
        (road_condition - 1) * 4.0 +
        np.random.normal(0, 2.5, size=n_samples)
    ).clip(0.0, 60.0).round(1)
    
    actual_travel_time = (historical_travel_time + delay_minutes).round(1)
    
    # Delay classification label
    delay_label = []
    for d in delay_minutes:
        if d < 6.0:
            delay_label.append("ON_TIME")
        elif d < 18.0:
            delay_label.append("MODERATE_DELAY")
        else:
            delay_label.append("SEVERE_DELAY")
            
    df = pd.DataFrame({
        "bus_route_id": bus_route_ids,
        "traffic_density": traffic_density,
        "rainfall": rainfall_mm,
        "road_condition": road_condition,
        "departure_time": departure_time,
        "historical_travel_time": historical_travel_time,
        "actual_travel_time": actual_travel_time,
        "delay_minutes": delay_minutes,
        "delay_label": delay_label,
        "provenance": "SYNTHETIC"
    })
    
    out_path = os.path.join(DATA_DIR, "transport_delay.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated Transport Delay Dataset: {len(df)} rows -> {out_path}")
    return df


def generate_electrical_infrastructure_dataset(n_samples=NUM_SAMPLES, seed=RANDOM_STATE + 3):
    """
    Dataset D: Substation, Transformers, and Feeder Grid Telemetry.
    Mapped to OMNIS-X electrical entities.
    """
    np.random.seed(seed)
    
    feeders = [
        ("FEEDER-LABS-F1", "ZONE-ENG-BLOCK"),
        ("SUBSTATION-01", "ZONE-ENG-BLOCK"),
        ("ATS-01", "ZONE-ENG-BLOCK"),
        ("GEN-500KVA", "ZONE-ENG-BLOCK"),
        ("METER-MAIN-01", "ZONE-CAMPUS-CENTRAL"),
    ]
    
    feed_indices = np.random.choice(len(feeders), size=n_samples)
    feeder_ids = [feeders[i][0] for i in feed_indices]
    building_zones = [feeders[i][1] for i in feed_indices]
    
    # Three-phase nominal line-to-line voltage is 415V
    # Normal distribution with occasional sags / surges
    voltage_sag_flags = np.random.choice([0, 1], p=[0.92, 0.08], size=n_samples)
    voltage = np.where(
        voltage_sag_flags == 1,
        np.random.uniform(340.0, 385.0, size=n_samples),
        np.random.normal(loc=415.0, scale=8.0, size=n_samples)
    ).clip(330.0, 460.0).round(1)
    
    # Power load (kW)
    power_load_kw = np.random.uniform(25.0, 450.0, size=n_samples).round(1)
    
    # Power Factor (0.70 to 0.99)
    power_factor = np.random.beta(a=12, b=2, size=n_samples).clip(0.68, 0.99).round(3)
    
    # Current (I = P / (sqrt(3) * V * PF))
    current = (
        (power_load_kw * 1000.0) / (np.sqrt(3) * voltage * power_factor) +
        np.random.normal(0, 4.0, size=n_samples)
    ).clip(15.0, 850.0).round(1)
    
    # Transformer winding temperature (°C)
    # Driven by current loading and poor power factor
    temp_stress = (current / 700.0) * 45.0 + (1.0 - power_factor) * 35.0
    transformer_temperature = (42.0 + temp_stress + np.random.normal(0, 3.0, size=n_samples)).clip(35.0, 115.0).round(1)
    
    # Operating condition classification
    abnormal_condition_label = []
    for v, i, temp, pf in zip(voltage, current, transformer_temperature, power_factor):
        if v < 370.0 or temp > 92.0 or i > 720.0 or pf < 0.73:
            abnormal_condition_label.append("CRITICAL")
        elif v < 395.0 or temp > 76.0 or i > 520.0 or pf < 0.82:
            abnormal_condition_label.append("WARNING")
        else:
            abnormal_condition_label.append("NORMAL")
            
    df = pd.DataFrame({
        "feeder_id": feeder_ids,
        "building_zone": building_zones,
        "voltage": voltage,
        "current": current,
        "power_load_kw": power_load_kw,
        "transformer_temperature": transformer_temperature,
        "power_factor": power_factor,
        "abnormal_condition_label": abnormal_condition_label,
        "provenance": "SYNTHETIC"
    })
    
    out_path = os.path.join(DATA_DIR, "electrical_infrastructure.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated Electrical Infrastructure Dataset: {len(df)} rows -> {out_path}")
    return df


def main():
    print("=== OMNIS-X ML LAB: SYNTHETIC DATA GENERATION ===")
    df_eq = generate_equipment_failure_dataset()
    df_it = generate_it_infrastructure_dataset()
    df_tr = generate_transport_delay_dataset()
    df_el = generate_electrical_infrastructure_dataset()
    
    manifest = {
        "random_state": RANDOM_STATE,
        "samples_per_dataset": NUM_SAMPLES,
        "datasets": {
            "equipment_failure": {
                "file": "equipment_failure.csv",
                "rows": len(df_eq),
                "columns": list(df_eq.columns),
                "target": "failure_label",
                "class_distribution": df_eq["failure_label"].value_counts().to_dict(),
            },
            "it_infrastructure": {
                "file": "it_infrastructure.csv",
                "rows": len(df_it),
                "columns": list(df_it.columns),
                "target": "fault_label",
                "class_distribution": df_it["fault_label"].value_counts().to_dict(),
            },
            "transport_delay": {
                "file": "transport_delay.csv",
                "rows": len(df_tr),
                "columns": list(df_tr.columns),
                "target_regression": "delay_minutes",
                "target_classification": "delay_label",
                "class_distribution": df_tr["delay_label"].value_counts().to_dict(),
            },
            "electrical_infrastructure": {
                "file": "electrical_infrastructure.csv",
                "rows": len(df_el),
                "columns": list(df_el.columns),
                "target": "abnormal_condition_label",
                "class_distribution": df_el["abnormal_condition_label"].value_counts().to_dict(),
            },
        }
    }
    
    manifest_path = os.path.join(REPORTS_DIR, "dataset_manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"Dataset Manifest saved -> {manifest_path}")
    print("Synthetic dataset generation completed successfully.")


if __name__ == "__main__":
    main()
