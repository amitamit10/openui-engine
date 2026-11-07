(function () {
  'use strict';

  /* ---------- sticky header shadow ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  var menuText = menuBtn && menuBtn.querySelector('.menu-text');

  function isMobile() { return window.matchMedia('(max-width: 879px)').matches; }

  function setMenu(open, opts) {
    if (!menuBtn || !nav) return;
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (menuText) menuText.textContent = open ? 'Close' : 'Menu';
    if (!open && opts && opts.returnFocus) menuBtn.focus();
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && isMobile()) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false, { returnFocus: true });
      }
    });
    window.matchMedia('(min-width: 880px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- monthly / annual pricing toggle ---------- */
  var sw = document.getElementById('billing-switch');
  var amounts = document.querySelectorAll('.amount[data-monthly]');
  var billed = document.querySelectorAll('.billed[data-monthly-text]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function formatGBP(n) { return '£' + n.toLocaleString('en-GB'); }

  function renderPrices(annual) {
    amounts.forEach(function (el) {
      var value = annual ? el.dataset.annual : el.dataset.monthly;
      el.textContent = formatGBP(Number(value));
    });
    billed.forEach(function (el) {
      el.textContent = annual ? el.dataset.annualText : el.dataset.monthlyText;
    });
  }

  if (sw) {
    sw.addEventListener('click', function () {
      var annual = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(annual));
      if (reduce) {
        renderPrices(annual);
        return;
      }
      amounts.forEach(function (el) { el.classList.add('is-swapping'); });
      window.setTimeout(function () {
        renderPrices(annual);
        amounts.forEach(function (el) { el.classList.remove('is-swapping'); });
      }, 160);
    });
  }

  /* ---------- FAQ accordion ---------- */
  var triggers = document.querySelectorAll('.acc-trigger');
  triggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });
})();
