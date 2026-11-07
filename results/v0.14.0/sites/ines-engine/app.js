(function () {
  'use strict';

  // Mobile menu
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    var label = toggle.querySelector('.nav__toggle-label');
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      if (label) label.textContent = open ? 'Close' : 'Menu';
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  // Half day / full day price toggle
  var durationButtons = document.querySelectorAll('[data-duration]');
  var prices = document.querySelectorAll('[data-price]');
  var note = document.querySelector('[data-duration-note]');
  var euro = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  durationButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-duration');
      durationButtons.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      prices.forEach(function (p) {
        var value = Number(p.getAttribute('data-' + mode));
        if (!isNaN(value)) p.textContent = euro.format(value).replace(/\s/g, '');
      });
      if (note) {
        note.textContent = mode === 'half'
          ? 'Showing half day prices, four hours on set.'
          : 'Showing full day prices, nine hours on set.';
      }
    });
  });

  // Accordion (one panel per button, each toggles independently)
  document.querySelectorAll('.accordion__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open;
    });
  });

  // Enquiry form
  var form = document.querySelector('[data-enquiry]');
  if (form) {
    var email = document.getElementById('f-email');
    var emailErr = document.getElementById('f-email-err');
    var status = form.querySelector('[data-status]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = email.value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!ok) {
        email.setAttribute('aria-invalid', 'true');
        email.setAttribute('aria-describedby', 'f-email-err');
        emailErr.hidden = false;
        status.textContent = '';
        email.focus();
        return;
      }
      email.removeAttribute('aria-invalid');
      email.removeAttribute('aria-describedby');
      emailErr.hidden = true;
      status.textContent = 'Thank you. Ines replies within two working days.';
      form.reset();
    });
  }
})();
