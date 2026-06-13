(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    function toggle() {
      if (window.scrollY > 480) {
        button.classList.add("is-visible");
      } else {
        button.classList.remove("is-visible");
      }
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      play();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
    show(0);
    play();
  }

  function initLocalFilter() {
    var area = document.querySelector("[data-filter-area]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!area || !grid) {
      return;
    }
    var input = area.querySelector("[data-local-search]");
    var select = area.querySelector("[data-sort-select]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applySearch() {
      var keyword = normalize(input && input.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-category") + " " + card.textContent);
        card.style.display = !keyword || text.indexOf(keyword) !== -1 ? "" : "none";
      });
    }

    function sortCards() {
      var mode = select ? select.value : "default";
      var sorted = cards.slice();
      if (mode === "popular") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        });
      } else if (mode === "latest") {
        sorted.sort(function (a, b) {
          return String(b.getAttribute("data-date")).localeCompare(String(a.getAttribute("data-date")));
        });
      } else if (mode === "year") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      } else {
        sorted.sort(function (a, b) {
          return Number(a.getAttribute("data-views")) - Number(b.getAttribute("data-views"));
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      applySearch();
    }

    if (input) {
      input.addEventListener("input", applySearch);
    }
    if (select) {
      select.addEventListener("change", sortCards);
    }
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"movie-poster\" href=\"" + movie.href + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"movie-duration\">" + escapeHtml(movie.duration) + "</span>" +
      "<span class=\"movie-play\">▶</span>" +
      "</a>" +
      "<div class=\"movie-info\">" +
      "<a class=\"movie-title\" href=\"" + movie.href + "\">" + escapeHtml(movie.title) + "</a>" +
      "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"movie-meta\"><a href=\"" + movie.categoryHref + "\">" + escapeHtml(movie.category) + "</a><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
      "<div class=\"movie-tags\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.searchItems) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    if (input) {
      input.value = query;
    }
    var normalized = query.toLowerCase().trim();
    var items;
    if (normalized) {
      items = window.searchItems.filter(function (movie) {
        var text = [movie.title, movie.oneLine, movie.region, movie.year, movie.category, movie.genre, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        return text.indexOf(normalized) !== -1;
      });
      if (title) {
        title.textContent = "搜索结果：" + query;
      }
    } else {
      items = window.searchItems.slice(0, 24);
      if (title) {
        title.textContent = "热门影片";
      }
    }
    results.innerHTML = items.slice(0, 120).map(movieCard).join("");
  }

  window.setupMoviePlayer = function (source) {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var button = player.querySelector(".player-play-button");
    var loaded = false;
    var hlsInstance = null;

    function loadSource() {
      if (loaded || !video) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      loadSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }
    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initBackTop();
    initHero();
    initLocalFilter();
    initSearchPage();
  });
})();
