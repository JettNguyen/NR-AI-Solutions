/* ========================================
   N&R AI Solutions | Shared Navigation
   js/nav.js
   ======================================== */

(function () {
  'use strict';

  var THEME_KEY = 'nr-theme';
  var root = document.documentElement;

  function getStoredTheme() {
    try {
      return window.localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function updateNavLogos(theme) {
    var logoFile = theme === 'dark' ? 'icon-1024-dark.svg' : 'icon-1024-light.svg';

    document.querySelectorAll('.nav-logo img, .footer-logo img').forEach(function (img) {
      if (!img.dataset.logoBaseHref) {
        img.dataset.logoBaseHref = img.getAttribute('src') || '';
      }

      var baseHref = img.dataset.logoBaseHref;
      if (!baseHref) return;

      try {
        var resolved = new URL(baseHref, window.location.href);
        resolved.pathname = resolved.pathname.replace(/[^/]+$/, logoFile);
        img.src = resolved.toString();
      } catch (e) {
        img.src = baseHref.replace(/[^/]+$/, logoFile);
      }
    });
  }

  function applyTheme(theme, shouldPersist) {
    var nextTheme = theme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', nextTheme);

    document.querySelectorAll('.theme-toggle').forEach(function (toggle) {
      var isDark = nextTheme === 'dark';
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      var label = toggle.querySelector('.theme-toggle-label');
      if (label) {
        label.textContent = isDark ? 'Dark Mode' : 'Light Mode';
      }
    });

    updateNavLogos(nextTheme);

    if (!shouldPersist) return;

    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch (e) {
      /* localStorage unavailable */
    }
  }

  function createThemeToggle(extraClassName) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = extraClassName ? 'theme-toggle ' + extraClassName : 'theme-toggle';
    button.innerHTML = '<span class="theme-toggle-label">Light Mode</span><span class="theme-toggle-track" aria-hidden="true"><span class="theme-toggle-thumb"></span></span>';
    button.addEventListener('click', function () {
      var currentTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true);
    });
    return button;
  }

  function mountThemeToggles() {
    var navInner = document.querySelector('.nav-inner');
    if (navInner && !navInner.querySelector('.theme-toggle')) {
      var desktopToggle = createThemeToggle('theme-toggle--nav');
      var navCta = navInner.querySelector('.nav-cta');
      if (navCta) {
        navInner.insertBefore(desktopToggle, navCta);
      } else {
        navInner.appendChild(desktopToggle);
      }
    }

    var drawer = document.getElementById('navDrawer');
    if (drawer && !drawer.querySelector('.theme-toggle')) {
      var drawerToggle = createThemeToggle('theme-toggle--drawer');
      var drawerCta = drawer.querySelector('.nav-drawer-cta');
      if (drawerCta) {
        drawer.insertBefore(drawerToggle, drawerCta);
      } else {
        drawer.appendChild(drawerToggle);
      }
    }
  }

  mountThemeToggles();
  applyTheme(getStoredTheme() || 'light', false);

  /* ── Active page link ──
     Use link.href (browser-resolved absolute URL) so relative hrefs
     like "../about/" work correctly from any directory depth.        */
  var currentNorm = window.location.pathname.replace(/\/+$/, '') || '/';

  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(function (link) {
    try {
      var linkNorm = new URL(link.href).pathname.replace(/\/+$/, '') || '/';
      if (linkNorm === currentNorm) {
        link.classList.add('active');
      } else if (linkNorm !== '/' && currentNorm.startsWith(linkNorm + '/')) {
        link.classList.add('active');
      }
    } catch (e) { /* skip non-navigable hrefs */ }
  });

  var moreContainer = document.getElementById('navMore');
  var moreToggle = document.getElementById('navMoreToggle');
  var moreMenu = document.getElementById('navMoreMenu');

  if (moreContainer && moreToggle && moreMenu) {
    var hasActiveMoreLink = !!moreMenu.querySelector('a.active');
    if (hasActiveMoreLink) {
      moreToggle.classList.add('active');
    }

    function openMoreMenu() {
      moreContainer.classList.add('open');
      moreToggle.setAttribute('aria-expanded', 'true');
    }

    function closeMoreMenu() {
      moreContainer.classList.remove('open');
      moreToggle.setAttribute('aria-expanded', 'false');
    }

    moreToggle.addEventListener('click', function () {
      if (moreContainer.classList.contains('open')) {
        closeMoreMenu();
      } else {
        openMoreMenu();
      }
    });

    document.addEventListener('click', function (event) {
      if (!moreContainer.contains(event.target)) {
        closeMoreMenu();
      }
    });

    moreMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMoreMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMoreMenu();
      }
    });
  }

  /* ── Scroll: nav opacity ── */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ── Hamburger / Drawer ── */
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('navDrawer');
  const overlay   = document.getElementById('navOverlay');

  function openDrawer() {
    hamburger.classList.add('open');
    drawer.classList.add('open');
    overlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      if (drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeDrawer);
  }

  /* Close drawer on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  /* ── Scroll-triggered fade-up (IntersectionObserver) ── */
  const fadeEls = document.querySelectorAll('.fade-up');

  if ('IntersectionObserver' in window && fadeEls.length) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    /* Fallback: show everything if observer not supported */
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }
})();
