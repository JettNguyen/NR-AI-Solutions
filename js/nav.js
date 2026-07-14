/* ========================================
   Otian AI | Shared Navigation
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
    // The icon shows the theme that's ON: sun while light, moon while dark.
    // Both icons live in the DOM; CSS swaps them on html[data-theme].
    button.innerHTML =
      '<svg class="theme-toggle-icon theme-toggle-icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="4"/>' +
        '<line x1="12" y1="2" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="22"/>' +
        '<line x1="2" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="22" y2="12"/>' +
        '<line x1="4.93" y1="4.93" x2="6.7" y2="6.7"/><line x1="17.3" y1="17.3" x2="19.07" y2="19.07"/>' +
        '<line x1="4.93" y1="19.07" x2="6.7" y2="17.3"/><line x1="17.3" y1="6.7" x2="19.07" y2="4.93"/>' +
      '</svg>' +
      '<svg class="theme-toggle-icon theme-toggle-icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' +
      '</svg>';
    button.addEventListener('click', function () {
      var currentTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true);
    });
    return button;
  }

  function mountThemeToggles() {
    // Main nav only — the toggle stays visible at every width, so the
    // mobile drawer doesn't need (or get) its own copy.
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
  }

  mountThemeToggles();
  applyTheme(getStoredTheme() || 'light', false);

  /* ── Active page link ──
     Use link.href (browser-resolved absolute URL) so relative hrefs
     like "../about/" work correctly from any directory depth.        */
  var currentNorm = window.location.pathname.replace(/\/+$/, '') || '/';

  document.querySelectorAll('.nav-links a, .nav-drawer a, .nav-drawer-flyout a').forEach(function (link) {
    try {
      var linkNorm = new URL(link.href).pathname.replace(/\/+$/, '') || '/';
      if (linkNorm === currentNorm) {
        link.classList.add('active');
      } else if (linkNorm !== '/' && currentNorm.startsWith(linkNorm + '/')) {
        link.classList.add('active');
      }
    } catch (e) { /* skip non-navigable hrefs */ }
  });

  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.nav-more'));

  dropdowns.forEach(function (container) {
    var toggle = container.querySelector('.nav-more-toggle');
    var menu = container.querySelector('.nav-more-menu');
    if (!toggle || !menu) return;

    if (menu.querySelector('a.active')) {
      toggle.classList.add('active');
    }

    function open() {
      dropdowns.forEach(function (other) {
        if (other !== container) closeDropdown(other);
      });
      container.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function close() {
      container.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      /* :focus-within on the container also drives the open visual state (for
         keyboard nav), so if the toggle or a menu link still has focus after
         this click, the CSS would keep showing it as open. Blur to match. */
      if (container.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    }

    container._closeNavMore = close;

    toggle.addEventListener('click', function () {
      if (container.classList.contains('open')) {
        close();
      } else {
        open();
      }
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', close);
    });
  });

  function closeDropdown(container) {
    if (container._closeNavMore) container._closeNavMore();
  }

  document.addEventListener('click', function (event) {
    dropdowns.forEach(function (container) {
      if (!container.contains(event.target)) closeDropdown(container);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      dropdowns.forEach(closeDropdown);
    }
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

  /* ── Drawer flyout: Services / Learn / Company pop out beside the drawer ── */
  const drawerFlyout = document.getElementById('navDrawerFlyout');
  let resetDrawerPanels = function () {};

  if (drawerFlyout) {
    const catButtons = Array.prototype.slice.call(document.querySelectorAll('.nav-drawer-cat'));
    const linkGroups = Array.prototype.slice.call(drawerFlyout.querySelectorAll('.nav-drawer-flyout-links'));
    const flyoutTitle = document.getElementById('navDrawerFlyoutTitle');
    const closeBtn = drawerFlyout.querySelector('.nav-drawer-back');
    const canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    catButtons.forEach(function (btn) {
      const group = document.getElementById(btn.dataset.drawerTarget || '');
      if (group && group.querySelector('a.active')) {
        btn.classList.add('active');
      }
    });

    function openFlyout(targetId, label) {
      linkGroups.forEach(function (group) {
        group.classList.toggle('is-active', group.id === targetId);
      });
      if (flyoutTitle) flyoutTitle.textContent = label;
      drawerFlyout.classList.add('open');
      drawerFlyout.setAttribute('aria-hidden', 'false');
      catButtons.forEach(function (btn) {
        const isTarget = btn.dataset.drawerTarget === targetId;
        btn.setAttribute('aria-expanded', String(isTarget));
        btn.classList.toggle('open', isTarget);
      });
    }

    resetDrawerPanels = function () {
      drawerFlyout.classList.remove('open');
      drawerFlyout.setAttribute('aria-hidden', 'true');
      catButtons.forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.classList.remove('open');
      });
    };

    catButtons.forEach(function (btn) {
      const targetId = btn.dataset.drawerTarget;
      const label = btn.textContent.trim();
      btn.addEventListener('click', function () {
        openFlyout(targetId, label);
      });
      if (canHover) {
        btn.addEventListener('mouseenter', function () {
          openFlyout(targetId, label);
        });
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', resetDrawerPanels);
    }

    /* Flyout should only stay expanded while hovering its own trigger or the
       flyout itself - hovering anything else in the drawer (e.g. "How It
       Works") collapses it. */
    if (canHover) {
      const drawerEl = document.getElementById('navDrawer');
      if (drawerEl) {
        Array.prototype.slice.call(drawerEl.children).forEach(function (child) {
          if (!child.classList.contains('nav-drawer-cat')) {
            child.addEventListener('mouseenter', resetDrawerPanels);
          }
        });
      }
    }
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
    resetDrawerPanels();
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
      threshold: 0,
      rootMargin: '0px 0px -20px 0px'
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
