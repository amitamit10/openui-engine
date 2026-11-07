(function () {
  'use strict';

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  var mobileQuery = window.matchMedia('(max-width: 899.98px)');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle-label').textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && mobileQuery.matches) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    mobileQuery.addEventListener('change', function () {
      if (!mobileQuery.matches) setMenu(false);
    });
  }

  // Monthly / annual pricing toggle
  var buttons = document.querySelectorAll('.billing-option');
  var amounts = document.querySelectorAll('.amount[data-monthly]');
  var billed = document.querySelectorAll('.billed[data-monthly-text]');

  function setBilling(mode) {
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.billing === mode));
    });
    amounts.forEach(function (el) {
      el.textContent = mode === 'annual' ? el.dataset.annual : el.dataset.monthly;
    });
    billed.forEach(function (el) {
      el.textContent = mode === 'annual' ? el.dataset.annualText : el.dataset.monthlyText;
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { setBilling(b.dataset.billing); });
  });

  // FAQ accordion
  document.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var open = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(open));
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) panel.hidden = !open;
    });
  });
})();
