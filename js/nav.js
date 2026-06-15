/* ========================================
   N&R AI Solutions — Shared Navigation
   js/nav.js
   ======================================== */

(function () {
  'use strict';

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
