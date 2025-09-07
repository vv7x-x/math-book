(function(){
  'use strict';
  
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const langToggle = document.getElementById('langToggle');
  const yearEl = document.getElementById('year');
  
  // Initialize year
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Enhanced i18n with more translations
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
      qr_desc: 'احصل على كود QR خاص بك لتثبيت الحضور.',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      success: 'تم بنجاح',
      retry: 'إعادة المحاولة',
      no_data: 'لا توجد بيانات',
      search: 'بحث...',
      filter: 'تصفية',
      clear: 'مسح',
      save: 'حفظ',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      close: 'إغلاق'
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
      qr_desc: 'Get your personal QR code for attendance.',
      loading: 'Loading...',
      error: 'Error occurred',
      success: 'Success',
      retry: 'Retry',
      no_data: 'No data available',
      search: 'Search...',
      filter: 'Filter',
      clear: 'Clear',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close'
    }
  };

  // Initialize theme and language
  const savedTheme = localStorage.getItem('theme') || 'light';
  const savedLang = localStorage.getItem('lang') || 'ar';
  
  if(savedTheme === 'dark') {
    html.classList.add('dark');
    if(themeToggle) themeToggle.textContent = '🌙';
  }
  
  applyLang(savedLang);
  if(langToggle) langToggle.textContent = savedLang.toUpperCase();

  // Enhanced language switching with smooth transitions
  function applyLang(lang) {
    const dict = i18n[lang] || i18n.ar;
    
    // Add fade effect
    document.body.style.opacity = '0.7';
    
    setTimeout(() => {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(dict[key]) el.textContent = dict[key];
      });

  // Header scroll state
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.app-header');
    if (!header) return;
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });
      
      if(lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');
      }
      
      document.body.style.opacity = '1';
    }, 150);
  }

  // Enhanced theme toggle with animation
  if(themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = html.classList.contains('dark');
      
      // Add transition effect
      html.style.transition = 'all 0.3s ease';
      
      html.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
      
      // Remove transition after animation
      setTimeout(() => {
        html.style.transition = '';
      }, 300);
    });
  }

  // Enhanced language toggle
  if(langToggle) {
    langToggle.addEventListener('click', () => {
      const current = localStorage.getItem('lang') || 'ar';
      const next = current === 'ar' ? 'en' : 'ar';
      localStorage.setItem('lang', next);
      langToggle.textContent = next.toUpperCase();
      applyLang(next);
    });
  }

  // Enhanced Notification System
  window.NotificationManager = {
    notifications: [],
    
    show: function(message, type = 'info', options = {}) {
      const notification = {
        id: Date.now() + Math.random(),
        message,
        type,
        duration: options.duration || 5000,
        persistent: options.persistent || false,
        actions: options.actions || []
      };
      
      this.notifications.push(notification);
      this.render(notification);
      
      // Auto remove if not persistent
      if (!notification.persistent && notification.duration > 0) {
        setTimeout(() => {
          this.remove(notification.id);
        }, notification.duration);
      }
      
      return notification.id;
    },
    
    render: function(notification) {
      const container = this.getContainer();
      const alert = document.createElement('div');
      alert.className = `alert ${notification.type} notification`;
      alert.setAttribute('data-id', notification.id);
      alert.setAttribute('role', 'alert');
      alert.setAttribute('aria-live', 'polite');
      
      // Create content
      const content = document.createElement('div');
      content.style.cssText = 'display: flex; align-items: center; gap: 0.75rem; flex: 1;';
      
      // Add icon based on type
      const icon = document.createElement('span');
      icon.setAttribute('aria-hidden', 'true');
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };
      icon.textContent = icons[notification.type] || icons.info;
      icon.style.fontSize = '1.2rem';
      
      // Add message
      const messageEl = document.createElement('span');
      messageEl.textContent = notification.message;
      messageEl.style.flex = '1';
      
      content.appendChild(icon);
      content.appendChild(messageEl);
      alert.appendChild(content);
      
      // Add actions if any
      if (notification.actions.length > 0) {
        const actionsContainer = document.createElement('div');
        actionsContainer.style.cssText = 'display: flex; gap: 0.5rem; margin-left: 1rem;';
        
        notification.actions.forEach(action => {
          const btn = document.createElement('button');
          btn.textContent = action.text;
          btn.className = 'btn ghost';
          btn.style.cssText = 'padding: 0.25rem 0.5rem; font-size: 0.75rem;';
          btn.onclick = () => {
            if (action.callback) action.callback();
            if (action.dismiss !== false) this.remove(notification.id);
          };
          actionsContainer.appendChild(btn);
        });
        
        alert.appendChild(actionsContainer);
      }
      
      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'إغلاق الإشعار');
      closeBtn.style.cssText = 'background:none;border:none;font-size:1.5rem;cursor:pointer;margin-left:auto;padding:0.25rem;';
      closeBtn.onclick = () => this.remove(notification.id);
      alert.appendChild(closeBtn);
      
      // Add animation
      alert.style.transform = 'translateX(100%)';
      alert.style.transition = 'transform 0.3s ease';
      
      container.appendChild(alert);
      
      // Trigger animation
      setTimeout(() => {
        alert.style.transform = 'translateX(0)';
      }, 10);
    },
    
    remove: function(id) {
      const alert = document.querySelector(`[data-id="${id}"]`);
      if (alert) {
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
          }
        }, 300);
      }
      
      this.notifications = this.notifications.filter(n => n.id !== id);
    },
    
    getContainer: function() {
      let container = document.getElementById('notification-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 400px;
          pointer-events: none;
        `;
        document.body.appendChild(container);
      }
      return container;
    },
    
    clear: function() {
      this.notifications.forEach(notification => {
        this.remove(notification.id);
      });
    }
  };

  // Utility functions
  window.AppUtils = {
    showAlert: function(message, type = 'info', duration = 5000) {
      return window.NotificationManager.show(message, type, { duration });
    },
    
    showNotification: function(message, type = 'info', options = {}) {
      return window.NotificationManager.show(message, type, options);
    },
    
    showLoading: function(element, show = true) {
      if(show) {
        element.innerHTML = `
          <div class="loading">
            <div class="spinner"></div>
            <span>${i18n[localStorage.getItem('lang') || 'ar'].loading}</span>
          </div>
        `;
      }
    },
    
    formatDate: function(date) {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(date).toLocaleDateString(
        localStorage.getItem('lang') === 'en' ? 'en-US' : 'ar-SA',
        options
      );
    },
    
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  };

  // Add smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if(target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add loading states to forms
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
      const submitBtn = this.querySelector('button[type="submit"]');
      if(submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = `
          <div class="loading">
            <div class="spinner"></div>
            <span>${i18n[localStorage.getItem('lang') || 'ar'].loading}</span>
          </div>
        `;
        submitBtn.disabled = true;
        
        // Reset after 5 seconds if no response
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 5000);
      }
    });
  });

  // Add keyboard navigation
  document.addEventListener('keydown', function(e) {
    // Alt + T for theme toggle
    if(e.altKey && e.key === 't') {
      e.preventDefault();
      if(themeToggle) themeToggle.click();
    }
    
    // Alt + L for language toggle
    if(e.altKey && e.key === 'l') {
      e.preventDefault();
      if(langToggle) langToggle.click();
    }
  });

  // Add intersection observer for animations
  if('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    // Observe feature cards
    document.querySelectorAll('.feature').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(card);
    });
  }

  // Performance optimizations
  const performanceUtils = {
    // Lazy loading for images
    lazyLoadImages: function() {
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    },
    
    // Preload critical resources
    preloadCriticalResources: function() {
      const criticalResources = [
        '/assets/css/styles.css',
        '/assets/js/app.js'
      ];
      
      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
      });
    },
    
    // Debounce function for performance
    debounce: function(func, wait, immediate) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          timeout = null;
          if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
      };
    },
    
    // Throttle function for performance
    throttle: function(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  };

  // Security enhancements
  const securityUtils = {
    // Sanitize HTML content
    sanitizeHTML: function(str) {
      const temp = document.createElement('div');
      temp.textContent = str;
      return temp.innerHTML;
    },
    
    // Validate input data
    validateInput: function(input, type = 'text') {
      const patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[+]?[1-9][\d]{0,15}$/,
        username: /^[a-zA-Z0-9_]{3,20}$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
      };
      
      if (type === 'required') {
        return input && input.trim().length > 0;
      }
      
      if (patterns[type]) {
        return patterns[type].test(input);
      }
      
      return true;
    },
    
    // Escape special characters
    escapeHTML: function(str) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return str.replace(/[&<>"']/g, m => map[m]);
    },
    
    // Generate secure random token
    generateToken: function(length = 32) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
  };

  // Add performance monitoring
  const performanceMonitor = {
    startTime: performance.now(),
    
    measurePageLoad: function() {
      window.addEventListener('load', () => {
        const loadTime = performance.now() - this.startTime;
        console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
        
        // Send to analytics if available
        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'page_load_time', {
            value: Math.round(loadTime)
          });
        }
      });
    },
    
    measureInteraction: function(element, eventType, callback) {
      const startTime = performance.now();
      
      element.addEventListener(eventType, () => {
        const duration = performance.now() - startTime;
        console.log(`${eventType} interaction took ${duration.toFixed(2)}ms`);
        
        if (callback) callback(duration);
      });
    }
  };

  // Initialize performance optimizations
  performanceUtils.preloadCriticalResources();
  performanceUtils.lazyLoadImages();
  performanceMonitor.measurePageLoad();

  // Add security headers and CSP
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://math-book-tpjz.vercel.app https://zrxgvzhikiyqyhxprmwc.supabase.co https://*.supabase.co;";
  document.head.appendChild(meta);

  // Add security headers
  const securityMeta = document.createElement('meta');
  securityMeta.httpEquiv = 'X-Content-Type-Options';
  securityMeta.content = 'nosniff';
  document.head.appendChild(securityMeta);

  const frameOptions = document.createElement('meta');
  frameOptions.httpEquiv = 'X-Frame-Options';
  frameOptions.content = 'DENY';
  document.head.appendChild(frameOptions);

  // Expose utilities globally
  window.PerformanceUtils = performanceUtils;
  window.SecurityUtils = securityUtils;
  window.PerformanceMonitor = performanceMonitor;

  console.log('🚀 App initialized successfully with enhanced performance and security!');
})();