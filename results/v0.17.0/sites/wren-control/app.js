(function () {
  'use strict';

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.getElementById('site-menu');
  var mqDesktop = window.matchMedia('(min-width: 900px)');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle-label').textContent = open ? 'Close' : 'Menu';
    panel.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  panel.addEventListener('click', function (e) {
    if (e.target.closest('a') && !mqDesktop.matches) {
      setMenu(false);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  mqDesktop.addEventListener('change', function () {
    setMenu(false);
  });

  // Monthly / yearly billing toggle
  var billingButtons = document.querySelectorAll('.billing-btn');
  var priceEls = document.querySelectorAll('.js-price');
  var status = document.getElementById('billing-status');

  function setBilling(mode) {
    billingButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-billing') === mode));
    });
    priceEls.forEach(function (el) {
      var value = el.getAttribute('data-' + mode);
      if (value !== null) { el.textContent = value; }
    });
    status.textContent = mode === 'yearly'
      ? 'Showing yearly prices. Two months free on every plan.'
      : 'Showing monthly prices.';
  }

  billingButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBilling(btn.getAttribute('data-billing'));
    });
  });

  // FAQ accordion
  var accButtons = document.querySelectorAll('.acc-btn');
  accButtons.forEach(function (btn) {
    var region = document.getElementById(btn.getAttribute('aria-controls'));
    region.hidden = btn.getAttribute('aria-expanded') !== 'true';
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      region.hidden = !open;
    });
  });
})();
