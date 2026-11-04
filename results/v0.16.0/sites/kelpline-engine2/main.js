(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  // Mobile navigation
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-nav]');
  var label = toggle ? toggle.querySelector('.menu-toggle-label') : null;

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (label) label.textContent = open ? 'Close' : 'Menu';
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
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  // Early bird / standard price toggle
  var priceToggle = document.querySelector('[data-price-toggle]');
  if (priceToggle) {
    var buttons = priceToggle.querySelectorAll('[data-mode]');
    var amounts = document.querySelectorAll('.price-amount');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-mode');
        buttons.forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        amounts.forEach(function (el) {
          var value = el.getAttribute('data-' + mode);
          if (value) el.textContent = value;
        });
      });
    });
  }

  // Accordion (FAQ)
  var accordion = document.querySelector('[data-accordion]');
  if (accordion) {
    var triggers = accordion.querySelectorAll('.accordion-trigger');
    triggers.forEach(function (trigger) {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      var open = trigger.getAttribute('aria-expanded') === 'true';
      if (panel) panel.hidden = !open;
      trigger.addEventListener('click', function () {
        var expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!expanded));
        if (panel) panel.hidden = expanded;
      });
    });
  }

  // Count-up metrics (respects reduced motion)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var counters = document.querySelectorAll('[data-count]');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var start = null;
        var duration = 900;
        function step(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        }
        el.textContent = '0';
        requestAnimationFrame(step);
        // fallback so the final figure always shows, even if frames are throttled
        setTimeout(function () { el.textContent = String(target); }, duration + 150);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { io.observe(el); });
  }
})();
