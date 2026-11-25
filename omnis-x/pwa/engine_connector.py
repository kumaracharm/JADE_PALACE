#!/usr/bin/env python3
"""
Separated OMNIS-X Engine Connection Module.

This file isolates all communication with the actual OMNIS-X (JADE_PALACE)
FastAPI backend or custom external webhook. When a new IP is assigned to the
main OMNIS-X engine, update `engine_config.json` (or set environment variables
like ENGINE_BASE_URL=http://<NEW_IP>:8000) without touching UI or DB code.
"""

import json
import os
import urllib.error
import urllib.request
from typing import Any, Dict, Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENGINE_CONFIG_PATH = os.path.join(BASE_DIR, "engine_config.json")

# Maps 2D/3D Campus Map room IDs -> OMNIS-X backend entity_id values
ROOM_TO_OMNISX_ENTITY: Dict[str, str] = {
    "SUB-01": "SUBSTATION-01",
    "UPS-01": "UPS-LAB-02",
    "SRV-01": "ROOM-MDF",
    "BUS-01": "GEN-500KVA",
    "CR-101": "CR-201",
    "CR-102": "CR-202",
    "CR-103": "LAB-03-COMP",
    "CR-104": "FEEDER-CR-F2",
    "VLSI-201": "LAB-01-EE",
    "ROB-202": "LAB-02-ROBOTICS",
    "HV-203": "FEEDER-LABS-F1",
    "SEM-204": "LH-01",
    "ADM-301": "PANEL-ENG-MAIN",
    "CTR-302": "ATS-01",
    "RF-303": "SUBSTATION-01",
}


def load_engine_config() -> Dict[str, Any]:
    """Loads connection settings from engine_config.json with env var overrides."""
    cfg: Dict[str, Any] = {
        "pwa_host": "0.0.0.0",
        "pwa_port": 8090,
        "website_name": "OMNIS-X • Apex Institute of Technology",
        "engine_mode": "omnisx",
        "engine_base_url": "http://127.0.0.1:8000",
        "engine_incidents_path": "/api/v1/incidents",
        "engine_health_path": "/health",
        "engine_user_id": "USR-PRINCIPAL",
        "engine_auth_header": "",
        "auto_forward": True,
    }
    if os.path.isfile(ENGINE_CONFIG_PATH):
        try:
            with open(ENGINE_CONFIG_PATH, "r", encoding="utf-8") as f:
                file_cfg = json.load(f)
            if isinstance(file_cfg, dict):
                cfg.update(file_cfg)
        except Exception:
            pass

    # Environment variable overrides for dynamic/new IP assignment
    if os.environ.get("HOST"):
        cfg["pwa_host"] = os.environ["HOST"]
    if os.environ.get("PORT"):
        cfg["pwa_port"] = int(os.environ["PORT"])
    if os.environ.get("ENGINE_BASE_URL"):
        cfg["engine_base_url"] = os.environ["ENGINE_BASE_URL"].rstrip("/")
    elif os.environ.get("ENGINE_HOST"):
        e_port = os.environ.get("ENGINE_PORT", "8000")
        cfg["engine_base_url"] = f"http://{os.environ['ENGINE_HOST']}:{e_port}"
    if os.environ.get("ENGINE_MODE"):
        cfg["engine_mode"] = os.environ["ENGINE_MODE"]
    if os.environ.get("ENGINE_USER_ID"):
        cfg["engine_user_id"] = os.environ["ENGINE_USER_ID"]
    if os.environ.get("ENGINE_AUTH_HEADER"):
        cfg["engine_auth_header"] = os.environ["ENGINE_AUTH_HEADER"]

    cfg["engine_base_url"] = str(cfg["engine_base_url"]).rstrip("/")
    cfg["engine_incidents_url"] = (
        f"{cfg['engine_base_url']}{cfg['engine_incidents_path']}"
        if cfg["engine_mode"] == "omnisx"
        else cfg["engine_base_url"]
    )
    return cfg


def resolve_entity_id(room_id: str, explicit_entity_id: str = "") -> str:
    return (explicit_entity_id or ROOM_TO_OMNISX_ENTITY.get(room_id, room_id)).strip()


def build_omnisx_incident_payload(record: Dict[str, Any]) -> Dict[str, Any]:
    """Formats a student grievance into OMNIS-X IncidentCreate schema."""
    room_code = record["room_code"]
    room_name = record["room_name"]
    category = record["category"]
    sub_cat = record.get("sub_category", "")
    equipment = record.get("equipment", "") or "General"
    note = record.get("location_note", "") or "None"

    priority_map = {
        "LOW": "LOW",
        "MEDIUM": "MEDIUM",
        "HIGH": "HIGH",
        "CRITICAL": "MISSION_CRITICAL",
    }
    priority = priority_map.get(record.get("severity", "MEDIUM").upper(), "MEDIUM")

    return {
        "title": f"[{room_code}] {record['title']}",
        "description": (
            f"{record['description']}\n"
            f"Category: {category} ({sub_cat}) | "
            f"Room: {room_code} ({room_name}) | "
            f"Equipment: {equipment} | "
            f"Note: {note}"
        ),
        "root_entity_id": resolve_entity_id(record["room_id"], record.get("backend_entity_id", "")),
        "source_type": "STUDENT_REPORTED",
        "source_id": record["ticket_code"],
        "priority": priority,
        "metadata_json": {
            "source": "STUDENT_REPORTED",
            "ticketCode": record["ticket_code"],
            "category": category,
            "reportCategory": category,
            "subCategory": sub_cat,
            "roomId": record["room_id"],
            "layerId": record["layer_id"],
            "equipment": record.get("equipment", ""),
            "locationNote": record.get("location_note", ""),
            "coordinates3D": {
                "x": record.get("pin_x", 0),
                "y": record.get("pin_y", 0),
                "z": record.get("pin_z", 0),
            },
            "anonymous": bool(record.get("anonymous", 0)),
            "studentId": record.get("student_id", ""),
        },
    }


def build_webhook_payload(record: Dict[str, Any]) -> Dict[str, Any]:
    """Formats a student grievance into generic JSON webhook format."""
    return {
        "event": "grievance.submitted",
        "ticketCode": record["ticket_code"],
        "id": record["id"],
        "category": record["category"],
        "subCategory": record.get("sub_category", ""),
        "title": record["title"],
        "description": record["description"],
        "severity": record["severity"],
        "location": {
            "layerId": record["layer_id"],
            "layerTitle": record.get("layer_title", ""),
            "roomId": record["room_id"],
            "roomCode": record["room_code"],
            "roomName": record["room_name"],
            "backendEntityId": resolve_entity_id(
                record["room_id"], record.get("backend_entity_id", "")
            ),
            "department": record.get("department", ""),
            "equipment": record.get("equipment", ""),
            "locationNote": record.get("location_note", ""),
            "coordinates3D": {
                "x": record.get("pin_x", 0),
                "y": record.get("pin_y", 0),
                "z": record.get("pin_z", 0),
            },
        },
        "reporter": {
            "anonymous": bool(record.get("anonymous", 0)),
            "name": record.get("student_name", ""),
            "studentId": record.get("student_id", ""),
            "contact": record.get("student_contact", ""),
        },
        "createdAt": record["created_at"],
    }


def post_json(
    target_url: str,
    payload: Dict[str, Any],
    auth_header: str = "",
    extra_headers: Optional[Dict[str, str]] = None,
    timeout: int = 5,
) -> str:
    if not target_url or not target_url.startswith(("http://", "https://")):
        return "local_only"

    body = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "OMNIS-X-Student-PWA/1.0",
    }
    if extra_headers:
        headers.update(extra_headers)
    if auth_header:
        if ":" in auth_header and not auth_header.lower().startswith("bearer "):
            k, v = auth_header.split(":", 1)
            headers[k.strip()] = v.strip()
        else:
            headers["Authorization"] = auth_header.strip()

    req = urllib.request.Request(target_url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return f"forwarded ({resp.status})"
    except urllib.error.HTTPError as exc:
        return f"sync_http_{exc.code}"
    except Exception as exc:
        return f"saved_locally ({type(exc).__name__})"


def dispatch_record_to_engine(
    record: Dict[str, Any],
    target_url: str,
    mode: str = "omnisx",
    omnisx_user_id: str = "USR-PRINCIPAL",
    auth_header: str = "",
) -> str:
    if not target_url:
        return "local_only"
    if mode == "omnisx" or "/api/v1/incidents" in target_url:
        payload = build_omnisx_incident_payload(record)
        return post_json(
            target_url,
            payload,
            auth_header=auth_header,
            extra_headers={"X-User-Id": omnisx_user_id or "USR-PRINCIPAL"},
        )
    payload = build_webhook_payload(record)
    return post_json(
        target_url,
        payload,
        auth_header=auth_header,
        extra_headers={"X-OMNISX-Event": "grievance.created"},
    )


def ping_engine(target_url: str, auth_header: str = "", timestamp: str = "") -> Dict[str, str]:
    if "/api/v1/incidents" in target_url:
        health_url = target_url.split("/api/v1/incidents")[0] + "/health"
        try:
            with urllib.request.urlopen(health_url, timeout=4) as resp:
                return {"result": f"OMNIS-X online ({resp.status})", "url": health_url}
        except Exception as exc:
            return {"result": f"OMNIS-X unreachable ({type(exc).__name__})", "url": health_url}

    res = post_json(
        target_url,
        {
            "event": "omnisx.pwa.ping",
            "message": "Test connection from OMNIS-X Student Grievance PWA",
            "timestamp": timestamp,
        },
        auth_header=auth_header,
    )
    return {"result": res, "url": target_url}
