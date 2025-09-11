// Admin Scanner PWA - minimal scaffold with camera + offline queue skeleton

const els = {
  endpoint: document.getElementById('endpoint'),
  scannerId: document.getElementById('scannerId'),
  user: document.getElementById('user'),
  pass: document.getElementById('pass'),
  login: document.getElementById('login'),
  logout: document.getElementById('logout'),
  lesson: document.getElementById('lesson'),
  refreshLessons: document.getElementById('refreshLessons'),
  video: document.getElementById('video'),
  status: document.getElementById('status'),
  qsize: document.getElementById('qsize'),
};

const store = {
  jwt: localStorage.getItem('adminJwt') || '',
  endpoint: localStorage.getItem('scannerEndpoint') || '',
  scannerId: localStorage.getItem('scannerId') || '',
};

els.endpoint.value = store.endpoint;
els.scannerId.value = store.scannerId;

// Offline queue using localStorage (swap to IndexedDB later)
function getQueue(){
  try { return JSON.parse(localStorage.getItem('scanQueue')||'[]'); } catch { return []; }
}
function setQueue(q){ localStorage.setItem('scanQueue', JSON.stringify(q)); els.qsize.textContent = q.length; }
setQueue(getQueue());

async function api(path, opts={}){
  const base = els.endpoint.value.trim().replace(/\/$/, '');
  const headers = new Headers(opts.headers || {});
  if (store.jwt) headers.set('Authorization', `Bearer ${store.jwt}`);
  const res = await fetch(`${base}${path}`, { ...opts, headers });
  if (res.status === 401) { localStorage.removeItem('adminJwt'); location.reload(); }
  return res;
}

els.login.onclick = async () => {
  try{
    const res = await fetch(els.endpoint.value.trim().replace(/\/$/, '') + '/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: els.user.value.trim(), password: els.pass.value })
    });
    if(!res.ok){ els.status.innerHTML = '<span class="badge err">فشل تسجيل الدخول</span>'; return; }
    const j = await res.json();
    store.jwt = j.token; localStorage.setItem('adminJwt', store.jwt);
    localStorage.setItem('scannerEndpoint', els.endpoint.value.trim());
    localStorage.setItem('scannerId', els.scannerId.value.trim());
    els.status.innerHTML = '<span class="badge ok">تم تسجيل الدخول</span>';
  }catch(e){ els.status.innerHTML = '<span class="badge err">تعذّر الاتصال</span>'; }
};

els.logout.onclick = () => { localStorage.removeItem('adminJwt'); store.jwt=''; location.reload(); };

els.refreshLessons.onclick = async () => {
  // Placeholder: fetch lessons for today from functions or backend
  try{
    const res = await api('/api/schedules');
    const list = await res.json();
    const items = Array.isArray(list) ? list : list.items;
    els.lesson.innerHTML = '';
    items.slice(0, 20).forEach(x => {
      const opt = document.createElement('option');
      opt.value = x.id || `${x.date}-${x.time}-${x.center}`;
      opt.textContent = `${x.subject || 'درس'} — ${x.date} ${x.time}`;
      els.lesson.appendChild(opt);
    });
  }catch(e){ els.status.innerHTML = '<span class="badge err">تعذّر تحميل الدروس</span>'; }
};

async function startCamera(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    els.video.srcObject = stream; await els.video.play();
    els.status.innerHTML = '<span class="badge ok">الكاميرا جاهزة</span>';
  }catch(e){ els.status.innerHTML = '<span class="badge err">لا يمكن الوصول للكاميرا</span>'; }
}

async function processCode(qr){
  const payload = {
    token: qr,
    scannerId: els.scannerId.value.trim() || 'scanner-1',
    lessonId: els.lesson.value || null,
    idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2)}`
  };
  // Online try
  try{
    const res = await api('/api/markAttendance', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(res.ok){ els.status.innerHTML = '<span class="badge ok">تم تسجيل الحضور</span>'; return; }
    throw new Error('not ok');
  }catch{
    // Queue offline
    const q = getQueue(); q.push(payload); setQueue(q);
    els.status.innerHTML = '<span class="badge err">حُفظت في قائمة الانتظار</span>';
  }
}

let lastValue = '';
let lastTime = 0;
function shouldProcess(val){
  const now = Date.now();
  if(val === lastValue && (now - lastTime) < 3000) return false;
  lastValue = val; lastTime = now; return true;
}

async function detectLoop(){
  const hasBarcodeDetector = 'BarcodeDetector' in window;
  if(hasBarcodeDetector){
    try{
      // @ts-ignore
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      els.status.innerHTML = '<span class="badge ok">قارئ QR مفعّل</span>';
      const tick = async () => {
        try{
          const codes = await detector.detect(els.video);
          if (codes && codes.length){
            const raw = codes[0].rawValue || codes[0].raw || '';
            if(raw && raw.length > 15 && shouldProcess(raw)){
              await processCode(raw);
            }
          }
        }catch{ /* ignore frame errors */ }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return;
    }catch(e){
      els.status.innerHTML = '<span class="badge err">تعذّر تفعيل قارئ QR، سيتم استخدام اللصق كبديل</span>';
    }
  } else {
    els.status.innerHTML = '<span class="badge err">قارئ QR غير مدعوم، استخدم لصق التوكن للاختبار</span>';
  }

  // Fallback: simulate by paste
  window.addEventListener('paste', (e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if(text && text.length > 20 && shouldProcess(text)){ processCode(text); }
  });
}

async function syncQueue(){
  const q = getQueue();
  if(q.length === 0) return;
  const next = q[0];
  try{
    const res = await api('/api/markAttendance', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(next) });
    if(res.ok){ q.shift(); setQueue(q); }
  }catch{ /* keep queued */ }
}

setInterval(syncQueue, 5000);

(async function init(){
  await startCamera();
  await detectLoop();
})();

// Persist settings on change
['endpoint','scannerId'].forEach(id => {
  const input = els[id];
  input?.addEventListener('change', ()=>{
    if(id==='endpoint') localStorage.setItem('scannerEndpoint', els.endpoint.value.trim());
    if(id==='scannerId') localStorage.setItem('scannerId', els.scannerId.value.trim());
  });
});
