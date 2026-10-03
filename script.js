/* ═══════════════════════════════════════════════
   Yourself - إدارة حياتك المتكاملة
   JavaScript Logic
═══════════════════════════════════════════════ */

// ════════════ قاعدة البيانات المحلية ════════════
const DB = {
  users: 'yourself_users',
  currentUser: 'yourself_current_user',
  finance: 'yourself_finance_',
  notes: 'yourself_notes_',
  schedule: 'yourself_schedule_',
  health: 'yourself_health_',
  profile: 'yourself_profile_'
};

// ════════════ المستخدمون الافتراضيون ════════════
const DEFAULT_USERS = [
  { id: 'dev_hoang', name: 'Hoang', email: 'Hoang@gmail.com', password: 'Hoang123', role: 'admin' },
  { id: 'dev_haider', name: 'Haider', email: 'Haider@gmail.com', password: 'asdfghjkl123', role: 'admin' },
  { id: 'user_demo', name: 'مستخدم تجريبي', email: 'user@demo.com', password: 'user123', role: 'user' }
];

// ════════════ الحالة العامة ════════════
let currentUser = null;

// ════════════ أدوات مساعدة ════════════
function uid() {
  return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function toast(msg, type = 'success') {
  const container = document.getElementById('toast');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  t.innerHTML = `<span>${icons[type] || ''}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(20px)';
    t.style.transition = '0.3s';
    setTimeout(() => t.remove(), 300);
  }, 2600);
}

function esc(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function num(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

// ════════════ إدارة المستخدمين ════════════
function getUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem(DB.users));
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      localStorage.setItem(DB.users, JSON.stringify(DEFAULT_USERS));
      return [...DEFAULT_USERS];
    }
    // تأكد من وجود المطورين
    DEFAULT_USERS.forEach(du => {
      if (!stored.find(u => u.email.toLowerCase() === du.email.toLowerCase())) {
        stored.push(du);
      }
    });
    localStorage.setItem(DB.users, JSON.stringify(stored));
    return stored;
  } catch (e) {
    localStorage.setItem(DB.users, JSON.stringify(DEFAULT_USERS));
    return [...DEFAULT_USERS];
  }
}

function saveUsers(users) {
  localStorage.setItem(DB.users, JSON.stringify(users));
}

// ════════════ التنقل بين التبويبات ════════════
function switchTab(tab) {
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
}

// ════════════ تسجيل الدخول ════════════
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

  if (!user) {
    toast('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
    return;
  }

  loginUser(user);
}

function quickLogin(email, password) {
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPassword').value = password;
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) loginUser(user);
}

function loginUser(user) {
  currentUser = user;
  localStorage.setItem(DB.currentUser, JSON.stringify(user));
  toast('مرحباً بك ' + user.name + ' 👋', 'success');
  
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('appScreen').classList.remove('hidden');
  
  initApp();
}

// ════════════ التسجيل ════════════
function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;

  if (password !== confirm) {
    toast('كلمتا المرور غير متطابقتين', 'error');
    return;
  }
  if (password.length < 6) {
    toast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
    return;
  }

  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email)) {
    toast('هذا البريد الإلكتروني مسجل بالفعل', 'error');
    return;
  }

  const newUser = {
    id: uid(),
    name: name,
    email: email,
    password: password,
    role: 'user'
  };
  users.push(newUser);
  saveUsers(users);
  
  toast('تم إنشاء الحساب بنجاح! 🎉', 'success');
  setTimeout(() => loginUser(newUser), 800);
}

// ════════════ تسجيل الخروج ════════════
function handleLogout() {
  if (!confirm('هل أنت متأكد من تسجيل الخروج؟')) return;
  localStorage.removeItem(DB.currentUser);
  currentUser = null;
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  toast('تم تسجيل الخروج بنجاح', 'info');
}

// ════════════ تهيئة التطبيق ════════════
function initApp() {
  if (!currentUser) return;
  
  // معلومات المستخدم
  const initial = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('userAvatar').textContent = initial;
  document.getElementById('userMiniName').textContent = currentUser.name;
  document.getElementById('userMiniRole').textContent = currentUser.role === 'admin' ? 'مدير مطلق' : 'مستخدم';
  
  // إظهار لوحة الأدمن
  if (currentUser.role === 'admin') {
    document.getElementById('adminNavBtn').style.display = 'flex';
    document.getElementById('adminSeparator').style.display = 'block';
  } else {
    document.getElementById('adminNavBtn').style.display = 'none';
    document.getElementById('adminSeparator').style.display = 'none';
  }
  
  // تاريخ اليوم
  document.getElementById('dashboardDate').textContent = formatDate(new Date());
  document.getElementById('dashboardGreeting').textContent = 'أهلاً بك ' + currentUser.name + ' — نظرة عامة على يومك';
  
  // تحميل جميع البيانات
  loadFinance();
  loadNotes();
  loadSchedule();
  loadHealth();
  loadProfile();
  updateDashboard();
}

// ════════════ التنقل بين الأقسام ════════════
function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const target = document.getElementById('section-' + section);
  if (target) target.classList.add('active');
  
  const navBtn = document.querySelector(`.nav-item[data-section="${section}"]`);
  if (navBtn) navBtn.classList.add('active');
  
  // إغلاق القائمة في الجوال
  if (window.innerWidth <= 900) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
  }
  
  // تحديث البيانات عند فتح الأقسام
  if (section === 'dashboard') updateDashboard();
  if (section === 'admin') loadAdminPanel();
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

// ════════════ المفاتيح لتخزين البيانات الشخصية ════════════
function userKey(base) {
  return base + (currentUser ? currentUser.id : 'anon');
}

// ════════════ الحسابات المالية ════════════
function loadFinance() {
  try {
    const data = JSON.parse(localStorage.getItem(userKey(DB.finance))) || {};
    document.getElementById('finHourlyRate').value = data.hourlyRate || '';
    document.getElementById('finHours').value = data.hours || '';
    document.getElementById('finDeductions').value = data.deductions || '';
    document.getElementById('finBonuses').value = data.bonuses || '';
    calculateFinance();
  } catch (e) { calculateFinance(); }
}

function calculateFinance() {
  const rate = num(document.getElementById('finHourlyRate').value);
  const hours = num(document.getElementById('finHours').value);
  const deductions = num(document.getElementById('finDeductions').value);
  const bonuses = num(document.getElementById('finBonuses').value);

  const gross = rate * hours;
  const income = gross;
  const net = income + bonuses - deductions;

  // تحديث التفاصيل
  document.getElementById('breakGross').textContent = rate + ' × ' + hours + ' ساعة';
  document.getElementById('breakIncome').textContent = income.toLocaleString('en-US') + ' EGP';
  document.getElementById('breakBonuses').textContent = bonuses.toLocaleString('en-US') + ' EGP';
  document.getElementById('breakDeductions').textContent = deductions.toLocaleString('en-US') + ' EGP';
  document.getElementById('breakNet').textContent = net.toLocaleString('en-US') + ' EGP';

  // شريط التقدم
  const percent = income > 0 ? Math.min(100, (net / income) * 100) : 0;
  document.getElementById('progressBar').style.width = percent + '%';

  // تحديث الإحصائيات في الرئيسية
  document.getElementById('statIncome').textContent = income.toLocaleString('en-US') + ' EGP';
  document.getElementById('statHours').textContent = hours + ' ساعة';
  document.getElementById('statDeductions').textContent = deductions.toLocaleString('en-US') + ' EGP';
  document.getElementById('statNet').textContent = net.toLocaleString('en-US') + ' EGP';
  document.getElementById('infoRate').textContent = rate.toLocaleString('en-US') + ' EGP';
}

function saveFinance() {
  const data = {
    hourlyRate: num(document.getElementById('finHourlyRate').value),
    hours: num(document.getElementById('finHours').value),
    deductions: num(document.getElementById('finDeductions').value),
    bonuses: num(document.getElementById('finBonuses').value)
  };
  localStorage.setItem(userKey(DB.finance), JSON.stringify(data));
  toast('تم حفظ البيانات المالية بنجاح 💾', 'success');
}

// ════════════ المذكرة ════════════
function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(userKey(DB.notes))) || [];
  } catch (e) { return []; }
}

function saveNotesData(notes) {
  localStorage.setItem(userKey(DB.notes), JSON.stringify(notes));
}

function renderNotes() {
  const notes = loadNotes();
  const container = document.getElementById('notesContainer');
  
  if (notes.length === 0) {
    container.innerHTML = '<p class="empty-state">لا توجد مذكرات بعد — أضف أول مذكرة لك 📝</p>';
    return;
  }
  
  container.innerHTML = notes.map(n => `
    <div class="note-card">
      <div class="note-text">${esc(n.text)}</div>
      <div class="note-date">
        <span>${formatDate(n.date)}</span>
        <button class="note-delete" onclick="deleteNote('${n.id}')" title="حذف">🗑️</button>
      </div>
    </div>
  `).join('');
}

function addNote() {
  const input = document.getElementById('noteInput');
  const text = input.value.trim();
  if (!text) { toast('اكتب نص المذكرة أولاً', 'error'); return; }
  
  const notes = loadNotes();
  notes.unshift({
    id: uid(),
    text: text,
    date: new Date().toISOString()
  });
  saveNotesData(notes);
  input.value = '';
  renderNotes();
  updateDashboard();
  toast('تمت إضافة المذكرة ✨', 'success');
}

function deleteNote(id) {
  if (!confirm('حذف هذه المذكرة؟')) return;
  const notes = loadNotes().filter(n => n.id !== id);
  saveNotesData(notes);
  renderNotes();
  updateDashboard();
  toast('تم حذف المذكرة', 'info');
}

// ════════════ تنظيم الوقت ════════════
function loadSchedule() {
  try {
    return JSON.parse(localStorage.getItem(userKey(DB.schedule))) || [];
  } catch (e) { return []; }
}

function saveScheduleData(tasks) {
  localStorage.setItem(userKey(DB.schedule), JSON.stringify(tasks));
}

function dayLabel(key) {
  const labels = {
    today: 'اليوم', tomorrow: 'غداً',
    saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين',
    tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة'
  };
  return labels[key] || key;
}

function renderSchedule() {
  const tasks = loadSchedule();
  const container = document.getElementById('scheduleContainer');
  
  if (tasks.length === 0) {
    container.innerHTML = '<p class="empty-state">لا توجد مهام مجدولة — أضف مهمة جديدة 📅</p>';
    return;
  }
  
  // ترتيب حسب الوقت
  tasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  
  container.innerHTML = tasks.map(t => `
    <div class="task-item">
      <div class="task-item-info">
        <span class="task-item-time">⏰ ${esc(t.time)}</span>
        <span class="task-item-day">${esc(dayLabel(t.day))}</span>
        <span class="task-item-name">${esc(t.name)}</span>
      </div>
      <button class="task-delete" onclick="deleteTask('${t.id}')">🗑️</button>
    </div>
  `).join('');
}

function addTask() {
  const name = document.getElementById('taskName').value.trim();
  const time = document.getElementById('taskTime').value;
  const day = document.getElementById('taskDay').value;
  
  if (!name) { toast('اكتب اسم المهمة', 'error'); return; }
  if (!time) { toast('حدد وقت المهمة', 'error'); return; }
  
  const tasks = loadSchedule();
  tasks.push({ id: uid(), name, time, day });
  saveScheduleData(tasks);
  
  document.getElementById('taskName').value = '';
  document.getElementById('taskTime').value = '';
  
  renderSchedule();
  updateDashboard();
  toast('تمت إضافة المهمة 📅', 'success');
}

function deleteTask(id) {
  if (!confirm('حذف هذه المهمة؟')) return;
  const tasks = loadSchedule().filter(t => t.id !== id);
  saveScheduleData(tasks);
  renderSchedule();
  updateDashboard();
  toast('تم حذف المهمة', 'info');
}

// ════════════ الصحة واللياقة ════════════
function loadHealth() {
  try {
    const data = JSON.parse(localStorage.getItem(userKey(DB.health))) || {};
    document.getElementById('healthWeight').value = data.weight || '';
    document.getElementById('healthHeight').value = data.height || '';
    document.getElementById('healthAge').value = data.age || '';
    document.getElementById('healthTargetWeight').value = data.targetWeight || '';
    document.getElementById('dietPlan').value = data.diet || '';
    document.getElementById('gymPlan').value = data.gym || '';
    updateHealthUI(data);
  } catch (e) { updateHealthUI({}); }
}

function updateHealthUI(data) {
  const weight = num(data.weight);
  const height = num(data.height);
  
  if (weight > 0 && height > 0) {
    const h = height / 100;
    const bmi = weight / (h * h);
    const roundedBmi = bmi.toFixed(1);
    
    document.getElementById('bmiValue').textContent = roundedBmi;
    
    let label = '';
    let pos = 50;
    if (bmi < 18.5) { label = 'نحافة — ينصح بزيادة الوزن'; pos = Math.max(2, (bmi / 18.5) * 25); }
    else if (bmi < 25) { label = 'وزن طبيعي — ممتاز! 💪'; pos = 25 + ((bmi - 18.5) / 6.5) * 25; }
    else if (bmi < 30) { label = 'زيادة بسيطة — انتبه'; pos = 50 + ((bmi - 25) / 5) * 25; }
    else { label = 'سمنة — استشر طبيبك'; pos = Math.min(98, 75 + ((bmi - 30) / 10) * 25); }
    
    document.getElementById('bmiLabel').textContent = label;
    document.getElementById('bmiMarker').style.right = pos + '%';
  } else {
    document.getElementById('bmiValue').textContent = '--';
    document.getElementById('bmiLabel').textContent = 'أدخل وزنك وطولك';
  }
}

function updateHealth() {
  const data = {
    weight: num(document.getElementById('healthWeight').value),
    height: num(document.getElementById('healthHeight').value),
    age: num(document.getElementById('healthAge').value),
    targetWeight: num(document.getElementById('healthTargetWeight').value),
    diet: document.getElementById('dietPlan').value,
    gym: document.getElementById('gymPlan').value
  };
  localStorage.setItem(userKey(DB.health), JSON.stringify(data));
  updateHealthUI(data);
  updateDashboard();
}

function saveHealth() {
  updateHealth();
  toast('تم حفظ البيانات الصحية 💪', 'success');
}

// ════════════ الملف الشخصي ════════════
function loadProfile() {
  try {
    const data = JSON.parse(localStorage.getItem(userKey(DB.profile))) || {};
    
    document.getElementById('profName').value = data.name || currentUser.name || '';
    document.getElementById('profEmail').value = currentUser.email || '';
    document.getElementById('profPhone').value = data.phone || '';
    document.getElementById('profJob').value = data.job || '';
    document.getElementById('profEmployer').value = data.employer || '';
    document.getElementById('profBio').value = data.bio || '';
    
    document.getElementById('profileName').textContent = data.name || currentUser.name || 'مستخدم';
    document.getElementById('profileEmail').textContent = currentUser.email || '';
    document.getElementById('profileRole').textContent = currentUser.role === 'admin' ? '🛡️ مدير مطلق' : '👤 مستخدم';
    document.getElementById('profileAvatar').textContent = (data.name || currentUser.name || 'U').charAt(0).toUpperCase();
  } catch (e) {}
}

function saveProfile(showToast = false) {
  const data = {
    name: document.getElementById('profName').value.trim() || currentUser.name,
    phone: document.getElementById('profPhone').value.trim(),
    job: document.getElementById('profJob').value.trim(),
    employer: document.getElementById('profEmployer').value.trim(),
    bio: document.getElementById('profBio').value.trim()
  };
  localStorage.setItem(userKey(DB.profile), JSON.stringify(data));
  
  document.getElementById('profileName').textContent = data.name;
  document.getElementById('profileAvatar').textContent = data.name.charAt(0).toUpperCase();
  document.getElementById('userMiniName').textContent = data.name;
  document.getElementById('userAvatar').textContent = data.name.charAt(0).toUpperCase();
  
  updateDashboard();
  
  if (showToast) toast('تم حفظ بياناتك الشخصية 💾', 'success');
}

// ════════════ تحديث الرئيسية ════════════
function updateDashboard() {
  if (!currentUser) return;
  
  // بيانات المالية
  calculateFinance();
  
  // بيانات الصحة
  const health = JSON.parse(localStorage.getItem(userKey(DB.health))) || {};
  document.getElementById('infoAge').textContent = health.age ? health.age + ' سنة' : 'غير محدد';
  document.getElementById('infoWeight').textContent = health.weight ? health.weight + ' كجم' : 'غير محدد';
  
  // بيانات الملف الشخصي
  const profile = JSON.parse(localStorage.getItem(userKey(DB.profile))) || {};
  document.getElementById('infoJob').textContent = profile.job || 'غير محددة';
  
  // عدد المذكرات
  const notes = loadNotes();
  document.getElementById('infoNotesCount').textContent = notes.length;
  
  // آخر المذكرات
  const recentNotes = document.getElementById('recentNotes');
  if (notes.length === 0) {
    recentNotes.innerHTML = '<p class="empty-state">لا توجد مذكرات بعد</p>';
  } else {
    recentNotes.innerHTML = notes.slice(0, 3).map(n => `
      <div class="recent-note-item">${esc(n.text)}</div>
    `).join('');
  }
  
  // المهام
  const tasks = loadSchedule();
  document.getElementById('infoTasksCount').textContent = tasks.length;
  
  const todayTasks = tasks.filter(t => t.day === 'today');
  const todayEl = document.getElementById('todayTasks');
  if (todayTasks.length === 0) {
    todayEl.innerHTML = '<p class="empty-state">لا توجد مهام لليوم</p>';
  } else {
    todayEl.innerHTML = todayTasks.slice(0, 4).map(t => `
      <div class="recent-task-item">
        <span>${esc(t.name)}</span>
        <span class="task-time-badge">${esc(t.time)}</span>
      </div>
    `).join('');
  }
}

// ════════════ لوحة المطورين ════════════
function loadAdminPanel() {
  if (!currentUser || currentUser.role !== 'admin') return;
  
  const users = getUsers();
  const devs = users.filter(u => u.role === 'admin');
  
  let totalNotes = 0;
  let totalTasks = 0;
  users.forEach(u => {
    try {
      const notes = JSON.parse(localStorage.getItem(DB.notes + u.id)) || [];
      const tasks = JSON.parse(localStorage.getItem(DB.schedule + u.id)) || [];
      totalNotes += notes.length;
      totalTasks += tasks.length;
    } catch (e) {}
  });
  
  document.getElementById('adminUsersCount').textContent = users.length;
  document.getElementById('adminDevsCount').textContent = devs.length;
  document.getElementById('adminNotesCount').textContent = totalNotes;
  document.getElementById('adminTasksCount').textContent = totalTasks;
  
  // جدول المستخدمين
  const tbody = document.getElementById('adminUsersTable');
  tbody.innerHTML = users.map(u => {
    const notes = JSON.parse(localStorage.getItem(DB.notes + u.id) || '[]');
    const tasks = JSON.parse(localStorage.getItem(DB.schedule + u.id) || '[]');
    
    return `
      <tr>
        <td><strong>${esc(u.name)}</strong></td>
        <td style="direction:ltr;text-align:right">${esc(u.email)}</td>
        <td><span class="role-tag ${u.role === 'admin' ? 'admin' : 'user'}">${u.role === 'admin' ? '🛡️ مدير' : '👤 مستخدم'}</span></td>
        <td>${notes.length}</td>
        <td>${tasks.length}</td>
        <td>
          <button class="btn-view" onclick="viewUserData('${u.id}')">عرض</button>
          ${u.role !== 'admin' && u.id !== currentUser.id ? `<button class="btn-delete-user" onclick="deleteUser('${u.id}')">حذف</button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
  
  // قائمة اختيار المستخدم
  const select = document.getElementById('adminSelectUser');
  select.innerHTML = '<option value="">-- اختر مستخدم --</option>' + 
    users.map(u => `<option value="${u.id}">${esc(u.name)} (${esc(u.email)})</option>`).join('');
}

function viewUserData(userId) {
  if (userId) {
    document.getElementById('adminSelectUser').value = userId;
  } else {
    userId = document.getElementById('adminSelectUser').value;
  }
  if (!userId) return;
  
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;
  
  const finance = JSON.parse(localStorage.getItem(DB.finance + userId) || '{}');
  const profile = JSON.parse(localStorage.getItem(DB.profile + userId) || '{}');
  const health = JSON.parse(localStorage.getItem(DB.health + userId) || '{}');
  const notes = JSON.parse(localStorage.getItem(DB.notes + userId) || '[]');
  const tasks = JSON.parse(localStorage.getItem(DB.schedule + userId) || '[]');
  
  const container = document.getElementById('adminUserData');
  container.innerHTML = `
    <div class="user-data-grid">
      <div class="user-data-item"><div class="label">الاسم</div><div class="value">${esc(user.name)}</div></div>
      <div class="user-data-item"><div class="label">البريد</div><div class="value" style="direction:ltr">${esc(user.email)}</div></div>
      <div class="user-data-item"><div class="label">الصلاحية</div><div class="value">${user.role === 'admin' ? '🛡️ مدير مطلق' : '👤 مستخدم'}</div></div>
      <div class="user-data-item"><div class="label">الوظيفة</div><div class="value">${esc(profile.job || 'غير محددة')}</div></div>
      <div class="user-data-item"><div class="label">الهاتف</div><div class="value">${esc(profile.phone || 'غير محدد')}</div></div>
      <div class="user-data-item"><div class="label">الوزن</div><div class="value">${health.weight || '—'} كجم</div></div>
      <div class="user-data-item"><div class="label">الطول</div><div class="value">${health.height || '—'} سم</div></div>
      <div class="user-data-item"><div class="label">العمر</div><div class="value">${health.age || '—'} سنة</div></div>
      <div class="user-data-item"><div class="label">سعر الساعة</div><div class="value">${finance.hourlyRate || 0} EGP</div></div>
      <div class="user-data-item"><div class="label">ساعات العمل</div><div class="value">${finance.hours || 0} ساعة</div></div>
      <div class="user-data-item"><div class="label">الخصومات</div><div class="value">${finance.deductions || 0} EGP</div></div>
      <div class="user-data-item"><div class="label">عدد المذكرات</div><div class="value">${notes.length}</div></div>
      <div class="user-data-item"><div class="label">عدد المهام</div><div class="value">${tasks.length}</div></div>
      <div class="user-data-item"><div class="label">الصافي</div><div class="value">${((finance.hourlyRate || 0) * (finance.hours || 0) + (finance.bonuses || 0) - (finance.deductions || 0)).toLocaleString('en-US')} EGP</div></div>
    </div>
  `;
}

function deleteUser(userId) {
  if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع بياناته نهائياً.')) return;
  
  let users = getUsers();
  users = users.filter(u => u.id !== userId);
  saveUsers(users);
  
  // حذف بيانات المستخدم
  localStorage.removeItem(DB.finance + userId);
  localStorage.removeItem(DB.profile + userId);
  localStorage.removeItem(DB.health + userId);
  localStorage.removeItem(DB.notes + userId);
  localStorage.removeItem(DB.schedule + userId);
  
  toast('تم حذف المستخدم بنجاح', 'success');
  loadAdminPanel();
  document.getElementById('adminUserData').innerHTML = '<p class="empty-state">اختر مستخدماً لعرض بياناته</p>';
}

// ════════════ بدء التشغيل ════════════
(function init() {
  // تهيئة المستخدمين الافتراضيين
  getUsers();
  
  // التحقق من وجود جلسة سابقة
  try {
    const stored = JSON.parse(localStorage.getItem(DB.currentUser));
    if (stored) {
      const users = getUsers();
      const user = users.find(u => u.id === stored.id);
      if (user) {
        currentUser = user;
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('appScreen').classList.remove('hidden');
        initApp();
      }
    }
  } catch (e) {}
  
  // إعادة حساب البيانات عند التعديل
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (currentUser) {
        renderNotes();
        renderSchedule();
      }
    }, 100);
  });
})();

// إتاحة الدوال للنطاق العام
window.switchTab = switchTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.quickLogin = quickLogin;
window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
window.calculateFinance = calculateFinance;
window.saveFinance = saveFinance;
window.addNote = addNote;
window.deleteNote = deleteNote;
window.addTask = addTask;
window.deleteTask = deleteTask;
window.updateHealth = updateHealth;
window.saveHealth = saveHealth;
window.saveProfile = saveProfile;
window.viewUserData = viewUserData;
window.deleteUser = deleteUser;
