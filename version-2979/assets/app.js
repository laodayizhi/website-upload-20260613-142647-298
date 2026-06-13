(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });

      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var searchParams = new URLSearchParams(window.location.search);
  var query = searchParams.get('q') || '';
  var localSearch = document.querySelector('[data-local-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var activeFilter = 'all';

  function applyFilter() {
    var keyword = localSearch ? localSearch.value.trim().toLowerCase() : '';

    cards.forEach(function (card) {
      var cardText = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-tags') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();

      var cardType = card.getAttribute('data-type') || '';
      var matchesKeyword = !keyword || cardText.indexOf(keyword) !== -1;
      var matchesType = activeFilter === 'all' || cardType === activeFilter;

      card.classList.toggle('is-hidden', !(matchesKeyword && matchesType));
    });
  }

  if (localSearch) {
    if (query) {
      localSearch.value = query;
    }

    localSearch.addEventListener('input', applyFilter);
    applyFilter();
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeFilter = chip.getAttribute('data-filter') || 'all';

      chips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });

      applyFilter();
    });
  });
})();

function setupMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var trigger = document.querySelector('[data-play-trigger]');
  var attached = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      attached = true;
      return;
    }

    video.src = streamUrl;
    attached = true;
  }

  function playVideo() {
    attachStream();

    if (trigger) {
      trigger.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (trigger) {
          trigger.classList.remove('is-hidden');
        }
      });
    }
  }

  if (trigger) {
    trigger.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (trigger) {
      trigger.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (trigger && video.currentTime === 0) {
      trigger.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
    }
  });
}
