/*!
 * GDC Zaim — shared site behaviour
 * Navigation, theme, English/Urdu switching, scroll reveal, formatting helpers
 * and the site-wide search index (SRS §22).
 */
(function () {
  'use strict';

  const D = window.GDC || {};
  const root = document.documentElement;
  const BASE = root.getAttribute('data-base') || '';

  /* ============================================================
   * Icons — a tiny inline sprite so the site needs no icon font
   * ============================================================ */
  const ICONS = {
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    caret: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5Z"/><path d="M8 7h8M8 11h6"/>',
    cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    flask: '<path d="M9 2h6M10 2v6.5L4.6 18A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-3L14 8.5V2"/><path d="M7 15h10"/>',
    atom: '<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="10" ry="4.5"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(120 12 12)"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 7-10 16-10 0 9-4 16-9 16Z"/><path d="M4 21c4-6 8-8 12-9"/>',
    dna: '<path d="M4 2c0 6 16 8 16 14M20 2c0 6-16 8-16 14M4 22c0-2 16-2 16 0M6 6h12M6 18h12"/>',
    sigma: '<path d="M18 4H6l7 8-7 8h12"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
    mosque: '<path d="M12 2c3 2.5 4.5 4.5 4.5 6.5H7.5C7.5 6.5 9 4.5 12 2Z"/><path d="M4 21V12a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9"/><path d="M4 21h16M10 21v-4a2 2 0 0 1 4 0v4"/>',
    trophy: '<path d="M8 3h8v6a4 4 0 0 1-8 0Z"/><path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3M10 21h4M12 13v8"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>',
    cup: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"/><path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2M4 22h14"/>',
    home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
    health: '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11Z"/><path d="M9.5 11h5M12 8.5v5"/>',
    bus: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M3 10h18M7 20v-2M17 20v-2"/><circle cx="7.5" cy="16.5" r="1"/><circle cx="16.5" cy="16.5" r="1"/>',
    file: '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/>',
    download: '<path d="M12 3v12M7 11l5 5 5-5"/><path d="M4 20h16"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.5 3.5 0 0 1 0 5.6M18 14.3a6.5 6.5 0 0 1 3.5 5.7"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    bell: '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z"/><path d="M10.5 20a2 2 0 0 0 3 0"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    shield: '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    clipboard: '<rect x="8" y="3" width="8" height="4" rx="1"/><path d="M16 5h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h4"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8.8c0-.5.4-.8 1-.8Z"/>',
    twitter: '<path d="M4 4l7.5 9.5L4.5 20h2l6-6.2 4.7 6.2H21l-7.8-9.9L20 4h-2l-5.6 5.8L8.1 4H4Z"/>',
    youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7.5 10v7M7.5 7.2v.1M11.5 17v-4a2.5 2.5 0 0 1 5 0v4"/>'
  };

  function icon(name, cls) {
    const path = ICONS[name] || ICONS.file;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
      (cls ? ' class="' + cls + '"' : '') + '>' + path + '</svg>';
  }

  /* ============================================================
   * Helpers
   * ============================================================ */
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function parseDate(iso) { const p = String(iso).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtDate(iso) { const d = parseDate(iso); return d.getDate() + ' ' + MONTHS_LONG[d.getMonth()] + ' ' + d.getFullYear(); }
  function fmtShort(iso) { const d = parseDate(iso); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
  function dayOf(iso) { return String(parseDate(iso).getDate()).padStart(2, '0'); }
  function monthOf(iso) { return MONTHS[parseDate(iso).getMonth()]; }
  function deptName(id) { const d = (D.departments || []).find(x => x.id === id); return d ? d.name : 'All Departments'; }
  function qs(name) { return new URLSearchParams(location.search).get(name); }
  function byDateDesc(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }
  function byDateAsc(a, b) { return a.date > b.date ? 1 : a.date < b.date ? -1 : 0; }

  /* ============================================================
   * Theme (light / dark)
   * ============================================================ */
  function currentTheme() {
    let stored = null;
    try { stored = localStorage.getItem('gdc-theme'); } catch (e) { /* private mode */ }
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('title', btn.getAttribute('aria-label'));
    });
  }
  function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('gdc-theme', next); } catch (e) { /* ignore */ }
    applyTheme(next);
  }

  /* ============================================================
   * Language — English / Urdu (SRS §26, §27)
   * Elements carry data-i18n="key"; Urdu strings live in I18N.ur.
   * Content pages additionally use data-ur="..." for inline overrides.
   * ============================================================ */
  const I18N = {
    ur: {
      'nav.home': 'صفحۂ اول',
      'nav.about': 'کالج کا تعارف',
      'nav.about.college': 'کالج کے بارے میں',
      'nav.about.principal': 'پرنسپل کا پیغام',
      'nav.about.admin': 'انتظامیہ',
      'nav.about.facilities': 'سہولیات',
      'nav.academics': 'تعلیمی امور',
      'nav.academics.departments': 'شعبہ جات',
      'nav.academics.programs': 'پروگرامز و کورسز',
      'nav.academics.faculty': 'اساتذہ',
      'nav.academics.exams': 'امتحانات و نتائج',
      'nav.admissions': 'داخلے',
      'nav.admissions.main': 'داخلہ معلومات',
      'nav.admissions.scholarships': 'وظائف',
      'nav.admissions.downloads': 'ڈاؤن لوڈز',
      'nav.campus': 'کیمپس لائف',
      'nav.campus.notices': 'اعلانات',
      'nav.campus.events': 'تقریبات',
      'nav.campus.gallery': 'گیلری',
      'nav.campus.library': 'لائبریری',
      'nav.campus.services': 'طلبہ سہولیات',
      'nav.campus.alumni': 'سابق طلبہ و روزگار',
      'nav.contact': 'رابطہ',
      'nav.portal': 'پورٹل لاگ ان',
      'nav.search': 'تلاش',
      'common.readMore': 'مزید پڑھیں',
      'common.viewAll': 'تمام دیکھیں',
      'common.apply': 'درخواست دیں',
      'common.download': 'ڈاؤن لوڈ',
      'common.quickLinks': 'فوری روابط',
      'home.noticesTitle': 'تازہ ترین اعلانات',
      'home.eventsTitle': 'آنے والی تقریبات',
      'home.deptTitle': 'شعبہ جات',
      'home.principalTitle': 'پرنسپل کا پیغام',
      'home.admissionsTitle': 'داخلے جاری ہیں',
      'footer.quickLinks': 'فوری روابط',
      'footer.academics': 'تعلیمی امور',
      'footer.contact': 'رابطہ',
      'footer.rights': 'جملہ حقوق محفوظ ہیں'
    }
  };

  function currentLang() {
    try { return localStorage.getItem('gdc-lang') === 'ur' ? 'ur' : 'en'; } catch (e) { return 'en'; }
  }
  function applyLang(lang) {
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!el.dataset.enText) el.dataset.enText = el.textContent;
      el.textContent = lang === 'ur' ? (I18N.ur[key] || el.dataset.enText) : el.dataset.enText;
    });
    document.querySelectorAll('[data-ur]').forEach(el => {
      if (!el.dataset.enText) el.dataset.enText = el.textContent;
      el.textContent = lang === 'ur' ? el.getAttribute('data-ur') : el.dataset.enText;
    });
    document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
      btn.innerHTML = icon('globe') + '<span>' + (lang === 'ur' ? 'English' : 'اردو') + '</span>';
      btn.setAttribute('aria-label', lang === 'ur' ? 'Switch to English' : 'اردو میں دیکھیں');
    });
  }
  function toggleLang() {
    const next = currentLang() === 'ur' ? 'en' : 'ur';
    try { localStorage.setItem('gdc-lang', next); } catch (e) { /* ignore */ }
    applyLang(next);
  }

  /* ============================================================
   * Navigation
   * ============================================================ */
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.main-nav');
    if (toggle && nav) {
      toggle.innerHTML = icon('menu');
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.innerHTML = icon(open ? 'close' : 'menu');
        document.body.style.overflow = open && window.innerWidth <= 1080 ? 'hidden' : '';
      });
    }

    document.querySelectorAll('.nav-item.has-menu').forEach(item => {
      const btn = item.querySelector('.nav-link');
      const menu = item.querySelector('.nav-menu');
      if (!btn || !menu) return;
      btn.insertAdjacentHTML('beforeend', icon('caret', 'caret'));
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', e => {
        e.preventDefault();
        const open = !item.classList.contains('open');
        document.querySelectorAll('.nav-item.open').forEach(o => {
          o.classList.remove('open');
          const b = o.querySelector('.nav-link'); if (b) b.setAttribute('aria-expanded', 'false');
        });
        item.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
      });
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-item')) {
        document.querySelectorAll('.nav-item.open').forEach(o => {
          o.classList.remove('open');
          const b = o.querySelector('.nav-link'); if (b) b.setAttribute('aria-expanded', 'false');
        });
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.nav-item.open').forEach(o => o.classList.remove('open'));
      const lb = document.querySelector('.lightbox.open');
      if (lb) closeLightbox(lb);
    });

    // Mark the active page
    const here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-list a[href]').forEach(a => {
      const target = a.getAttribute('href').split('/').pop().split('#')[0];
      if (target && target === here) {
        a.setAttribute('aria-current', 'page');
        const parent = a.closest('.nav-item.has-menu');
        if (parent) parent.querySelector('.nav-link').setAttribute('aria-current', 'page');
      }
    });
  }

  /* ============================================================
   * Scroll reveal
   * ============================================================ */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: .08 });
    items.forEach(el => io.observe(el));
  }

  /* Count-up for the statistics band */
  function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const run = el => {
      const target = +el.getAttribute('data-count');
      if (reduce) { el.textContent = target.toLocaleString('en-US'); return; }
      const start = performance.now(), dur = 1400;
      const step = now => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
    }, { threshold: .4 });
    nums.forEach(el => io.observe(el));
  }

  /* ============================================================
   * Lightbox (gallery)
   * ============================================================ */
  let lastFocus = null;
  function openLightbox(box, tone, caption, image, alt) {
    lastFocus = document.activeElement;
    const media = box.querySelector('[data-lb-media]');
    media.innerHTML = image
      ? '<img src="' + esc(image) + '" alt="' + esc(alt || caption) + '">'
      : '<span class="ph ph-' + esc(tone) + '"></span>';
    box.querySelector('[data-lb-caption]').textContent = caption;
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
    box.querySelector('.lightbox-close').focus();
  }
  function closeLightbox(box) {
    box.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  /* ============================================================
   * Site-wide search index (SRS §22)
   * ============================================================ */
  function buildIndex() {
    const idx = [];
    const add = (type, title, text, url, meta) => idx.push({ type, title, text: text || '', url, meta: meta || '' });

    (D.departments || []).forEach(d =>
      add('Department', d.name, d.intro + ' ' + d.courses.join(' ') + ' ' + d.hod,
        BASE + 'department.html?id=' + d.id, 'HOD: ' + d.hod));
    (D.faculty || []).forEach(f =>
      add('Faculty', f.name, f.designation + ' ' + f.qualification + ' ' + f.specialization,
        BASE + 'faculty.html?q=' + encodeURIComponent(f.name), f.designation));
    (D.notices || []).forEach(n =>
      add('Notice', n.title, n.body, BASE + 'notices.html?id=' + n.id, n.category + ' · ' + fmtShort(n.date)));
    (D.events || []).forEach(e =>
      add('Event', e.title, e.summary + ' ' + e.venue, BASE + 'events.html#' + e.id, fmtShort(e.date)));
    (D.programs || []).forEach(p =>
      add('Programme', p.name, p.eligibility + ' ' + p.duration, BASE + 'academics.html#programs', p.level));
    (D.books || []).forEach(b =>
      add('Library Book', b.title, b.author + ' ' + b.category + ' ' + b.isbn,
        BASE + 'library.html?q=' + encodeURIComponent(b.title), b.author));
    (D.downloads || []).forEach(f =>
      add('Document', f.title, f.category + ' ' + f.type, BASE + 'downloads.html', f.category));
    (D.scholarships || []).forEach(s =>
      add('Scholarship', s.name, s.eligibility + ' ' + s.provider, BASE + 'scholarships.html', s.provider));
    (D.facilities || []).forEach(f =>
      add('Facility', f.name, f.detail, BASE + 'facilities.html', 'Campus facility'));
    (D.studentServices || []).forEach(s =>
      add('Student Service', s.name, s.requires, BASE + 'student-services.html', 'Turnaround: ' + s.turnaround));
    return idx;
  }

  function searchIndex(query, limit) {
    const q = String(query || '').trim().toLowerCase();
    if (q.length < 2) return [];
    const terms = q.split(/\s+/);
    return buildIndex()
      .map(item => {
        const title = item.title.toLowerCase(), text = item.text.toLowerCase();
        let score = 0;
        terms.forEach(t => {
          if (title === t) score += 12;
          else if (title.startsWith(t)) score += 8;
          else if (title.includes(t)) score += 6;
          if (text.includes(t)) score += 2;
        });
        return { item, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit || 30)
      .map(r => r.item);
  }

  function initHeaderSearch() {
    document.querySelectorAll('[data-search-trigger]').forEach(btn => {
      btn.addEventListener('click', () => { location.href = BASE + 'search.html'; });
    });
  }

  /* ============================================================
   * Boot
   * ============================================================ */
  function init() {
    applyTheme(currentTheme());
    applyLang(currentLang());
    initNav();
    initReveal();
    initCounters();
    initHeaderSearch();

    // Pages that render or re-render lists dispatch this to refresh shared behaviour
    window.addEventListener('gdc:rendered', () => { initReveal(); initCounters(); applyLang(currentLang()); });

    document.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', toggleTheme));
    document.querySelectorAll('[data-lang-toggle]').forEach(b => b.addEventListener('click', toggleLang));

    // Footer year
    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

    // Gallery lightbox wiring (present only on pages that include the markup)
    const box = document.querySelector('.lightbox');
    if (box) {
      document.addEventListener('click', e => {
        const item = e.target.closest('[data-lightbox]');
        if (item) openLightbox(box, item.getAttribute('data-tone'), item.getAttribute('data-caption'),
          item.getAttribute('data-full'), item.getAttribute('data-alt'));
        if (e.target.closest('.lightbox-close') || e.target === box) closeLightbox(box);
      });
    }

    // Tabs
    document.querySelectorAll('[role="tablist"]').forEach(list => {
      const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
      const select = tab => {
        tabs.forEach(t => {
          const on = t === tab;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          const panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) panel.hidden = !on;
        });
      };
      tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => select(tab));
        tab.addEventListener('keydown', e => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          e.preventDefault();
          const dir = e.key === 'ArrowRight' ? 1 : -1;
          const next = tabs[(i + dir + tabs.length) % tabs.length];
          next.focus(); select(next);
        });
      });
    });

    // Demo form handling — no backend in Phase 1
    document.querySelectorAll('form[data-demo-form]').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const note = form.querySelector('[data-form-status]');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const ref = form.getAttribute('data-ref-prefix');
        if (note) {
          note.className = 'form-status ok';
          note.hidden = false;
          note.innerHTML = ref
            ? '<strong>Submitted.</strong> Your reference number is <code>' + ref + '-' +
              String(Math.floor(Math.random() * 9000) + 1000) + '</code>. Keep it to track the request. ' +
              '<em>Demonstration only — submissions are not stored until the Phase&nbsp;2 backend is connected.</em>'
            : '<strong>Thank you.</strong> Your message has been recorded. ' +
              '<em>Demonstration only — submissions are not stored until the Phase&nbsp;2 backend is connected.</em>';
          note.focus();
        }
        form.reset();
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* Public helpers for page-level scripts */
  window.GDCUI = { icon, esc, fmtDate, fmtShort, dayOf, monthOf, deptName, qs, parseDate, byDateDesc, byDateAsc, searchIndex, BASE };
})();
