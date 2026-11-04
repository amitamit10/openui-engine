(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  var mq = window.matchMedia('(min-width: 960px)');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.setAttribute('data-open', String(open));
  }

  if (toggle && nav) {
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
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' &&
          !nav.contains(e.target) && !toggle.contains(e.target)) {
        setMenu(false);
      }
    });
    var onMq = function () { setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq);
  }

  /* ---------- Monthly / one-off pricing toggle ---------- */
  var freqButtons = document.querySelectorAll('.freq-btn');
  var amounts = document.querySelectorAll('.tier .amount');
  var periods = document.querySelectorAll('.tier .period');
  var status = document.getElementById('freq-status');

  function setFrequency(freq) {
    freqButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-freq') === freq));
    });
    amounts.forEach(function (el) {
      var v = el.getAttribute('data-' + freq);
      if (v) el.innerHTML = v;
    });
    periods.forEach(function (el) {
      var v = el.getAttribute('data-' + freq);
      if (v) el.textContent = v;
    });
    if (status) {
      status.textContent = freq === 'monthly'
        ? 'Showing monthly prices.'
        : 'Showing one-off prices, paid once for a full year of work.';
    }
  }

  freqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setFrequency(btn.getAttribute('data-freq'));
    });
  });

  /* ---------- Tier selection summary ---------- */
  var summary = document.getElementById('tier-summary');
  document.querySelectorAll('[data-tier]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tier = btn.getAttribute('data-tier');
      var pressed = document.querySelector('.freq-btn[aria-pressed="true"]');
      var freq = pressed ? pressed.getAttribute('data-freq') : 'monthly';
      var card = btn.closest('.tier');
      var amount = card ? card.querySelector('.amount') : null;
      var period = card ? card.querySelector('.period') : null;
      if (summary && amount && period) {
        summary.textContent = 'You have chosen ' + tier + ' at ' +
          amount.textContent + ' ' + (freq === 'monthly' ? 'per month' : 'one-off') + '.';
      }
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.acc-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open;
    });
  });
})();
