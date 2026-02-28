/* ============================================================
   HearTrackerr – Main JS
   FAQ accordion · Smooth scroll · Reduced-motion aware
   ============================================================ */

(function () {
  "use strict";

  /* ----- FAQ accordion ----- */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.querySelectorAll(".faq-item__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const item = btn.closest(".faq-item");
      const answer = item.querySelector(".faq-item__answer");
      const isOpen = item.hasAttribute("open");

      if (isOpen) {
        // Close
        if (!prefersReducedMotion) {
          answer.style.maxHeight = answer.scrollHeight + "px";
          requestAnimationFrame(function () {
            answer.style.maxHeight = "0";
            answer.style.overflow = "hidden";
          });
          answer.addEventListener(
            "transitionend",
            function () {
              item.removeAttribute("open");
              answer.style.maxHeight = "";
              answer.style.overflow = "";
            },
            { once: true }
          );
        } else {
          item.removeAttribute("open");
        }
      } else {
        // Open
        item.setAttribute("open", "");
        if (!prefersReducedMotion) {
          answer.style.maxHeight = "0";
          answer.style.overflow = "hidden";
          requestAnimationFrame(function () {
            answer.style.transition = "max-height 0.3s ease";
            answer.style.maxHeight = answer.scrollHeight + "px";
          });
          answer.addEventListener(
            "transitionend",
            function () {
              answer.style.maxHeight = "";
              answer.style.overflow = "";
              answer.style.transition = "";
            },
            { once: true }
          );
        }
      }
    });
  });

  /* ----- Smooth scroll for anchor links (respects reduced-motion via CSS) ----- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ----- Year in footer ----- */
  var yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
