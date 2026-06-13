(function () {
    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('.site-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (input && normalize(input.value)) {
                    return;
                }
                event.preventDefault();
                window.location.href = './search.html';
            });
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-target]'));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('active', thumbIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                show(parseInt(thumb.getAttribute('data-hero-target'), 10) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
            var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
            var empty = scope.querySelector('[data-empty-state]');
            var activeValue = 'all';

            if (scope.hasAttribute('data-url-query')) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q') || '';
                if (input && q) {
                    input.value = q;
                }
            }

            function apply() {
                var query = input ? normalize(input.value) : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var typeGroup = card.getAttribute('data-group') || '';
                    var category = card.getAttribute('data-category') || '';
                    var matchText = !query || text.indexOf(query) !== -1;
                    var matchChip = activeValue === 'all' || typeGroup === activeValue || category === activeValue;
                    var showCard = matchText && matchChip;
                    card.style.display = showCard ? '' : 'none';
                    if (showCard) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    activeValue = chip.getAttribute('data-filter-value') || 'all';
                    chips.forEach(function (item) {
                        item.classList.toggle('active', item === chip);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    window.setupMoviePlayer = function (videoUrl) {
        onReady(function () {
            var video = document.querySelector('.movie-video');
            var overlay = document.querySelector('.play-overlay');
            var button = document.querySelector('.play-button');
            var hls = null;
            var loaded = false;

            function beginPlayback() {
                if (!video || !videoUrl) {
                    return;
                }
                if (!loaded) {
                    loaded = true;
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = videoUrl;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(videoUrl);
                        hls.attachMedia(video);
                    } else {
                        video.src = videoUrl;
                    }
                }
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener('click', beginPlayback);
            }
            if (button) {
                button.addEventListener('click', beginPlayback);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!loaded) {
                        beginPlayback();
                    }
                });
            }
            window.addEventListener('beforeunload', function () {
                if (hls && hls.destroy) {
                    hls.destroy();
                }
            });
        });
    };

    onReady(function () {
        initNavigation();
        initHero();
        initFilters();
    });
}());
