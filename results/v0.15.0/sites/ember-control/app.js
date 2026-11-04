(function () {
  'use strict';

  var header = document.getElementById('top-bar');
  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('site-nav');
  var mobileQuery = window.matchMedia('(max-width: 900px)');

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Menu';
    nav.hidden = !open;
  }

  function isOpen() {
    return toggle.getAttribute('aria-expanded') === 'true';
  }

  setMenu(false);

  toggle.addEventListener('click', function () {
    setMenu(!isOpen());
  });

  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) {
      setMenu(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', function (event) {
    if (isOpen() && !nav.contains(event.target) && !toggle.contains(event.target)) {
      setMenu(false);
    }
  });

  function onBreakpoint() {
    setMenu(false);
  }
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', onBreakpoint);
  }

  /* ---------- Header shadow on scroll ---------- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Per person / per table prices ---------- */
  var segmented = document.querySelector('.segmented');
  var modeButtons = segmented ? segmented.querySelectorAll('button[data-mode]') : [];
  var amounts = document.querySelectorAll('.amount[data-person]');
  var units = document.querySelectorAll('.unit[data-unit-person]');
  var status = document.getElementById('price-status');

  function formatPrice(value) {
    return '£' + Number(value).toLocaleString('en-GB');
  }

  function setPriceMode(mode) {
    var isTable = mode === 'table';
    for (var i = 0; i < modeButtons.length; i++) {
      modeButtons[i].setAttribute('aria-pressed', String(modeButtons[i].getAttribute('data-mode') === mode));
    }
    for (var a = 0; a < amounts.length; a++) {
      amounts[a].textContent = formatPrice(isTable ? amounts[a].getAttribute('data-table') : amounts[a].getAttribute('data-person'));
    }
    for (var u = 0; u < units.length; u++) {
      units[u].textContent = units[u].getAttribute(isTable ? 'data-unit-table' : 'data-unit-person');
    }
    if (status) {
      status.textContent = isTable ? 'Showing prices per table of four.' : 'Showing prices per person.';
    }
  }

  if (segmented) {
    segmented.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-mode]');
      if (button) setPriceMode(button.getAttribute('data-mode'));
    });
  }

  /* ---------- FAQ accordion (one panel open at a time) ---------- */
  var accButtons = document.querySelectorAll('.acc-btn');

  function setPanel(button, open) {
    var panel = document.getElementById(button.getAttribute('aria-controls'));
    button.setAttribute('aria-expanded', String(open));
    if (panel) panel.hidden = !open;
  }

  for (var k = 0; k < accButtons.length; k++) {
    accButtons[k].addEventListener('click', function (event) {
      var target = event.currentTarget;
      var wasOpen = target.getAttribute('aria-expanded') === 'true';
      for (var j = 0; j < accButtons.length; j++) {
        setPanel(accButtons[j], false);
      }
      if (!wasOpen) setPanel(target, true);
    });
  }
})();
