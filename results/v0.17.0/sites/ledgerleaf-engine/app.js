(function () {
  'use strict';

  // Mobile menu
  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('primary-nav');
  var toggleLabel = toggle && toggle.querySelector('.menu-toggle-label');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (toggleLabel) toggleLabel.textContent = open ? 'Close' : 'Menu';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  // Monthly / annual billing toggle
  var billingButtons = document.querySelectorAll('[data-billing]');
  var amounts = document.querySelectorAll('.amount[data-monthly]');
  var notes = document.querySelectorAll('.billing-note[data-monthly-text]');

  function setBilling(mode) {
    billingButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-billing') === mode));
    });
    amounts.forEach(function (el) {
      el.textContent = mode === 'annual' ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
    });
    notes.forEach(function (el) {
      el.textContent = mode === 'annual' ? el.getAttribute('data-annual-text') : el.getAttribute('data-monthly-text');
    });
    var perLabels = document.querySelectorAll('.price .per');
    perLabels.forEach(function (el) {
      el.textContent = mode === 'annual' ? '/ month, billed yearly' : '/ month';
    });
  }

  billingButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBilling(btn.getAttribute('data-billing'));
    });
  });

  // FAQ accordion
  var triggers = document.querySelectorAll('.acc-trigger');
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });
})();
