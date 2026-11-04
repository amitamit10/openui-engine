/* Halden & Voss Architects: menu, fee toggle and accordion. No dependencies. */
(function () {
  'use strict';

  var currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('site-menu');

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.nav-toggle-label').textContent = open ? 'Close' : 'Menu';
    menu.classList.toggle('is-open', open);
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    window.matchMedia('(min-width: 960px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Fee basis toggle ---------- */
  var segments = Array.prototype.slice.call(document.querySelectorAll('.segment'));
  var note = document.getElementById('fee-note');
  var amounts = Array.prototype.slice.call(document.querySelectorAll('.price-amount'));
  var units = Array.prototype.slice.call(document.querySelectorAll('[data-unit]'));

  var notes = {
    design: 'Design stage only shows the fixed fee for design work. Full service adds tender support and construction-stage administration.',
    full: 'Full service shows the fixed fee for each tier including tender support and construction-stage administration.'
  };

  function setBasis(basis) {
    segments.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-basis') === basis));
    });
    amounts.forEach(function (el) {
      var value = Number(el.getAttribute(basis === 'full' ? 'data-full' : 'data-design'));
      el.textContent = currency.format(value);
    });
    units.forEach(function (el) {
      el.textContent = basis === 'full' ? 'fixed fee incl. construction stage, excl. VAT' : 'fixed fee for design work, excl. VAT';
    });
    if (note) note.textContent = notes[basis];
  }

  segments.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBasis(btn.getAttribute('data-basis'));
    });
  });

  if (segments.length) setBasis('design');

  /* ---------- Accordion ---------- */
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.acc-trigger'));

  triggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });
})();
