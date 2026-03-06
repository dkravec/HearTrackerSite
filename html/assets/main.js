/* ============================================================
   HearTracker – Main JS
   Nav/footer injection · FAQ accordion · Smooth scroll · JSON loaders
   ============================================================
   Each page has header & footer HTML shells with empty <ul> and <p>
   elements. This script fills in nav links, footer links, and the
   footer copyright line from one central definition — no fetch needed.
   ============================================================ */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ----- Resolve base path for JSON fetches ----- */
  var scripts = document.getElementsByTagName("script");
  var assetBase = "";
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].getAttribute("src") || "";
    if (src.indexOf("main.js") !== -1) {
      assetBase = src.replace("main.js", "");
      break;
    }
  }

  /* ----- Nav & footer link definitions (edit here to update all pages) ----- */
  var NAV_LINKS = [
    { href: "#features", text: "Features", class: "nav-link--text" },
    { href: "#how-it-works", text: "How It Works", class: "nav-link--text" },
    { href: "#faq", text: "FAQ", class: "nav-link--text" },
    { href: "https://apps.apple.com/app/heartracker/id6759507667", text: "Get the App", class: "btn btn--outline btn--small", external: true }
  ];

  var FOOTER_LINKS = [
    { href: "support/", text: "Support" },
    { href: "privacy/", text: "Privacy Policy" },
    { href: "changelog/", text: "Changelog" },
    { href: "mailto:daniel@dkravec.net", text: "Contact", absolute: true },
    { href: "https://novapro.net", text: "novapro.net", absolute: true, external: true }
  ];

  var FOOTER_COPY = "&copy; " + new Date().getFullYear() + " HearTracker. All rights reserved.";

  /* ----- Derive site root from script path ----- */
  // assetBase is "assets/" from root or "../assets/" from sub-pages.
  // Strip "assets/" to get the page-to-root prefix ("" or "../").
  var siteRoot = assetBase.replace("assets/", "");

  /* ----- Inject nav links ----- */
  (function injectNavLinks() {
    var ul = document.getElementById("nav-links");
    if (!ul) return;

    NAV_LINKS.forEach(function (link) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      // Handle external links and anchors differently
      if (link.external) {
        a.href = link.href;
        a.target = "_blank";
        a.rel = "noopener";
      } else {
        a.href = link.href.charAt(0) === "#"
          ? (siteRoot ? "/" + link.href : link.href)
          : siteRoot + link.href;
      }
      a.textContent = link.text;
      if (link.class) a.className = link.class;
      li.appendChild(a);
      ul.appendChild(li);
    });
  })();

  /* ----- Inject footer links ----- */
  (function injectFooterLinks() {
    var ul = document.getElementById("footer-links");
    if (!ul) return;

    FOOTER_LINKS.forEach(function (link) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = link.absolute ? link.href : siteRoot + link.href;
      a.textContent = link.text;
      if (link.external) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      li.appendChild(a);
      ul.appendChild(li);
    });
  })();

  /* ----- Inject footer copy ----- */
  (function injectFooterCopy() {
    var p = document.getElementById("footer-copy");
    if (!p) return;
    p.innerHTML = FOOTER_COPY;
  })();

  /* ----- Shared helpers ----- */
  function escapeHTML(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ----- Smooth scroll (delegated — works for all anchor links) ----- */
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;

    var hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    var target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
      target.focus({ preventScroll: true });
    }
  });

  /* ----- FAQ accordion (delegated for dynamic items) ----- */
  function initFaqAccordion(container) {
    container.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq-item__btn");
      if (!btn) return;

      var item = btn.closest(".faq-item");
      var isOpen = item.hasAttribute("open");

      if (isOpen) {
        item.removeAttribute("open");
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.setAttribute("open", "");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  }

  /* ----- Reviews from JSON ----- */
  (function loadReviews() {
    var section = document.getElementById("reviews");
    var grid = document.getElementById("testimonials-grid");
    if (!section || !grid) return;

    fetch(assetBase + "reviews.json")
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

    fetch(assetBase + "faq.json")
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
            '<div class="faq-item__answer">' +
              "<p>" + escapeHTML(faq.answer) + "</p>" +
            "</div>";
          list.appendChild(item);
        });

        initFaqAccordion(list);
        section.removeAttribute("hidden");
      })
      .catch(function () { /* silently hide section if JSON fails */ });
  })();

  /* ----- Changelog from JSON ----- */
  (function loadChangelog() {
    var list = document.getElementById("changelog-list");
    if (!list) return;

    fetch(assetBase + "changelog.json")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.render) return;

        var shown = data.entries.filter(function (e) { return e.shown; });
        if (shown.length === 0) {
          list.innerHTML = '<p style="color:var(--clr-text-muted)">No releases yet.</p>';
          return;
        }

        shown.forEach(function (entry) {
          var el = document.createElement("div");
          el.className = "changelog-entry";

          var changesHtml = entry.changes
            .map(function (c) { return "<li>" + escapeHTML(c) + "</li>"; })
            .join("");

          el.innerHTML =
            '<h2 class="changelog-entry__version">v' + escapeHTML(entry.version) + "</h2>" +
            '<time class="changelog-entry__date" datetime="' + escapeHTML(entry.date) + '">' + escapeHTML(entry.date) + "</time>" +
            "<ul>" + changesHtml + "</ul>";

          list.appendChild(el);
        });
      })
      .catch(function () {
        list.innerHTML = '<p style="color:var(--clr-text-muted)">Could not load changelog.</p>';
      });
  })();

})();
