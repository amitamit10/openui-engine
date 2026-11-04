/* Ines Okafor Photography: interactions
   Mobile menu, half/full day price toggle, FAQ accordion.
   Every enhancement is guarded so the page still reads fine if a piece fails. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-toggle');
  var panel = document.getElementById('nav-panel');

  function setMenu(open, returnFocus) {
    if (!menuBtn || !panel) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.menu-toggle-label').textContent = open ? 'Close' : 'Menu';
    panel.classList.toggle('is-open', open);
    if (!open && returnFocus) menuBtn.focus();
  }

  if (menuBtn && panel) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true', false);
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false, false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false, true);
      }
    });

    document.addEventListener('click', function (e) {
      if (menuBtn.getAttribute('aria-expanded') === 'true' &&
          !panel.contains(e.target) && !menuBtn.contains(e.target)) {
        setMenu(false, false);
      }
    });

    var mq = window.matchMedia('(min-width: 960px)');
    var onMq = function () { if (mq.matches) setMenu(false, false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq);
  }

  /* ---------- Half day / full day price toggle ---------- */
  var toggleBtns = Array.prototype.slice.call(document.querySelectorAll('.toggle-btn[data-mode]'));
  var amounts = Array.prototype.slice.call(document.querySelectorAll('.amount[data-half]'));
  var periods = Array.prototype.slice.call(document.querySelectorAll('.period'));

  function setMode(mode) {
    toggleBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
    });
    amounts.forEach(function (el) {
      var value = mode === 'full' ? el.dataset.full : el.dataset.half;
      if (el.textContent === value) return;
      if (reduceMotion) {
        el.textContent = value;
        return;
      }
      el.classList.add('is-changing');
      window.setTimeout(function () {
        el.textContent = value;
        el.classList.remove('is-changing');
      }, 150);
    });
    periods.forEach(function (el) {
      el.textContent = mode === 'full' ? 'for 9 hours' : 'for 4 hours';
    });
  }

  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setMode(btn.dataset.mode);
    });
  });

  /* ---------- FAQ accordion ---------- */
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.acc-trigger'));

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var panelEl = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', String(!expanded));
      if (panelEl) panelEl.hidden = expanded;
    });
  });
})();
