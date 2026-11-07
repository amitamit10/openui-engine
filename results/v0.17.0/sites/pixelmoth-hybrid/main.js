/* Pixelmoth Games: menu, price period toggle, accordion */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var toggleLabel = toggle ? toggle.querySelector(".nav-toggle-label") : null;

  function setMenu(open, returnFocus) {
    if (!toggle || !nav) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (toggleLabel) toggleLabel.textContent = open ? "Close" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
    if (!open && returnFocus) toggle.focus();
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true", false);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false, false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false, true);
      }
    });

    var mq = window.matchMedia("(min-width: 900px)");
    var handleWide = function (e) { if (e.matches) setMenu(false, false); };
    if (mq.addEventListener) mq.addEventListener("change", handleWide);
    else if (mq.addListener) mq.addListener(handleWide);
  }

  /* ---------- Launch week / regular price toggle ---------- */
  var buttons = document.querySelectorAll("[data-mode]");
  var status = document.getElementById("price-status");
  var amounts = document.querySelectorAll(".amount");

  function setMode(mode) {
    var isLaunch = mode === "launch";

    buttons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-mode") === mode ? "true" : "false");
    });

    amounts.forEach(function (el) {
      var current = isLaunch ? el.getAttribute("data-launch") : el.getAttribute("data-regular");
      el.textContent = current;

      // The struck-through price is the regular price while launch week is showing.
      var old = el.parentElement.querySelector(".old-price");
      if (old) {
        old.textContent = el.getAttribute("data-regular");
        old.hidden = !isLaunch;
      }
    });

    root.setAttribute("data-price-mode", mode);
    if (status) {
      status.textContent = isLaunch
        ? "Showing launch-week prices. Regular prices start 23 November 2026."
        : "Showing regular prices.";
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setMode(btn.getAttribute("data-mode"));
    });
  });
  setMode("launch");

  /* ---------- FAQ accordion ---------- */
  var triggers = document.querySelectorAll(".acc-trigger");

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var expanded = trigger.getAttribute("aria-expanded") === "true";
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));
      trigger.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (panel) panel.hidden = expanded;
    });
  });
})();
