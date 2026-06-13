(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  const backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let activeIndex = 0;
    let timer = null;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    prev?.addEventListener('click', () => {
      showSlide(activeIndex - 1);
      start();
    });

    next?.addEventListener('click', () => {
      showSlide(activeIndex + 1);
      start();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  const normalize = (value) => String(value || '').trim().toLowerCase();

  document.querySelectorAll('[data-card-grid]').forEach((grid) => {
    const section = grid.closest('section') || document;
    const input = section.querySelector('[data-card-search]');
    const selects = Array.from(section.querySelectorAll('[data-filter-field]'));
    const summary = section.querySelector('[data-filter-summary]');
    const cards = Array.from(grid.querySelectorAll('.movie-card'));

    const applyFilters = () => {
      const keyword = normalize(input?.value);
      const filters = new Map(selects.map((select) => [select.dataset.filterField, normalize(select.value)]));
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.category,
          card.textContent
        ].join(' '));

        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesFilters = Array.from(filters.entries()).every(([field, value]) => {
          if (!value) {
            return true;
          }

          return normalize(card.dataset[field]).includes(value);
        });

        const shouldShow = matchesKeyword && matchesFilters;
        card.classList.toggle('is-hidden-by-filter', !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (summary) {
        summary.textContent = `当前展示 ${visible} / ${cards.length} 部影片`;
      }
    };

    input?.addEventListener('input', applyFilters);
    selects.forEach((select) => select.addEventListener('change', applyFilters));
    applyFilters();
  });

  const searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    const input = searchPage.querySelector('[data-json-search]');
    const typeSelect = searchPage.querySelector('[data-json-type]');
    const categorySelect = searchPage.querySelector('[data-json-category]');
    const results = searchPage.querySelector('[data-json-results]');
    const summary = searchPage.querySelector('[data-json-summary]');
    let movies = [];

    const renderCard = (movie) => {
      const tags = [movie.region, movie.type, movie.year, movie.category]
        .filter(Boolean)
        .slice(0, 4)
        .map((tag) => `<span>${escapeHtml(tag)}</span>`)
        .join('');

      return `
        <article class="movie-card">
          <a class="poster-link" href="${movie.url}" aria-label="观看${escapeHtml(movie.title)}">
            <img src="${movie.image}" alt="${escapeHtml(movie.title)}" loading="lazy">
            <span class="poster-shade"></span>
            <span class="play-chip">播放</span>
          </a>
          <div class="movie-card-body">
            <div class="movie-meta-line">
              <a href="category/${movie.categorySlug}.html">${escapeHtml(movie.category)}</a>
              <span>${escapeHtml(movie.year)}</span>
            </div>
            <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
            <p>${escapeHtml(movie.oneLine || movie.summary || '')}</p>
            <div class="tag-row">${tags}</div>
          </div>
        </article>`;
    };

    const runSearch = () => {
      if (!results) {
        return;
      }

      const keyword = normalize(input?.value);
      const typeValue = normalize(typeSelect?.value);
      const categoryValue = normalize(categorySelect?.value);

      const filtered = movies.filter((movie) => {
        const haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.category,
          movie.oneLine,
          movie.summary
        ].join(' '));

        return (!keyword || haystack.includes(keyword)) &&
          (!typeValue || normalize(movie.type).includes(typeValue)) &&
          (!categoryValue || normalize(movie.category).includes(categoryValue));
      }).slice(0, 120);

      results.innerHTML = filtered.map(renderCard).join('');

      if (summary) {
        summary.textContent = `找到 ${filtered.length} 条结果，最多显示前 120 条`;
      }
    };

    fetch('assets/movies.json')
      .then((response) => response.json())
      .then((data) => {
        movies = Array.isArray(data) ? data : [];
        runSearch();
      })
      .catch(() => {
        if (summary) {
          summary.textContent = '搜索数据加载失败，请直接浏览首页或分类页。';
        }
      });

    input?.addEventListener('input', runSearch);
    typeSelect?.addEventListener('change', runSearch);
    categorySelect?.addEventListener('change', runSearch);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
