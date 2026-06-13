const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

function updateHeader() {
    if (!header) {
        return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 20);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (menuToggle && mobileNav && header) {
    menuToggle.addEventListener('click', () => {
        const open = !mobileNav.classList.contains('is-open');
        mobileNav.classList.toggle('is-open', open);
        header.classList.toggle('menu-active', open);
        document.body.classList.toggle('menu-open', open);
    });
}

const hero = document.querySelector('[data-hero]');
if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    const showSlide = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === current);
        });
    };
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
    if (slides.length > 1) {
        window.setInterval(() => showSlide(current + 1), 6200);
    }
}

function normalizeText(value) {
    return (value || '').toString().trim().toLowerCase();
}

const scopes = document.querySelectorAll('[data-filter-scope]');
scopes.forEach((scope) => {
    const section = scope.closest('section') || document;
    const input = scope.querySelector('[data-filter-input]');
    const year = scope.querySelector('[data-filter-year]');
    const type = scope.querySelector('[data-filter-type]');
    const region = scope.querySelector('[data-filter-region]');
    const cards = Array.from(section.querySelectorAll('[data-card]'));
    const empty = section.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
        input.value = params.get('q');
    }
    const apply = () => {
        const keyword = normalizeText(input ? input.value : '');
        const y = normalizeText(year ? year.value : '');
        const t = normalizeText(type ? type.value : '');
        const r = normalizeText(region ? region.value : '');
        let visible = 0;
        cards.forEach((card) => {
            const haystack = normalizeText(card.dataset.search);
            const cardYear = normalizeText(card.dataset.year);
            const cardType = normalizeText(card.dataset.type);
            const cardRegion = normalizeText(card.dataset.region);
            const matched = (!keyword || haystack.includes(keyword)) && (!y || cardYear === y) && (!t || cardType === t) && (!r || cardRegion === r);
            card.classList.toggle('is-hidden-card', !matched);
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    };
    [input, year, type, region].forEach((control) => {
        if (control) {
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        }
    });
    apply();
});

const player = document.querySelector('[data-player]');
if (player) {
    const trigger = document.querySelector('[data-play-trigger]');
    const stream = player.dataset.stream;
    let prepared = false;
    let hlsInstance = null;

    async function preparePlayer() {
        if (prepared || !stream) {
            return;
        }
        prepared = true;
        if (player.canPlayType('application/vnd.apple.mpegurl')) {
            player.src = stream;
            return;
        }
        try {
            const module = await import('./hls-dru42stk.js');
            const Hls = module.H;
            if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(player);
            } else {
                player.src = stream;
            }
        } catch (error) {
            player.src = stream;
        }
    }

    async function startPlayer() {
        await preparePlayer();
        if (trigger) {
            trigger.classList.add('is-hidden');
        }
        const promise = player.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(() => {});
        }
    }

    if (trigger) {
        trigger.addEventListener('click', startPlayer);
    }
    player.addEventListener('play', () => {
        if (trigger) {
            trigger.classList.add('is-hidden');
        }
    });
    player.addEventListener('click', () => {
        if (!prepared) {
            startPlayer();
        }
    });
    window.addEventListener('beforeunload', () => {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
        }
    });
}
