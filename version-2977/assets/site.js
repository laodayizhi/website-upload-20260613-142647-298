(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = qs('[data-menu-button]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    qsa('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        var url = './search.html';
        if (value) {
          url += '?q=' + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function setupHeroSlider() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var list = qs('[data-filter-list]');
    var panel = qs('[data-filter-panel]');
    if (!list || !panel) {
      return;
    }
    var input = qs('[data-filter-input]', panel);
    var year = qs('[data-filter-year]', panel);
    var type = qs('[data-filter-type]', panel);
    var category = qs('[data-filter-category]', panel);
    var empty = qs('[data-empty-state]');
    var cards = qsa('[data-movie-card]', list);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }

    function apply() {
      var text = normalize(input ? input.value : '');
      var yearValue = year ? year.value : 'all';
      var typeValue = type ? type.value : 'all';
      var categoryValue = category ? category.value : 'all';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matchText = !text || haystack.indexOf(text) !== -1;
        var matchYear = yearValue === 'all' || card.getAttribute('data-year') === yearValue;
        var matchType = typeValue === 'all' || card.getAttribute('data-type') === typeValue;
        var matchCategory = categoryValue === 'all' || card.getAttribute('data-category') === categoryValue;
        var ok = matchText && matchYear && matchType && matchCategory;
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function playVideo(box) {
    var video = qs('video', box);
    var src = box.getAttribute('data-video-src');
    if (!video || !src) {
      return;
    }
    box.classList.add('is-playing');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = src;
      }
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!box.hlsInstance) {
        var hls = new window.Hls({ enableWorker: true });
        box.hlsInstance = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
      return;
    }
    if (!video.src) {
      video.src = src;
    }
    video.play().catch(function () {});
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (box) {
      var button = qs('.play-trigger', box);
      var video = qs('video', box);
      if (button) {
        button.addEventListener('click', function () {
          playVideo(box);
        });
      }
      if (video) {
        video.addEventListener('play', function () {
          box.classList.add('is-playing');
        });
        video.addEventListener('click', function () {
          if (!box.classList.contains('is-playing')) {
            playVideo(box);
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearchForms();
    setupHeroSlider();
    setupFilters();
    setupPlayers();
  });
})();
