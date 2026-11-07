(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var header = document.querySelector('.site-header');

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('primary-nav');

  function setMenu(open) {
    if (!toggle || !nav) return;
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
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' &&
          !nav.contains(e.target) && !toggle.contains(e.target)) {
        setMenu(false);
      }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- billing toggle ---------- */
  var segs = Array.prototype.slice.call(document.querySelectorAll('.billing-toggle .seg'));
  var tiers = Array.prototype.slice.call(document.querySelectorAll('.tier[data-monthly]'));
  var billing = 'monthly';

  function formatGBP(n) {
    return '£' + (Number.isInteger(n) ? n : n.toFixed(2));
  }

  function renderBilling(mode) {
    billing = mode;
    segs.forEach(function (b) {
      var on = b.getAttribute('data-billing') === mode;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });

    tiers.forEach(function (tier) {
      var monthly = Number(tier.getAttribute('data-monthly'));
      var term = Number(tier.getAttribute('data-term'));
      var amount = tier.querySelector('.amount');
      var period = tier.querySelector('.period');
      var note = tier.querySelector('.price-note');
      var value, perLabel, noteText;

      if (mode === 'term') {
        value = term;
        perLabel = '/ term';
        var equiv = term / 3;
        var saved = monthly * 3 - term;
        var pct = Math.round(saved / (monthly * 3) * 100);
        noteText = 'About ' + formatGBP(Math.round(equiv * 100) / 100) +
          ' a month. You save ' + formatGBP(saved) + ' (' + pct + '%) against monthly.';
      } else {
        value = monthly;
        perLabel = '/ month';
        noteText = 'Billed monthly. Pause free once a term.';
      }

      if (amount) {
        var newText = String(value);
        if (amount.textContent !== newText) {
          amount.textContent = newText;
          if (!reduceMotion.matches) {
            amount.classList.remove('price-flip');
            void amount.offsetWidth;
            amount.classList.add('price-flip');
          }
        }
      }
      if (period) period.textContent = perLabel;
      if (note) note.textContent = noteText;
    });
  }

  segs.forEach(function (b) {
    b.addEventListener('click', function () {
      renderBilling(b.getAttribute('data-billing'));
    });
  });

  /* ---------- FAQ accordion ---------- */
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.acc-trigger'));

  triggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        panel.hidden = false;
        if (!reduceMotion.matches) {
          panel.classList.remove('is-animating');
          void panel.offsetWidth;
          panel.classList.add('is-animating');
        }
      } else {
        panel.hidden = true;
      }
    });
  });

  /* ---------- close sticky-header overlap on in-page jumps ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    var top = target.getBoundingClientRect().top + window.pageYOffset - (header ? header.offsetHeight : 0) + 1;
    window.scrollTo({ top: top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#' + id);
    if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT)$/.test(target.tagName)) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', function onBlur() {
        target.removeAttribute('tabindex');
        target.removeEventListener('blur', onBlur);
      });
    }
    target.focus({ preventScroll: true });
  });

  renderBilling('monthly');
})();
