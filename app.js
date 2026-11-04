const state = {
  scenario: 0,
  paused: false,
  progress: 64,
  alarmFilter: 'all',
  acknowledged: new Set(),
  soundEnabled: false,
  audioContext: null,
  alternateVisible: true,
  selectedRoute: 'preferred',
  liveSimulation: false,
  liveTimer: null,
  toastTimer: null,
  lastUpdated: 0
};

const scenarios = [
  { name: 'Monsoon corridor / 01', rain: 78, traffic: 64, route: 'river', note: 'Heavy rain developing' },
  { name: 'Market district / 02', rain: 58, traffic: 82, route: 'market', note: 'Traffic density rising' },
  { name: 'Civic quarter / 03', rain: 36, traffic: 47, route: 'civic', note: 'Weather clearing' }
];

const alarms = [
  { id: 'rain', type: 'high', icon: '≋', title: 'Heavy rain cell', body: 'Visibility dropping on River Loop', time: '4 min ago', tag: 'WEATHER' },
  { id: 'tree', type: 'high', icon: '×', title: 'Fallen tree reported', body: 'North Ring Road · lane partially blocked', time: '7 min ago', tag: 'OBSTRUCTION' },
  { id: 'traffic', type: 'medium', icon: '↝', title: 'Traffic surge', body: 'Market St. delay now +14 minutes', time: '11 min ago', tag: 'TRAFFIC' }
];

const hospitals = [
  { name: 'Central Medical', area: 'Civic Quarter', time: '08 min', capacity: '82%', status: 'Ready', beds: '18 beds', doctors: '6 doctors', phone: '+91 80 4455 1200', tone: 'good' },
  { name: 'St. Agnes Trauma', area: 'River East', time: '12 min', capacity: '64%', status: 'Ready', beds: '11 beds', doctors: '4 doctors', phone: '+91 80 4455 1422', tone: 'good' },
  { name: 'Northside General', area: 'Kalyan Nagar', time: '15 min', capacity: '91%', status: 'Limited', beds: '3 beds', doctors: '2 doctors', phone: '+91 80 4455 1688', tone: 'warn' },
  { name: 'Lakeside Community', area: 'West Bank', time: '19 min', capacity: '76%', status: 'Ready', beds: '9 beds', doctors: '3 doctors', phone: '+91 80 4455 1777', tone: 'good' }
];

const routeCoordinates = [
  { x: 10, y: 81, label: 'Leaving Dispatch' },
  { x: 22, y: 70, label: 'North Ring Road' },
  { x: 31, y: 61, label: 'North Ring Road' },
  { x: 42, y: 65, label: 'River Loop' },
  { x: 49, y: 53, label: 'Civic Quarter' },
  { x: 58, y: 39, label: 'Civic Quarter' },
  { x: 68, y: 43, label: 'Approaching handoff' },
  { x: 80, y: 25, label: 'Central Medical' }
];

const alternateRouteCoordinates = [
  { x: 10, y: 81, label: 'Leaving Dispatch' },
  { x: 18, y: 71, label: 'River Loop' },
  { x: 29, y: 75, label: 'River Loop' },
  { x: 43, y: 69, label: 'River Loop' },
  { x: 55, y: 58, label: 'Civic Quarter' },
  { x: 68, y: 60, label: 'Civic Quarter' },
  { x: 75, y: 48, label: 'Approaching handoff' },
  { x: 80, y: 25, label: 'Central Medical' }
];

const briefCopy = [
  'Assess alerts first, then move the unit and confirm the safest handoff.',
  'Coordinate by advancing the simulated unit and watching the ETA change with route risk.',
  'Transfer with confidence by comparing hospital capacity before the handoff.'
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function renderAlarms() {
  const list = $('#alarmList');
  const openAlarms = alarms.filter((alarm) => !state.acknowledged.has(alarm.id));
  list.innerHTML = alarms.map((alarm) => {
    const isAcknowledged = state.acknowledged.has(alarm.id);
    return `<div class="alarm-item ${alarm.type} ${isAcknowledged ? 'acknowledged' : ''}">
      <div class="alarm-icon">${alarm.icon}</div>
      <div><strong>${alarm.title}</strong><p>${alarm.body}</p><button class="ack-button" data-alarm="${alarm.id}" type="button">${isAcknowledged ? 'Acknowledged ✓' : 'Acknowledge alarm'}</button></div>
      <small>${alarm.time}</small>
    </div>`;
  }).join('');
  $('#alarmCount').textContent = String(openAlarms.length).padStart(2, '0');
  $('#alarmNavCount').textContent = String(openAlarms.length).padStart(2, '0');
  $$('.ack-button').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.alarm;
    if (state.acknowledged.has(id)) state.acknowledged.delete(id); else state.acknowledged.add(id);
    renderAlarms();
    showToast(state.acknowledged.has(id) ? 'Alarm acknowledged — response board updated.' : 'Alarm returned to the active queue.');
  }));
}

function renderHospitals() {
  $('#hospitalList').innerHTML = hospitals.map((hospital) => `<div class="hospital-row">
    <span class="hospital-name"><button class="hospital-expand" aria-expanded="false" aria-label="Show details for ${hospital.name}" type="button">+</button><span><strong>${hospital.name}</strong><small>${hospital.area}</small></span></span>
    <span>${hospital.time}</span><span class="capacity ${hospital.tone === 'warn' ? 'warn' : ''}">${hospital.capacity}</span><span class="hospital-status ${hospital.tone === 'warn' ? 'warn' : ''}"><span></span>${hospital.status}</span><span class="hospital-detail-hint">View details</span><span class="row-arrow">›</span>
    <div class="hospital-details" hidden><div><small>CONTACT</small><button class="call-button" data-hospital="${hospital.name}" type="button">Call ${hospital.phone}</button></div><div><small>AVAILABLE BEDS</small><strong>${hospital.beds}</strong></div><div><small>AVAILABLE DOCTORS</small><strong>${hospital.doctors}</strong></div><div><small>RECEIVING STATUS</small><strong>${hospital.status} · ${hospital.capacity} capacity</strong></div></div>
  </div>`).join('');
  $$('.hospital-expand').forEach((button) => button.addEventListener('click', () => {
    const row = button.closest('.hospital-row');
    const details = row.querySelector('.hospital-details');
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    button.textContent = expanded ? '+' : '−';
    details.hidden = expanded;
    row.classList.toggle('expanded', !expanded);
  }));
  $$('.call-button').forEach((button) => button.addEventListener('click', () => showToast(`Sample call queued for ${button.dataset.hospital}.`)));
}

function updateRoute() {
  const activeCoordinates = state.selectedRoute === 'alternate' ? alternateRouteCoordinates : routeCoordinates;
  const point = activeCoordinates[Math.min(activeCoordinates.length - 1, Math.floor((state.progress / 100) * activeCoordinates.length))];
  const x = activeCoordinates[Math.min(activeCoordinates.length - 1, Math.floor(state.progress / 100 * activeCoordinates.length))];
  const marker = $('#ambulanceMarker');
  marker.style.left = `${x.x}%`;
  marker.style.top = `${x.y}%`;
  $('#progressFill').style.width = `${state.progress}%`;
  $('#progressLabel').textContent = `${state.progress}%`;
  $('#routeStatus').textContent = point.label;
  $('#checkpointLabel').textContent = point.label === 'Central Medical' ? 'HANDOFF' : point.label.toUpperCase();
  const totalSeconds = Math.max(0, Math.round((100 - state.progress) * (state.selectedRoute === 'alternate' ? 10 : 14)));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  $('#etaValue').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  $('#etaSubtext').textContent = state.progress > 88 ? 'handoff ready' : 'to Central Medical';
  const reached = state.progress >= 94;
  $('#destinationStatus').textContent = reached ? 'REACHED' : 'EN ROUTE';
  $('#destinationStrip').classList.toggle('reached', reached);
  $('#destinationNote').textContent = reached ? 'Arrived at 19:50 · handoff complete' : 'Handoff planned · receiving unit notified';
  if (reached) {
    $('#etaValue').textContent = '00:00';
    $('#etaSubtext').textContent = 'Central Medical';
    $('#routeStatus').textContent = 'Handoff complete';
  }
  $('#routeSvg').classList.toggle('route-alt', state.selectedRoute === 'alternate');
  $$('.route-option').forEach((option) => option.classList.toggle('active', option.dataset.route === state.selectedRoute));
}

function selectRoute(route) {
  state.selectedRoute = route;
  updateRoute();
  showToast(route === 'alternate' ? 'River Loop selected — ETA recalculated with lower obstruction risk.' : 'North Ring Road selected — fastest clear-traffic route.');
}

function runAlternateScenario() {
  state.acknowledged.delete('tree');
  state.acknowledged.delete('rain');
  state.progress = Math.max(34, Math.min(state.progress, 72));
  setAlternateVisibility(true);
  selectRoute('alternate');
  renderAlarms();
  $('#scenarioName').textContent = 'Obstruction response / 04';
  $('#rainMetric').textContent = '86';
  $('#trafficMetric').textContent = '79';
  const foot = $('.metric-highlight .metric-foot');
  if (foot) foot.childNodes[2].textContent = ' Heavy rain + fallen tree ';
  showToast('Scenario active: North Ring Road blocked — River Loop diversion applied.');
}

function setAlternateVisibility(visible) {
  state.alternateVisible = visible;
  $('#alternateRoute').classList.toggle('route-hidden', !visible);
  $('#alternateRouteLabel').classList.toggle('route-hidden', !visible);
  const button = $('#alternateButton');
  button.classList.toggle('active', visible);
  button.innerHTML = visible ? '<span>⌁</span> Hide alternate' : '<span>⌁</span> Show alternate';
}

function playAlarmTone() {
  if (!state.soundEnabled) return;
  state.audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  const now = state.audioContext.currentTime;
  [0, .18].forEach((offset, index) => {
    const oscillator = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = index === 0 ? 740 : 920;
    gain.gain.setValueAtTime(.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(.12, now + offset + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, now + offset + .14);
    oscillator.connect(gain).connect(state.audioContext.destination);
    oscillator.start(now + offset);
    oscillator.stop(now + offset + .15);
  });
}

function setSoundState(enabled) {
  state.soundEnabled = enabled;
  const labels = enabled ? ['♫', 'Sound on'] : ['♩', 'Sound off'];
  const panelButton = $('#soundToggle');
  const heroButton = $('#soundHeroToggle');
  panelButton.setAttribute('aria-pressed', String(enabled));
  panelButton.innerHTML = `<span>${labels[0]}</span> ${labels[1]}`;
  heroButton.setAttribute('aria-pressed', String(enabled));
  heroButton.innerHTML = enabled ? '<span>♫</span> Sound enabled' : '<span>♩</span> Enable sound';
}

function setLiveSimulation(enabled) {
  state.liveSimulation = enabled;
  const button = $('#liveRunButton');
  button.setAttribute('aria-pressed', String(enabled));
  button.innerHTML = enabled ? '<span>Ⅱ</span> Live running' : '<span>▶</span> Run live';
  window.clearInterval(state.liveTimer);
  if (enabled) {
    state.liveTimer = window.setInterval(advanceScenario, 4500);
    showToast('Live simulation running — route and ETA will update automatically.');
  } else {
    showToast('Live simulation paused. Use Advance scenario for manual control.');
  }
}

function applyScenario(index, announce = true) {
  state.scenario = index % scenarios.length;
  const scenario = scenarios[state.scenario];
  $('#scenarioName').textContent = scenario.name;
  $('#rainMetric').textContent = scenario.rain;
  $('#trafficMetric').textContent = scenario.traffic;
  const foot = $('.metric-highlight .metric-foot');
  if (foot) foot.childNodes[2].textContent = ` ${scenario.note} `;
  state.progress = state.scenario === 1 ? 34 : state.scenario === 2 ? 82 : 64;
  updateRoute();
  if (announce) showToast(`Loaded ${scenario.name} — simulated conditions refreshed.`);
}

function advanceScenario() {
  if (state.paused) return;
  if (state.progress >= 94) {
    state.progress = 18;
    showToast('New response cycle started at dispatch.');
  } else {
    state.progress = Math.min(96, state.progress + 8);
    showToast(state.progress >= 90 ? 'Unit A–07 is arriving at Central Medical.' : state.selectedRoute === 'alternate' ? 'Unit A–07 advanced along River Loop.' : 'Unit A–07 advanced along the preferred route.');
  }
  updateRoute();
  playAlarmTone();
}

function showToast(message) {
  $('#toastMessage').textContent = message;
  $('#toast').classList.add('show');
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => $('#toast').classList.remove('show'), 3200);
}

function openDashboard(accessMode = 'signed-in') {
  localStorage.setItem('rainwatchAccess', accessMode);
  $('#authScreen').hidden = true;
  $('#appShell').hidden = false;
  showToast(accessMode === 'emergency' ? 'Emergency access granted — dashboard opened without sign-in.' : 'Signed in as Alex Rivera — dashboard ready.');
}

function openAccessScreen() {
  localStorage.removeItem('rainwatchAccess');
  $('#appShell').hidden = true;
  $('#authScreen').hidden = false;
}

function bindAccessAndProfile() {
  let createMode = false;
  $('#authForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if ($('#authEmail').value.trim()) openDashboard('signed-in');
  });
  $('#toggleAuthMode').addEventListener('click', () => {
    createMode = !createMode;
    $('#authTitle').textContent = createMode ? 'Create operator access.' : 'Welcome back.';
    $('#authSubtitle').textContent = createMode ? 'Set up a demo operator profile for the response board.' : 'Sign in to open the emergency response board.';
    $('#authSubmitLabel').textContent = createMode ? 'Create account & continue' : 'Sign in to dashboard';
    $('#toggleAuthMode').textContent = createMode ? 'Already have access? Sign in' : 'Create a demo operator account';
    $('#authPassword').placeholder = createMode ? 'Create demo password' : 'Enter demo password';
  });
  $('#skipAuth').addEventListener('click', () => openDashboard('emergency'));
  $('#profileButton').addEventListener('click', () => { $('#profileModal').hidden = false; });
  $('#closeProfile').addEventListener('click', () => { $('#profileModal').hidden = true; });
  $('#saveProfile').addEventListener('click', () => {
    const name = $('#profileNameInput').value.trim() || 'Alex Rivera';
    $('#profileName').textContent = name;
    $('.operator-chip strong').textContent = name;
    showToast(`Profile saved for ${name}.`);
    $('#profileModal').hidden = true;
  });
  $('#signOut').addEventListener('click', () => { $('#profileModal').hidden = true; openAccessScreen(); });
  $('#profileModal').addEventListener('click', (event) => { if (event.target === $('#profileModal')) $('#profileModal').hidden = true; });
  if (localStorage.getItem('rainwatchAccess')) openDashboard(localStorage.getItem('rainwatchAccess'));
}

function startClock() {
  const clock = $('#clockTime');
  const initial = new Date();
  let seconds = initial.getSeconds();
  let minutes = 42;
  let hours = 19;
  window.setInterval(() => {
    if (state.paused) return;
    seconds += 1;
    if (seconds >= 60) { seconds = 0; minutes += 1; }
    if (minutes >= 60) { minutes = 0; hours += 1; }
    clock.textContent = [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
    if (Math.random() > .74) $('#mapUpdated').textContent = 'a few sec ago';
  }, 1000);
}

function bindInteractions() {
  $('#advanceButton').addEventListener('click', advanceScenario);
  $('#liveRunButton').addEventListener('click', () => setLiveSimulation(!state.liveSimulation));
  $('#soundHeroToggle').addEventListener('click', () => {
    setSoundState(!state.soundEnabled);
    if (state.soundEnabled) { playAlarmTone(); showToast('Alarm sound enabled for the simulation.'); }
    else showToast('Alarm sound muted.');
  });
  $('#markArrived').addEventListener('click', () => { state.progress = 96; updateRoute(); showToast('Ambulance reached Central Medical — handoff complete.'); });
  $('#destinationExpand').addEventListener('click', (event) => {
    const expanded = event.currentTarget.getAttribute('aria-expanded') === 'true';
    event.currentTarget.setAttribute('aria-expanded', String(!expanded));
    event.currentTarget.textContent = expanded ? '+' : '−';
    $('#destinationDetails').hidden = expanded;
    $('#destinationStrip').classList.toggle('destination-expanded', !expanded);
  });
  $('#runAlternateScenario').addEventListener('click', runAlternateScenario);
  $$('.route-option').forEach((option) => option.addEventListener('click', () => selectRoute(option.dataset.route)));
  $('#applyPlan').addEventListener('click', () => { setAlternateVisibility(true); selectRoute('alternate'); state.progress = Math.min(94, state.progress + 5); updateRoute(); showToast('River Loop applied — 6 minute saving reflected on route.'); });
  $('#alternateButton').addEventListener('click', () => { setAlternateVisibility(!state.alternateVisible); showToast(state.alternateVisible ? 'Alternate emergency route is visible.' : 'Alternate route hidden from the map.'); });
  $('#soundToggle').addEventListener('click', (event) => {
    setSoundState(!state.soundEnabled);
    if (state.soundEnabled) { playAlarmTone(); showToast('Alarm sound enabled for the simulation.'); }
    else showToast('Alarm sound muted.');
  });
  $('#pauseButton').addEventListener('click', (event) => { state.paused = !state.paused; event.currentTarget.innerHTML = state.paused ? '<span>▶</span> Resume feed' : '<span>Ⅱ</span> Pause feed'; $('#clockLabel').textContent = state.paused ? 'FEED PAUSED' : 'LIVE DEMO'; showToast(state.paused ? 'Simulation paused for presenter narration.' : 'Simulation feed resumed.'); });
  $('#scenarioSelect').addEventListener('click', () => applyScenario(state.scenario + 1));
  $('#filterHospitals').addEventListener('click', () => showToast('Filter preview: showing facilities within 20 minutes.'));
  $$('.brief-step').forEach((step) => step.addEventListener('click', () => {
    const index = Number(step.dataset.brief);
    $$('.brief-step').forEach((item) => item.classList.toggle('active', item === step));
    $('#briefCaption').textContent = briefCopy[index];
    if (index === 0) $('#alarmPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (index === 1) $('#routePanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (index === 2) $('#hospitalsPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
  $('#briefHelp').addEventListener('click', () => { $('#guideModal').hidden = false; });
  $('#whyButton').addEventListener('click', () => showToast('Why: traffic is 64% on North Ring Road; River Loop avoids the obstruction and saves about 6 minutes.'));
  $('#showHospitals').addEventListener('click', () => { $('#hospitalsPanel').scrollIntoView({ behavior: 'smooth', block: 'center' }); showToast('Hospital network expanded for handoff planning.'); });
  $('#viewAllAlarms').addEventListener('click', () => { $('#alarmPanel').scrollIntoView({ behavior: 'smooth', block: 'center' }); showToast('Active alarm queue is shown in this demo view.'); });
  $('#settingsButton').addEventListener('click', () => showToast('Demo settings are locked to sample data mode.'));
  $$('.nav-item').forEach((item) => item.addEventListener('click', () => {
    $$('.nav-item').forEach((nav) => nav.classList.remove('active'));
    item.classList.add('active');
    const target = item.dataset.view === 'alarms' ? '#alarmPanel' : item.dataset.view === 'hospitals' ? '#hospitalsPanel' : item.dataset.view === 'route' ? '#routePanel' : '.hero-row';
    $(target).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  const modal = $('#guideModal');
  $('#helpButton').addEventListener('click', () => { modal.hidden = false; });
  $('#closeGuide').addEventListener('click', () => { modal.hidden = true; });
  $('#startDemo').addEventListener('click', () => { modal.hidden = true; state.acknowledged.clear(); applyScenario(0, false); showToast('Walkthrough ready — start by scanning the response picture.'); });
  modal.addEventListener('click', (event) => { if (event.target === modal) modal.hidden = true; });
}

renderAlarms();
renderHospitals();
updateRoute();
setAlternateVisibility(true);
bindInteractions();
bindAccessAndProfile();
startClock();
