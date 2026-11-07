/* Wren & Paw: menu, billing toggle, accordion. Progressive enhancement only. */
(function () {
  'use strict';

  var doc = document;

  /* Mobile menu */
  var toggle = doc.getElementById('menu-toggle');
  var menu = doc.getElementById('mobile-menu');

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
    if (open) {
      menu.removeAttribute('hidden');
    } else {
      menu.setAttribute('hidden', '');
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    var mq = window.matchMedia('(min-width: 960px)');
    var onChange = function (ev) { if (ev.matches) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* Billing toggle: updates every price in the pricing section */
  var toggles = doc.querySelectorAll('.toggle-btn[data-period]');

  function setPeriod(period) {
    toggles.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-period') === period ? 'true' : 'false');
    });

    doc.querySelectorAll('.plan .amount').forEach(function (el) {
      var value = el.getAttribute(period === 'yearly' ? 'data-yearly' : 'data-monthly');
      el.textContent = value;
    });

    doc.querySelectorAll('.plan .billed').forEach(function (el) {
      var text = el.getAttribute(period === 'yearly' ? 'data-yearly-text' : 'data-monthly-text');
      if (text) el.textContent = text;
    });
  }

  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setPeriod(btn.getAttribute('data-period'));
    });
  });

  /* Accordion */
  var triggers = doc.querySelectorAll('.acc-trigger');

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var panel = doc.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (panel) {
        if (expanded) panel.setAttribute('hidden', '');
        else panel.removeAttribute('hidden');
      }
    });
  });
})();
