/* Tilde Language School: menu, billing toggle, accordion.
   The page is fully readable without this script; it only enhances. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open, returnFocus) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle-label').textContent = open ? 'Close' : 'Menu';
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

    document.addEventListener('click', function (event) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (!nav.contains(event.target) && !toggle.contains(event.target)) setMenu(false, false);
    });

    window.matchMedia('(min-width: 880px)').addEventListener('change', function (event) {
      if (event.matches) setMenu(false, false);
    });
  }

  /* ---------- Billing toggle ---------- */
  var billingButtons = Array.prototype.slice.call(document.querySelectorAll('[data-billing]'));
  var note = document.getElementById('billing-note');
  var amounts = Array.prototype.slice.call(document.querySelectorAll('.price-amount'));

  function formatPounds(value) {
    return '£' + Math.round(value).toLocaleString('en-GB');
  }

  function setBilling(mode) {
    billingButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-billing') === mode));
    });

    amounts.forEach(function (amount) {
      var card = amount.closest('.tier');
      var period = card.querySelector('.price-period');
      var equiv = card.querySelector('.price-equiv');
      var monthly = Number(amount.getAttribute('data-month'));
      var term = Number(amount.getAttribute('data-term'));

      if (mode === 'term') {
        amount.textContent = formatPounds(term);
        period.textContent = '/ term of 12 weeks';
        equiv.textContent = 'About ' + formatPounds(term / 3) + ' a month, 10% less';
      } else {
        amount.textContent = formatPounds(monthly);
        period.textContent = '/ month';
        equiv.textContent = '';
      }
    });

    if (note) {
      note.textContent = mode === 'term'
        ? 'Paid up front for each 12-week term. Saves ten per cent on monthly billing.'
        : 'Billed monthly. Cancel with 14 days’ notice.';
    }
  }

  if (billingButtons.length) {
    billingButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setBilling(btn.getAttribute('data-billing'));
      });
    });
    setBilling('month');
  }

  /* ---------- FAQ accordion ---------- */
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.acc-trigger'));

  function setPanel(trigger, open) {
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    trigger.setAttribute('aria-expanded', String(open));
    if (panel) panel.hidden = !open;
  }

  triggers.forEach(function (trigger) {
    // Start with the panel state the markup declares (aria-expanded), then hide closed ones.
    setPanel(trigger, trigger.getAttribute('aria-expanded') === 'true');
    trigger.addEventListener('click', function () {
      setPanel(trigger, trigger.getAttribute('aria-expanded') !== 'true');
    });
  });

  // Keep reduced-motion users from waiting on any open/close transition (CSS handles the rest).
  if (reduceMotion && reduceMotion.matches) root.setAttribute('data-motion', 'reduced');
})();
