(function () {
  'use strict';

  /* Decorative waveforms in the hero session sheet. Deterministic per seed. */
  function seeded(seed) {
    var s = seed * 9301 + 49297;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }
  document.querySelectorAll('svg.wave').forEach(function (svg) {
    var seed = Number(svg.getAttribute('data-seed')) || 1;
    var rand = seeded(seed);
    var n = 100;
    var step = 600 / n;
    var d = '';
    for (var i = 0; i < n; i++) {
      var env = 0.35 + 0.65 * Math.abs(Math.sin((i / n) * Math.PI * (2 + (seed % 3))));
      var amp = Math.max(0.08, env * rand());
      var h = Math.max(2, amp * 52);
      var x = i * step + step / 2;
      d += 'M' + x.toFixed(1) + ' ' + (28 - h / 2).toFixed(1) + 'V' + (28 + h / 2).toFixed(1);
    }
    svg.innerHTML = '<path class="wave-path" d="' + d + '"></path>';
  });

  /* Mobile menu */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  var desktopQuery = window.matchMedia('(min-width: 900px)');

  function setMenu(open, returnFocus) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    } else if (returnFocus) {
      toggle.focus();
    }
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true', false);
  });

  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false, false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false, true);
    }
  });

  document.addEventListener('click', function (e) {
    if (toggle.getAttribute('aria-expanded') === 'true' &&
        !menu.contains(e.target) && !toggle.contains(e.target)) {
      setMenu(false, false);
    }
  });

  function onBreakpoint() {
    if (desktopQuery.matches && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false, false);
    }
  }
  if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', onBreakpoint);
  else desktopQuery.addListener(onBreakpoint);

  /* FAQ accordion */
  document.querySelectorAll('.acc-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open;
    });
  });

  /* Pricing: per episode / per season */
  var billingButtons = document.querySelectorAll('[data-billing]');
  var status = document.getElementById('billing-status');
  var tiers = document.querySelectorAll('.tier');

  var currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });

  function setBilling(mode) {
    billingButtons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-billing') === mode));
    });
    tiers.forEach(function (tier) {
      var amount = tier.querySelector('.amount');
      var unit = tier.querySelector('.unit');
      var value = mode === 'season' ? tier.getAttribute('data-season') : tier.getAttribute('data-episode');
      amount.textContent = currency.format(Number(value));
      unit.textContent = mode === 'season' ? 'per season of 8' : 'per episode';
      tier.querySelectorAll('.note').forEach(function (note) {
        note.hidden = note.getAttribute('data-when') !== mode;
      });
    });
    status.textContent = mode === 'season'
      ? 'Showing prices per season of eight episodes.'
      : 'Showing prices per episode.';
  }

  billingButtons.forEach(function (b) {
    b.addEventListener('click', function () {
      setBilling(b.getAttribute('data-billing'));
    });
  });
  setBilling('episode');
})();
