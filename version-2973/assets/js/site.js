(function () {
    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
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
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
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
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initQuickSearch() {
        var form = document.querySelector('[data-global-search]');
        if (!form) {
            return;
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input');
            var value = input ? input.value.trim() : '';
            var target = form.getAttribute('data-target') || 'library.html';
            if (value) {
                window.location.href = target + '?q=' + encodeURIComponent(value);
            } else {
                window.location.href = target;
            }
        });
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var grid = document.querySelector('[data-movie-grid]');
        if (!panel || !grid) {
            return;
        }
        var input = panel.querySelector('[data-search-input]');
        var typeFilter = panel.querySelector('[data-type-filter]');
        var yearFilter = panel.querySelector('[data-year-filter]');
        var regionFilter = panel.querySelector('[data-region-filter]');
        var sortFilter = panel.querySelector('[data-sort-filter]');
        var empty = document.querySelector('[data-empty-state]');
        var initialCards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && input) {
            input.value = query;
        }

        function matches(card) {
            var keyword = normalize(input && input.value);
            var typeValue = normalize(typeFilter && typeFilter.value);
            var yearValue = normalize(yearFilter && yearFilter.value);
            var regionValue = normalize(regionFilter && regionFilter.value);
            var text = normalize([
                card.getAttribute('data-card-title'),
                card.getAttribute('data-card-type'),
                card.getAttribute('data-card-region'),
                card.getAttribute('data-card-genre'),
                card.getAttribute('data-card-category'),
                card.textContent
            ].join(' '));
            var cardType = normalize(card.getAttribute('data-card-type'));
            var cardYear = normalize(card.getAttribute('data-card-year'));
            var cardRegion = normalize(card.getAttribute('data-card-region'));

            if (keyword && text.indexOf(keyword) === -1) {
                return false;
            }
            if (typeValue && cardType !== typeValue) {
                return false;
            }
            if (yearValue && cardYear !== yearValue) {
                return false;
            }
            if (regionValue && cardRegion !== regionValue) {
                return false;
            }
            return true;
        }

        function sortCards(cards) {
            var mode = sortFilter ? sortFilter.value : 'year-desc';
            var sorted = cards.slice();
            sorted.sort(function (a, b) {
                var yearA = Number(a.getAttribute('data-card-year') || 0);
                var yearB = Number(b.getAttribute('data-card-year') || 0);
                var titleA = normalize(a.getAttribute('data-card-title'));
                var titleB = normalize(b.getAttribute('data-card-title'));
                if (mode === 'year-asc') {
                    return yearA - yearB || titleA.localeCompare(titleB, 'zh-Hans-CN');
                }
                if (mode === 'title-asc') {
                    return titleA.localeCompare(titleB, 'zh-Hans-CN') || yearB - yearA;
                }
                if (mode === 'hot-desc') {
                    return initialCards.indexOf(a) - initialCards.indexOf(b);
                }
                return yearB - yearA || titleA.localeCompare(titleB, 'zh-Hans-CN');
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function apply() {
            var visible = 0;
            initialCards.forEach(function (card) {
                var ok = matches(card);
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            sortCards(initialCards);
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, typeFilter, yearFilter, regionFilter, sortFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initQuickSearch();
        initFilters();
    });
})();
