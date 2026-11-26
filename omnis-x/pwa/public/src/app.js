import {
  LAYERS,
  ROOMS,
  CATEGORIES,
  SEVERITIES,
  STATUS_META,
  getCategoryMeta,
  getLayerMeta,
  getRoomMeta,
} from './campusData.js';
import { CampusMap2D } from './campusMap2d.js';
import { EngineClient } from './engineClient.js';
import { enqueueGrievance, getQueuedGrievances, flushQueue } from './offlineQueue.js';

const state = {
  selectedCategory: 'water',
  selectedSubCategory: '',
  selectedSeverity: 'MEDIUM',
  selectedEquipment: '',
  selectedRoom: null,
  selectedLayer: null,
  pinCoords: null,
  photoDataUrl: '',
  grievances: [],
  statusSummary: null,
  config: null,
  desktopMapMode: '2d', // Fast 2D by default; lazy-load 3D only on explicit toggle
  showPower: false,
  showData: false,
  deferredInstallPrompt: null,
};

const $ = (id) => document.getElementById(id);

let map2dDesktop = null;
let map2dMobile = null;
let map3d = null;
let map3dInitialized = false;

function showToast(msg, duration = 3000) {
  const el = $('toast');
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    el.style.display = 'none';
  }, duration);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function syncMapsWithGrievances() {
  if (map2dDesktop) map2dDesktop.setGrievances(state.grievances);
  if (map2dMobile) map2dMobile.setGrievances(state.grievances);
  if (map3d) map3d.setGrievances(state.grievances);
}

async function refreshData() {
  try {
    const { items, statusSummary } = await EngineClient.fetchAll();
    state.grievances = items;
    state.statusSummary = statusSummary;
    localStorage.setItem('omnisx_cached_grievances', JSON.stringify(state.grievances));
    localStorage.setItem('omnisx_cached_status', JSON.stringify(state.statusSummary));
  } catch {
    try {
      state.grievances = JSON.parse(localStorage.getItem('omnisx_cached_grievances') || '[]');
      state.statusSummary = JSON.parse(localStorage.getItem('omnisx_cached_status') || 'null');
    } catch {
      // ignore
    }
  }

  syncMapsWithGrievances();
  renderStatusTab();
  renderAdminTriage();
  await updateQueueBadge();
}

async function loadConfig() {
  try {
    const cfg = await EngineClient.fetchConfig();
    state.config = cfg;
    $('cfg-website-name').value = cfg.websiteName || '';
    $('cfg-integration-mode').value = cfg.integrationMode || 'omnisx';
    $('cfg-webhook-url').value = cfg.webhookUrl || '';
    $('cfg-omnisx-user').value = cfg.omnisxUserId || 'USR-PRINCIPAL';
    $('cfg-auto-forward').checked = cfg.autoForward !== false;
    $('omnisx-user-field').style.display = cfg.integrationMode === 'webhook' ? 'none' : 'block';
    if (cfg.websiteName) {
      $('portal-subtitle').textContent = cfg.websiteName.replace('OMNIS-X • ', '');
    }
  } catch {
    // offline
  }
}

// --- Lightweight 2D Maps (Default on Phone & Desktop) ---
function init2DMaps() {
  const callbacks = {
    onLayerChange: (layerId) => {
      setActiveLayerUI(layerId);
      if (map2dDesktop && map2dDesktop.activeLayerId !== layerId) map2dDesktop.setLayer(layerId);
      if (map2dMobile && map2dMobile.activeLayerId !== layerId) map2dMobile.setLayer(layerId);
      if (map3d) map3d.setLayer(layerId);
    },
    onSelectRoom: (room, layer, coords) => {
      setLocationFromMap(room, layer, coords);
      showToast(`Pinned ${room.code} (${layer.planeNumber})`);
    },
  };

  map2dDesktop = new CampusMap2D($('desktop-map2d-host'), callbacks);
  map2dMobile = new CampusMap2D($('mobile-map2d-host'), callbacks);
}

// --- Lazy-loaded 3D Twin (Desktop optional only — never loaded on phone) ---
async function init3DMapLazy() {
  if (map3dInitialized) return;
  map3dInitialized = true;

  const { CampusMap3D } = await import('./campusMap3d.js');
  const container = $('map3d-container');
  const tooltip = $('hover-tooltip');

  map3d = new CampusMap3D(container, {
    onHoverRoom: (room, pos) => {
      if (!room) {
        tooltip.style.display = 'none';
        return;
      }
      const openCount = state.grievances.filter(
        (g) => g.roomId === room.id && g.status !== 'RESOLVED'
      ).length;
      tooltip.innerHTML = `<strong style="color:#F5D061;">${escapeHtml(room.code)}</strong> • ${escapeHtml(room.name)}<br><span style="color:#9D8EB5;">${
        openCount > 0 ? `${openCount} active issue(s)` : 'Click to pin location'
      }</span>`;
      tooltip.style.left = `${pos.x}px`;
      tooltip.style.top = `${pos.y}px`;
      tooltip.style.display = 'block';
    },
    onSelectRoom: (room, layer, coords) => {
      setLocationFromMap(room, layer, coords);
      showToast(`Pinned ${room.code} (${layer.planeNumber})`);
    },
  });

  map3d.setGrievances(state.grievances);
  if (state.selectedRoom) {
    map3d.selectRoom(state.selectedRoom.id, state.pinCoords);
  }

  const floorPills = $('floor-pills');
  const allBtn = document.createElement('button');
  allBtn.className = 'floor-pill active';
  allBtn.textContent = 'All Levels';
  allBtn.dataset.layer = 'all';
  floorPills.appendChild(allBtn);

  LAYERS.forEach((layer) => {
    const b = document.createElement('button');
    b.className = 'floor-pill';
    b.textContent = layer.planeNumber;
    b.dataset.layer = layer.id;
    floorPills.appendChild(b);
  });

  floorPills.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-layer]');
    if (!btn) return;
    const lid = btn.dataset.layer;
    setActiveLayerUI(lid);
    map3d.setLayer(lid);
    if (lid !== 'all') {
      if (map2dDesktop) map2dDesktop.setLayer(lid);
      if (map2dMobile) map2dMobile.setLayer(lid);
    }
  });

  $('view-presets').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-preset]');
    if (!btn) return;
    $('view-presets').querySelectorAll('button[data-preset]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    map3d.setViewPreset(btn.dataset.preset);
  });

  $('btn-reset-map').addEventListener('click', () => {
    map3d.resetView();
    setActiveLayerUI('all');
    $('explode-slider').value = '1.6';
    $('explode-val').textContent = '1.6m';
    $('view-presets').querySelectorAll('button[data-preset]').forEach((b) => {
      b.classList.toggle('active', b.dataset.preset === 'iso');
    });
  });

  $('explode-slider').addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    $('explode-val').textContent = `${val.toFixed(1)}m`;
    map3d.setExplodedDistance(val);
  });

  $('btn-toggle-power').addEventListener('click', () => {
    state.showPower = !state.showPower;
    $('btn-toggle-power').classList.toggle('active-power', state.showPower);
    map3d.setUtilityLayers({ showPower: state.showPower });
  });

  $('btn-toggle-data').addEventListener('click', () => {
    state.showData = !state.showData;
    $('btn-toggle-data').classList.toggle('active-data', state.showData);
    map3d.setUtilityLayers({ showData: state.showData });
  });
}

function initDesktopModeSwitch() {
  $('map-mode-switch').addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-map-mode]');
    if (!btn) return;
    const mode = btn.dataset.mapMode;
    state.desktopMapMode = mode;

    $('map-mode-switch').querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b.dataset.mapMode === mode);
    });

    if (mode === '3d') {
      $('desktop-map2d-host').style.display = 'none';
      $('desktop-map3d-wrap').style.display = 'block';
      await init3DMapLazy();
      if (map3d) map3d._handleResize();
    } else {
      $('desktop-map3d-wrap').style.display = 'none';
      $('desktop-map2d-host').style.display = 'flex';
    }
  });
}

function setActiveLayerUI(layerId) {
  const layer = layerId === 'all' ? null : getLayerMeta(layerId);
  $('breadcrumb-floor').textContent = layer ? `${layer.planeNumber} (${layer.title})` : 'All Levels';
  $('floor-pills').querySelectorAll('button[data-layer]').forEach((b) => {
    b.classList.toggle('active', b.dataset.layer === layerId);
  });
}

function setLocationFromMap(room, layer, coords) {
  state.selectedRoom = room;
  state.selectedLayer = layer || getLayerMeta(room.layerId);
  state.pinCoords = coords || {
    x: room.position[0],
    y: Number((state.selectedLayer.elevationY + room.position[1]).toFixed(2)),
    z: room.position[2],
  };
  state.selectedEquipment = '';

  setActiveLayerUI(room.layerId);
  $('room-select').value = room.id;

  // Keep both 2D maps & optional 3D map synchronized
  if (map2dDesktop) map2dDesktop.selectRoom(room.id, state.pinCoords);
  if (map2dMobile) map2dMobile.selectRoom(room.id, state.pinCoords);
  if (map3d && map3d.selectedRoomId !== room.id) map3d.selectRoom(room.id, state.pinCoords);

  // Touch-friendly equipment chips
  const eqField = $('equipment-field');
  const eqChips = $('equipment-chips');
  eqChips.innerHTML = '';
  if (room.equipment && room.equipment.length) {
    room.equipment.forEach((eq) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mini-chip';
      btn.textContent = eq;
      btn.addEventListener('click', () => {
        const already = state.selectedEquipment === eq;
        state.selectedEquipment = already ? '' : eq;
        eqChips.querySelectorAll('.mini-chip').forEach((x) => x.classList.remove('active'));
        if (!already) btn.classList.add('active');
      });
      eqChips.appendChild(btn);
    });
    eqField.style.display = 'block';
  } else {
    eqField.style.display = 'none';
  }

  const locBox = $('location-display');
  locBox.classList.add('selected');
  locBox.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
      <span class="badge" style="border-color:rgba(212,175,55,0.45);color:#F5D061;">${escapeHtml(room.code)} • ${escapeHtml(state.selectedLayer.planeNumber)}</span>
      <span class="mono" style="font-size:10px;color:#9D8EB5;">${escapeHtml(room.backendEntityId)}</span>
    </div>
    <div style="font-size:13px;font-weight:700;color:#fff;">${escapeHtml(room.name)}</div>
    <div style="font-size:11px;color:#8A8594;margin-top:2px;">${escapeHtml(room.department)}</div>
  `;
}

function initFormControls() {
  const grid = $('category-grid');
  const filterCat = $('filter-category');

  CATEGORIES.forEach((cat) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `cat-card ${cat.id === state.selectedCategory ? 'active' : ''}`;
    btn.dataset.cat = cat.id;
    btn.innerHTML = `<span class="cat-dot" style="background:${cat.color};"></span><span>${escapeHtml(cat.label)}</span>`;
    grid.appendChild(btn);

    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.label;
    filterCat.appendChild(opt);
  });

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-cat]');
    if (!btn) return;
    selectCategory(btn.dataset.cat);
  });

  selectCategory(state.selectedCategory);

  const roomSelect = $('room-select');
  LAYERS.forEach((layer) => {
    const grp = document.createElement('optgroup');
    grp.label = `${layer.planeNumber} — ${layer.title}`;
    ROOMS.filter((r) => r.layerId === layer.id).forEach((room) => {
      const opt = document.createElement('option');
      opt.value = room.id;
      opt.textContent = `${room.code} — ${room.name}`;
      grp.appendChild(opt);
    });
    roomSelect.appendChild(grp);
  });

  roomSelect.addEventListener('change', () => {
    const room = getRoomMeta(roomSelect.value);
    if (!room) {
      state.selectedRoom = null;
      state.pinCoords = null;
      state.selectedEquipment = '';
      $('location-display').classList.remove('selected');
      $('location-display').innerHTML = '<div class="location-empty">Tap any room on the college floor plan, or select from the list below.</div>';
      $('equipment-field').style.display = 'none';
      if (map2dDesktop) map2dDesktop.clearSelection();
      if (map2dMobile) map2dMobile.clearSelection();
      if (map3d) map3d.clearSelection();
      return;
    }
    const layer = getLayerMeta(room.layerId);
    setLocationFromMap(room, layer, {
      x: room.position[0],
      y: Number((layer.elevationY + room.position[1]).toFixed(2)),
      z: room.position[2],
    });
  });

  const sevRow = $('severity-row');
  SEVERITIES.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `sev-btn ${s.id === state.selectedSeverity ? 'active' : ''}`;
    b.dataset.sev = s.id;
    b.textContent = s.label;
    sevRow.appendChild(b);
  });

  sevRow.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-sev]');
    if (!b) return;
    state.selectedSeverity = b.dataset.sev;
    sevRow.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.sev === state.selectedSeverity);
    });
  });

  const DEMO_STUDENT = {
    name: 'Priya Verma',
    id: 'ENG24CS042',
    contact: 'priya.v@student.apex.edu',
    username: 'student',
    password: 'StudentPass!123',
    role: 'STUDENT',
  };

  function applyStudentCredentials() {
    $('student-name').value = DEMO_STUDENT.name;
    $('student-id').value = DEMO_STUDENT.id;
    $('student-contact').value = DEMO_STUDENT.contact;
    $('anon-toggle').checked = false;
    $('student-fields').style.display = 'block';
    localStorage.setItem(
      'omnisx_student_profile',
      JSON.stringify({ name: DEMO_STUDENT.name, id: DEMO_STUDENT.id, contact: DEMO_STUDENT.contact })
    );
    const statusText = $('student-status-text');
    if (statusText) statusText.textContent = `Authenticated: ${DEMO_STUDENT.name} (${DEMO_STUDENT.id})`;
    showToast(`Loaded Student: ${DEMO_STUDENT.name} (${DEMO_STUDENT.username} / ${DEMO_STUDENT.password})`);
  }

  $('btn-fill-student-creds')?.addEventListener('click', applyStudentCredentials);
  $('btn-quick-fill-top')?.addEventListener('click', applyStudentCredentials);

  try {
    const savedProfile = JSON.parse(localStorage.getItem('omnisx_student_profile') || '{}');
    if (savedProfile.name) {
      $('student-name').value = savedProfile.name;
      $('student-id').value = savedProfile.id || DEMO_STUDENT.id;
      $('student-contact').value = savedProfile.contact || DEMO_STUDENT.contact;
    } else {
      // Default to demo student credentials
      $('student-name').value = DEMO_STUDENT.name;
      $('student-id').value = DEMO_STUDENT.id;
      $('student-contact').value = DEMO_STUDENT.contact;
    }
  } catch {
    $('student-name').value = DEMO_STUDENT.name;
    $('student-id').value = DEMO_STUDENT.id;
    $('student-contact').value = DEMO_STUDENT.contact;
  }

  $('anon-toggle').addEventListener('change', (e) => {
    $('student-fields').style.display = e.target.checked ? 'none' : 'block';
  });

  $('photo-input').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      state.photoDataUrl = await compressImageToDataUrl(file, 800, 0.72);
      $('photo-preview').src = state.photoDataUrl;
      $('photo-preview-wrap').style.display = 'flex';
      $('photo-preview-wrap').style.alignItems = 'center';
    } catch {
      showToast('Could not process image');
    }
  });

  $('btn-clear-photo').addEventListener('click', () => {
    state.photoDataUrl = '';
    $('photo-input').value = '';
    $('photo-preview-wrap').style.display = 'none';
  });

  $('btn-new-report').addEventListener('click', () => {
    $('submission-success').style.display = 'none';
    $('report-form-container').style.display = 'block';
  });

  $('grievance-form').addEventListener('submit', handleSubmitGrievance);
}

function selectCategory(catId) {
  state.selectedCategory = catId;
  const cat = getCategoryMeta(catId);
  $('selected-cat-badge').textContent = cat.shortLabel.toUpperCase();
  $('issue-title').placeholder = cat.quickPlaceholder;

  $('category-grid').querySelectorAll('button[data-cat]').forEach((b) => {
    b.classList.toggle('active', b.dataset.cat === catId);
  });

  const chips = $('subcategory-chips');
  chips.innerHTML = '';
  state.selectedSubCategory = cat.subCategories[0] || '';
  cat.subCategories.forEach((sub, idx) => {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = `mini-chip ${idx === 0 ? 'active' : ''}`;
    c.textContent = sub;
    c.addEventListener('click', () => {
      state.selectedSubCategory = sub;
      chips.querySelectorAll('.mini-chip').forEach((x) => x.classList.remove('active'));
      c.classList.add('active');
      if (!$('issue-title').value.trim()) {
        $('issue-title').value = state.selectedRoom ? `${sub} in ${state.selectedRoom.code}` : sub;
      }
    });
    chips.appendChild(c);
  });
}

function compressImageToDataUrl(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleSubmitGrievance(e) {
  e.preventDefault();
  if (!state.selectedRoom) {
    showToast('Tap a room on the floor plan first.');
    return;
  }

  const title = $('issue-title').value.trim();
  const description = $('issue-desc').value.trim();
  if (!title || !description) {
    showToast('Please enter a short headline and details.');
    return;
  }

  const anonymous = $('anon-toggle').checked;
  const studentName = $('student-name').value.trim();
  const studentId = $('student-id').value.trim();
  const studentContact = $('student-contact').value.trim();

  if (!anonymous) {
    localStorage.setItem(
      'omnisx_student_profile',
      JSON.stringify({ name: studentName, id: studentId, contact: studentContact })
    );
  }

  const payload = {
    category: state.selectedCategory,
    subCategory: state.selectedSubCategory,
    title,
    description,
    severity: state.selectedSeverity,
    layerId: state.selectedRoom.layerId,
    layerTitle: state.selectedLayer?.title || '',
    roomId: state.selectedRoom.id,
    roomCode: state.selectedRoom.code,
    roomName: state.selectedRoom.name,
    backendEntityId: state.selectedRoom.backendEntityId || state.selectedRoom.id,
    department: state.selectedRoom.department,
    equipment: state.selectedEquipment,
    locationNote: $('location-note').value.trim(),
    pinCoords: state.pinCoords || { x: 0, y: 0, z: 0 },
    anonymous,
    studentName,
    studentId,
    studentContact,
    photoDataUrl: state.photoDataUrl,
  };

  const btn = $('btn-submit');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    if (!navigator.onLine) throw new Error('offline');
    const item = await EngineClient.submitGrievance(payload);
    resetFormFields();
    await refreshData();

    $('success-ticket-code').textContent = item.ticketCode;
    $('success-sync-note').textContent =
      item.webhookStatus && item.webhookStatus.startsWith('forwarded')
        ? `Dispatched to OMNIS-X (${item.backendEntityId}) and saved locally.`
        : `Saved in Campus Portal for ${item.roomCode} (${item.backendEntityId}).`;
    $('report-form-container').style.display = 'none';
    $('submission-success').style.display = 'block';
  } catch {
    await enqueueGrievance(payload);
    await updateQueueBadge();
    resetFormFields();
    showToast('Saved offline — will auto-sync when online.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Incident Report';
  }
}

function resetFormFields() {
  $('issue-title').value = '';
  $('issue-desc').value = '';
  $('location-note').value = '';
  state.selectedEquipment = '';
  $('equipment-chips').querySelectorAll('.mini-chip').forEach((x) => x.classList.remove('active'));
  state.photoDataUrl = '';
  $('photo-input').value = '';
  $('photo-preview-wrap').style.display = 'none';
}

function renderStatusTab() {
  const cardsEl = $('system-status-cards');
  const feedEl = $('grievance-feed');
  const s = state.statusSummary;

  const badgeColor = (st) => {
    if (st === 'CRITICAL') return '#E05D5D';
    if (st === 'DEGRADED') return '#E5A83B';
    if (st === 'ADVISORY') return '#D4AF37';
    return '#52B788';
  };

  if (s) {
    const sysList = [
      { key: 'water', title: 'Water & Coolers' },
      { key: 'ac', title: 'Air Conditioning' },
      { key: 'faculty', title: 'Teacher / Classes' },
      { key: 'electrical', title: 'Power & Lights' },
      { key: 'network', title: 'Wi-Fi & Labs' },
      { key: 'facilities', title: 'Hygiene & Facility' },
    ];
    cardsEl.innerHTML = sysList
      .map((sys) => {
        const info = s.systems[sys.key] || { state: 'OPERATIONAL', openCount: 0, affectedRooms: [] };
        const col = badgeColor(info.state);
        const roomsText = info.affectedRooms.length ? info.affectedRooms.join(', ') : 'All normal';
        return `
        <div class="stat-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
            <span style="font-size:11px;font-weight:600;color:#E2E1E6;">${sys.title}</span>
            <span class="badge" style="border-color:${col};color:${col};">${info.state}</span>
          </div>
          <div class="mono" style="font-size:10px;color:#8A8594;">
            Open: <strong style="color:#E2E1E6;">${info.openCount}</strong> • ${escapeHtml(roomsText)}
          </div>
        </div>`;
      })
      .join('');
  }

  const catFilter = $('filter-category').value;
  const stFilter = $('filter-status').value;
  const search = $('filter-search').value.trim().toLowerCase();

  const filtered = state.grievances.filter((g) => {
    if (catFilter !== 'ALL' && g.category !== catFilter) return false;
    if (stFilter !== 'ALL' && g.status !== stFilter) return false;
    if (search) {
      const hay = `${g.ticketCode} ${g.title} ${g.description} ${g.roomCode} ${g.roomName} ${g.equipment}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  if (!filtered.length) {
    feedEl.innerHTML = '<div class="section-card" style="text-align:center;color:#8A8594;font-size:12px;">No grievances reported yet. All campus areas are clear.</div>';
    return;
  }

  feedEl.innerHTML = filtered
    .map((g) => {
      const cat = getCategoryMeta(g.category);
      const stMeta = STATUS_META[g.status] || { label: g.status, color: '#9D8EB5' };
      return `
      <div class="ticket-card" data-focus-room="${escapeHtml(g.roomId)}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:5px;">
          <span class="mono" style="font-size:10px;color:#F5D061;">${escapeHtml(g.ticketCode)} • ${escapeHtml(g.roomCode)}</span>
          <span class="badge" style="border-color:${stMeta.color};color:${stMeta.color};">${escapeHtml(stMeta.label)}</span>
        </div>
        <div style="font-size:13px;font-weight:600;color:#E2E1E6;margin-bottom:4px;">${escapeHtml(g.title)}</div>
        <div style="font-size:12px;color:#8A8594;line-height:1.45;margin-bottom:8px;">${escapeHtml(g.description)}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
          <span class="badge" style="border-color:${cat.color};color:${cat.color};">${escapeHtml(cat.shortLabel)}</span>
          <span class="badge">${escapeHtml(g.severity)}</span>
          ${g.equipment ? `<span class="badge">${escapeHtml(g.equipment)}</span>` : ''}
          <span class="mono" style="font-size:10px;color:#8A8594;margin-left:auto;">${escapeHtml(formatTime(g.createdAt))}</span>
        </div>
        ${g.resolutionNote ? `<div style="margin-top:8px;padding:6px 8px;background:rgba(82,183,136,0.08);border-left:2px solid #52B788;font-size:11px;color:#cce8db;">Update: ${escapeHtml(g.resolutionNote)}</div>` : ''}
        ${g.photoDataUrl ? `<img src="${g.photoDataUrl}" alt="Attachment" style="margin-top:8px;max-height:84px;border-radius:6px;border:1px solid #2D303E;" />` : ''}
      </div>`;
    })
    .join('');

  feedEl.querySelectorAll('.ticket-card[data-focus-room]').forEach((card) => {
    card.addEventListener('click', () => {
      const rid = card.dataset.focusRoom;
      const room = getRoomMeta(rid);
      if (room) {
        if (map2dDesktop) map2dDesktop.selectRoom(rid, null);
        if (map2dMobile) map2dMobile.selectRoom(rid, null);
        if (map3d) map3d.selectRoom(rid, null);
        setActiveLayerUI(room.layerId);
      }
    });
  });
}

function renderAdminTriage() {
  const el = $('admin-triage-list');
  if (!state.grievances.length) {
    el.innerHTML = '<div style="font-size:12px;color:#8A8594;">No grievances submitted yet.</div>';
    return;
  }

  el.innerHTML = state.grievances
    .map(
      (g) => `
      <div style="border:1px solid #252833;border-radius:6px;padding:10px;margin-bottom:8px;background:#14151C;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <strong class="mono" style="font-size:11px;color:#F5D061;">${escapeHtml(g.ticketCode)} • ${escapeHtml(g.roomCode)}</strong>
          <span class="mono" style="font-size:10px;color:#9D8EB5;">${escapeHtml(g.webhookStatus)}</span>
        </div>
        <div style="font-size:12px;font-weight:500;margin-bottom:8px;color:#E2E1E6;">${escapeHtml(g.title)}</div>
        <div style="display:flex;gap:6px;align-items:center;">
          <select class="select triage-status" data-id="${escapeHtml(g.id)}" style="padding:5px;font-size:12px;">
            ${['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED']
              .map((st) => `<option value="${st}" ${g.status === st ? 'selected' : ''}>${st}</option>`)
              .join('')}
          </select>
          <input class="input triage-note" data-id="${escapeHtml(g.id)}" type="text" value="${escapeHtml(g.resolutionNote)}" placeholder="Resolution note..." style="padding:5px 8px;font-size:12px;" />
          <button type="button" class="btn btn-sm btn-gold triage-save" data-id="${escapeHtml(g.id)}">Save</button>
        </div>
      </div>`
    )
    .join('');

  el.querySelectorAll('.triage-save').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const status = el.querySelector(`.triage-status[data-id="${id}"]`).value;
      const resolutionNote = el.querySelector(`.triage-note[data-id="${id}"]`).value;
      try {
        await EngineClient.updateGrievanceStatus(id, { status, resolutionNote });
        showToast('Status updated');
        await refreshData();
      } catch (err) {
        showToast(`Failed: ${err.message}`);
      }
    });
  });
}

function initPortalTab() {
  $('cfg-integration-mode').addEventListener('change', (e) => {
    $('omnisx-user-field').style.display = e.target.value === 'webhook' ? 'none' : 'block';
  });

  $('btn-save-config').addEventListener('click', async () => {
    const body = {
      websiteName: $('cfg-website-name').value.trim(),
      integrationMode: $('cfg-integration-mode').value,
      webhookUrl: $('cfg-webhook-url').value.trim(),
      omnisxUserId: $('cfg-omnisx-user').value.trim(),
      autoForward: $('cfg-auto-forward').checked,
    };
    const authVal = $('cfg-auth-header').value.trim();
    if (authVal) body.webhookAuthHeader = authVal;

    try {
      const cfg = await EngineClient.saveConfig(body);
      state.config = cfg;
      $('cfg-auth-header').value = '';
      if (cfg.websiteName) {
        $('portal-subtitle').textContent = cfg.websiteName.replace('OMNIS-X • ', '');
      }
      showToast('OMNIS-X connection settings saved');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  });

  $('btn-test-webhook').addEventListener('click', async () => {
    const webhookUrl = $('cfg-webhook-url').value.trim();
    const webhookAuthHeader = $('cfg-auth-header').value.trim();
    try {
      const res = await EngineClient.testConnection({ webhookUrl, webhookAuthHeader });
      showToast(res.result);
    } catch (err) {
      showToast(`Connection test failed: ${err.message}`);
    }
  });

  $('btn-export-json').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state.grievances, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `omnisx-grievances-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  });

  $('filter-category').addEventListener('change', renderStatusTab);
  $('filter-status').addEventListener('change', renderStatusTab);
  $('filter-search').addEventListener('input', renderStatusTab);
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn, .mobile-nav button').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === tabId);
  });
  ['report', 'status', 'portal'].forEach((id) => {
    $(`tab-${id}`).style.display = id === tabId ? 'block' : 'none';
  });
}

function initNavigation() {
  document.querySelectorAll('.tab-btn, .mobile-nav button').forEach((b) => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });
}

async function updateQueueBadge() {
  try {
    const q = await getQueuedGrievances();
    $('queue-count').textContent = String(q.length);
    $('btn-sync-queue').style.display = q.length > 0 ? 'inline-flex' : 'none';
  } catch {
    // ignore
  }
}

async function syncQueuedItems() {
  if (!navigator.onLine) return;
  const { synced } = await flushQueue((payload) => EngineClient.submitGrievance(payload));
  await updateQueueBadge();
  if (synced.length > 0) {
    showToast(`Synced ${synced.length} offline report(s)`);
    await refreshData();
  }
}

function initConnectivityAndPWA() {
  const updateOnlineStatus = () => {
    const online = navigator.onLine;
    $('conn-dot').classList.toggle('offline', !online);
    $('conn-label').textContent = online ? 'ONLINE' : 'OFFLINE';
    if (online) syncQueuedItems();
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  $('btn-sync-queue').addEventListener('click', syncQueuedItems);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredInstallPrompt = e;
    $('btn-install-pwa').style.display = 'inline-flex';
  });

  $('btn-install-pwa').addEventListener('click', async () => {
    if (!state.deferredInstallPrompt) return;
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    $('btn-install-pwa').style.display = 'none';
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

async function boot() {
  initNavigation();
  initFormControls();
  initPortalTab();
  init2DMaps();
  initDesktopModeSwitch();
  initConnectivityAndPWA();
  await Promise.all([loadConfig(), refreshData()]);
}

boot();
