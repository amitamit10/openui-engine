/* Wren & Paw: small progressive enhancements. The page works without this file for reading and anchor links. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-nav]');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle-label').textContent = open ? 'Close' : 'Menu';
    if (open) {
      nav.hidden = false;
      var first = nav.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    } else {
      nav.hidden = true;
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && window.matchMedia('(max-width: 899px)').matches) {
        setMenu(false);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target) && !toggle.contains(e.target)) {
        setMenu(false);
      }
    });

    window.matchMedia('(min-width: 900px)').addEventListener('change', function (mq) {
      // Desktop shows the links inline; keep the mobile state tidy.
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('.menu-toggle-label').textContent = 'Menu';
      if (mq.matches) nav.hidden = false; else nav.hidden = true;
    });
  }

  /* ---------- Accordion ---------- */
  var accordion = document.querySelector('[data-accordion]');
  if (accordion) {
    accordion.addEventListener('click', function (e) {
      var btn = e.target.closest('.acc-trigger');
      if (!btn) return;
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  }

  /* ---------- Billing toggle ---------- */
  var seg = document.querySelector('.segmented');
  var status = document.querySelector('[data-period-status]');
  var priceEls = document.querySelectorAll('[data-price]');

  function formatMonthly(total) {
    return '£' + (total / 12).toFixed(2);
  }

  function setPeriod(period) {
    var yearly = period === 'yearly';
    seg.querySelectorAll('.seg-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-period') === period));
    });
    priceEls.forEach(function (el) {
      var card = el.closest('.plan');
      var amount = yearly ? el.getAttribute('data-yearly') : el.getAttribute('data-monthly');
      el.textContent = '£' + amount;
      card.querySelector('.price-unit').textContent = yearly ? 'per year' : 'per month';
      card.querySelector('[data-note]').textContent = yearly
        ? 'Billed once a year: works out at ' + formatMonthly(Number(el.getAttribute('data-yearly'))) + ' a month'
        : 'Billed monthly, cancel any time';
    });
    if (status) {
      status.textContent = yearly ? 'Showing yearly prices' : 'Showing monthly prices';
    }
  }

  if (seg) {
    seg.addEventListener('click', function (e) {
      var btn = e.target.closest('.seg-btn');
      if (!btn) return;
      setPeriod(btn.getAttribute('data-period'));
    });
  }

  /* ---------- Booking form (no backend: validates and confirms locally) ---------- */
  var form = document.getElementById('book');
  if (form) {
    var statusEl = form.querySelector('[data-form-status]');

    function check(input, errorId, message) {
      var error = document.getElementById(errorId);
      var empty = input.value.trim() === '';
      input.setAttribute('aria-invalid', String(empty));
      if (error) {
        error.hidden = !empty;
        if (empty) error.textContent = message;
      }
      return !empty;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name;
      var pet = form.elements.pet;
      var okName = check(name, 'e-name', 'Please add your name so we know who to call.');
      var okPet = check(pet, 'e-pet', "Please add your pet's name.");
      statusEl.classList.remove('is-error');
      if (!okName || !okPet) {
        statusEl.classList.add('is-error');
        statusEl.textContent = 'Please fix the highlighted fields.';
        (okName ? pet : name).focus();
        return;
      }
      statusEl.textContent = 'Thanks, ' + name.value.trim() + '. We have noted ' + pet.value.trim() +
        ' and will text you before 10am to confirm a time. If it is urgent, call 01603 555 142.';
      form.reset();
    });
  }
})();
