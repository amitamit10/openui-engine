(function () {
  'use strict';

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.getElementById('nav-panel');

  function setMenu(open) {
    if (!toggle || !panel) return;
    panel.setAttribute('data-open', open ? 'true' : 'false');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.querySelector('.nav-toggle-label').textContent = open ? 'Close' : 'Menu';
  }

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  // Billing toggle
  var seg = document.querySelectorAll('.seg-btn');
  var amounts = document.querySelectorAll('.price-amount');
  var notes = document.querySelectorAll('.price-note');

  function setBilling(mode) {
    seg.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-billing') === mode ? 'true' : 'false');
    });
    amounts.forEach(function (el) {
      el.textContent = '£' + el.getAttribute('data-' + mode);
    });
    notes.forEach(function (el) {
      el.textContent = el.getAttribute('data-' + mode + '-note').replace(/&pound;/g, '£');
    });
  }

  seg.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBilling(btn.getAttribute('data-billing'));
    });
  });

  // FAQ accordion
  var faqButtons = document.querySelectorAll('.faq-q');
  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var target = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (target) target.hidden = expanded;
    });
  });
})();
