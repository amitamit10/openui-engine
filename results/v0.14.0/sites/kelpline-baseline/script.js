(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    var wide = window.matchMedia('(min-width: 880px)');
    var onWide = function (e) { if (e.matches) setMenu(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
  }

  // Early bird / standard price toggle
  var toggleBtns = document.querySelectorAll('.price-toggle-btn');
  var status = document.getElementById('price-status');
  var amounts = document.querySelectorAll('.amount');

  function fmt(n) {
    return '£' + n;
  }

  function setPeriod(period) {
    for (var i = 0; i < toggleBtns.length; i++) {
      var on = toggleBtns[i].getAttribute('data-period') === period;
      toggleBtns[i].setAttribute('aria-pressed', String(on));
    }
    for (var j = 0; j < amounts.length; j++) {
      amounts[j].textContent = fmt(amounts[j].getAttribute('data-' + period));
    }
    if (status) {
      status.textContent = period === 'early'
        ? 'Showing early bird prices, valid until 15 July 2027.'
        : 'Showing standard prices, from 16 July 2027.';
    }
  }

  for (var k = 0; k < toggleBtns.length; k++) {
    toggleBtns[k].addEventListener('click', function (e) {
      setPeriod(e.currentTarget.getAttribute('data-period'));
    });
  }

  // Accordion: one panel open at a time
  var triggers = document.querySelectorAll('.accordion-trigger');

  function setPanel(trigger, open) {
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    trigger.setAttribute('aria-expanded', String(open));
    if (panel) panel.hidden = !open;
  }

  for (var m = 0; m < triggers.length; m++) {
    triggers[m].addEventListener('click', function (e) {
      var target = e.currentTarget;
      var willOpen = target.getAttribute('aria-expanded') !== 'true';
      for (var n = 0; n < triggers.length; n++) {
        setPanel(triggers[n], false);
      }
      setPanel(target, willOpen);
    });
  }
})();
