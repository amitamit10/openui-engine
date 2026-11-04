(function () {
  'use strict';

  // ---------- Mobile navigation ----------
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var navLinks = document.getElementById('nav-links');
  var mqDesktop = window.matchMedia('(min-width: 900px)');

  function setNavOpen(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
  }

  toggle.addEventListener('click', function () {
    setNavOpen(!header.classList.contains('is-open'));
  });

  navLinks.addEventListener('click', function (event) {
    if (event.target.closest('a')) setNavOpen(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && header.classList.contains('is-open')) {
      setNavOpen(false);
      toggle.focus();
    }
  });

  function onBreakpoint(event) {
    if (event.matches) setNavOpen(false);
  }
  if (mqDesktop.addEventListener) mqDesktop.addEventListener('change', onBreakpoint);
  else mqDesktop.addListener(onBreakpoint);

  // ---------- Price toggle: per person / per table of four ----------
  var segmented = document.querySelector('.segmented');
  var status = document.getElementById('price-status');
  var modeButtons = segmented.querySelectorAll('button[data-mode]');
  var priceEls = document.querySelectorAll('.price[data-pp]');
  var unitEls = document.querySelectorAll('.unit[data-pp-unit]');

  function setPriceMode(mode) {
    var key = mode === 'table' ? 'table' : 'pp';
    modeButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-mode') === mode));
    });
    priceEls.forEach(function (el) {
      el.textContent = el.getAttribute('data-' + key);
    });
    unitEls.forEach(function (el) {
      el.textContent = el.getAttribute('data-' + key + '-unit');
    });
    status.textContent = mode === 'table'
      ? 'Showing prices for a table of four. The private room shows its hire fee.'
      : 'Showing prices per person.';
  }

  modeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setPriceMode(btn.getAttribute('data-mode'));
    });
  });

  // ---------- FAQ accordion ----------
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });
})();
