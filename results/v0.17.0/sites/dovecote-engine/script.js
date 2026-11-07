/* Dovecote Studios — progressive enhancements.
   Every control works with the markup alone for navigation; JS adds the menu,
   billing switch, accordion, form checks and light reveal animation. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.getElementById('primary-nav');
  var toggleLabel = toggle && toggle.querySelector('.menu-toggle-label');

  function setMenu(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    if (toggleLabel) toggleLabel.textContent = open ? 'Close' : 'Menu';
  }

  function isMobile() {
    return window.matchMedia('(max-width: 959px)').matches;
  }

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close the mobile menu after choosing a link, and on Escape.
    panel.addEventListener('click', function (event) {
      if (event.target.closest('a') && isMobile()) setMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    // Reset state when the viewport grows to the desktop layout.
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (event) {
      if (event.matches) setMenu(false);
    });
  }

  /* ---------- Monthly / annual pricing ---------- */
  var billing = document.getElementById('billing-toggle');
  var billingStatus = document.getElementById('billing-status');
  var priceNodes = document.querySelectorAll('.price-amount[data-monthly]');
  var noteNodes = document.querySelectorAll('.price-note[data-monthly-note]');

  function formatPrice(value) {
    return '£' + value.toLocaleString('en-GB');
  }

  function setBilling(annual) {
    priceNodes.forEach(function (node) {
      node.textContent = formatPrice(Number(annual ? node.dataset.annual : node.dataset.monthly));
    });
    noteNodes.forEach(function (node) {
      var text = annual ? node.dataset.annualNote : node.dataset.monthlyNote;
      node.textContent = text.replace(/&pound;/g, '£');
    });
    if (billing) {
      billing.checked = annual;
      billing.setAttribute('aria-checked', String(annual));
    }
    if (billingStatus) {
      billingStatus.textContent = annual
        ? 'Showing annual prices, billed yearly. Each space is 15% lower per month.'
        : 'Showing monthly prices.';
    }
  }

  if (billing) {
    billing.addEventListener('change', function () {
      setBilling(billing.checked);
    });
    setBilling(billing.checked);
  }

  /* ---------- FAQ accordion ---------- */
  var faqButtons = document.querySelectorAll('.faq-button');
  faqButtons.forEach(function (button, index) {
    var panelId = button.getAttribute('aria-controls');
    var target = panelId && document.getElementById(panelId);
    if (!target) return;
    if (!button.id) button.id = panelId + '-btn';
    target.setAttribute('aria-labelledby', button.id);

    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      target.hidden = expanded;
    });
    // Keep the index for debugging hooks without changing behaviour.
    button.dataset.index = String(index + 1);
  });

  /* ---------- Forms ---------- */
  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function setError(input, errorEl, message) {
    var invalid = Boolean(message);
    input.setAttribute('aria-invalid', String(invalid));
    if (errorEl) {
      errorEl.hidden = !invalid;
      if (invalid) errorEl.textContent = message;
    }
    return !invalid;
  }

  var tourForm = document.getElementById('tour-form');
  if (tourForm) {
    var nameInput = document.getElementById('tour-name');
    var emailInput = document.getElementById('tour-email');
    var spaceInput = document.getElementById('tour-space');
    var tourStatus = document.getElementById('tour-status');

    tourForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var okName = setError(nameInput, document.getElementById('tour-name-error'),
        nameInput.value.trim() ? '' : 'Please tell us your name.');
      var okEmail = setError(emailInput, document.getElementById('tour-email-error'),
        isEmail(emailInput.value) ? '' : 'Please enter an email address we can reply to.');

      if (!okName || !okEmail) {
        tourStatus.classList.add('is-error');
        tourStatus.textContent = 'Please fix the highlighted fields.';
        (okName ? emailInput : nameInput).focus();
        return;
      }

      var first = nameInput.value.trim().split(/\s+/)[0];
      var spaceLabel = spaceInput.options[spaceInput.selectedIndex].text;
      tourStatus.classList.remove('is-error');
      var forWhat = spaceInput.value === 'not-sure' ? '' : ' for ' + spaceLabel.toLowerCase();
      tourStatus.textContent = 'Thanks, ' + first + '. Your tour request' + forWhat +
        ' is in. We will reply to ' + emailInput.value.trim() + ' within one working day.';
      tourForm.reset();
      nameInput.setAttribute('aria-invalid', 'false');
      emailInput.setAttribute('aria-invalid', 'false');
    });
  }

  var signinForm = document.getElementById('signin-form');
  if (signinForm) {
    var signinEmail = document.getElementById('signin-email');
    var signinStatus = document.getElementById('signin-status');
    signinForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!isEmail(signinEmail.value)) {
        signinStatus.classList.add('is-error');
        signinStatus.textContent = 'Enter the email address on your membership.';
        signinEmail.focus();
        return;
      }
      signinStatus.classList.remove('is-error');
      signinStatus.textContent = 'If that address holds a membership, a sign-in link is on its way.';
      signinForm.reset();
    });
  }

  /* ---------- Reveal on scroll (skipped for reduced motion) ---------- */
  var revealTargets = document.querySelectorAll('.feature, .step, .quote, .tier, .metric, .faq-item');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    revealTargets.forEach(function (el) { el.classList.add('reveal'); });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealTargets.forEach(function (el) { observer.observe(el); });
  }
})();
