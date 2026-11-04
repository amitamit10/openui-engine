(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });

  /* Mobile menu */
  var toggle = doc.querySelector('.menu-toggle');
  var menu = doc.getElementById('mobile-menu');

  function setMenu(open, returnFocus) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    if (!open && returnFocus) toggle.focus();
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(menu.hidden);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false, false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) setMenu(false, true);
    });
    var wide = window.matchMedia('(min-width: 880px)');
    var onWide = function () { if (wide.matches) setMenu(false, false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else wide.addListener(onWide);
  }

  /* Early bird / standard price toggle */
  var periodButtons = Array.prototype.slice.call(doc.querySelectorAll('.period-btn'));
  var amounts = Array.prototype.slice.call(doc.querySelectorAll('.amount'));

  function setPeriod(period) {
    periodButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-period') === period));
    });
    amounts.forEach(function (el) {
      var value = Number(el.getAttribute('data-' + period));
      if (!isNaN(value)) el.textContent = money.format(value);
    });
    root.setAttribute('data-period', period);
  }

  periodButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setPeriod(btn.getAttribute('data-period'));
    });
  });

  /* FAQ accordion */
  var accButtons = Array.prototype.slice.call(doc.querySelectorAll('.acc-btn'));
  accButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var panel = doc.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open;
    });
  });
})();
