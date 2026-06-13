(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-nav-links]");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var hero = panel.closest(".page-hero") || document;
    var grid = document.querySelector("[data-filter-grid]");
    var empty = document.querySelector("[data-empty-state]");
    var input = panel.querySelector(".js-filter-input");
    var selects = Array.prototype.slice.call(panel.querySelectorAll(".js-filter-select"));

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function apply() {
      var query = normalize(input ? input.value : "");
      var activeFilters = selects.map(function (select) {
        return {
          key: select.getAttribute("data-filter-key"),
          value: normalize(select.value)
        };
      }).filter(function (item) {
        return item.value;
      });
      var visible = 0;

      cards.forEach(function (card) {
        var search = normalize(card.getAttribute("data-search"));
        var matchedQuery = !query || search.indexOf(query) !== -1;
        var matchedFilters = activeFilters.every(function (item) {
          return normalize(card.getAttribute("data-" + item.key)).indexOf(item.value) !== -1;
        });
        var showCard = matchedQuery && matchedFilters;
        card.hidden = !showCard;
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input && input.hasAttribute("data-auto-query")) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });

    apply();
  });
}());
