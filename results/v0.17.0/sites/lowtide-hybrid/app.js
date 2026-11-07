(function () {
  'use strict';

  /* Decorative waveforms: deterministic bars so every load looks the same. */
  function bars(seed) {
    var out = [];
    for (var i = 0; i < 72; i++) {
      var x = Math.sin(seed * 999 + i * 12.9898) * 43758.5453;
      var r = x - Math.floor(x);
      var env = 0.4 + 0.6 * Math.abs(Math.sin(i / 9 + seed));
      var h = Math.max(8, Math.round((0.15 + 0.85 * r) * env * 100));
      out.push('<i style="height:' + h + '%"></i>');
    }
    return out.join('');
  }
  document.querySelectorAll('.wave').forEach(function (el) {
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = bars(parseInt(el.getAttribute('data-seed') || '7', 10));
  });

  /* Mobile menu */
  var header = document.querySelector('.site-header');
  var toggle = header.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  var desktop = window.matchMedia('(min-width: 900px)');

  function setOpen(open) {
    header.setAttribute('data-open', open ? 'true' : 'false');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.getAttribute('data-open') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  function onBreakpoint() { if (desktop.matches) setOpen(false); }
  if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
  else desktop.addListener(onBreakpoint);

  /* Per episode / per season toggle */
  var note = document.getElementById('price-note');
  var basisButtons = document.querySelectorAll('[data-basis]');
  function money(v) { return '£' + Number(v).toLocaleString('en-GB'); }
  function setBasis(basis) {
    basisButtons.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-basis') === basis ? 'true' : 'false');
    });
    document.querySelectorAll('.amount').forEach(function (el) {
      el.textContent = money(el.getAttribute('data-' + basis));
      var unit = el.parentElement.querySelector('.unit');
      if (unit) unit.textContent = basis === 'episode' ? 'per episode' : 'per season of 8';
    });
    if (note) {
      note.textContent = basis === 'episode'
        ? 'Showing the price of one episode.'
        : 'Showing the price of a season of eight episodes, booked together.';
    }
  }
  basisButtons.forEach(function (b) {
    b.addEventListener('click', function () { setBasis(b.getAttribute('data-basis')); });
  });

  /* FAQ accordion */
  document.querySelectorAll('.faq-q button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (panel) panel.hidden = open;
    });
  });
})();
