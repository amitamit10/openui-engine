(function () {
  'use strict';

  // Mobile navigation
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.getElementById('nav-panel');
  var mq = window.matchMedia('(min-width: 860px)');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    toggle.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
  }

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    var onChange = function (e) { if (e.matches) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  // Launch week / regular price toggle
  var periodButtons = document.querySelectorAll('[data-period]');
  var note = document.getElementById('period-note');
  var tiers = document.querySelectorAll('.tier[data-launch]');

  function money(n) { return '$' + Number(n).toFixed(2); }

  function setPeriod(period) {
    periodButtons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-period') === period));
    });
    tiers.forEach(function (tier) {
      var now = tier.querySelector('.price-now');
      var was = tier.querySelector('.price-was');
      var launch = period === 'launch';
      now.textContent = money(launch ? tier.dataset.launch : tier.dataset.regular);
      was.textContent = launch ? 'Regular ' + money(tier.dataset.regular) : '';
      was.hidden = !launch;
    });
    if (note) {
      note.textContent = period === 'launch'
        ? 'Launch week: reduced prices for seven days from release.'
        : 'Regular prices, from day eight onward.';
    }
  }

  periodButtons.forEach(function (b) {
    b.addEventListener('click', function () {
      setPeriod(b.getAttribute('data-period'));
    });
  });
  if (periodButtons.length) setPeriod('launch');

  // FAQ accordion
  document.querySelectorAll('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var panelEl = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!open));
      if (panelEl) panelEl.hidden = open;
    });
  });
})();
