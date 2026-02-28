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

  /* ----- FAQ accordion (delegated for dynamic items) ----- */
  function initFaqAccordion(container) {
    container.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq-item__btn");
      if (!btn) return;

      var item = btn.closest(".faq-item");
      var answer = item.querySelector(".faq-item__answer");
      var isOpen = item.hasAttribute("open");

      if (isOpen) {
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
              btn.setAttribute("aria-expanded", "false");
              answer.setAttribute("hidden", "");
              answer.style.maxHeight = "";
              answer.style.overflow = "";
            },
            { once: true }
          );
        } else {
          item.removeAttribute("open");
          btn.setAttribute("aria-expanded", "false");
          answer.setAttribute("hidden", "");
        }
      } else {
        item.setAttribute("open", "");
        btn.setAttribute("aria-expanded", "true");
        answer.removeAttribute("hidden");
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
  }

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

  /* ----- Reviews from JSON ----- */
  (function loadReviews() {
    var section = document.getElementById("reviews");
    var grid = document.getElementById("testimonials-grid");
    if (!section || !grid) return;

    fetch("assets/reviews.json")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.render) return;

        var shown = data.reviews.filter(function (r) { return r.shown; });
        if (shown.length === 0) return;

        shown.forEach(function (review) {
          var filled = Math.min(Math.max(Math.round(review.stars), 0), 5);
          var stars = "★".repeat(filled) + "☆".repeat(5 - filled);

          var card = document.createElement("div");
          card.className = "testimonial";
          card.innerHTML =
            '<div class="testimonial__stars" aria-label="' + filled + ' out of 5 stars">' + stars + "</div>" +
            '<p class="testimonial__quote">"' + escapeHTML(review.message) + '"</p>' +
            '<p class="testimonial__author">— ' + escapeHTML(review.name) + "</p>";
          grid.appendChild(card);
        });

        section.removeAttribute("hidden");
      })
      .catch(function () { /* silently hide section if JSON fails */ });
  })();

  /* ----- FAQ from JSON ----- */
  (function loadFaq() {
    var section = document.getElementById("faq");
    var list = document.getElementById("faq-list");
    if (!section || !list) return;

    fetch("assets/faq.json")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.render) return;

        var shown = data.faqs.filter(function (f) { return f.shown; });
        if (shown.length === 0) return;

        shown.forEach(function (faq) {
          var item = document.createElement("div");
          item.className = "faq-item";
          item.innerHTML =
            '<button class="faq-item__btn" aria-expanded="false">' +
              "<span>" + escapeHTML(faq.question) + "</span>" +
              '<svg class="faq-item__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">' +
                '<line x1="10" y1="4" x2="10" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
                '<line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
              "</svg>" +
            "</button>" +
            '<div class="faq-item__answer" hidden>' +
              "<p>" + escapeHTML(faq.answer) + "</p>" +
            "</div>";
          list.appendChild(item);
        });

        initFaqAccordion(list);
        section.removeAttribute("hidden");
      })
      .catch(function () { /* silently hide section if JSON fails */ });
  })();

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ----- Year in footer ----- */
  var yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
