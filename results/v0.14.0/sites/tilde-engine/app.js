(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 900px)');

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('site-nav');

  function setMenu(open) {
    menuToggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  }

  menuToggle.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  desktop.addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });

  /* ---------- Billing toggle (per term / monthly) ---------- */
  const billingButtons = document.querySelectorAll('[data-billing]');
  const amounts = document.querySelectorAll('.amount[data-term]');
  const periods = document.querySelectorAll('.period[data-period-term]');
  const billingNote = document.getElementById('billing-note');

  const notes = {
    term: 'Terms are 10 weeks, paid up front. Works out about 6–9% less per week than monthly.',
    month: 'Billed monthly. Cancel with 30 days’ notice, no exit fee.'
  };

  function formatPound(value) {
    return '£' + value;
  }

  function setBilling(mode) {
    billingButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.billing === mode));
    });

    amounts.forEach((el) => {
      el.textContent = formatPound(mode === 'term' ? el.dataset.term : el.dataset.month);
    });

    periods.forEach((el) => {
      el.textContent = mode === 'term' ? el.dataset.periodTerm : el.dataset.periodMonth;
    });

    if (billingNote) billingNote.textContent = notes[mode];
  }

  billingButtons.forEach((button) => {
    button.addEventListener('click', () => setBilling(button.dataset.billing));
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-q').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      if (panel) panel.hidden = isOpen;
    });
  });

  /* ---------- Hero: speaker highlight cycles through the class ---------- */
  const tiles = Array.from(document.querySelectorAll('[data-tile]'));
  if (tiles.length && !reduceMotion.matches) {
    let current = tiles.findIndex((tile) => tile.classList.contains('is-speaking'));
    if (current < 0) current = 0;
    window.setInterval(() => {
      tiles[current].classList.remove('is-speaking');
      current = (current + 1) % tiles.length;
      tiles[current].classList.add('is-speaking');
    }, 2600);
  }

  /* ---------- Member sign-in notice (toast) ---------- */
  const toast = document.getElementById('toast');
  let toastTimer = null;

  document.querySelectorAll('[data-toast]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      toast.textContent = trigger.dataset.toast;
      toast.classList.add('is-visible');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 5000);
    });
  });

  /* ---------- Trial booking form (client-side validation) ---------- */
  const form = document.getElementById('trial-form');
  const status = document.getElementById('form-status');

  function checkField(input, errorEl, valid) {
    input.setAttribute('aria-invalid', String(!valid));
    errorEl.hidden = valid;
    return valid;
  }

  if (form) {
    const name = form.elements.name;
    const email = form.elements.email;

    name.addEventListener('input', () => {
      if (name.getAttribute('aria-invalid') === 'true') {
        checkField(name, document.getElementById('e-name'), name.value.trim() !== '');
      }
    });
    email.addEventListener('input', () => {
      if (email.getAttribute('aria-invalid') === 'true') {
        checkField(email, document.getElementById('e-email'), email.validity.valid && email.value.trim() !== '');
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      status.textContent = '';

      const nameOk = checkField(name, document.getElementById('e-name'), name.value.trim() !== '');
      const emailOk = checkField(email, document.getElementById('e-email'), email.validity.valid && email.value.trim() !== '');
      const language = form.elements.language;
      const languageOk = language.value !== '';
      language.setAttribute('aria-invalid', String(!languageOk));

      if (!nameOk || !emailOk || !languageOk) {
        const firstInvalid = [name, email, language].find((el) => el.getAttribute('aria-invalid') === 'true');
        if (firstInvalid) firstInvalid.focus();
        status.textContent = 'Please fill in the highlighted fields.';
        return;
      }

      const firstName = name.value.trim();
      const lang = language.value;
      status.textContent = 'Thanks, ' + firstName + '. We will confirm your ' + lang + ' trial slot by email within one working day.';
      form.reset();
      [name, email, language].forEach((el) => el.removeAttribute('aria-invalid'));
    });
  }
})();
