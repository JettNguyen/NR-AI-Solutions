/* ========================================
   Otian AI | Questionnaire Form
   js/questionnaire.js

   Two doors: join the Archie waitlist (short path)
   or the guided-setup intake (full path). The fork
   step decides which sequence of steps runs.
   ======================================== */

(function () {
  'use strict';

  /* ── Step sequences per path ── */
  const PATHS = {
    waitlist: ['step-intent', 'step-waitlist'],
    guided:   ['step-intent', 'step-about', 'step-help', 'step-handson', 'step-comfort', 'step-closing']
  };

  const stepLabels = {
    'step-intent':   'Get Started',
    'step-waitlist': 'Join the Waitlist',
    'step-about':    'About You',
    'step-help':     'What You Want Help With',
    'step-handson':  'How Hands-On',
    'step-comfort':  'Comfort Level',
    'step-closing':  'Closing'
  };

  let activePath = 'guided'; // default until the fork is answered
  let pathPos = 0;

  /* ── Element references ── */
  const steps        = document.querySelectorAll('.form-step');
  const progressFill = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');
  const progressCount = document.getElementById('progressCount');
  const formEl       = document.getElementById('questionnaireForm');
  const thankyou     = document.getElementById('thankyouScreen');
  const progressWrap = document.getElementById('progressWrap');

  function currentStepId() {
    return PATHS[activePath][pathPos];
  }

  /* ── Update progress bar ── */
  function updateProgress() {
    const total = PATHS[activePath].length;
    const pct = Math.round(((pathPos + 1) / total) * 100);
    if (progressFill)  progressFill.style.width = pct + '%';
    if (progressLabel) progressLabel.textContent = stepLabels[currentStepId()] || '';
    if (progressCount) progressCount.textContent = 'Section ' + (pathPos + 1) + ' of ' + total;
  }

  /* ── Show the step at the current path position ── */
  function showStep(pos, skipScroll) {
    pathPos = pos;
    const id = currentStepId();
    steps.forEach(function (step) {
      step.classList.toggle('active', step.id === id);
    });
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

  function scrollToFirstStepError(stepEl) {
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
  function validateStep(stepId) {
    const stepEl = document.getElementById(stepId);
    if (!stepEl) return true;
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

    function requireEmail(id, msg) {
      const el = document.getElementById(id);
      if (!el) return;
      if (!el.value.trim()) {
        showError(el, msg || 'Please enter your email address.');
        valid = false;
      } else if (!isValidEmail(el.value.trim())) {
        showError(el, 'Please enter a valid email address.');
        valid = false;
      }
    }

    function requireChoice(name, errId) {
      if (!document.querySelector('input[name="' + name + '"]:checked')) {
        var errEl = document.getElementById(errId);
        if (errEl) errEl.classList.add('visible');
        valid = false;
      }
    }

    switch (stepId) {
      case 'step-intent':
        requireChoice('intent', 'intentError');
        break;

      case 'step-waitlist':
        requireEmail('waitlistEmail');
        requireChoice('platform', 'platformError');
        break;

      case 'step-about':
        requireInput('fullName', 'Please enter your name.');
        requireEmail('emailAddress');
        requireInput('profession', 'Please tell us your profession or line of work.');
        break;

      case 'step-help':
        requireInput('handOffTask', 'Please describe the task you\'d like to hand off.');
        var checkboxes = document.querySelectorAll('input[name="helpOptions"]');
        var anyChecked = false;
        checkboxes.forEach(function (cb) { if (cb.checked) anyChecked = true; });
        if (!anyChecked) {
          var groupErr = document.getElementById('helpOptionsError');
          if (groupErr) groupErr.classList.add('visible');
          valid = false;
        }
        requireChoice('timeSpent', 'timeSpentError');
        requireChoice('messagingPref', 'messagingPrefError');
        break;

      case 'step-handson':
        requireChoice('taskApproval', 'taskApprovalError');
        requireChoice('urgentNotify', 'urgentNotifyError');
        requireChoice('summaryFreq', 'summaryFreqError');
        break;

      case 'step-comfort':
        requireChoice('techRating', 'techRatingError');
        requireChoice('aiExperience', 'aiExperienceError');
        requireChoice('aiAgentAwareness', 'aiAgentAwarenessError');
        requireChoice('managePref', 'managePrefError');
        break;

      case 'step-closing':
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

  /* ── Fork: intent choice sets the active path ── */
  function selectedIntent() {
    var checked = document.querySelector('input[name="intent"]:checked');
    return checked ? checked.value : null;
  }

  document.querySelectorAll('input[name="intent"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      var intent = selectedIntent();
      if (intent && PATHS[intent]) {
        activePath = intent;
        updateProgress();
      }
    });
  });

  /* ── Next button handler ── */
  document.querySelectorAll('.btn-next').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var stepId = currentStepId();
      if (validateStep(stepId)) {
        if (stepId === 'step-intent') {
          var intent = selectedIntent();
          if (intent && PATHS[intent]) activePath = intent;
        }
        if (pathPos < PATHS[activePath].length - 1) {
          showStep(pathPos + 1);
        }
      } else {
        scrollToFirstStepError(document.getElementById(stepId));
      }
    });
  });

  /* ── Back button handler ── */
  document.querySelectorAll('.btn-back').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (pathPos > 0) {
        showStep(pathPos - 1);
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
    var isWaitlist = selectedIntent() === 'waitlist';
    var guidedBlock   = document.getElementById('thankyouGuided');
    var waitlistBlock = document.getElementById('thankyouWaitlist');
    if (guidedBlock)   guidedBlock.hidden = isWaitlist;
    if (waitlistBlock) waitlistBlock.hidden = !isWaitlist;

    if (!isWaitlist) {
      var fullName  = (document.getElementById('fullName') || {}).value || '';
      var firstName = fullName.trim().split(' ')[0] || 'there';
      var nameEl = document.getElementById('thankyouName');
      if (nameEl) nameEl.textContent = firstName;
    }

    if (formEl)       formEl.style.display = 'none';
    if (progressWrap) progressWrap.style.display = 'none';
    if (thankyou)     thankyou.classList.add('visible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.btn-submit').forEach(function (submitBtn) {
    var idleLabel = submitBtn.textContent;

    submitBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (!validateStep(currentStepId())) {
        scrollToFirstStepError(document.getElementById(currentStepId()));
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

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
        submitBtn.textContent = idleLabel;
        alert('Something went wrong. Please try again or email us at questions@otianai.com');
      });
    });
  });

  /* ── Init ── */
  showStep(0, true);
})();
