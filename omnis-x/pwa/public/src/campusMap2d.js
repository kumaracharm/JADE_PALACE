import { LAYERS, ROOMS } from './campusData.js';

/**
 * Lightweight, touch-friendly OMNIS-X 2D SVG Campus Floor Plan
 * Uses the exact room dimensions and [x, z] coordinates from the 3D blueprint
 * so phones get instant loading, zero GPU/WebGL drain, and tap-anywhere pinning.
 */
export class CampusMap2D {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.activeLayerId = 'floor1'; // Default to Academic Wing where students report most issues
    this.selectedRoomId = null;
    this.pinCoords = null; // { x, y, z }
    this.grievances = [];

    this._render();
  }

  setLayer(layerId) {
    if (!layerId || layerId === 'all') {
      // In 2D plan mode, keep the current floor or default to floor1
      this._render();
      return;
    }
    this.activeLayerId = layerId;
    this._render();
  }

  setGrievances(list) {
    this.grievances = Array.isArray(list) ? list : [];
    this._render();
  }

  selectRoom(roomId, customCoords = null) {
    const room = ROOMS.find((r) => r.id === roomId);
    if (!room) return;
    this.activeLayerId = room.layerId;
    this.selectedRoomId = room.id;
    const layer = LAYERS.find((l) => l.id === room.layerId) || LAYERS[0];
    this.pinCoords = customCoords || {
      x: room.position[0],
      y: Number((layer.elevationY + room.position[1]).toFixed(2)),
      z: room.position[2],
    };
    this._render();
  }

  clearSelection() {
    this.selectedRoomId = null;
    this.pinCoords = null;
    this._render();
  }

  _escape(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  _render() {
    const layer = LAYERS.find((l) => l.id === this.activeLayerId) || LAYERS[1];
    const layerRooms = ROOMS.filter((r) => r.layerId === layer.id);
    const hasCorridor = layer.id === 'floor1' || layer.id === 'floor2';

    const roomsSvg = layerRooms
      .map((room) => {
        const w = room.dimensions.width;
        const d = room.dimensions.depth;
        const rx = room.position[0] - w / 2;
        const rz = room.position[2] - d / 2;

        const isSelected = this.selectedRoomId === room.id;
        const openIssues = this.grievances.filter(
          (g) => g.roomId === room.id && g.status !== 'RESOLVED'
        );
        const hasCritical = openIssues.some((g) => g.severity === 'CRITICAL');

        let fill = 'rgba(24, 25, 30, 0.72)';
        let stroke = '#5A4E70';
        let strokeWidth = '0.14';
        let titleColor = '#E2E1E6';
        let codeColor = '#9D8EB5';

        if (isSelected) {
          fill = 'rgba(212, 175, 55, 0.18)';
          stroke = '#F5D061';
          strokeWidth = '0.24';
          titleColor = '#FFFFFF';
          codeColor = '#F5D061';
        } else if (hasCritical) {
          fill = 'rgba(224, 93, 93, 0.12)';
          stroke = '#E05D5D';
          strokeWidth = '0.18';
        } else if (openIssues.length > 0) {
          stroke = '#E5A83B';
          strokeWidth = '0.16';
        }

        const shortName = room.name
          .replace(/^Classroom\s+/i, '')
          .replace(/\s*\([^)]*\)/g, '')
          .slice(0, 24);

        const issueBadge =
          openIssues.length > 0
            ? `<circle cx="${rx + w - 0.8}" cy="${rz + 0.8}" r="0.45" fill="${
                hasCritical ? '#E05D5D' : '#E5A83B'
              }" />
               <text x="${rx + w - 0.8}" y="${rz + 1.0}" text-anchor="middle" fill="#121316" font-size="0.55" font-weight="700" font-family="monospace">${openIssues.length}</text>`
            : '';

        return `
          <g class="map2d-room" data-room-id="${this._escape(room.id)}" style="cursor:pointer;">
            <rect x="${rx}" y="${rz}" width="${w}" height="${d}" rx="0.35"
              fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
            <text x="${room.position[0]}" y="${room.position[2] - 0.45}" text-anchor="middle"
              fill="${codeColor}" font-size="0.95" font-weight="700" font-family="monospace">${this._escape(room.code)}</text>
            <text x="${room.position[0]}" y="${room.position[2] + 0.85}" text-anchor="middle"
              fill="${titleColor}" font-size="0.72" font-weight="500" font-family="sans-serif">${this._escape(shortName)}</text>
            ${issueBadge}
          </g>
        `;
      })
      .join('');

    const corridorSvg = hasCorridor
      ? `<rect x="-15" y="-1.15" width="22" height="2.3" rx="0.2" fill="rgba(157,142,181,0.06)" stroke="#2D303B" stroke-width="0.1" stroke-dasharray="0.4 0.3" />
         <text x="-4" y="0.28" text-anchor="middle" fill="#5A5565" font-size="0.65" font-family="monospace" letter-spacing="0.15">CENTRAL CORRIDOR</text>`
      : '';

    let pinSvg = '';
    if (this.pinCoords && this.selectedRoomId) {
      const selectedRoom = layerRooms.find((r) => r.id === this.selectedRoomId);
      if (selectedRoom) {
        pinSvg = `
          <g pointer-events="none">
            <circle cx="${this.pinCoords.x}" cy="${this.pinCoords.z}" r="0.9" fill="rgba(245, 208, 97, 0.22)" stroke="#F5D061" stroke-width="0.14" />
            <circle cx="${this.pinCoords.x}" cy="${this.pinCoords.z}" r="0.38" fill="#F5D061" stroke="#121316" stroke-width="0.12" />
          </g>
        `;
      }
    }

    this.container.innerHTML = `
      <div class="map2d-wrap">
        <div class="map2d-levels">
          ${LAYERS.map(
            (l) => `
            <button type="button" class="map2d-lvl-btn ${l.id === this.activeLayerId ? 'active' : ''}" data-layer="${l.id}">
              <span>${this._escape(l.planeNumber)}</span>
              <small>${l.id === 'ground' ? 'Utility' : l.id === 'floor1' ? 'Classes' : l.id === 'floor2' ? 'Labs' : 'Admin'}</small>
            </button>`
          ).join('')}
        </div>

        <div class="map2d-svg-box cad-grid-pattern">
          <svg class="map2d-svg" viewBox="-17.8 -10.3 35.6 20.6" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${this._escape(layer.title)} Floor Plan">
            <!-- Outer Floor Slab (34m x 19m) -->
            <rect x="-17" y="-9.5" width="34" height="19" rx="0.5" fill="rgba(16, 17, 20, 0.72)" stroke="#3F4352" stroke-width="0.18" />
            ${corridorSvg}
            ${roomsSvg}
            ${pinSvg}
          </svg>
        </div>

        <div class="map2d-caption">
          <span>${this._escape(layer.planeNumber)} — ${this._escape(layer.title)}</span>
          <span class="mono" style="color:#9D8EB5;">Tap room spot to pin</span>
        </div>
      </div>
    `;

    // Level tab clicks
    this.container.querySelectorAll('.map2d-lvl-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeLayerId = btn.dataset.layer;
        this._render();
        if (this.callbacks.onLayerChange) {
          this.callbacks.onLayerChange(this.activeLayerId);
        }
      });
    });

    // Room tap-to-pin with exact SVG -> campus [x, z] coordinate mapping
    const svgEl = this.container.querySelector('.map2d-svg');
    this.container.querySelectorAll('.map2d-room').forEach((roomEl) => {
      roomEl.addEventListener('click', (e) => {
        const rid = roomEl.dataset.roomId;
        const room = ROOMS.find((r) => r.id === rid);
        if (!room || !svgEl) return;

        let px = room.position[0];
        let pz = room.position[2];
        try {
          const pt = svgEl.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const svgPt = pt.matrixTransform(svgEl.getScreenCTM().inverse());
          px = Number(svgPt.x.toFixed(2));
          pz = Number(svgPt.y.toFixed(2));
        } catch {
          // fallback to room center
        }

        const coords = {
          x: px,
          y: Number((layer.elevationY + room.position[1]).toFixed(2)),
          z: pz,
        };
        this.selectedRoomId = room.id;
        this.pinCoords = coords;
        this._render();

        if (this.callbacks.onSelectRoom) {
          this.callbacks.onSelectRoom(room, layer, coords);
        }
      });
    });
  }
}
