(function () {
  'use strict';

  /* ---- Mobile navigation ------------------------------------------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    toggle.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 880) setMenu(false);
    });
  }

  /* ---- Monthly / yearly pricing toggle ----------------------------- */
  var billingButtons = document.querySelectorAll('[data-billing]');
  var amounts = document.querySelectorAll('.amount[data-monthly]');
  var notes = document.querySelectorAll('.billing-note[data-note-monthly]');
  var status = document.getElementById('billing-status');

  function setBilling(mode) {
    billingButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-billing') === mode));
    });
    amounts.forEach(function (el) {
      el.textContent = mode === 'yearly' ? el.getAttribute('data-yearly') : el.getAttribute('data-monthly');
    });
    notes.forEach(function (el) {
      el.textContent = mode === 'yearly' ? el.getAttribute('data-note-yearly') : el.getAttribute('data-note-monthly');
    });
    if (status) {
      status.textContent = 'Showing ' + (mode === 'yearly' ? 'yearly' : 'monthly') + ' prices.';
    }
  }

  billingButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBilling(btn.getAttribute('data-billing'));
    });
  });

  /* ---- FAQ accordion ------------------------------------------------ */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });
})();
