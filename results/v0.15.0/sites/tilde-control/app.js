(function () {
  'use strict';

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.getElementById('nav-panel');
  var desktop = window.matchMedia('(min-width: 1040px)');

  function setMenu(open) {
    panel.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', function () {
    setMenu(!panel.classList.contains('is-open'));
  });

  panel.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  desktop.addEventListener('change', function () {
    setMenu(false);
  });

  // Billing toggle
  var seg = document.querySelectorAll('[data-billing]');
  var status = document.getElementById('billing-status');

  seg.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-billing');
      seg.forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-pressed', String(on));
        b.classList.toggle('is-on', on);
      });
      document.querySelectorAll('.amount').forEach(function (el) {
        el.textContent = '£' + el.getAttribute('data-' + mode);
      });
      document.querySelectorAll('.per').forEach(function (el) {
        el.textContent = mode === 'term' ? 'per term' : 'per month';
      });
      status.textContent = mode === 'term'
        ? 'Showing prices billed per term'
        : 'Showing prices billed monthly';
    });
  });

  // FAQ accordion
  document.querySelectorAll('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var target = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!open));
      target.hidden = open;
    });
  });
})();
