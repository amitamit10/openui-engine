(function () {
  "use strict";

  // Mobile menu
  var toggle = document.getElementById("menu-toggle");
  var panel = document.getElementById("site-nav");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".menu-toggle__label").textContent = open ? "Close" : "Menu";
    panel.classList.toggle("is-open", open);
  }

  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  panel.addEventListener("click", function (event) {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      toggle.focus();
    }
  });

  window.matchMedia("(min-width: 900px)").addEventListener("change", function (event) {
    if (event.matches) setMenu(false);
  });

  // Launch week / regular price toggle
  var periodButtons = document.querySelectorAll("[data-period]");
  var amounts = document.querySelectorAll(".tier__amount");
  var status = document.getElementById("period-status");

  function setPeriod(period) {
    periodButtons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.period === period));
    });
    amounts.forEach(function (el) {
      var value = Number(el.dataset[period]);
      el.textContent = "$" + value.toFixed(2);
    });
    status.textContent = period === "launch"
      ? "Showing launch week prices, valid until 15 November."
      : "Showing regular prices. Launch week ends 15 November.";
  }

  periodButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setPeriod(btn.dataset.period);
    });
  });

  // Accordion
  var accordionButtons = document.querySelectorAll(".accordion__btn");
  accordionButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var panelEl = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      panelEl.hidden = expanded;
    });
  });
})();
