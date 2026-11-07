(function () {
  'use strict';

  /* ---------- Decorative metric visuals (generated from data attributes) ---------- */
  document.querySelectorAll('[data-dots]').forEach(function (el) {
    var total = Number(el.getAttribute('data-dots'));
    var lit = Number(el.getAttribute('data-lit'));
    for (var i = 0; i < total; i++) {
      var dot = document.createElement('span');
      if (i < lit) dot.className = 'on';
      el.appendChild(dot);
    }
  });

  document.querySelectorAll('[data-days]').forEach(function (el) {
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(function (letter) {
      var day = document.createElement('span');
      day.textContent = letter;
      el.appendChild(day);
    });
  });

  document.querySelectorAll('[data-hours]').forEach(function (el) {
    for (var h = 0; h < 24; h++) {
      var hour = document.createElement('span');
      if (h >= 7 && h < 23) hour.className = 'on';
      el.appendChild(hour);
    }
  });

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.getElementById('site-menu');
  var toggleLabel = toggle ? toggle.querySelector('.nav-toggle-label') : null;

  function setMenu(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    if (toggleLabel) toggleLabel.textContent = open ? 'Close' : 'Menu';
  }

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    panel.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (toggle.getAttribute('aria-expanded') === 'true' &&
          !panel.contains(event.target) && !toggle.contains(event.target)) {
        setMenu(false);
      }
    });
  }

  /* ---------- Monthly / annual pricing toggle ---------- */
  var billingButtons = document.querySelectorAll('[data-billing]');
  var priceEls = document.querySelectorAll('[data-monthly][data-annual]');
  var noteEls = document.querySelectorAll('[data-monthly-note]');
  var status = document.getElementById('billing-status');

  function formatPound(value) {
    return '£' + Number(value).toLocaleString('en-GB');
  }

  function setBilling(mode) {
    billingButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-billing') === mode));
    });
    priceEls.forEach(function (el) {
      el.textContent = formatPound(el.getAttribute('data-' + mode));
    });
    noteEls.forEach(function (el) {
      el.textContent = el.getAttribute('data-' + mode + '-note') || '';
    });
    if (status) {
      status.textContent = mode === 'annual'
        ? 'Showing annual prices, billed up front. Prices are per month.'
        : 'Showing monthly prices. Rolling, with 30 days notice.';
    }
  }

  billingButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBilling(btn.getAttribute('data-billing'));
    });
  });

  /* ---------- FAQ accordion ---------- */
  var faqButtons = document.querySelectorAll('.faq-btn');

  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panelEl = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      if (panelEl) panelEl.hidden = expanded;
    });
  });
})();
