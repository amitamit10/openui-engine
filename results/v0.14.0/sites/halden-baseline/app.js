(function () {
  'use strict';

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('primary-nav');
  var mqDesktop = window.matchMedia('(min-width: 960px)');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
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

  mqDesktop.addEventListener('change', function (e) {
    if (e.matches) setMenu(false);
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

  // Fee scope toggle
  var segments = document.querySelectorAll('[data-scope]');
  var status = document.getElementById('scope-status');
  var amounts = document.querySelectorAll('[data-amount-design]');
  var notes = document.querySelectorAll('[data-note-design]');

  function setScope(scope) {
    var key = scope === 'full' ? 'Full' : 'Design';
    segments.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-scope') === scope));
    });
    amounts.forEach(function (el) { el.textContent = el.dataset['amount' + key]; });
    notes.forEach(function (el) { el.textContent = el.dataset['note' + key]; });
    status.textContent = scope === 'full'
      ? 'Showing full service prices, design to practical completion.'
      : 'Showing design stage prices.';
  }

  segments.forEach(function (b) {
    b.addEventListener('click', function () {
      setScope(b.getAttribute('data-scope'));
    });
  });
})();
