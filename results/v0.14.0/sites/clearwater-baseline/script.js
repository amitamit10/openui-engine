(function () {
  'use strict';

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) {
      setMenu(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  // Monthly / one-off toggle
  var billingButtons = document.querySelectorAll('[data-billing]');
  var amounts = document.querySelectorAll('.amount');
  var periods = document.querySelectorAll('.period');
  var status = document.querySelector('.gift-status');
  var billing = 'monthly';
  var selected = null;

  function renderPrices() {
    var monthly = billing === 'monthly';
    amounts.forEach(function (el) {
      el.textContent = '£' + (monthly ? el.dataset.monthly : el.dataset.oneoff);
    });
    periods.forEach(function (el) {
      el.textContent = monthly ? 'per month' : 'one-off';
    });
    billingButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.billing === billing));
    });
    if (selected) {
      announce(selected);
    }
  }

  function setBilling(mode) {
    billing = mode;
    renderPrices();
  }

  function announce(name) {
    var card = document.querySelector('[data-tier="' + name + '"]');
    var amount = card.querySelector('.amount').textContent;
    var suffix = billing === 'monthly' ? 'a month' : 'as a one-off gift';
    status.textContent = name + ' selected: ' + amount + ' ' + suffix + '. Thank you. We will email you to confirm.';
  }

  billingButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBilling(btn.dataset.billing);
    });
  });

  document.querySelectorAll('[data-choose]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selected = btn.dataset.choose;
      announce(selected);
    });
  });

  renderPrices();

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });
})();
