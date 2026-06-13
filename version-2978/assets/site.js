(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function normalize(text) {
        return String(text || "").toLowerCase().replace(/\s+/g, "");
    }

    function initLocalSearch() {
        var forms = document.querySelectorAll("[data-local-search]");
        forms.forEach(function (form) {
            var input = form.querySelector("input");
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
            var empty = document.querySelector("[data-empty-state]");
            function applySearch() {
                var query = normalize(input.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.dataset.region,
                        card.dataset.year
                    ].join(" "));
                    var ok = !query || text.indexOf(query) !== -1;
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                applySearch();
            });
            input.addEventListener("input", applySearch);
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                input.value = q;
                applySearch();
            }
        });
    }

    function initFilters() {
        var row = document.querySelector("[data-filter-row]");
        if (!row) {
            return;
        }
        var chips = Array.prototype.slice.call(row.querySelectorAll("[data-filter]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var empty = document.querySelector("[data-empty-state]");
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("active");
                });
                chip.classList.add("active");
                var value = chip.dataset.filter;
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [card.dataset.genre, card.dataset.tags].join(" ");
                    var ok = value === "all" || text.indexOf(value) !== -1;
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            });
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("active", idx === index);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("active", idx === index);
            });
        }
        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                show(idx);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initPlayer() {
        var video = document.getElementById("moviePlayer");
        var trigger = document.querySelector("[data-play]");
        if (!video || !trigger) {
            return;
        }
        var stream = video.getAttribute("data-stream");
        var attached = false;
        var requested = false;
        var hlsInstance = null;

        function prepare() {
            if (attached || !stream) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }
            if (typeof Hls !== "undefined" && Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    if (requested) {
                        video.play().catch(function () {});
                    }
                });
                return;
            }
            video.src = stream;
        }

        function start() {
            requested = true;
            prepare();
            trigger.classList.add("is-hidden");
            video.play().catch(function () {});
        }

        trigger.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initLocalSearch();
        initFilters();
        initHero();
        initPlayer();
    });
})();
