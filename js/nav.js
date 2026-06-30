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
