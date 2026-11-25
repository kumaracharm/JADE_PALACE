"""
OMNIS-X — Real-Time Synthetic Telemetry & ML Inference Streamer
Simulates continuous, high-frequency IoT sensor telemetry across campus cyber-physical entities.
Posts live telemetry to OMNIS-X backend, triggers continuous ML inference, and outputs live predictions.
"""

import time
import math
import random
import argparse
import requests
from datetime import datetime

BACKEND_URL = "http://127.0.0.1:8000"


def generate_equipment_telemetry(t: float, inject_fault: bool = False):
    """Simulates real-time sensor stream for Lab GPU Cluster / Industrial Robotics."""
    if inject_fault:
        # Abnormal thermal runaway and mechanical vibration
        temp = 85.0 + random.uniform(5.0, 15.0)
        vibration = 6.5 + random.uniform(1.0, 3.5)
        rpm = 3800.0 + random.uniform(100.0, 400.0)
        pressure = 4.2 + random.uniform(0.5, 1.2)
    else:
        # Nominal operation with diurnal cycle and white noise
        temp = 62.0 + 5.0 * math.sin(t * 0.1) + random.gauss(0, 0.8)
        vibration = 2.4 + 0.3 * math.sin(t * 0.2) + random.gauss(0, 0.1)
        rpm = 2950.0 + random.gauss(0, 15.0)
        pressure = 3.2 + random.gauss(0, 0.05)

    return {
        "model_type": "equipment_failure",
        "entity_id": "EQ-GPU-CLUSTER",
        "features": {
            "temperature_c": round(temp, 2),
            "vibration_mm_s": round(vibration, 2),
            "pressure_bar": round(pressure, 2),
            "rotational_speed_rpm": round(rpm, 1),
            "operating_hours": 7800.0,
            "maintenance_history": 1 if inject_fault else 0,
        },
    }


def generate_electrical_telemetry(t: float, inject_fault: bool = False):
    """Simulates real-time telemetry for 11kV Substation Unit SUB-01."""
    if inject_fault:
        voltage = 365.0 - random.uniform(10.0, 30.0)  # Severe voltage sag
        current = 580.0 + random.uniform(20.0, 60.0)  # Overcurrent
        power_factor = 0.72 - random.uniform(0.05, 0.1)
        temp = 88.0 + random.uniform(5.0, 12.0)
        load = 240.0 + random.uniform(20.0, 50.0)
    else:
        voltage = 415.0 + 3.0 * math.sin(t * 0.05) + random.gauss(0, 1.0)
        current = 320.0 + 15.0 * math.sin(t * 0.1) + random.gauss(0, 3.0)
        power_factor = 0.94 + random.gauss(0, 0.01)
        temp = 54.0 + 4.0 * math.sin(t * 0.02) + random.gauss(0, 0.5)
        load = 145.0 + 10.0 * math.sin(t * 0.05) + random.gauss(0, 2.0)

    return {
        "model_type": "electrical_grid",
        "entity_id": "SUBSTATION-01",
        "features": {
            "voltage": round(voltage, 1),
            "current": round(current, 1),
            "power_load_kw": round(load, 1),
            "transformer_temperature": round(temp, 1),
            "power_factor": round(min(1.0, max(0.5, power_factor)), 3),
        },
    }


def generate_it_telemetry(t: float, inject_fault: bool = False):
    """Simulates real-time telemetry for Core Aggregation Switch SW-MDF-CORE."""
    if inject_fault:
        cpu = 96.0 + random.uniform(1.0, 3.5)
        mem = 94.0 + random.uniform(2.0, 5.0)
        latency = 145.0 + random.uniform(20.0, 80.0)
        loss = 7.5 + random.uniform(2.0, 6.0)
        rate = 2600.0 + random.uniform(200.0, 600.0)
    else:
        cpu = 42.0 + 10.0 * math.sin(t * 0.1) + random.gauss(0, 2.0)
        mem = 58.0 + random.gauss(0, 1.0)
        latency = 12.5 + random.gauss(0, 1.5)
        loss = max(0.0, 0.1 + random.gauss(0, 0.05))
        rate = 850.0 + 50.0 * math.sin(t * 0.05) + random.gauss(0, 20.0)

    return {
        "model_type": "it_infrastructure",
        "entity_id": "SW-MDF-CORE",
        "features": {
            "cpu_usage": round(min(100.0, max(5.0, cpu)), 1),
            "memory_usage": round(min(100.0, max(10.0, mem)), 1),
            "network_latency_ms": round(max(1.0, latency), 1),
            "packet_loss": round(min(100.0, max(0.0, loss)), 2),
            "disk_usage": 65.0,
            "request_rate": round(max(10.0, rate), 1),
        },
    }


def run_streamer(interval: float = 2.0, inject_anomaly_at: int = -1):
    print("=" * 76)
    print("OMNIS-X REAL-TIME SYNTHETIC TELEMETRY & ML INFERENCE STREAMER")
    print(f"Target Backend : {BACKEND_URL}")
    print(f"Tick Interval  : {interval} seconds")
    print(f"Anomaly Trigger: {'Tick #' + str(inject_anomaly_at) if inject_anomaly_at > 0 else 'Continuous Nominal (Simulated Sensors)'}")
    print("=" * 76)

    # Verify backend connection
    try:
        r = requests.get(f"{BACKEND_URL}/health", timeout=2)
        if r.status_code == 200:
            print(f"[OK] Backend connected: {r.json().get('service')} (v{r.json().get('version')})\n")
    except Exception as e:
        print(f"[WARN] Cannot reach {BACKEND_URL}/health: {e}")
        print("Ensure FastAPI backend is running: python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000\n")

    tick = 0
    start_time = time.time()

    try:
        while True:
            tick += 1
            t = time.time() - start_time
            now_str = datetime.now().strftime("%H:%M:%S")

            # Check if anomaly should be injected on this tick
            is_anomaly = (tick == inject_anomaly_at) or (inject_anomaly_at > 0 and tick > inject_anomaly_at and tick < inject_anomaly_at + 3)

            # Cycle through domains: Equipment -> Electrical -> IT
            generators = [
                generate_equipment_telemetry,
                generate_electrical_telemetry,
                generate_it_telemetry,
            ]
            gen = generators[tick % len(generators)]
            payload = gen(t, inject_fault=is_anomaly)

            # Post live inference request
            try:
                res = requests.post(f"{BACKEND_URL}/api/v1/ml/predict", json=payload, timeout=2)
                if res.status_code == 200:
                    data = res.json()
                    pred = data.get("prediction")
                    conf = data.get("confidence", 0.0)
                    model_type = data.get("model_type")
                    entity = data.get("target_entity_id")
                    
                    status_flag = "[ALERT]" if ("CRITICAL" in str(pred) or "FAULT" in str(pred) or "WARNING" in str(pred)) else "[NOMINAL]"
                    color_marker = ">>>" if status_flag == "[ALERT]" else "   "

                    print(f"{color_marker} [{now_str}] Tick #{tick:03d} | {entity:<16} | Model: {model_type:<18} | Status: {status_flag} Pred: {pred:<18} Conf: {conf*100:.1f}%")
                else:
                    print(f"[{now_str}] Tick #{tick:03d} | Inference error HTTP {res.status_code}: {res.text}")
            except Exception as ex:
                print(f"[{now_str}] Tick #{tick:03d} | Post error: {ex}")

            time.sleep(interval)

    except KeyboardInterrupt:
        print("\nStreamer stopped by user.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OMNIS-X Real-Time Synthetic Telemetry Streamer")
    parser.add_argument("--interval", type=float, default=2.0, help="Stream interval in seconds (default: 2.0)")
    parser.add_argument("--inject-anomaly-at", type=int, default=-1, help="Tick number at which to inject a synthetic fault (e.g. 5)")
    args = parser.parse_args()

    run_streamer(interval=args.interval, inject_anomaly_at=args.inject_anomaly_at)
