(function () {
  'use strict';

  // Mobile menu
  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle-label').textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
  }

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

  window.matchMedia('(min-width: 960px)').addEventListener('change', function (mq) {
    if (mq.matches) setMenu(false);
  });

  // Fee scope toggle: switches displayed prices and scope rows
  var scopeButtons = document.querySelectorAll('.scope-btn');
  var prices = document.querySelectorAll('.price');
  var fullOnly = document.querySelectorAll('.tier-full-only');
  var note = document.getElementById('scope-note');
  var status = document.getElementById('scope-status');
  var notes = {
    design: 'Design stage covers RIBA stages 0 to 4, to planning submission.',
    full: 'Full service covers RIBA stages 0 to 7, from the first visit to handover.'
  };

  function setScope(scope) {
    var full = scope === 'full';
    scopeButtons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-scope') === scope));
    });
    prices.forEach(function (p) {
      var value = full ? p.getAttribute('data-full') : p.getAttribute('data-design');
      p.classList.add('is-updating');
      p.textContent = '£' + value;
      window.setTimeout(function () { p.classList.remove('is-updating'); }, 180);
    });
    fullOnly.forEach(function (li) { li.hidden = !full; });
    note.textContent = notes[full ? 'full' : 'design'];
    status.textContent = 'Prices now show ' + (full ? 'full service' : 'design stage only') + ' fees.';
  }

  scopeButtons.forEach(function (b) {
    b.addEventListener('click', function () {
      setScope(b.getAttribute('data-scope'));
    });
  });

  // FAQ accordion
  document.querySelectorAll('.acc-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    });
  });
})();
