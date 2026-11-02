/* Northstar landing page interactions: mobile menu, billing toggle, FAQ accordion. */
(function () {
  'use strict';

  var MOBILE_QUERY = window.matchMedia('(max-width: 899.98px)');

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  var toggleLabel = document.querySelector('.menu-toggle-label');

  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (toggleLabel) toggleLabel.textContent = open ? 'Close' : 'Menu';
  }

  function isMenuOpen() {
    return !!nav && nav.classList.contains('is-open');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(!isMenuOpen());
    });

    // Close the menu when a link inside it is followed.
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && MOBILE_QUERY.matches) {
        setMenu(false);
      }
    });

    // Escape closes the menu and returns focus to the toggle.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isMenuOpen()) {
        setMenu(false);
        toggle.focus();
      }
    });

    // Click outside the open menu closes it.
    document.addEventListener('click', function (event) {
      if (!isMenuOpen()) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setMenu(false);
    });

    // Reset the menu state when crossing into the desktop layout.
    var onBreakpoint = function () {
      if (!MOBILE_QUERY.matches) setMenu(false);
    };
    if (MOBILE_QUERY.addEventListener) {
      MOBILE_QUERY.addEventListener('change', onBreakpoint);
    } else if (MOBILE_QUERY.addListener) {
      MOBILE_QUERY.addListener(onBreakpoint);
    }
  }

  /* ---------- Billing toggle (monthly / yearly) ---------- */
  var billingButtons = Array.prototype.slice.call(document.querySelectorAll('[data-billing]'));
  var amounts = Array.prototype.slice.call(document.querySelectorAll('.amount[data-monthly]'));
  var billingStatus = document.getElementById('billing-status');

  function setBilling(mode) {
    billingButtons.forEach(function (btn) {
      var active = btn.getAttribute('data-billing') === mode;
      btn.setAttribute('aria-pressed', String(active));
    });

    amounts.forEach(function (el) {
      var next = mode === 'yearly' ? el.getAttribute('data-yearly') : el.getAttribute('data-monthly');
      if (el.textContent !== next) {
        el.style.opacity = '0';
        window.setTimeout(function () {
          el.textContent = next;
          el.style.opacity = '1';
        }, 120);
      }
    });

    if (billingStatus) {
      billingStatus.textContent = mode === 'yearly'
        ? 'Showing yearly prices, billed annually'
        : 'Showing monthly prices';
    }
  }

  billingButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setBilling(btn.getAttribute('data-billing'));
    });
  });

  /* ---------- FAQ accordion ---------- */
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.acc-trigger'));

  function setPanel(trigger, open) {
    var panelId = trigger.getAttribute('aria-controls');
    var panel = panelId ? document.getElementById(panelId) : null;
    trigger.setAttribute('aria-expanded', String(open));
    if (panel) panel.hidden = !open;
  }

  triggers.forEach(function (trigger) {
    setPanel(trigger, trigger.getAttribute('aria-expanded') === 'true');

    trigger.addEventListener('click', function () {
      var open = trigger.getAttribute('aria-expanded') !== 'true';
      setPanel(trigger, open);
    });
  });
})();
