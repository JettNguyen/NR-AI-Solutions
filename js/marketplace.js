/* ========================================
   Otian AI | Product Marketplace
   js/marketplace.js
   ======================================== */

(function () {
  'use strict';

  /* ── Product filtering ── */
  var typeTabs    = document.getElementById('mpTypeTabs');
  var filterBar   = document.getElementById('marketplaceFilterBar');
  var searchInput = document.getElementById('marketplaceSearchInput');
  var priceToggle = document.getElementById('mpPriceToggle');
  var grid        = document.getElementById('mpProductGrid');
  var emptyState  = document.getElementById('marketplaceFilterEmpty');

  if (grid) {
    var typeButtons  = typeTabs    ? Array.prototype.slice.call(typeTabs.querySelectorAll('.mp-type-tab'))            : [];
    var filterPills  = filterBar   ? Array.prototype.slice.call(filterBar.querySelectorAll('.marketplace-filter-pill')) : [];
    var priceButtons = priceToggle ? Array.prototype.slice.call(priceToggle.querySelectorAll('.mp-price-btn'))        : [];
    var cards        = Array.prototype.slice.call(grid.querySelectorAll('.mp-product-card'));

    var activeType     = 'all';
    var activeCategory = 'all';
    var activePrice    = 'all';

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var matchType     = activeType     === 'all' || card.dataset.type     === activeType;
        var matchCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
        var matchPrice    = activePrice    === 'all' || card.dataset.price    === activePrice;
        var matchSearch   = !query
          || card.dataset.name.indexOf(query) !== -1
          || card.dataset.desc.indexOf(query) !== -1;

        var match = matchType && matchCategory && matchPrice && matchSearch;
        card.hidden = !match;
        if (match) visibleCount++;
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    /* Type tab click */
    if (typeTabs) {
      typeTabs.addEventListener('click', function (e) {
        var tab = e.target.closest('.mp-type-tab');
        if (!tab) return;
        typeButtons.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        activeType = tab.dataset.type;
        applyFilters();
      });
    }

    /* Category filter click */
    if (filterBar) {
      filterBar.addEventListener('click', function (e) {
        var pill = e.target.closest('.marketplace-filter-pill');
        if (!pill) return;
        filterPills.forEach(function (p) { p.classList.remove('is-active'); });
        pill.classList.add('is-active');
        activeCategory = pill.dataset.filter;
        applyFilters();
      });
    }

    /* Price toggle click */
    if (priceToggle) {
      priceToggle.addEventListener('click', function (e) {
        var btn = e.target.closest('.mp-price-btn');
        if (!btn) return;
        priceButtons.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        activePrice = btn.dataset.price;
        applyFilters();
      });
    }

    /* Search input */
    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
  }

  /* ── Waitlist form ── */
  var form         = document.getElementById('marketplaceWaitlistForm');
  var confirmation = document.getElementById('marketplaceConfirmationMessage');

  if (!form) return;

  /* Error helpers */
  function showError(input, msg) {
    input.classList.add('field-error');
    var errEl = input.parentElement.querySelector('.form-error-msg');
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.add('visible');
    }
  }

  function clearError(input) {
    input.classList.remove('field-error');
    var errEl = input.parentElement.querySelector('.form-error-msg');
    if (errEl) errEl.classList.remove('visible');
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  /* Clear errors on input */
  form.querySelectorAll('.form-input').forEach(function (el) {
    el.addEventListener('input', function () { clearError(el); });
    el.addEventListener('change', function () { clearError(el); });
  });

  /* Submit */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var nameEl     = document.getElementById('waitlistName');
    var emailEl    = document.getElementById('waitlistEmail');
    var interestEl = document.getElementById('waitlistInterest');
    var valid      = true;

    if (nameEl && !nameEl.value.trim()) {
      showError(nameEl, 'Please enter your name.');
      valid = false;
    }

    if (emailEl) {
      if (!emailEl.value.trim()) {
        showError(emailEl, 'Please enter your email address.');
        valid = false;
      } else if (!isValidEmail(emailEl.value.trim())) {
        showError(emailEl, 'Please enter a valid email address.');
        valid = false;
      }
    }

    if (interestEl && !interestEl.value) {
      showError(interestEl, 'Please choose an option.');
      valid = false;
    }

    if (!valid) return;

    /* Show confirmation inline */
    form.style.display = 'none';
    if (confirmation) {
      confirmation.classList.add('visible');
    }
  });
})();
