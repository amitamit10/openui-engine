(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  /* ---------- mobile navigation ---------- */
  var header = document.getElementById('site-header');
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('primary-nav');

  function setMenu(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.querySelector('.nav-toggle-label').textContent = open ? 'Close' : 'Menu';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(!header.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 960 && header.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ---------- per person / per table price toggle ---------- */
  var toggleBtns = document.querySelectorAll('.price-toggle [data-mode]');
  var amounts = document.querySelectorAll('.amount[data-pp]');

  function setMode(mode) {
    toggleBtns.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-mode') === mode ? 'true' : 'false');
    });
    amounts.forEach(function (el) {
      var value = mode === 'table' ? el.getAttribute('data-table') : el.getAttribute('data-pp');
      el.textContent = '£' + Number(value).toLocaleString('en-GB');
      var unit = el.nextElementSibling;
      if (unit && unit.classList.contains('unit')) {
        unit.textContent = mode === 'table' ? 'per table of six' : 'per person';
      }
    });
  }

  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setMode(btn.getAttribute('data-mode'));
    });
  });

  /* ---------- accordion ---------- */
  var accordion = document.querySelector('[data-accordion]');
  if (accordion) {
    var triggers = accordion.querySelectorAll('.acc-trigger');

    triggers.forEach(function (trigger) {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      if (panel) panel.hidden = !expanded;

      trigger.addEventListener('click', function () {
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        if (panel) panel.hidden = isOpen;
      });
    });
  }

  /* ---------- booking form (front-end only) ---------- */
  var form = document.getElementById('book-form');
  if (form) {
    var dateInput = document.getElementById('bk-date');
    var errorBox = document.getElementById('form-error');
    var status = document.getElementById('form-status');

    var today = new Date();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var todayStr = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
    dateInput.min = todayStr;

    function showError(message) {
      errorBox.textContent = message;
      errorBox.hidden = false;
      status.textContent = '';
      status.className = 'form-status';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var date = data.get('date');
      var name = String(data.get('name') || '').trim();
      var email = String(data.get('email') || '').trim();
      var guests = data.get('guests');

      if (!date) return showError('Choose a date for your table.');
      if (date < todayStr) return showError('That date has already passed. Pick a day from today onwards.');
      if (!name) return showError('Add the name the booking should be under.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Enter an email address we can confirm to.');

      errorBox.hidden = true;
      errorBox.textContent = '';

      var d = new Date(date + 'T12:00:00');
      var when = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      var party = Number(guests) >= 9
        ? 'a Private Room enquiry for ' + guests + ' or more'
        : 'a table for ' + guests;
      status.className = 'form-status is-ok';
      status.textContent = 'Thanks, ' + name.split(' ')[0] + '. We have ' + party + ' on ' + when + '. We confirm by email within two hours.';
      form.reset();
      dateInput.min = todayStr;
    });
  }
})();
