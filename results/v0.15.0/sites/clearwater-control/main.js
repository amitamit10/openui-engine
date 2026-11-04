(function () {
  'use strict';

  // Mobile menu
  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  var wide = window.matchMedia('(min-width: 900px)');
  var onWide = function (e) { if (e.matches) setMenu(false); };
  if (wide.addEventListener) wide.addEventListener('change', onWide);
  else wide.addListener(onWide);

  // Monthly / one-off pricing toggle
  var billingButtons = document.querySelectorAll('[data-billing]');
  var amounts = document.querySelectorAll('.amount[data-monthly]');
  var periods = document.querySelectorAll('[data-period]');
  var status = document.getElementById('price-status');

  function setBilling(mode) {
    billingButtons.forEach(function (btn) {
      var on = btn.getAttribute('data-billing') === mode;
      btn.setAttribute('aria-pressed', String(on));
    });
    amounts.forEach(function (el) {
      el.textContent = '£' + el.getAttribute('data-' + mode);
    });
    periods.forEach(function (el) {
      el.textContent = mode === 'monthly' ? 'a month' : 'one-off gift';
    });
    status.textContent = mode === 'monthly'
      ? 'Showing monthly prices.'
      : 'Showing one-off gift prices.';
  }

  billingButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBilling(btn.getAttribute('data-billing'));
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });
})();
