(function(){
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const langToggle = document.getElementById('langToggle');
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  const i18n = {
    ar: {
      welcome_title: 'أهلاً بك في منصة الطالب',
      welcome_sub: 'سجّل حسابك وانتظر الموافقة من الإدارة ثم سجّل الدخول لمتابعة مواعيد الدروس والإعلانات.',
      register: 'تسجيل حساب جديد',
      login: 'تسجيل الدخول',
      schedules: 'جداول الدروس',
      schedules_desc: 'اطّلع على المواعيد والمراكز بسهولة.',
      announcements: 'الإعلانات',
      announcements_desc: 'استقبل آخر أخبار المدرّس والتحديثات.',
      qr_title: 'كود حضور',
      qr_desc: 'احصل على كود QR خاص بك لتثبيت الحضور.'
    },
    en: {
      welcome_title: 'Welcome to the Student Portal',
      welcome_sub: 'Register and wait for admin approval, then log in to view schedules and announcements.',
      register: 'Create New Account',
      login: 'Log In',
      schedules: 'Lesson Schedules',
      schedules_desc: 'Check dates and centers easily.',
      announcements: 'Announcements',
      announcements_desc: 'Receive the latest updates from the teacher.',
      qr_title: 'Attendance QR',
      qr_desc: 'Get your personal QR code for attendance.'
    }
  };

  const savedTheme = localStorage.getItem('theme')||'light';
  if(savedTheme==='dark'){ html.classList.add('dark'); if(themeToggle) themeToggle.textContent='🌙'; }
  const savedLang = localStorage.getItem('lang')||'ar';
  applyLang(savedLang);
  if(langToggle) langToggle.textContent = savedLang.toUpperCase();

  function applyLang(lang){
    const dict = i18n[lang]||i18n.ar;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(dict[key]) el.textContent = dict[key];
    });
    if(lang==='ar'){
      document.documentElement.setAttribute('dir','rtl');
      document.documentElement.setAttribute('lang','ar');
    } else {
      document.documentElement.setAttribute('dir','ltr');
      document.documentElement.setAttribute('lang','en');
    }
  }

  themeToggle&&themeToggle.addEventListener('click',()=>{
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem('theme',isDark?'dark':'light');
    themeToggle.textContent = isDark?'🌙':'☀️';
  });

  langToggle&&langToggle.addEventListener('click',()=>{
    const current = localStorage.getItem('lang')||'ar';
    const next = current==='ar'?'en':'ar';
    localStorage.setItem('lang', next);
    langToggle.textContent = next.toUpperCase();
    applyLang(next);
  });
})();