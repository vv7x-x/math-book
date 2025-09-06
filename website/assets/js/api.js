(function() {
  const API_BASE = (localStorage.getItem('apiBase') || 'http://localhost:4000') + '/api';

  async function fetchJson(url, options) {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function loadCenters() {
    try {
      const centers = await fetchJson(`${API_BASE}/centers`);
      const select = document.getElementById('centerSelect');
      if (select) {
        select.innerHTML = '';
        centers.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.name;
          opt.textContent = c.name;
          select.appendChild(opt);
        });
      }
    } catch {}
  }

  async function handleRegister() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    await loadCenters();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const msg = document.getElementById('registerMsg');
      try {
        await fetchJson(`${API_BASE}/register`, { method: 'POST', body: JSON.stringify(data) });
        msg.textContent = 'تم إرسال طلبك. الحالة: في انتظار الموافقة';
      } catch (err) {
        msg.textContent = 'حدث خطأ. حاول مرة أخرى';
      }
    });
  }

  async function handleLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { username } = Object.fromEntries(new FormData(form).entries());
      const msg = document.getElementById('loginMsg');
      try {
        const res = await fetchJson(`${API_BASE}/login`, { method: 'POST', body: JSON.stringify({ username }) });
        localStorage.setItem('student', JSON.stringify(res.student));
        window.location.href = 'dashboard.html';
      } catch {
        msg.textContent = 'لم يتم اعتماد الحساب بعد أو اسم المستخدم غير صحيح';
      }
    });
  }

  async function handleDashboard() {
    const qrImg = document.getElementById('qrImg');
    if (!qrImg) return;
    const student = JSON.parse(localStorage.getItem('student') || 'null');
    if (!student) { window.location.href = 'login.html'; return; }
    document.getElementById('studentName').textContent = student.fullName;
    qrImg.src = `${API_BASE}/students/${student.id}/qr`;

    try {
      const [lessons, announcements] = await Promise.all([
        fetchJson(`${API_BASE}/lessons`),
        fetchJson(`${API_BASE}/announcements`)
      ]);
      const list = document.getElementById('lessonsList');
      list.innerHTML = '';
      lessons.forEach(l => {
        const li = document.createElement('li');
        li.textContent = `${l.subject || ''} – ${new Date(l.date).toLocaleString()} – ${l.center}`;
        list.appendChild(li);
      });
      const ann = document.getElementById('annList');
      ann.innerHTML = '';
      announcements.forEach(a => {
        const li = document.createElement('li');
        li.textContent = `${a.title || ''} – ${a.message || ''}`;
        ann.appendChild(li);
      });
    } catch {}

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { localStorage.removeItem('student'); window.location.href = 'login.html'; });
  }

  window.addEventListener('DOMContentLoaded', () => {
    handleRegister();
    handleLogin();
    handleDashboard();
  });
})();

