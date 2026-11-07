(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var menuBtn = document.querySelector('.menu-toggle');
  var navLinks = document.getElementById('nav-links');

  // Decorative waveforms (hero tracker). Deterministic so the page looks the same on every load.
  document.querySelectorAll('.wave[data-wave]').forEach(function (el) {
    var count = parseInt(el.getAttribute('data-wave'), 10) || 48;
    var played = parseInt(el.getAttribute('data-played'), 10) || 0;
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var envelope = 0.45 + 0.55 * Math.abs(Math.sin(i / 6.5));
      var h = Math.round((18 + envelope * 62 * (0.35 + 0.65 * rnd())));
      var bar = document.createElement('span');
      bar.style.setProperty('--h', h + '%');
      if (i < played) bar.className = 'played';
      frag.appendChild(bar);
    }
    el.appendChild(frag);
  });

  // Mobile menu
  function setMenu(open) {
    if (!header || !menuBtn) return;
    header.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var label = menuBtn.querySelector('.menu-toggle-label');
    if (label) label.textContent = open ? 'Close' : 'Menu';
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(!header.classList.contains('is-open'));
    });
  }
  if (navLinks) {
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header && header.classList.contains('is-open')) {
      setMenu(false);
      if (menuBtn) menuBtn.focus();
    }
  });
  // Close the menu when the viewport grows to the desktop layout.
  var desktop = window.matchMedia('(min-width: 900px)');
  function onDesktop(mq) { if (mq.matches) setMenu(false); }
  if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
  else if (desktop.addListener) desktop.addListener(onDesktop);

  // Billing toggle: per episode / per season
  var billingButtons = document.querySelectorAll('.billing-option');
  var status = document.querySelector('.billing-status');

  function setBilling(mode) {
    billingButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-billing') === mode ? 'true' : 'false');
    });
    document.querySelectorAll('.price').forEach(function (price) {
      price.classList.add('is-swapping');
    });
    window.setTimeout(function () {
      document.querySelectorAll('.price-amount').forEach(function (el) {
        el.innerHTML = el.getAttribute('data-' + mode);
      });
      document.querySelectorAll('.price-unit').forEach(function (el) {
        el.textContent = el.getAttribute('data-' + mode);
      });
      document.querySelectorAll('.price').forEach(function (price) {
        price.classList.remove('is-swapping');
      });
      if (status) {
        status.textContent = mode === 'season'
          ? 'Showing prices per season of eight episodes.'
          : 'Showing prices per episode.';
      }
    }, 180);
  }

  billingButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBilling(btn.getAttribute('data-billing'));
    });
  });

  // FAQ accordion
  document.querySelectorAll('.acc-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (panel) panel.hidden = expanded;
    });
  });
})();
