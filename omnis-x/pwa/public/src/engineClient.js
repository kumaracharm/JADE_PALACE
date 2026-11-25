/**
 * Separated Frontend Engine API Client.
 * Isolates all HTTP communication with either:
 *   1) The PWA Relay Backend (/api/* -> engine_connector.py), OR
 *   2) The actual OMNIS-X FastAPI Engine (/api/v1/incidents) directly.
 */

import { ENGINE_CONFIG } from '/engine.config.js';
import { getRoomMeta } from './campusData.js';

function getDirectHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'X-User-Id': ENGINE_CONFIG.defaultUserId || 'USR-PRINCIPAL',
  };
  if (ENGINE_CONFIG.authHeader) {
    headers.Authorization = ENGINE_CONFIG.authHeader;
  }
  return headers;
}

async function httpJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || data.error || `HTTP ${res.status}`);
  return data;
}

function mapOmnisxIncidentToGrievance(inc) {
  const meta = inc.metadata_json || {};
  const room = getRoomMeta(meta.roomId) || {};
  return {
    id: inc.incident_id,
    ticketCode: inc.source_id || inc.incident_id,
    category: meta.category || 'other',
    subCategory: meta.subCategory || '',
    title: inc.title,
    description: inc.description,
    severity: inc.priority || 'MEDIUM',
    status: inc.status === 'VERIFIED' || inc.status === 'CLOSED' ? 'RESOLVED' : inc.status || 'SUBMITTED',
    layerId: meta.layerId || room.layerId || 'floor1',
    roomId: meta.roomId || inc.root_entity_id,
    roomCode: room.code || meta.roomId || inc.root_entity_id,
    roomName: room.name || inc.root_entity_id,
    backendEntityId: inc.root_entity_id,
    equipment: meta.equipment || '',
    locationNote: meta.locationNote || '',
    pinCoords: meta.coordinates3D || { x: 0, y: 0, z: 0 },
    resolutionNote: '',
    webhookStatus: 'direct_omnisx',
    createdAt: inc.created_at,
    updatedAt: inc.updated_at,
  };
}

function computeStatusFromItems(items) {
  const openStatuses = new Set(['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'REPORTED', 'TRIAGED']);
  const health = (cats) => {
    const rel = items.filter((x) => cats.has(x.category) && openStatuses.has(x.status));
    const crit = rel.filter((x) => x.severity === 'CRITICAL').length;
    const high = rel.filter((x) => x.severity === 'HIGH').length;
    let state = 'OPERATIONAL';
    if (crit > 0) state = 'CRITICAL';
    else if (high > 0 || rel.length >= 2) state = 'DEGRADED';
    else if (rel.length === 1) state = 'ADVISORY';
    return {
      state,
      openCount: rel.length,
      criticalCount: crit,
      affectedRooms: [...new Set(rel.map((x) => x.roomCode))].sort(),
    };
  };

  return {
    updatedAt: new Date().toISOString(),
    totals: { all: items.length },
    systems: {
      water: health(new Set(['water'])),
      ac: health(new Set(['ac'])),
      faculty: health(new Set(['faculty'])),
      electrical: health(new Set(['electrical'])),
      network: health(new Set(['network'])),
      facilities: health(new Set(['cleanliness', 'infrastructure', 'other'])),
    },
  };
}

export const EngineClient = {
  isDirectMode() {
    return ENGINE_CONFIG.mode === 'direct';
  },

  async fetchAll() {
    if (this.isDirectMode()) {
      const base = ENGINE_CONFIG.engineBaseUrl.replace(/\/$/, '');
      const raw = await httpJson(`${base}${ENGINE_CONFIG.incidentsPath}`, {
        headers: getDirectHeaders(),
      });
      const items = (Array.isArray(raw) ? raw : []).map(mapOmnisxIncidentToGrievance);
      return { items, statusSummary: computeStatusFromItems(items) };
    }
    const [gRes, sRes] = await Promise.all([
      httpJson('/api/grievances'),
      httpJson('/api/status'),
    ]);
    return { items: gRes.items || [], statusSummary: sRes };
  },

  async submitGrievance(payload) {
    if (this.isDirectMode()) {
      const base = ENGINE_CONFIG.engineBaseUrl.replace(/\/$/, '');
      const incPayload = {
        title: `[${payload.roomCode}] ${payload.title}`,
        description: `${payload.description}\nCategory: ${payload.category} (${payload.subCategory}) | Room: ${payload.roomCode} (${payload.roomName}) | Equipment: ${payload.equipment || 'General'} | Note: ${payload.locationNote || 'None'}`,
        root_entity_id: payload.backendEntityId || payload.roomId,
        source_type: 'REPORTED',
        priority: payload.severity || 'MEDIUM',
        metadata_json: {
          category: payload.category,
          subCategory: payload.subCategory,
          roomId: payload.roomId,
          layerId: payload.layerId,
          equipment: payload.equipment,
          locationNote: payload.locationNote,
          coordinates3D: payload.pinCoords,
          anonymous: payload.anonymous,
          studentId: payload.studentId,
        },
      };
      const inc = await httpJson(`${base}${ENGINE_CONFIG.incidentsPath}`, {
        method: 'POST',
        headers: getDirectHeaders(),
        body: JSON.stringify(incPayload),
      });
      return mapOmnisxIncidentToGrievance(inc);
    }

    const res = await httpJson('/api/grievances', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.item;
  },

  async updateGrievanceStatus(id, { status, resolutionNote }) {
    if (this.isDirectMode()) {
      if (status === 'RESOLVED') {
        const base = ENGINE_CONFIG.engineBaseUrl.replace(/\/$/, '');
        return httpJson(
          `${base}${ENGINE_CONFIG.incidentsPath}/${id}/verify?note=${encodeURIComponent(resolutionNote || 'Verified')}`,
          { method: 'POST', headers: getDirectHeaders() }
        );
      }
      throw new Error('Direct mode supports verifying resolution; use OMNIS-X Response Workspace for triage.');
    }
    return httpJson(`/api/grievances/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNote }),
    });
  },

  async fetchConfig() {
    if (this.isDirectMode()) {
      return {
        websiteName: 'OMNIS-X Direct Mode',
        integrationMode: 'omnisx',
        webhookUrl: `${ENGINE_CONFIG.engineBaseUrl.replace(/\/$/, '')}${ENGINE_CONFIG.incidentsPath}`,
        omnisxUserId: ENGINE_CONFIG.defaultUserId,
        autoForward: true,
      };
    }
    return httpJson('/api/config');
  },

  async saveConfig(body) {
    if (this.isDirectMode()) {
      throw new Error('In direct mode, edit /engine.config.js to change the Engine IP.');
    }
    return httpJson('/api/config', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async testConnection(body) {
    if (this.isDirectMode()) {
      const base = ENGINE_CONFIG.engineBaseUrl.replace(/\/$/, '');
      const res = await fetch(`${base}${ENGINE_CONFIG.healthPath}`);
      return { result: res.ok ? `OMNIS-X online (${res.status})` : `HTTP ${res.status}` };
    }
    return httpJson('/api/webhook-test', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};
