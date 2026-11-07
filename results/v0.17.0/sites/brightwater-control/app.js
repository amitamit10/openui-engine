(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setMenu(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    var desktop = window.matchMedia('(min-width: 900px)');
    var closeOnDesktop = function (mq) { if (mq.matches) setMenu(false); };
    if (desktop.addEventListener) {
      desktop.addEventListener('change', closeOnDesktop);
    } else if (desktop.addListener) {
      desktop.addListener(closeOnDesktop);
    }
  }

  /* ---------- Pay upfront / finance toggle ---------- */
  var tiers = document.querySelector('.tiers');
  var billing = document.querySelector('.billing-toggle');

  if (tiers && billing) {
    var buttons = billing.querySelectorAll('[data-mode]');

    var applyMode = function (mode) {
      tiers.setAttribute('data-mode', mode);
      for (var b = 0; b < buttons.length; b++) {
        var pressed = buttons[b].getAttribute('data-mode') === mode;
        buttons[b].setAttribute('aria-pressed', pressed ? 'true' : 'false');
      }
      var amounts = tiers.querySelectorAll('.price-amount');
      var periods = tiers.querySelectorAll('.price-period');
      var notes = tiers.querySelectorAll('.tier-note');
      for (var i = 0; i < amounts.length; i++) {
        amounts[i].textContent = amounts[i].getAttribute('data-' + mode);
        periods[i].textContent = periods[i].getAttribute('data-' + mode);
        notes[i].innerHTML = notes[i].getAttribute('data-' + mode);
      }
    };

    for (var k = 0; k < buttons.length; k++) {
      buttons[k].addEventListener('click', function (event) {
        applyMode(event.currentTarget.getAttribute('data-mode'));
      });
    }
  }

  /* ---------- FAQ accordion ---------- */
  var triggers = document.querySelectorAll('.accordion-trigger');

  for (var t = 0; t < triggers.length; t++) {
    (function (trigger) {
      var panelId = trigger.getAttribute('aria-controls');
      var panel = document.getElementById(panelId);
      if (!panel) return;

      // Panels start collapsed when JavaScript is running.
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');

      trigger.addEventListener('click', function () {
        var expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        panel.hidden = expanded;
      });
    })(triggers[t]);
  }

  root.setAttribute('data-ready', 'true');
})();
