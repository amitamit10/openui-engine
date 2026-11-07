(function () {
  'use strict';

  // ---------- mobile menu ----------
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open, returnFocus) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (!open && returnFocus) toggle.focus();
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true', false);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false, false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false, true);
      }
    });

    // Close the mobile panel if the viewport grows to the desktop layout.
    var desktop = window.matchMedia('(min-width: 900px)');
    var onChange = function (e) { if (e.matches) setMenu(false, false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  // Keep anchor targets clear of the sticky header.
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link || link.getAttribute('href').length < 2) return;
    var target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    var top = target.getBoundingClientRect().top + window.pageYOffset - (header ? header.offsetHeight : 0) + 1;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.replaceState(null, '', '#' + target.id);
  });

  // ---------- pay upfront / finance toggle ----------
  var grid = document.getElementById('pricing-grid');
  var billingButtons = document.querySelectorAll('[data-billing]');

  function setBilling(mode) {
    if (!grid) return;
    grid.setAttribute('data-mode', mode);
    billingButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-billing') === mode));
    });
    grid.querySelectorAll('[data-' + mode + ']').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + mode);
    });
  }

  billingButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBilling(btn.getAttribute('data-billing'));
    });
  });

  // ---------- accordion ----------
  var buttons = document.querySelectorAll('.accordion-button');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });

  // ---------- quote form ----------
  var form = document.getElementById('quote-form');
  if (form) {
    var postcode = document.getElementById('postcode');
    var error = document.getElementById('postcode-error');
    var status = document.getElementById('form-status');

    postcode.addEventListener('input', function () {
      if (postcode.validity.valid) {
        error.hidden = true;
        postcode.removeAttribute('aria-invalid');
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      status.textContent = '';
      if (!postcode.checkValidity() || postcode.value.trim() === '') {
        error.hidden = false;
        postcode.setAttribute('aria-invalid', 'true');
        postcode.focus();
        return;
      }
      error.hidden = true;
      postcode.removeAttribute('aria-invalid');
      var postcodeText = postcode.value.trim().toUpperCase();
      status.textContent = 'Thanks. We have your postcode (' + postcodeText + '). A surveyor will call within one working day to book your visit.';
      form.reset();
    });
  }
})();
