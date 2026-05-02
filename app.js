// ===== AUTH & STATE MANAGEMENT =====
const USERS_KEY = 'habit_tracker_users';
const SESSION_KEY = 'habit_tracker_session';
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const DEFAULT_HABITS = [
    { id: 'h1', name: '5:30 AM Wake Up', emoji: '🌅' },
    { id: 'h2', name: 'Workout', emoji: '💪' },
    { id: 'h3', name: 'Read 30 mins', emoji: '📚' },
    { id: 'h4', name: 'No Junk Food', emoji: '🥗' },
    { id: 'h5', name: 'Meditate', emoji: '🧘' },
    { id: 'h6', name: 'Budget Tracking', emoji: '💰' },
];

let currentUser = null;
let authMode = 'login'; // 'login' or 'register'

let state = {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    habits: [],
    checks: {},
    editingHabitId: null,
};

// ===== SIMPLE HASH (for localStorage password storage) =====
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash.toString(36);
}

// ===== USER MANAGEMENT =====
function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch { return {}; }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getUserDataKey(username) {
    return `habit_data_${username}`;
}

// ===== AUTH LOGIC =====
function switchAuthTab(mode) {
    authMode = mode;
    document.getElementById('tab-login').classList.toggle('active', mode === 'login');
    document.getElementById('tab-register').classList.toggle('active', mode === 'register');
    document.getElementById('auth-submit').textContent = mode === 'login' ? 'Sign In' : 'Create Account';
    document.getElementById('auth-error').textContent = '';
}

function handleAuth() {
    const username = document.getElementById('auth-username').value.trim().toLowerCase();
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');

    if (!username || username.length < 3) {
        errorEl.textContent = 'Username must be at least 3 characters.';
        return;
    }
    if (!password || password.length < 4) {
        errorEl.textContent = 'Password must be at least 4 characters.';
        return;
    }

    const users = getUsers();
    const hashed = simpleHash(password);

    if (authMode === 'register') {
        if (users[username]) {
            errorEl.textContent = 'Username already taken. Try another.';
            return;
        }
        users[username] = { password: hashed, createdAt: Date.now() };
        saveUsers(users);
        // Initialize with default habits for new user
        const dataKey = getUserDataKey(username);
        localStorage.setItem(dataKey, JSON.stringify({ habits: DEFAULT_HABITS.map(h => ({...h})), checks: {} }));
        loginUser(username);
    } else {
        if (!users[username]) {
            errorEl.textContent = 'User not found. Please sign up first.';
            return;
        }
        if (users[username].password !== hashed) {
            errorEl.textContent = 'Incorrect password. Try again.';
            return;
        }
        loginUser(username);
    }
}

function loginUser(username) {
    currentUser = username;
    localStorage.setItem(SESSION_KEY, username);
    loadUserData();
    showDashboard();
    renderAll();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem(SESSION_KEY);
    hideDashboard();
}

function showDashboard() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-header').classList.add('visible');
    document.getElementById('main-content').classList.add('visible');
    // Set user info in header
    document.getElementById('user-avatar').textContent = currentUser.charAt(0).toUpperCase();
    document.getElementById('user-name').textContent = currentUser;
    // Clear auth form
    document.getElementById('auth-username').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-error').textContent = '';
}

function hideDashboard() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('app-header').classList.remove('visible');
    document.getElementById('main-content').classList.remove('visible');
    switchAuthTab('login');
}

// ===== PARTICLES =====
function createParticles() {
    const container = document.getElementById('login-particles');
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'login-particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 15 + 's';
        p.style.animationDuration = (10 + Math.random() * 15) + 's';
        p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
        p.style.opacity = 0.1 + Math.random() * 0.3;
        container.appendChild(p);
    }
}

// ===== USER DATA =====
function loadUserData() {
    if (!currentUser) return;
    try {
        const dataKey = getUserDataKey(currentUser);
        const saved = localStorage.getItem(dataKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            state.habits = parsed.habits || [];
            state.checks = parsed.checks || {};
        } else {
            state.habits = DEFAULT_HABITS.map(h => ({...h}));
            state.checks = {};
            saveState();
        }
    } catch {
        state.habits = DEFAULT_HABITS.map(h => ({...h}));
        state.checks = {};
    }
}

function saveState() {
    if (!currentUser) return;
    const dataKey = getUserDataKey(currentUser);
    localStorage.setItem(dataKey, JSON.stringify({
        habits: state.habits,
        checks: state.checks,
    }));
}

function generateId() {
    return 'h' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getMonthKey() {
    return `${state.currentYear}-${String(state.currentMonth + 1).padStart(2, '0')}`;
}

function getDaysInMonth() {
    return new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
}

function isChecked(habitId, day) {
    const mk = getMonthKey();
    return !!(state.checks[mk] && state.checks[mk][habitId] && state.checks[mk][habitId][day]);
}

function toggleCheck(habitId, day) {
    const mk = getMonthKey();
    if (!state.checks[mk]) state.checks[mk] = {};
    if (!state.checks[mk][habitId]) state.checks[mk][habitId] = {};
    state.checks[mk][habitId][day] = !state.checks[mk][habitId][day];
    saveState();
}

// ===== WEEK HELPERS =====
function getWeeks() {
    const days = getDaysInMonth();
    const weeks = [];
    let week = { num: 1, days: [] };
    for (let d = 1; d <= days; d++) {
        const dow = new Date(state.currentYear, state.currentMonth, d).getDay();
        week.days.push(d);
        if (dow === 6 || d === days) {
            weeks.push(week);
            if (d < days) week = { num: week.num + 1, days: [] };
        }
    }
    return weeks;
}

// ===== CALCULATIONS =====
function getHabitProgress(habitId) {
    const days = getDaysInMonth();
    let done = 0;
    for (let d = 1; d <= days; d++) {
        if (isChecked(habitId, d)) done++;
    }
    return { done, total: days, pct: days > 0 ? Math.round((done / days) * 100) : 0 };
}

function getWeekProgress(week) {
    if (state.habits.length === 0) return 0;
    let total = week.days.length * state.habits.length;
    let done = 0;
    for (const d of week.days) {
        for (const h of state.habits) {
            if (isChecked(h.id, d)) done++;
        }
    }
    return total > 0 ? Math.round((done / total) * 100) : 0;
}

function getOverallProgress() {
    if (state.habits.length === 0) return { done: 0, total: 0, pct: 0 };
    const days = getDaysInMonth();
    const total = days * state.habits.length;
    let done = 0;
    for (let d = 1; d <= days; d++) {
        for (const h of state.habits) {
            if (isChecked(h.id, d)) done++;
        }
    }
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

function getDayProgress(day) {
    if (state.habits.length === 0) return 0;
    let done = 0;
    for (const h of state.habits) {
        if (isChecked(h.id, day)) done++;
    }
    return Math.round((done / state.habits.length) * 100);
}

function getTotalCompleted() {
    const days = getDaysInMonth();
    let count = 0;
    for (let d = 1; d <= days; d++) {
        for (const h of state.habits) {
            if (isChecked(h.id, d)) count++;
        }
    }
    return count;
}

// ===== RENDERING =====
function renderAll() {
    renderHeader();
    renderOverallProgress();
    renderWeeklyCards();
    renderTrackerGrid();
    renderAnalysis();
}

function renderHeader() {
    document.getElementById('month-title').textContent = `${MONTHS[state.currentMonth]} ${state.currentYear}`;
    document.getElementById('stat-total-habits').textContent = state.habits.length;
    document.getElementById('stat-completed').textContent = getTotalCompleted();
}

function renderOverallProgress() {
    const { done, total, pct } = getOverallProgress();
    const ring = document.getElementById('overall-ring');
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (pct / 100) * circumference;
    ring.style.strokeDasharray = circumference;
    setTimeout(() => { ring.style.strokeDashoffset = offset; }, 50);

    document.getElementById('overall-percent').textContent = pct + '%';
    document.getElementById('overall-bar-fill').style.width = pct + '%';

    const sub = document.getElementById('progress-subtitle');
    if (state.habits.length === 0) {
        sub.textContent = 'Start adding habits to track your journey!';
    } else if (pct >= 80) {
        sub.textContent = `🔥 Outstanding! ${done} of ${total} checks completed this month!`;
    } else if (pct >= 50) {
        sub.textContent = `💪 Great momentum! ${done} of ${total} checks completed.`;
    } else if (pct > 0) {
        sub.textContent = `🚀 Keep going! ${done} of ${total} checks done so far.`;
    } else {
        sub.textContent = 'Start checking off your habits to see progress!';
    }
}

function renderWeeklyCards() {
    const container = document.getElementById('weekly-cards');
    const weeks = getWeeks();
    const gradientDef = `<defs><linearGradient id="wring-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6C63FF"/><stop offset="100%" style="stop-color:#3B82F6"/></linearGradient></defs>`;

    container.innerHTML = weeks.map((w, i) => {
        const pct = getWeekProgress(w);
        const circumference = 2 * Math.PI * 33;
        const offset = circumference - (pct / 100) * circumference;
        const startDay = w.days[0];
        const endDay = w.days[w.days.length - 1];
        const startDate = `${MONTHS[state.currentMonth].substr(0,3)} ${startDay}`;
        const endDate = `${MONTHS[state.currentMonth].substr(0,3)} ${endDay}`;

        return `
        <div class="week-card">
            <div class="week-card-title">Week ${w.num}</div>
            <div class="week-card-dates">${startDate} – ${endDate}</div>
            <div class="week-ring-container">
                <svg class="week-ring" width="90" height="90" viewBox="0 0 90 90">
                    ${i === 0 ? gradientDef : ''}
                    <circle class="week-ring-bg" cx="45" cy="45" r="33"/>
                    <circle class="week-ring-fill" cx="45" cy="45" r="33"
                        style="stroke-dasharray:${circumference}; stroke-dashoffset:${offset}; stroke:url(#wring-gradient);"/>
                </svg>
                <div class="week-ring-text">${pct}%</div>
            </div>
        </div>`;
    }).join('');
}

function renderTrackerGrid() {
    const thead = document.getElementById('tracker-thead');
    const tbody = document.getElementById('tracker-tbody');
    const tfoot = document.getElementById('tracker-tfoot');
    const weeks = getWeeks();

    let headerRow1 = `<tr><th class="habit-col" rowspan="2">Habit</th>`;
    let headerRow2 = `<tr>`;
    weeks.forEach(w => {
        headerRow1 += `<th class="week-header" colspan="${w.days.length}">Week ${w.num}</th>`;
        w.days.forEach(d => {
            const dow = new Date(state.currentYear, state.currentMonth, d).getDay();
            const isWeekend = dow === 0 || dow === 6;
            headerRow2 += `<th class="day-header" style="${isWeekend ? 'color:var(--accent-light)' : ''}">${DAYS_SHORT[dow]}<br>${d}</th>`;
        });
    });
    headerRow1 += `<th class="progress-col" rowspan="2">Progress</th></tr>`;
    headerRow2 += `</tr>`;
    thead.innerHTML = headerRow1 + headerRow2;

    tbody.innerHTML = state.habits.map(h => {
        const prog = getHabitProgress(h.id);
        let cells = `<td class="habit-name-cell">
            <div class="habit-name-wrapper">
                <span class="habit-emoji">${h.emoji || ''}</span>
                <span class="habit-label" onclick="openEditModal('${h.id}')" title="Click to edit">${h.name}</span>
                <div class="habit-actions">
                    <button class="habit-action-btn" onclick="openEditModal('${h.id}')" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="habit-action-btn delete" onclick="openDeleteModal('${h.id}')" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        </td>`;
        weeks.forEach(w => {
            w.days.forEach(d => {
                const checked = isChecked(h.id, d);
                cells += `<td class="check-cell" onclick="handleCheck('${h.id}', ${d})">
                    <div class="check-box ${checked ? 'checked' : ''}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                </td>`;
            });
        });
        const color = prog.pct >= 70 ? 'var(--green)' : prog.pct >= 40 ? 'var(--orange)' : 'var(--red)';
        cells += `<td class="progress-cell">
            <span style="color:${color}">${prog.pct}%</span>
            <div class="mini-bar"><div class="mini-bar-fill" style="width:${prog.pct}%; background:${color}"></div></div>
        </td>`;
        return `<tr>${cells}</tr>`;
    }).join('');

    let footCells = `<td class="habit-name-cell" style="font-size:0.8rem;color:var(--text-muted);">Daily Progress</td>`;
    weeks.forEach(w => {
        w.days.forEach(d => {
            const dp = getDayProgress(d);
            footCells += `<td><span class="day-progress-val">${dp}%</span></td>`;
        });
    });
    footCells += `<td></td>`;
    tfoot.innerHTML = `<tr>${footCells}</tr>`;
}

function renderAnalysis() {
    const container = document.getElementById('analysis-grid');
    if (state.habits.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">Add habits to see your analysis.</p>';
        return;
    }
    const days = getDaysInMonth();
    let html = `<div class="analysis-header"><span>Habit</span><span style="text-align:center">Goal</span><span style="text-align:center">Actual</span><span>Progress</span></div>`;
    state.habits.forEach(h => {
        const prog = getHabitProgress(h.id);
        const barClass = prog.pct >= 70 ? 'high' : prog.pct >= 40 ? 'mid' : 'low';
        html += `
        <div class="analysis-row">
            <div class="analysis-habit-name">${h.emoji || ''} ${h.name}</div>
            <div class="analysis-goal">${days}</div>
            <div class="analysis-actual">${prog.done}</div>
            <div class="analysis-bar"><div class="analysis-bar-fill ${barClass}" style="width:${prog.pct}%"></div></div>
        </div>`;
    });
    container.innerHTML = html;
}

// ===== EVENT HANDLERS =====
function handleCheck(habitId, day) {
    toggleCheck(habitId, day);
    renderAll();
}

document.getElementById('prev-month').addEventListener('click', () => {
    state.currentMonth--;
    if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear--; }
    renderAll();
});
document.getElementById('next-month').addEventListener('click', () => {
    state.currentMonth++;
    if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; }
    renderAll();
});

// ===== HABIT MODAL =====
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const nameInput = document.getElementById('habit-name-input');
const emojiInput = document.getElementById('habit-emoji-input');

function openAddModal() {
    state.editingHabitId = null;
    modalTitle.textContent = 'Add New Habit';
    nameInput.value = '';
    emojiInput.value = '';
    modalOverlay.classList.add('active');
    setTimeout(() => nameInput.focus(), 300);
}

function openEditModal(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    state.editingHabitId = habitId;
    modalTitle.textContent = 'Edit Habit';
    nameInput.value = habit.name;
    emojiInput.value = habit.emoji || '';
    modalOverlay.classList.add('active');
    setTimeout(() => nameInput.focus(), 300);
}

function closeModal() {
    modalOverlay.classList.remove('active');
    state.editingHabitId = null;
}

function saveHabit() {
    const name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    const emoji = emojiInput.value.trim();

    if (state.editingHabitId) {
        const habit = state.habits.find(h => h.id === state.editingHabitId);
        if (habit) { habit.name = name; habit.emoji = emoji; }
    } else {
        state.habits.push({ id: generateId(), name, emoji });
    }
    saveState();
    closeModal();
    renderAll();
}

document.getElementById('add-habit-btn').addEventListener('click', openAddModal);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-save').addEventListener('click', saveHabit);
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveHabit(); });
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

// ===== DELETE MODAL =====
const deleteOverlay = document.getElementById('delete-modal-overlay');
let deletingHabitId = null;

function openDeleteModal(habitId) {
    deletingHabitId = habitId;
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    document.getElementById('delete-habit-name').textContent = habit.name;
    deleteOverlay.classList.add('active');
}

function closeDeleteModal() {
    deleteOverlay.classList.remove('active');
    deletingHabitId = null;
}

function confirmDelete() {
    if (!deletingHabitId) return;
    state.habits = state.habits.filter(h => h.id !== deletingHabitId);
    for (const mk of Object.keys(state.checks)) {
        delete state.checks[mk][deletingHabitId];
    }
    saveState();
    closeDeleteModal();
    renderAll();
}

document.getElementById('delete-modal-close').addEventListener('click', closeDeleteModal);
document.getElementById('delete-cancel').addEventListener('click', closeDeleteModal);
document.getElementById('delete-confirm').addEventListener('click', confirmDelete);
deleteOverlay.addEventListener('click', e => { if (e.target === deleteOverlay) closeDeleteModal(); });

// ===== KEYBOARD =====
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeDeleteModal(); }
});

// Enter key on auth form
document.getElementById('auth-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAuth();
});
document.getElementById('auth-username').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('auth-password').focus();
});

// ===== INIT =====
createParticles();

// Check for existing session
const savedSession = localStorage.getItem(SESSION_KEY);
if (savedSession) {
    const users = getUsers();
    if (users[savedSession]) {
        currentUser = savedSession;
        loadUserData();
        showDashboard();
        renderAll();
    } else {
        localStorage.removeItem(SESSION_KEY);
        hideDashboard();
    }
} else {
    hideDashboard();
}
