(function() {
  const messages = {
    ar: { dashboard: 'لوحة الإدارة' },
    en: { dashboard: 'Admin Dashboard' }
  };
  function applyLanguage(lang) {
    const dict = messages[lang] || messages.ar;
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    localStorage.setItem('lang', lang);
    const sel = document.getElementById('langSelect');
    if (sel) sel.value = lang;
  }
  window.addEventListener('DOMContentLoaded', () => {
    const stored = localStorage.getItem('lang') || 'ar';
    applyLanguage(stored);
    const sel = document.getElementById('langSelect');
    if (sel) sel.addEventListener('change', (e) => applyLanguage(e.target.value));
  });
})();

