(function() {
  const messages = {
    ar: {
      title: 'أحمد سامي – سبشيال وان',
      welcome: 'مرحباً بكم في بوابة الطلاب',
      subtitle: 'سجّل حسابك أو قم بتسجيل الدخول للوصول إلى الجدول والإعلانات وكود الحضور',
      register: 'تسجيل حساب',
      login: 'تسجيل الدخول',
      logout: 'خروج',
      fullName: 'الاسم الكامل',
      username: 'اسم المستخدم',
      nationalId: 'الرقم القومي/شهادة الميلاد',
      studentPhone: 'هاتف الطالب',
      parentPhone: 'هاتف ولي الأمر',
      stage: 'المرحلة التعليمية',
      age: 'العمر',
      center: 'المركز',
      submit: 'إرسال',
      qrCode: 'كود الحضور',
      schedule: 'جدول الدروس',
      announcements: 'إعلانات المعلم',
      brand: 'أحمد سامي – سبشيال وان'
    },
    en: {
      title: 'Ahmed Sami – Special One',
      welcome: 'Welcome to the Student Portal',
      subtitle: 'Register or log in to access schedule, announcements and QR attendance',
      register: 'Register',
      login: 'Login',
      logout: 'Logout',
      fullName: 'Full Name',
      username: 'Username',
      nationalId: 'National ID/Birth Certificate',
      studentPhone: 'Student Phone',
      parentPhone: 'Parent Phone',
      stage: 'Education Stage',
      age: 'Age',
      center: 'Learning Center',
      submit: 'Submit',
      qrCode: 'Attendance QR Code',
      schedule: 'Lesson Schedule',
      announcements: 'Teacher Announcements',
      brand: 'Ahmed Sami – Special One'
    }
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

