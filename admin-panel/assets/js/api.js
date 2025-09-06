(function() {
  const API_BASE = (localStorage.getItem('apiBase') || 'http://localhost:4000') + '/api';

  function qs(sel) { return document.querySelector(sel); }
  function ce(tag) { return document.createElement(tag); }

  async function fetchJson(url, options) {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  function ensureAuth() {
    const admin = JSON.parse(localStorage.getItem('admin') || 'null');
    return admin;
  }

  // login page
  function handleLogin() {
    const form = qs('#adminLoginForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const creds = Object.fromEntries(new FormData(form).entries());
      const msg = qs('#loginMsg');
      try {
        const res = await fetchJson(`${API_BASE}/admin/login`, { method: 'POST', body: JSON.stringify(creds) });
        localStorage.setItem('admin', JSON.stringify(res.admin));
        window.location.href = 'dashboard.html';
      } catch {
        msg.textContent = 'بيانات غير صحيحة';
      }
    });
  }

  // dashboard page
  async function handleDashboard() {
    if (!qs('#pendingList')) return;
    const admin = ensureAuth();
    if (!admin) { window.location.href = 'index.html'; return; }

    // Tabs
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.querySelector(`#tab-${btn.dataset.tab}`).classList.add('active');
      });
    });

    // Logout
    const logoutBtn = qs('#logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { localStorage.removeItem('admin'); window.location.href = 'index.html'; });

    // Pending students
    async function loadPending() {
      const items = await fetchJson(`${API_BASE}/admin/pending-students`);
      const ul = qs('#pendingList');
      ul.innerHTML = '';
      items.forEach(s => {
        const li = ce('li');
        li.innerHTML = `<div>${s.fullName} – ${s.username} – ${s.center}</div>`;
        const actions = ce('div');
        const approve = ce('button'); approve.className = 'button primary'; approve.textContent = 'قبول';
        const reject = ce('button'); reject.className = 'button'; reject.textContent = 'رفض';
        approve.onclick = async () => { await fetchJson(`${API_BASE}/admin/approve`, { method: 'POST', body: JSON.stringify({ id: s.id }) }); loadPending(); };
        reject.onclick = async () => { await fetchJson(`${API_BASE}/admin/reject`, { method: 'POST', body: JSON.stringify({ id: s.id }) }); loadPending(); };
        actions.appendChild(approve); actions.appendChild(reject);
        li.appendChild(actions);
        ul.appendChild(li);
      });
    }
    await loadPending();

    // Lessons
    async function loadLessons() {
      const items = await fetchJson(`${API_BASE}/lessons`);
      const ul = qs('#lessonList');
      ul.innerHTML = '';
      items.forEach(l => {
        const li = ce('li');
        li.innerHTML = `<div>${l.subject || ''} – ${new Date(l.date).toLocaleString()} – ${l.center}</div>`;
        const del = ce('button'); del.className = 'button'; del.textContent = 'حذف';
        del.onclick = async () => { await fetchJson(`${API_BASE}/admin/lessons/${l.id}`, { method: 'DELETE' }); loadLessons(); };
        li.appendChild(del);
        ul.appendChild(li);
      });
    }
    await loadLessons();
    const lessonForm = qs('#lessonForm');
    lessonForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(lessonForm).entries());
      data.date = new Date(data.date).getTime();
      await fetchJson(`${API_BASE}/admin/lessons`, { method: 'POST', body: JSON.stringify(data) });
      lessonForm.reset();
      loadLessons();
    });

    // Announcements
    async function loadAnnouncements() {
      const items = await fetchJson(`${API_BASE}/announcements`);
      const ul = qs('#annList');
      ul.innerHTML = '';
      items.forEach(a => {
        const li = ce('li');
        li.textContent = `${a.title || ''} – ${a.message || ''}`;
        ul.appendChild(li);
      });
    }
    await loadAnnouncements();
    const annForm = qs('#annForm');
    annForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(annForm).entries());
      await fetchJson(`${API_BASE}/admin/announcements`, { method: 'POST', body: JSON.stringify(data) });
      annForm.reset();
      loadAnnouncements();
    });

    // Centers
    async function loadCenters() {
      const items = await fetchJson(`${API_BASE}/centers`);
      const ul = qs('#centerList');
      ul.innerHTML = '';
      items.forEach(c => {
        const li = ce('li');
        li.innerHTML = `<div>${c.name}</div>`;
        const del = ce('button'); del.className = 'button'; del.textContent = 'حذف';
        del.onclick = async () => { await fetchJson(`${API_BASE}/admin/centers/${c.id}`, { method: 'DELETE' }); loadCenters(); };
        li.appendChild(del);
        ul.appendChild(li);
      });
    }
    await loadCenters();
    const centerForm = qs('#centerForm');
    centerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(centerForm).entries());
      await fetchJson(`${API_BASE}/admin/centers`, { method: 'POST', body: JSON.stringify(data) });
      centerForm.reset();
      loadCenters();
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    handleLogin();
    handleDashboard();
  });
})();

