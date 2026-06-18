/* ========================================
   N&R AI Solutions | Questionnaire Form
   js/questionnaire.js
   ======================================== */

(function () {
  'use strict';

  const TOTAL_STEPS = 7;

  const stepLabels = [
    'Introduction',
    'Welcome',
    'About You',
    'What You Want Help With',
    'How Hands-On',
    'Comfort Level',
    'Closing'
  ];

  let currentStep = 0;

  /* ── Element references ── */
  const steps        = document.querySelectorAll('.form-step');
  const progressFill = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');
  const progressCount = document.getElementById('progressCount');
  const formEl       = document.getElementById('questionnaireForm');
  const thankyou     = document.getElementById('thankyouScreen');
  const progressWrap = document.getElementById('progressWrap');

  /* ── Update progress bar ── */
  function updateProgress() {
    const pct = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);
    if (progressFill)  progressFill.style.width = pct + '%';
    if (progressLabel) progressLabel.textContent = stepLabels[currentStep];
    if (progressCount) progressCount.textContent = 'Section ' + (currentStep + 1) + ' of ' + TOTAL_STEPS;
  }

  /* ── Show a specific step ── */
  function showStep(index, skipScroll) {
    steps.forEach(function (step, i) {
      step.classList.toggle('active', i === index);
    });
    currentStep = index;
    updateProgress();

    if (!skipScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /* ── Validation helpers ── */
  function showError(input, msg) {
    input.classList.add('field-error');
    const errEl = input.parentElement.querySelector('.form-error-msg');
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.add('visible');
    }
  }

  function clearError(input) {
    input.classList.remove('field-error');
    const errEl = input.parentElement.querySelector('.form-error-msg');
    if (errEl) errEl.classList.remove('visible');
  }

  function clearAllErrors(stepEl) {
    stepEl.querySelectorAll('.field-error').forEach(function (el) {
      el.classList.remove('field-error');
    });
    stepEl.querySelectorAll('.form-error-msg.visible').forEach(function (el) {
      el.classList.remove('visible');
    });
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function scrollToFirstStepError(stepIndex) {
    var stepEl = steps[stepIndex];
    if (!stepEl) return;

    var firstFieldError = stepEl.querySelector('.field-error');
    var firstVisibleError = stepEl.querySelector('.form-error-msg.visible');
    var target = null;

    if (firstFieldError) {
      target = firstFieldError.closest('.form-group') || firstFieldError;
    } else if (firstVisibleError) {
      target = firstVisibleError.closest('.form-group') || firstVisibleError;
    }

    if (!target) return;

    document.querySelectorAll('.form-group.error-flash').forEach(function (el) {
      el.classList.remove('error-flash');
    });
    target.classList.add('error-flash');
    window.setTimeout(function () {
      target.classList.remove('error-flash');
    }, 1400);

    var navEl = document.getElementById('nav');
    var progressEl = document.getElementById('progressWrap');
    var navOffset = navEl ? navEl.offsetHeight : 0;
    var progressOffset = (progressEl && progressEl.offsetParent !== null) ? progressEl.offsetHeight : 0;
    var extraOffset = 18;
    var y = target.getBoundingClientRect().top + window.pageYOffset - navOffset - progressOffset - extraOffset;

    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });

    var focusTarget = firstFieldError || target.querySelector('input, textarea, select');
    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus({ preventScroll: true });
    }
  }

  /* ── Validate the current step ── */
  function validateStep(stepIndex) {
    const stepEl = steps[stepIndex];
    clearAllErrors(stepEl);
    let valid = true;

    function requireInput(id, msg) {
      const el = document.getElementById(id);
      if (!el) return;
      if (!el.value.trim()) {
        showError(el, msg || 'This field is required.');
        valid = false;
      }
    }

    switch (stepIndex) {
      case 0: /* Introduction, no required fields */
      case 1: /* Welcome, no required fields */
        break;

      case 2: /* About You */
        requireInput('fullName', 'Please enter your name.');
        var emailEl = document.getElementById('emailAddress');
        if (emailEl) {
          if (!emailEl.value.trim()) {
            showError(emailEl, 'Please enter your email address.');
            valid = false;
          } else if (!isValidEmail(emailEl.value.trim())) {
            showError(emailEl, 'Please enter a valid email address.');
            valid = false;
          }
        }
        requireInput('profession', 'Please tell us your profession or line of work.');
        break;

      case 3: /* What You Want Help With */
        requireInput('handOffTask', 'Please describe the task you\'d like to hand off.');
        var checkboxes = document.querySelectorAll('input[name="helpOptions"]');
        var anyChecked = false;
        checkboxes.forEach(function (cb) { if (cb.checked) anyChecked = true; });
        if (!anyChecked) {
          var groupErr = document.getElementById('helpOptionsError');
          if (groupErr) groupErr.classList.add('visible');
          valid = false;
        }
        if (!document.querySelector('input[name="timeSpent"]:checked')) {
          var timeErr = document.getElementById('timeSpentError');
          if (timeErr) timeErr.classList.add('visible');
          valid = false;
        }
        if (!document.querySelector('input[name="messagingPref"]:checked')) {
          var msgErr = document.getElementById('messagingPrefError');
          if (msgErr) msgErr.classList.add('visible');
          valid = false;
        }
        break;

      case 4: /* How Hands-On */
        if (!document.querySelector('input[name="taskApproval"]:checked')) {
          var taErr = document.getElementById('taskApprovalError');
          if (taErr) taErr.classList.add('visible');
          valid = false;
        }
        if (!document.querySelector('input[name="urgentNotify"]:checked')) {
          var unErr = document.getElementById('urgentNotifyError');
          if (unErr) unErr.classList.add('visible');
          valid = false;
        }
        if (!document.querySelector('input[name="summaryFreq"]:checked')) {
          var sfErr = document.getElementById('summaryFreqError');
          if (sfErr) sfErr.classList.add('visible');
          valid = false;
        }
        break;

      case 5: /* Comfort Level */
        if (!document.querySelector('input[name="techRating"]:checked')) {
          var trErr = document.getElementById('techRatingError');
          if (trErr) trErr.classList.add('visible');
          valid = false;
        }
        if (!document.querySelector('input[name="aiExperience"]:checked')) {
          var aeErr = document.getElementById('aiExperienceError');
          if (aeErr) aeErr.classList.add('visible');
          valid = false;
        }
        if (!document.querySelector('input[name="aiAgentAwareness"]:checked')) {
          var aaaErr = document.getElementById('aiAgentAwarenessError');
          if (aaaErr) aaaErr.classList.add('visible');
          valid = false;
        }
        if (!document.querySelector('input[name="managePref"]:checked')) {
          var mpErr = document.getElementById('managePrefError');
          if (mpErr) mpErr.classList.add('visible');
          valid = false;
        }
        break;

      case 6: /* Closing */
        var aiCBs = document.querySelectorAll('input[name="aiTools"]');
        var aiAny = false;
        aiCBs.forEach(function (cb) { if (cb.checked) aiAny = true; });
        if (!aiAny) {
          var aiErr = document.getElementById('aiToolsError');
          if (aiErr) aiErr.classList.add('visible');
          valid = false;
        }
        break;
    }

    return valid;
  }

  /* ── Next button handler ── */
  document.querySelectorAll('.btn-next').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (validateStep(currentStep)) {
        if (currentStep < TOTAL_STEPS - 1) {
          showStep(currentStep + 1);
        }
      } else {
        scrollToFirstStepError(currentStep);
      }
    });
  });

  /* ── Back button handler ── */
  document.querySelectorAll('.btn-back').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (currentStep > 0) {
        showStep(currentStep - 1);
      }
    });
  });

  /* ── Clear errors on input ── */
  document.querySelectorAll('.form-input, .form-textarea').forEach(function (el) {
    el.addEventListener('input', function () {
      clearError(el);
    });
  });

  /* ── helpOptions: max 3 selections ── */
  function updateHelpOptionsState() {
    var checked = document.querySelectorAll('input[name="helpOptions"]:checked');
    var allCBs  = document.querySelectorAll('input[name="helpOptions"]');
    var atMax   = checked.length >= 3;
    allCBs.forEach(function (cb) {
      if (!cb.checked) {
        cb.disabled = atMax;
        var opt = cb.closest('.checkbox-option');
        if (opt) opt.style.opacity = atMax ? '0.4' : '';
      }
    });
  }

  document.querySelectorAll('input[name="helpOptions"]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      updateHelpOptionsState();
    });
  });

  /* ── helpOptions "Other:" checkbox reveals text input ── */
  var helpOtherCB   = document.getElementById('helpOther');
  var helpOtherField = document.getElementById('somethingElseField');
  if (helpOtherCB && helpOtherField) {
    helpOtherCB.addEventListener('change', function () {
      helpOtherField.classList.toggle('visible', helpOtherCB.checked);
    });
  }

  /* ── summaryFreq "Other:" radio reveals text input ── */
  var summaryRadios     = document.querySelectorAll('input[name="summaryFreq"]');
  var summaryOtherField = document.getElementById('summaryOtherField');
  summaryRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      var val = document.querySelector('input[name="summaryFreq"]:checked');
      if (summaryOtherField) {
        summaryOtherField.classList.toggle('visible', val && val.value === 'other');
      }
    });
  });

  /* ── aiTools "Other:" checkbox reveals text input ── */
  var aiToolsOtherCB    = document.getElementById('aiToolsOther');
  var aiToolsOtherField = document.getElementById('aiToolsOtherField');
  if (aiToolsOtherCB && aiToolsOtherField) {
    aiToolsOtherCB.addEventListener('change', function () {
      aiToolsOtherField.classList.toggle('visible', aiToolsOtherCB.checked);
    });
  }

  /* ── Submit handler ── */
  var FORMSPREE_ID = 'mgobddpy'; // ← replace with your 8-char Formspree ID

  function showThankyou() {
    var fullName  = (document.getElementById('fullName') || {}).value || '';
    var firstName = fullName.trim().split(' ')[0] || 'there';
    if (formEl)       formEl.style.display = 'none';
    if (progressWrap) progressWrap.style.display = 'none';
    if (thankyou) {
      thankyou.classList.add('visible');
      var nameEl = document.getElementById('thankyouName');
      if (nameEl) nameEl.textContent = firstName;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  var submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (!validateStep(currentStep)) {
        scrollToFirstStepError(currentStep);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending\u2026';

      fetch('https://formspree.io/f/' + FORMSPREE_ID, {
        method: 'POST',
        body: new FormData(formEl),
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        if (res.ok) {
          showThankyou();
        } else {
          return res.json().then(function (json) {
            throw new Error(json.errors ? json.errors.map(function(e){return e.message;}).join(', ') : 'Submission failed');
          });
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
        alert('Something went wrong. Please try again or email us at questions@nrsolveai.com');
      });
    });
  }

  /* ── Init ── */
  showStep(0, true);
})();
