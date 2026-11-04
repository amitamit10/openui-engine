(function () {
  'use strict';

  // Mobile navigation
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');

  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.nav-toggle-label').textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    setNav(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a') && window.innerWidth < 960) setNav(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setNav(false);
      toggle.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 960) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('.nav-toggle-label').textContent = 'Menu';
    }
  });

  // Early bird / standard price toggle
  var priceButtons = document.querySelectorAll('.toggle-btn');
  var amounts = document.querySelectorAll('.amount');
  var savings = document.querySelectorAll('.saving');

  function setPeriod(period) {
    priceButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.period === period));
    });
    amounts.forEach(function (el) {
      el.textContent = el.dataset[period];
    });
    savings.forEach(function (el) {
      el.textContent = el.dataset[period];
    });
  }

  priceButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setPeriod(btn.dataset.period);
    });
  });

  // Accordion (FAQ)
  var triggers = document.querySelectorAll('.acc-trigger');
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });
})();
