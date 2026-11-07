/* Brightwater Solar | interactions: mobile menu, pricing toggle, FAQ accordion */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    var label = toggle.querySelector('.menu-label');
    if (label) label.textContent = open ? 'Close' : 'Menu';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
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
          !nav.contains(event.target) && !toggle.contains(event.target)) {
        setMenu(false);
      }
    });

    var desktop = window.matchMedia('(min-width: 900px)');
    var onDesktop = function (e) { if (e.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
    else if (desktop.addListener) desktop.addListener(onDesktop);
  }

  /* ---------- Pricing: pay upfront / finance ---------- */
  var modeButtons = document.querySelectorAll('.toggle-btn[data-mode]');
  var amounts = document.querySelectorAll('.price-amount');
  var units = document.querySelectorAll('.price-unit');
  var note = document.getElementById('mode-note');

  var notes = {
    upfront: 'Showing one-off prices, fully installed.',
    finance: 'Showing monthly payments over 120 months at 0% interest, subject to status.'
  };

  function setMode(mode) {
    modeButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode));
    });
    amounts.forEach(function (el) {
      if (el.dataset[mode]) el.textContent = el.dataset[mode];
    });
    units.forEach(function (el) {
      var key = mode + 'Unit';
      if (el.dataset[key]) el.textContent = el.dataset[key];
    });
    if (note) note.textContent = notes[mode];
  }

  modeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { setMode(btn.dataset.mode); });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (panel) panel.hidden = isOpen;
    });
  });
})();
