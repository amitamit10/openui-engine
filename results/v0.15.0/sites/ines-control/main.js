(() => {
  'use strict';

  // Mobile menu
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navPanel = document.getElementById('nav-panel');
  const menuLabel = menuToggle.querySelector('.sr-only');

  const setMenu = (open) => {
    header.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? 'Close menu' : 'Open menu';
  };

  menuToggle.addEventListener('click', () => {
    setMenu(!header.classList.contains('is-open'));
  });

  navPanel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-open')) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  window.matchMedia('(min-width: 900px)').addEventListener('change', () => setMenu(false));

  // Half day / full day pricing toggle
  const money = (value) => '€' + Number(value).toLocaleString('en-GB');
  const amounts = document.querySelectorAll('.amount');
  const pers = document.querySelectorAll('.per');
  const durationButtons = document.querySelectorAll('.toggle-btn');
  const note = document.getElementById('toggle-note');
  const notes = {
    half: 'Half day: four hours on site for Editorial and Commercial, five hours for Weddings.',
    full: 'Full day: eight hours for Editorial and Commercial, ten hours for Weddings, with a second photographer.'
  };

  const setDuration = (duration) => {
    durationButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.duration === duration));
    });
    amounts.forEach((el) => {
      el.textContent = money(el.dataset[duration]);
    });
    pers.forEach((el) => {
      el.textContent = duration === 'half' ? '/ half day' : '/ full day';
    });
    note.textContent = notes[duration];
  };

  durationButtons.forEach((button) => {
    button.addEventListener('click', () => setDuration(button.dataset.duration));
  });

  // FAQ accordion
  document.querySelectorAll('.acc-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });

  // Enquiry form (no backend: confirms locally)
  const form = document.querySelector('.enquiry');
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.name;
    const email = form.elements.email;
    if (!name.value.trim()) {
      status.textContent = 'Please add your name so Ines knows who to reply to.';
      name.focus();
      return;
    }
    if (!email.checkValidity() || !email.value.trim()) {
      status.textContent = 'Please add an email address we can reply to.';
      email.focus();
      return;
    }
    status.textContent = 'Thank you. Ines will reply within two working days.';
    form.reset();
  });
})();
