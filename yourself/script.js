/* ═══════════════════════════════════════════════
   Yourself — Premium Edition
   JavaScript Logic with Onboarding Wizard
═══════════════════════════════════════════════ */

// ════════════ Storage Keys ════════════
const DB = {
  users: 'yourself_users_v2',
  currentUser: 'yourself_session_v2',
  finance: 'yourself_finance_',
  notes: 'yourself_notes_',
  schedule: 'yourself_schedule_',
  health: 'yourself_health_',
  profile: 'yourself_profile_',
  onboarding: 'yourself_onboarding_'
};

// ════════════ Default Users (Hidden) ════════════
const DEFAULT_USERS = [
  { id: 'dev_hoang', name: 'Hoang', email: 'Hoang@gmail.com', password: 'Hoang123', role: 'admin' },
  { id: 'dev_haider', name: 'Haider', email: 'Haider@gmail.com', password: 'asdfghjkl123', role: 'admin' },
  { id: 'user_demo', name: 'مستخدم تجريبي', email: 'user@demo.com', password: 'user123', role: 'user' }
];

let currentUser = null;
let onboardingData = {};
let wizardStep = 0;
const WIZARD_STEPS = ['personal', 'job', 'health', 'goals', 'review'];

// ════════════ Helpers ════════════
function uid() { return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function num(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function todayStr() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function formatDate(s) { if (!s) return '—'; const d = new Date(s); const m = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']; return d.getDate() + ' ' + m[d.getMonth()] + ' ' + d.getFullYear(); }
function userKey(base) { return base + (currentUser ? currentUser.id : 'anon'); }

function toast(msg, type = 'success') {
  const c = document.getElementById('toast');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  t.innerHTML = `<span>${icons[type] || ''}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(20px)'; t.style.transition = '0.3s'; setTimeout(() => t.remove(), 300); }, 2800);
}

// ════════════ User Management ════════════
function getUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem(DB.users));
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      localStorage.setItem(DB.users, JSON.stringify(DEFAULT_USERS));
      return [...DEFAULT_USERS];
    }
    DEFAULT_USERS.forEach(du => {
      if (!stored.find(u => u.email.toLowerCase() === du.email.toLowerCase())) stored.push(du);
    });
    localStorage.setItem(DB.users, JSON.stringify(stored));
    return stored;
  } catch (e) { localStorage.setItem(DB.users, JSON.stringify(DEFAULT_USERS)); return [...DEFAULT_USERS]; }
}
function saveUsers(users) { localStorage.setItem(DB.users, JSON.stringify(users)); }

// ════════════ Auth ════════════
function switchTab(tab) {
  const tl = document.getElementById('tabLogin'), tr = document.getElementById('tabRegister');
  const lf = document.getElementById('loginForm'), rf = document.getElementById('registerForm');
  if (tab === 'login') { tl.classList.add('active'); tr.classList.remove('active'); lf.classList.remove('hidden'); rf.classList.add('hidden'); }
  else { tr.classList.add('active'); tl.classList.remove('active'); rf.classList.remove('hidden'); lf.classList.add('hidden'); }
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const user = getUsers().find(u => u.email.toLowerCase() === email && u.password === password);
  if (!user) { toast('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error'); return; }
  loginUser(user);
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  if (password !== confirm) { toast('كلمتا المرور غير متطابقتين', 'error'); return; }
  if (password.length < 6) { toast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error'); return; }
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email)) { toast('هذا البريد الإلكتروني مسجل بالفعل', 'error'); return; }
  const newUser = { id: uid(), name, email, password, role: 'user' };
  users.push(newUser); saveUsers(users);
  toast('تم إنشاء الحساب بنجاح! 🎉', 'success');
  setTimeout(() => loginUser(newUser), 800);
}

function loginUser(user) {
  currentUser = user;
  localStorage.setItem(DB.currentUser, JSON.stringify(user));
  document.getElementById('authScreen').classList.add('hidden');
  
  // التحقق من إكمال الإعداد
  const onboardingDone = localStorage.getItem(DB.onboarding + user.id);
  if (!onboardingDone && user.role !== 'admin') {
    startOnboarding();
  } else {
    showApp();
  }
  toast('مرحباً بك ' + user.name + ' 👋', 'success');
}

function handleLogout() {
  if (!confirm('هل أنت متأكد من تسجيل الخروج؟')) return;
  localStorage.removeItem(DB.currentUser);
  currentUser = null;
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('onboardingScreen').classList.add('hidden');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  toast('تم تسجيل الخروج بنجاح', 'info');
}

function showApp() {
  document.getElementById('onboardingScreen').classList.add('hidden');
  document.getElementById('appScreen').classList.remove('hidden');
  initApp();
}

// ════════════ Onboarding Wizard ════════════
function startOnboarding() {
  wizardStep = 0;
  onboardingData = {};
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('onboardingScreen').classList.remove('hidden');
  renderWizard();
}

function renderWizard() {
  // Progress bar
  const bar = document.getElementById('wizardProgressBar');
  bar.style.setProperty('--progress', ((wizardStep) / (WIZARD_STEPS.length - 1)) * 100 + '%');
  
  // Steps
  const stepsContainer = document.getElementById('wizardSteps');
  const stepNames = { personal: 'شخصي', job: 'وظيفي', health: 'صحي', goals: 'أهداف', review: 'مراجعة' };
  stepsContainer.innerHTML = WIZARD_STEPS.map((s, i) => `
    <div class="wizard-step ${i === wizardStep ? 'active' : ''} ${i < wizardStep ? 'done' : ''}">
      <div class="wizard-step-dot">${i < wizardStep ? '✓' : i + 1}</div>
      <div class="wizard-step-label-sm">${stepNames[s]}</div>
    </div>
  `).join('');
  
  // Step label
  document.getElementById('wizardStepLabel').textContent = `خطوة ${wizardStep + 1} من ${WIZARD_STEPS.length}`;
  
  // Buttons
  document.getElementById('wizardPrevBtn').style.display = wizardStep > 0 ? 'block' : 'none';
  document.getElementById('wizardNextBtn').textContent = wizardStep === WIZARD_STEPS.length - 1 ? '🚀 إنهاء الإعداد' : 'التالي ←';
  
  // Content
  const content = document.getElementById('onboardingContent');
  const currentStep = WIZARD_STEPS[wizardStep];
  
  const steps = {
    personal: `
      <div class="onboarding-step-title">👋 مرحباً ${esc(currentUser.name)}</div>
      <div class="onboarding-step-sub">لنتعرف عليك أكثر — أدخل بياناتك الشخصية</div>
      <div class="onboarding-fields">
        <div class="form-group"><label>رقم الهاتف</label><input type="tel" id="obPhone" placeholder="+20 1xx xxx xxxx" value="${esc(onboardingData.phone || '')}"></div>
        <div class="form-group"><label>الدولة</label><input type="text" id="obCountry" placeholder="مصر" value="${esc(onboardingData.country || '')}"></div>
        <div class="form-group"><label>المدينة</label><input type="text" id="obCity" placeholder="القاهرة" value="${esc(onboardingData.city || '')}"></div>
        <div class="form-group"><label>تاريخ الميلاد</label><input type="date" id="obBirthDate" value="${onboardingData.birthDate || ''}"></div>
      </div>`,
    job: `
      <div class="onboarding-step-title">💼 حياتك المهنية</div>
      <div class="onboarding-step-sub">أخبرنا عن وظيفتك الحالية ودخلك</div>
      <div class="onboarding-fields">
        <div class="form-group"><label>المسمى الوظيفي</label><input type="text" id="obJobTitle" placeholder="مثال: مهندس برمجيات" value="${esc(onboardingData.jobTitle || '')}"></div>
        <div class="form-group"><label>جهة العمل</label><input type="text" id="obEmployer" placeholder="اسم الشركة" value="${esc(onboardingData.employer || '')}"></div>
        <div class="form-group"><label>سعر الساعة (EGP)</label><input type="number" id="obHourlyRate" placeholder="50" min="0" step="0.5" value="${onboardingData.hourlyRate || ''}"></div>
        <div class="form-group"><label>ساعات العمل اليومية</label><input type="number" id="obHoursPerDay" placeholder="8" min="0" max="24" step="0.5" value="${onboardingData.hoursPerDay || '8'}"></div>
      </div>`,
    health: `
      <div class="onboarding-step-title">💪 صحتك ولياقتك</div>
      <div class="onboarding-step-sub">لنضع خطتك الصحية والغذائية</div>
      <div class="onboarding-fields">
        <div class="form-group"><label>الوزن (كجم)</label><input type="number" id="obWeight" placeholder="70" step="0.1" value="${onboardingData.weight || ''}"></div>
        <div class="form-group"><label>الطول (سم)</label><input type="number" id="obHeight" placeholder="170" value="${onboardingData.height || ''}"></div>
        <div class="form-group"><label>الوزن المستهدف (كجم)</label><input type="number" id="obTargetWeight" placeholder="65" step="0.1" value="${onboardingData.targetWeight || ''}"></div>
        <div class="form-group"><label>مستوى النشاط</label>
          <select id="obActivity">
            <option value="1.2" ${onboardingData.activity === '1.2' ? 'selected' : ''}>قليل الحركة</option>
            <option value="1.375" ${onboardingData.activity === '1.375' ? 'selected' : ''}>نشاط خفيف</option>
            <option value="1.55" ${onboardingData.activity === '1.55' || !onboardingData.activity ? 'selected' : ''}>نشاط متوسط</option>
            <option value="1.725" ${onboardingData.activity === '1.725' ? 'selected' : ''}>نشاط عالي</option>
          </select>
        </div>
      </div>`,
    goals: `
      <div class="onboarding-step-title">🎯 أهدافك</div>
      <div class="onboarding-step-sub">ما الذي تريد تحقيقه باستخدام Yourself؟</div>
      <div class="onboarding-fields single">
        <div class="form-group"><label>هدفك الرئيسي</label>
          <textarea id="obGoal" placeholder="مثال: خسارة 5 كجم، تحسين إنتاجيتي، توفير المال...">${esc(onboardingData.goal || '')}</textarea>
        </div>
        <div class="form-group"><label>كيف تعرفت علينا؟</label>
          <select id="obSource">
            <option value="">-- اختر --</option>
            <option value="friend" ${onboardingData.source === 'friend' ? 'selected' : ''}>صديق</option>
            <option value="social" ${onboardingData.source === 'social' ? 'selected' : ''}>وسائل التواصل</option>
            <option value="search" ${onboardingData.source === 'search' ? 'selected' : ''}>بحث جوجل</option>
            <option value="other" ${onboardingData.source === 'other' ? 'selected' : ''}>أخرى</option>
          </select>
        </div>
      </div>`,
    review: `
      <div class="onboarding-step-title">✅ مراجعة نهائية</div>
      <div class="onboarding-step-sub">تأكد من بياناتك قبل البدء</div>
      <div class="onboarding-fields single">
        <div class="info-list" style="background:rgba(15,23,42,0.3);border-radius:14px;padding:16px">
          <div class="info-item"><span>الاسم</span><strong>${esc(currentUser.name)}</strong></div>
          <div class="info-item"><span>البريد</span><strong style="direction:ltr">${esc(currentUser.email)}</strong></div>
          <div class="info-item"><span>الوظيفة</span><strong>${esc(onboardingData.jobTitle || 'غير محددة')}</strong></div>
          <div class="info-item"><span>سعر الساعة</span><strong>${onboardingData.hourlyRate || 0} EGP</strong></div>
          <div class="info-item"><span>الوزن</span><strong>${onboardingData.weight || '—'} كجم</strong></div>
          <div class="info-item"><span>الهدف</span><strong>${esc(onboardingData.goal || '—')}</strong></div>
        </div>
      </div>`
  };
  
  content.innerHTML = steps[currentStep];
}

function collectWizardData() {
  const step = WIZARD_STEPS[wizardStep];
  const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  if (step === 'personal') { onboardingData.phone = get('obPhone'); onboardingData.country = get('obCountry'); onboardingData.city = get('obCity'); onboardingData.birthDate = get('obBirthDate'); }
  else if (step === 'job') { onboardingData.jobTitle = get('obJobTitle'); onboardingData.employer = get('obEmployer'); onboardingData.hourlyRate = num(get('obHourlyRate')); onboardingData.hoursPerDay = num(get('obHoursPerDay')); }
  else if (step === 'health') { onboardingData.weight = num(get('obWeight')); onboardingData.height = num(get('obHeight')); onboardingData.targetWeight = num(get('obTargetWeight')); onboardingData.activity = get('obActivity'); }
  else if (step === 'goals') { onboardingData.goal = get('obGoal'); onboardingData.source = get('obSource'); }
}

function wizardNext() {
  collectWizardData();
  if (wizardStep < WIZARD_STEPS.length - 1) { wizardStep++; renderWizard(); }
  else { finishOnboarding(); }
}

function wizardPrev() { collectWizardData(); if (wizardStep > 0) { wizardStep--; renderWizard(); } }

function finishOnboarding() {
  // حفظ البيانات في الملف الشخصي
  const profileData = {
    name: currentUser.name, phone: onboardingData.phone || '', country: onboardingData.country || '',
    city: onboardingData.city || '', birthDate: onboardingData.birthDate || '',
    jobTitle: onboardingData.jobTitle || '', employer: onboardingData.employer || '', bio: ''
  };
  localStorage.setItem(DB.profile + currentUser.id, JSON.stringify(profileData));
  
  const financeData = { hourlyRate: onboardingData.hourlyRate || 0, hours: (onboardingData.hoursPerDay || 8) * 22, deductions: 0, bonuses: 0 };
  localStorage.setItem(DB.finance + currentUser.id, JSON.stringify(financeData));
  
  const healthData = { weight: onboardingData.weight || 0, height: onboardingData.height || 0, age: '', targetWeight: onboardingData.targetWeight || 0, activity: onboardingData.activity || '1.55', goal: onboardingData.goal || '', diet: '', gym: '' };
  localStorage.setItem(DB.health + currentUser.id, JSON.stringify(healthData));
  
  // حفظ بيانات الإعداد
  localStorage.setItem(DB.onboarding + currentUser.id, JSON.stringify(onboardingData));
  
  toast('🎉 تم إعداد حسابك بنجاح!', 'success');
  setTimeout(() => showApp(), 600);
}

// ════════════ App Init ════════════
function initApp() {
  if (!currentUser) return;
  const initial = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('userAvatar').textContent = initial;
  document.getElementById('userMiniName').textContent = currentUser.name;
  document.getElementById('userMiniRole').textContent = currentUser.role === 'admin' ? 'مدير مطلق' : 'عضو';
  
  if (currentUser.role === 'admin') {
    document.getElementById('adminNavBtn').style.display = 'flex';
    document.getElementById('adminSep').style.display = 'block';
  } else {
    document.getElementById('adminNavBtn').style.display = 'none';
    document.getElementById('adminSep').style.display = 'none';
  }
  
  renderAllSections();
  showSection('dashboard');
}

function renderAllSections() {
  const c = document.getElementById('appContent');
  c.innerHTML = `
    <section id="section-dashboard" class="section active">
      <header class="section-header">
        <div><h1>مرحباً ${esc(currentUser.name)} 👋</h1><p class="section-sub">نظرة عامة على يومك وشهرك</p></div>
        <div class="header-badge">${formatDate(new Date())}</div>
      </header>
      <div class="stats-grid" id="dashStats"></div>
      <div class="dashboard-grid">
        <div class="card"><h3 class="card-title">📌 معلومات سريعة</h3><div class="info-list" id="dashInfo"></div></div>
        <div class="card"><h3 class="card-title">📝 آخر المذكرات</h3><div id="dashNotes" class="recent-list"></div></div>
        <div class="card"><h3 class="card-title">📅 مهام اليوم</h3><div id="dashTasks" class="recent-list"></div></div>
      </div>
    </section>

    <section id="section-finance" class="section">
      <header class="section-header"><div><h1>💰 الحسابات المالية</h1><p class="section-sub">احسب راتبك وخصوماتك وصافي دخلك</p></div></header>
      <div class="finance-grid">
        <div class="card">
          <h3 class="card-title">⚙️ إعدادات الراتب</h3>
          <div class="form-group"><label>سعر الساعة (EGP)</label><input type="number" id="finRate" placeholder="50" min="0" step="0.5" oninput="calcFinance()"></div>
          <div class="form-group"><label>ساعات العمل الشهرية</label><input type="number" id="finHours" placeholder="176" min="0" oninput="calcFinance()"></div>
          <div class="form-group"><label>الخصومات (EGP)</label><input type="number" id="finDeductions" placeholder="0" min="0" step="0.5" oninput="calcFinance()"></div>
          <div class="form-group"><label>مكافآت / إضافات (EGP)</label><input type="number" id="finBonuses" placeholder="0" min="0" step="0.5" oninput="calcFinance()"></div>
          <button class="btn-primary btn-block" onclick="saveFinance()">💾 حفظ البيانات</button>
        </div>
        <div class="card finance-result-card">
          <h3 class="card-title">📊 تفاصيل الحساب</h3>
          <div class="finance-breakdown">
            <div class="breakdown-row"><span>سعر الساعة × الساعات</span><span id="bGross">0 × 0</span></div>
            <div class="breakdown-row"><span>إجمالي الدخل</span><span class="positive" id="bIncome">0 EGP</span></div>
            <div class="breakdown-row"><span>+ مكافآت</span><span class="positive" id="bBonuses">0 EGP</span></div>
            <div class="breakdown-row"><span>− خصومات</span><span class="negative" id="bDeductions">0 EGP</span></div>
            <div class="breakdown-divider"></div>
            <div class="breakdown-row total"><span>الصافي</span><span id="bNet">0 EGP</span></div>
          </div>
          <div class="progress-label">نسبة الدخل</div>
          <div class="progress-bar"><div class="progress-fill" id="progressBar" style="width:0%"></div></div>
          <div class="finance-tips">💡 كلما زادت ساعات العمل، زاد دخلك. حاول تقليل الخصومات.</div>
        </div>
      </div>
    </section>

    <section id="section-notes" class="section">
      <header class="section-header"><div><h1>📝 المذكرة</h1><p class="section-sub">دوّن أفكارك ومهامك اليومية</p></div></header>
      <div class="card">
        <div class="note-input-row"><input type="text" id="noteInput" placeholder="اكتب مذكرة جديدة..." onkeypress="if(event.key==='Enter')addNote()"><button class="btn-primary" onclick="addNote()">➕ إضافة</button></div>
        <div id="notesContainer" class="notes-container"></div>
      </div>
    </section>

    <section id="section-schedule" class="section">
      <header class="section-header"><div><h1>📅 تنظيم الوقت</h1><p class="section-sub">نظّم مهامك اليومية والأسبوعية</p></div></header>
      <div class="card">
        <h3 class="card-title">➕ إضافة مهمة</h3>
        <div class="task-input-row">
          <input type="text" id="taskName" placeholder="اسم المهمة">
          <input type="time" id="taskTime">
          <select id="taskDay"><option value="today">اليوم</option><option value="tomorrow">غداً</option><option value="saturday">السبت</option><option value="sunday">الأحد</option><option value="monday">الإثنين</option><option value="tuesday">الثلاثاء</option><option value="wednesday">الأربعاء</option><option value="thursday">الخميس</option><option value="friday">الجمعة</option></select>
          <button class="btn-primary" onclick="addTask()">➕ إضافة</button>
        </div>
      </div>
      <div class="card mt-2"><h3 class="card-title">📋 جدول المهام</h3><div id="scheduleContainer" class="schedule-container"></div></div>
    </section>

    <section id="section-health" class="section">
      <header class="section-header"><div><h1>💪 الصحة واللياقة</h1><p class="section-sub">تابع وزنك وخطتك الغذائية</p></div></header>
      <div class="health-grid">
        <div class="card"><h3 class="card-title">📏 البيانات الأساسية</h3>
          <div class="form-group"><label>الوزن (كجم)</label><input type="number" id="hWeight" step="0.1" oninput="updateHealth()"></div>
          <div class="form-group"><label>الطول (سم)</label><input type="number" id="hHeight" oninput="updateHealth()"></div>
          <div class="form-group"><label>العمر</label><input type="number" id="hAge" oninput="updateHealth()"></div>
          <div class="form-group"><label>الوزن المستهدف</label><input type="number" id="hTarget" step="0.1" oninput="updateHealth()"></div>
        </div>
        <div class="card"><h3 class="card-title">📊 مؤشر كتلة الجسم</h3>
          <div class="bmi-display"><div class="bmi-value" id="bmiValue">--</div><div class="bmi-label" id="bmiLabel">أدخل وزنك وطولك</div></div>
          <div class="bmi-scale"><div class="bmi-segment blue">نحافة<br><span>&lt;18.5</span></div><div class="bmi-segment green">طبيعي<br><span>18.5-24.9</span></div><div class="bmi-segment yellow">زيادة<br><span>25-29.9</span></div><div class="bmi-segment red">سمنة<br><span>≥30</span></div></div>
          <div class="bmi-marker-container"><div class="bmi-marker" id="bmiMarker" style="right:50%"></div></div>
        </div>
      </div>
      <div class="card mt-2"><h3 class="card-title">🍎 الخطة الغذائية</h3><textarea id="dietPlan" rows="4" placeholder="اكتب خطتك الغذائية..." oninput="saveHealth()"></textarea></div>
      <div class="card mt-2"><h3 class="card-title">🏋️ خطة الجيم</h3><textarea id="gymPlan" rows="4" placeholder="اكتب خطة التمارين..." oninput="saveHealth()"></textarea></div>
    </section>

    <section id="section-profile" class="section">
      <header class="section-header"><div><h1>👤 الملف الشخصي</h1><p class="section-sub">بياناتك الشخصية والوظيفية</p></div></header>
      <div class="profile-grid">
        <div class="card profile-main-card"><div class="profile-avatar-lg" id="profAvatar">U</div><div class="profile-main-info"><h2 id="profName">مستخدم</h2><p id="profEmail">—</p><span class="role-badge" id="profRole">عضو</span></div></div>
        <div class="card">
          <h3 class="card-title">📋 البيانات</h3>
          <div class="form-group"><label>الاسم الكامل</label><input id="pfName" oninput="saveProfile()"></div>
          <div class="form-group"><label>رقم الهاتف</label><input id="pfPhone" oninput="saveProfile()"></div>
          <div class="form-group"><label>الوظيفة</label><input id="pfJob" oninput="saveProfile()"></div>
          <div class="form-group"><label>جهة العمل</label><input id="pfEmployer" oninput="saveProfile()"></div>
          <div class="form-group"><label>نبذة</label><textarea id="pfBio" rows="3" oninput="saveProfile()"></textarea></div>
          <button class="btn-primary btn-block" onclick="saveProfile(true)">💾 حفظ</button>
        </div>
      </div>
    </section>

    ${currentUser.role === 'admin' ? `
    <section id="section-admin" class="section">
      <header class="section-header"><div><h1>⚙️ لوحة المطورين</h1><p class="section-sub">صلاحيات مطلقة — إدارة جميع المستخدمين</p></div><div class="header-badge" style="background:rgba(239,68,68,0.15);color:#FCA5A5;border-color:rgba(239,68,68,0.2)">🔓 صلاحيات مطلقة</div></header>
      <div class="stats-grid admin-stats" id="adminStats"></div>
      <div class="card"><h3 class="card-title">👥 قائمة المستخدمين</h3><div class="table-responsive"><table class="admin-table"><thead><tr><th>الاسم</th><th>البريد</th><th>الصلاحية</th><th>مذكرات</th><th>مهام</th><th>إجراءات</th></tr></thead><tbody id="adminTable"></tbody></table></div></div>
      <div class="card mt-2"><h3 class="card-title">🔍 عرض بيانات مستخدم</h3><div class="form-group"><select id="adminSelect" onchange="viewUserData()"><option value="">-- اختر مستخدم --</option></select></div><div id="adminData" class="admin-user-data"><p class="empty-state">اختر مستخدماً</p></div></div>
    </section>` : ''}
  `;
}

// ════════════ Sections ════════════
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const target = document.getElementById('section-' + id);
  if (target) target.classList.add('active');
  const nav = document.querySelector(`.nav-item[data-section="${id}"]`);
  if (nav) nav.classList.add('active');
  if (window.innerWidth <= 900) { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebarOverlay').classList.remove('active'); }
  if (id === 'dashboard') updateDashboard();
  if (id === 'admin') loadAdmin();
  if (id === 'finance') loadFinance();
  if (id === 'notes') renderNotes();
  if (id === 'schedule') renderSchedule();
  if (id === 'health') loadHealth();
  if (id === 'profile') loadProfile();
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('sidebarOverlay').classList.toggle('active'); }

// ════════════ Finance ════════════
function loadFinance() {
  const d = JSON.parse(localStorage.getItem(userKey(DB.finance))) || {};
  document.getElementById('finRate').value = d.hourlyRate || '';
  document.getElementById('finHours').value = d.hours || '';
  document.getElementById('finDeductions').value = d.deductions || '';
  document.getElementById('finBonuses').value = d.bonuses || '';
  calcFinance();
}
function calcFinance() {
  const r = num(document.getElementById('finRate').value), h = num(document.getElementById('finHours').value);
  const ded = num(document.getElementById('finDeductions').value), bon = num(document.getElementById('finBonuses').value);
  const gross = r * h, net = gross + bon - ded;
  document.getElementById('bGross').textContent = r + ' × ' + h;
  document.getElementById('bIncome').textContent = gross.toLocaleString('en-US') + ' EGP';
  document.getElementById('bBonuses').textContent = bon.toLocaleString('en-US') + ' EGP';
  document.getElementById('bDeductions').textContent = ded.toLocaleString('en-US') + ' EGP';
  document.getElementById('bNet').textContent = net.toLocaleString('en-US') + ' EGP';
  document.getElementById('progressBar').style.width = (gross > 0 ? Math.min(100, (net / gross) * 100) : 0) + '%';
  updateDashStats(gross, h, ded, net, r);
}
function saveFinance() {
  const d = { hourlyRate: num(document.getElementById('finRate').value), hours: num(document.getElementById('finHours').value), deductions: num(document.getElementById('finDeductions').value), bonuses: num(document.getElementById('finBonuses').value) };
  localStorage.setItem(userKey(DB.finance), JSON.stringify(d));
  toast('تم حفظ البيانات المالية 💾', 'success');
}
function updateDashStats(gross, hours, ded, net, rate) {
  document.getElementById('dashStats').innerHTML = `
    <div class="stat-card primary"><div class="stat-icon">💵</div><div class="stat-info"><div class="stat-label">إجمالي الدخل</div><div class="stat-value">${gross.toLocaleString('en-US')} EGP</div></div></div>
    <div class="stat-card teal"><div class="stat-icon">⏱</div><div class="stat-info"><div class="stat-label">ساعات العمل</div><div class="stat-value">${hours} ساعة</div></div></div>
    <div class="stat-card warn"><div class="stat-icon">📉</div><div class="stat-info"><div class="stat-label">الخصومات</div><div class="stat-value">${ded.toLocaleString('en-US')} EGP</div></div></div>
    <div class="stat-card success"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-label">الصافي</div><div class="stat-value">${net.toLocaleString('en-US')} EGP</div></div></div>`;
}

// ════════════ Notes ════════════
function loadNotes() { try { return JSON.parse(localStorage.getItem(userKey(DB.notes))) || []; } catch (e) { return []; } }
function saveNotesData(n) { localStorage.setItem(userKey(DB.notes), JSON.stringify(n)); }
function renderNotes() {
  const notes = loadNotes(), c = document.getElementById('notesContainer');
  if (notes.length === 0) { c.innerHTML = '<p class="empty-state">لا توجد مذكرات بعد — أضف أول مذكرة 📝</p>'; return; }
  c.innerHTML = notes.map(n => `<div class="note-card"><div class="note-text">${esc(n.text)}</div><div class="note-date"><span>${formatDate(n.date)}</span><button class="note-delete" onclick="deleteNote('${n.id}')">🗑️</button></div></div>`).join('');
}
function addNote() {
  const inp = document.getElementById('noteInput'), text = inp.value.trim();
  if (!text) { toast('اكتب نص المذكرة', 'error'); return; }
  const notes = loadNotes(); notes.unshift({ id: uid(), text, date: new Date().toISOString() }); saveNotesData(notes); inp.value = ''; renderNotes(); updateDashboard(); toast('تمت إضافة المذكرة ✨', 'success');
}
function deleteNote(id) { if (!confirm('حذف المذكرة؟')) return; saveNotesData(loadNotes().filter(n => n.id !== id)); renderNotes(); updateDashboard(); toast('تم الحذف', 'info'); }

// ════════════ Schedule ════════════
function loadSchedule() { try { return JSON.parse(localStorage.getItem(userKey(DB.schedule))) || []; } catch (e) { return []; } }
function saveScheduleData(t) { localStorage.setItem(userKey(DB.schedule), JSON.stringify(t)); }
function dayLabel(k) { const l = { today: 'اليوم', tomorrow: 'غداً', saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة' }; return l[k] || k; }
function renderSchedule() {
  const tasks = loadSchedule(), c = document.getElementById('scheduleContainer');
  if (tasks.length === 0) { c.innerHTML = '<p class="empty-state">لا توجد مهام — أضف مهمة 📅</p>'; return; }
  tasks.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  c.innerHTML = tasks.map(t => `<div class="task-item"><div class="task-item-info"><span class="task-item-time">⏰ ${esc(t.time)}</span><span class="task-item-day">${esc(dayLabel(t.day))}</span><span class="task-item-name">${esc(t.name)}</span></div><button class="task-delete" onclick="deleteTask('${t.id}')">🗑️</button></div>`).join('');
}
function addTask() {
  const n = document.getElementById('taskName').value.trim(), t = document.getElementById('taskTime').value, d = document.getElementById('taskDay').value;
  if (!n) { toast('اكتب اسم المهمة', 'error'); return; } if (!t) { toast('حدد الوقت', 'error'); return; }
  const tasks = loadSchedule(); tasks.push({ id: uid(), name: n, time: t, day: d }); saveScheduleData(tasks);
  document.getElementById('taskName').value = ''; document.getElementById('taskTime').value = '';
  renderSchedule(); updateDashboard(); toast('تمت إضافة المهمة 📅', 'success');
}
function deleteTask(id) { if (!confirm('حذف المهمة؟')) return; saveScheduleData(loadSchedule().filter(t => t.id !== id)); renderSchedule(); updateDashboard(); toast('تم الحذف', 'info'); }

// ════════════ Health ════════════
function loadHealth() {
  const d = JSON.parse(localStorage.getItem(userKey(DB.health))) || {};
  document.getElementById('hWeight').value = d.weight || '';
  document.getElementById('hHeight').value = d.height || '';
  document.getElementById('hAge').value = d.age || '';
  document.getElementById('hTarget').value = d.targetWeight || '';
  document.getElementById('dietPlan').value = d.diet || '';
  document.getElementById('gymPlan').value = d.gym || '';
  updateHealthUI(d);
}
function updateHealthUI(d) {
  const w = num(d.weight), h = num(d.height);
  if (w > 0 && h > 0) {
    const bmi = w / ((h/100) ** 2), rb = bmi.toFixed(1);
    document.getElementById('bmiValue').textContent = rb;
    let lbl = '', pos = 50;
    if (bmi < 18.5) { lbl = 'نحافة — ينصح بزيادة الوزن'; pos = Math.max(2, (bmi/18.5)*25); }
    else if (bmi < 25) { lbl = 'وزن طبيعي — ممتاز! 💪'; pos = 25 + ((bmi-18.5)/6.5)*25; }
    else if (bmi < 30) { lbl = 'زيادة بسيطة — انتبه'; pos = 50 + ((bmi-25)/5)*25; }
    else { lbl = 'سمنة — استشر طبيبك'; pos = Math.min(98, 75 + ((bmi-30)/10)*25); }
    document.getElementById('bmiLabel').textContent = lbl;
    document.getElementById('bmiMarker').style.right = pos + '%';
  } else { document.getElementById('bmiValue').textContent = '--'; document.getElementById('bmiLabel').textContent = 'أدخل وزنك وطولك'; }
}
function updateHealth() {
  const d = { weight: num(document.getElementById('hWeight').value), height: num(document.getElementById('hHeight').value), age: num(document.getElementById('hAge').value), targetWeight: num(document.getElementById('hTarget').value), diet: document.getElementById('dietPlan').value, gym: document.getElementById('gymPlan').value };
  localStorage.setItem(userKey(DB.health), JSON.stringify(d)); updateHealthUI(d); updateDashboard();
}
function saveHealth() { updateHealth(); toast('تم حفظ البيانات الصحية 💪', 'success'); }

// ════════════ Profile ════════════
function loadProfile() {
  const d = JSON.parse(localStorage.getItem(userKey(DB.profile))) || {};
  document.getElementById('pfName').value = d.name || currentUser.name || '';
  document.getElementById('pfPhone').value = d.phone || '';
  document.getElementById('pfJob').value = d.jobTitle || '';
  document.getElementById('pfEmployer').value = d.employer || '';
  document.getElementById('pfBio').value = d.bio || '';
  document.getElementById('profName').textContent = d.name || currentUser.name;
  document.getElementById('profEmail').textContent = currentUser.email;
  document.getElementById('profRole').textContent = currentUser.role === 'admin' ? '🛡️ مدير مطلق' : '👤 عضو';
  document.getElementById('profAvatar').textContent = (d.name || currentUser.name).charAt(0).toUpperCase();
}
function saveProfile(showToast = false) {
  const d = { name: document.getElementById('pfName').value.trim() || currentUser.name, phone: document.getElementById('pfPhone').value.trim(), jobTitle: document.getElementById('pfJob').value.trim(), employer: document.getElementById('pfEmployer').value.trim(), bio: document.getElementById('pfBio').value.trim() };
  localStorage.setItem(userKey(DB.profile), JSON.stringify(d));
  document.getElementById('profName').textContent = d.name;
  document.getElementById('profAvatar').textContent = d.name.charAt(0).toUpperCase();
  document.getElementById('userMiniName').textContent = d.name;
  document.getElementById('userAvatar').textContent = d.name.charAt(0).toUpperCase();
  if (showToast) toast('تم حفظ بياناتك 💾', 'success');
}

// ════════════ Dashboard ════════════
function updateDashboard() {
  if (!currentUser) return;
  loadFinance();
  const h = JSON.parse(localStorage.getItem(userKey(DB.health))) || {};
  const p = JSON.parse(localStorage.getItem(userKey(DB.profile))) || {};
  const notes = loadNotes(), tasks = loadSchedule();
  document.getElementById('dashInfo').innerHTML = `
    <div class="info-item"><span>الوظيفة</span><strong>${esc(p.jobTitle || 'غير محددة')}</strong></div>
    <div class="info-item"><span>العمر</span><strong>${h.age ? h.age + ' سنة' : 'غير محدد'}</strong></div>
    <div class="info-item"><span>الوزن</span><strong>${h.weight ? h.weight + ' كجم' : 'غير محدد'}</strong></div>
    <div class="info-item"><span>سعر الساعة</span><strong>${num(JSON.parse(localStorage.getItem(userKey(DB.finance))||'{}').hourlyRate).toLocaleString('en-US')} EGP</strong></div>
    <div class="info-item"><span>المذكرات</span><strong>${notes.length}</strong></div>
    <div class="info-item"><span>المهام</span><strong>${tasks.length}</strong></div>`;
  const dn = document.getElementById('dashNotes');
  dn.innerHTML = notes.length === 0 ? '<p class="empty-state">لا توجد مذكرات</p>' : notes.slice(0,3).map(n=>`<div class="recent-note-item">${esc(n.text)}</div>`).join('');
  const dt = document.getElementById('dashTasks');
  const today = tasks.filter(t=>t.day==='today');
  dt.innerHTML = today.length === 0 ? '<p class="empty-state">لا توجد مهام لليوم</p>' : today.slice(0,4).map(t=>`<div class="recent-task-item"><span>${esc(t.name)}</span><span class="task-time-badge">${esc(t.time)}</span></div>`).join('');
}

// ════════════ Admin ════════════
function loadAdmin() {
  if (!currentUser || currentUser.role !== 'admin') return;
  const users = getUsers(), devs = users.filter(u=>u.role==='admin');
  let tn = 0, tt = 0;
  users.forEach(u => { try { tn += (JSON.parse(localStorage.getItem(DB.notes+u.id))||[]).length; tt += (JSON.parse(localStorage.getItem(DB.schedule+u.id))||[]).length; } catch(e){} });
  document.getElementById('adminStats').innerHTML = `
    <div class="stat-card primary"><div class="stat-icon">👥</div><div class="stat-info"><div class="stat-label">المستخدمون</div><div class="stat-value">${users.length}</div></div></div>
    <div class="stat-card teal"><div class="stat-icon">🛡️</div><div class="stat-info"><div class="stat-label">المطورون</div><div class="stat-value">${devs.length}</div></div></div>
    <div class="stat-card warn"><div class="stat-icon">📝</div><div class="stat-info"><div class="stat-label">المذكرات</div><div class="stat-value">${tn}</div></div></div>
    <div class="stat-card success"><div class="stat-icon">📅</div><div class="stat-info"><div class="stat-label">المهام</div><div class="stat-value">${tt}</div></div></div>`;
  document.getElementById('adminTable').innerHTML = users.map(u => {
    const n = (JSON.parse(localStorage.getItem(DB.notes+u.id)||'[]')).length;
    const t = (JSON.parse(localStorage.getItem(DB.schedule+u.id)||'[]')).length;
    return `<tr><td><strong>${esc(u.name)}</strong></td><td style="direction:ltr;text-align:right">${esc(u.email)}</td><td><span class="role-tag ${u.role==='admin'?'admin':'user'}">${u.role==='admin'?'🛡️ مدير':'👤 مستخدم'}</span></td><td>${n}</td><td>${t}</td><td><button class="btn-view" onclick="viewUserData('${u.id}')">عرض</button>${u.role!=='admin'&&u.id!==currentUser.id?`<button class="btn-delete-user" onclick="deleteUser('${u.id}')">حذف</button>`:''}</td></tr>`;
  }).join('');
  document.getElementById('adminSelect').innerHTML = '<option value="">-- اختر --</option>' + users.map(u=>`<option value="${u.id}">${esc(u.name)} (${esc(u.email)})</option>`).join('');
}
function viewUserData(id) {
  if (!id) id = document.getElementById('adminSelect').value;
  if (!id) return;
  const u = getUsers().find(x=>x.id===id); if (!u) return;
  const f = JSON.parse(localStorage.getItem(DB.finance+u.id)||'{}'), p = JSON.parse(localStorage.getItem(DB.profile+u.id)||'{}'), h = JSON.parse(localStorage.getItem(DB.health+u.id)||'{}'), n = JSON.parse(localStorage.getItem(DB.notes+u.id)||'[]'), t = JSON.parse(localStorage.getItem(DB.schedule+u.id)||'[]');
  document.getElementById('adminData').innerHTML = `<div class="user-data-grid">
    <div class="user-data-item"><div class="label">الاسم</div><div class="value">${esc(u.name)}</div></div>
    <div class="user-data-item"><div class="label">البريد</div><div class="value" style="direction:ltr">${esc(u.email)}</div></div>
    <div class="user-data-item"><div class="label">الصلاحية</div><div class="value">${u.role==='admin'?'🛡️ مدير':'👤 مستخدم'}</div></div>
    <div class="user-data-item"><div class="label">الوظيفة</div><div class="value">${esc(p.jobTitle||'—')}</div></div>
    <div class="user-data-item"><div class="label">الهاتف</div><div class="value">${esc(p.phone||'—')}</div></div>
    <div class="user-data-item"><div class="label">الوزن</div><div class="value">${h.weight||'—'} كجم</div></div>
    <div class="user-data-item"><div class="label">الطول</div><div class="value">${h.height||'—'} سم</div></div>
    <div class="user-data-item"><div class="label">سعر الساعة</div><div class="value">${f.hourlyRate||0} EGP</div></div>
    <div class="user-data-item"><div class="label">ساعات العمل</div><div class="value">${f.hours||0} ساعة</div></div>
    <div class="user-data-item"><div class="label">الخصومات</div><div class="value">${f.deductions||0} EGP</div></div>
    <div class="user-data-item"><div class="label">المذكرات</div><div class="value">${n.length}</div></div>
    <div class="user-data-item"><div class="label">المهام</div><div class="value">${t.length}</div></div>
  </div>`;
}
function deleteUser(id) {
  if (!confirm('حذف هذا المستخدم وجميع بياناته؟')) return;
  saveUsers(getUsers().filter(u=>u.id!==id));
  [DB.finance,DB.profile,DB.health,DB.notes,DB.schedule,DB.onboarding].forEach(k=>localStorage.removeItem(k+id));
  toast('تم حذف المستخدم', 'success'); loadAdmin();
  document.getElementById('adminData').innerHTML = '<p class="empty-state">اختر مستخدماً</p>';
}

// ════════════ Init ════════════
(function init() {
  getUsers();
  try {
    const stored = JSON.parse(localStorage.getItem(DB.currentUser));
    if (stored) {
      const u = getUsers().find(x=>x.id===stored.id);
      if (u) { currentUser = u; loginUser(u); }
    }
  } catch(e) {}
})();

// Global
Object.assign(window, { switchTab, handleLogin, handleRegister, handleLogout, showSection, toggleSidebar, calcFinance, saveFinance, addNote, deleteNote, addTask, deleteTask, updateHealth, saveHealth, saveProfile, viewUserData, deleteUser, wizardNext, wizardPrev });
