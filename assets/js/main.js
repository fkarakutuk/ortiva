(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- */
  /* Header scroll state                                               */
  /* ---------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------------------------------------------------------- */
  /* Mega menu                                                          */
  /* ---------------------------------------------------------------- */
  var megaTrigger = document.getElementById('megaTrigger');
  var megaMenu = document.getElementById('megaMenu');
  var megaList = document.getElementById('megaList');
  var megaVisualImg = document.getElementById('megaVisualImg');
  var megaVisualTitle = document.getElementById('megaVisualTitle');
  var megaOpen = false;
  var megaCloseTimer = null;

  function openMega() {
    clearTimeout(megaCloseTimer);
    if (!megaMenu) return;
    megaMenu.classList.add('is-open');
    megaTrigger.setAttribute('aria-expanded', 'true');
    megaOpen = true;
  }
  function closeMega() {
    if (!megaMenu) return;
    megaMenu.classList.remove('is-open');
    megaTrigger.setAttribute('aria-expanded', 'false');
    megaOpen = false;
  }
  function scheduleClose() {
    megaCloseTimer = setTimeout(closeMega, 220);
  }

  if (megaTrigger && megaMenu) {
    megaTrigger.addEventListener('click', function () {
      megaOpen ? closeMega() : openMega();
    });
    megaTrigger.addEventListener('mouseenter', openMega);
    megaMenu.addEventListener('mouseenter', function () { clearTimeout(megaCloseTimer); });
    megaTrigger.addEventListener('mouseleave', scheduleClose);
    megaMenu.addEventListener('mouseleave', scheduleClose);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMega();
    });
    document.addEventListener('click', function (e) {
      if (megaOpen && !megaMenu.contains(e.target) && e.target !== megaTrigger) closeMega();
    });

    if (megaList) {
      megaList.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('mouseenter', function () {
          var img = a.getAttribute('data-cat-img');
          var name = a.getAttribute('data-cat-name');
          if (img && megaVisualImg) megaVisualImg.src = img;
          if (name && megaVisualTitle) megaVisualTitle.textContent = name;
        });
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Mobile nav                                                         */
  /* ---------------------------------------------------------------- */
  var mobileTrigger = document.getElementById('mobileTrigger');
  var mobileNav = document.getElementById('mobileNav');
  var mobileClose = document.getElementById('mobileClose');
  var mobileSubTrigger = document.getElementById('mobileSubTrigger');
  var mobileSub = document.getElementById('mobileSub');

  function openMobile() {
    mobileNav.classList.add('is-open');
    mobileTrigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  }
  function closeMobile() {
    mobileNav.classList.remove('is-open');
    mobileTrigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }
  if (mobileTrigger && mobileNav) {
    mobileTrigger.addEventListener('click', openMobile);
    mobileClose && mobileClose.addEventListener('click', closeMobile);
  }
  if (mobileSubTrigger && mobileSub) {
    mobileSubTrigger.addEventListener('click', function () {
      var isOpen = mobileSub.classList.toggle('is-open');
      mobileSubTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  /* ---------------------------------------------------------------- */
  /* Search overlay                                                     */
  /* ---------------------------------------------------------------- */
  var searchTrigger = document.getElementById('searchTrigger');
  var searchOverlay = document.getElementById('searchOverlay');
  var searchClose = document.getElementById('searchClose');
  var searchInput = document.getElementById('searchInput');
  var searchResults = document.getElementById('searchResults');
  var ROOT_PREFIX = '../'.repeat(window.ORTIVA_DEPTH || 0);

  function openSearch() {
    searchOverlay.classList.add('is-open');
    document.body.classList.add('no-scroll');
    setTimeout(function () { searchInput && searchInput.focus(); }, 60);
  }
  function closeSearch() {
    searchOverlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }
  if (searchTrigger) searchTrigger.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSearch();
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      openSearch();
    }
  });
  if (searchOverlay) {
    searchOverlay.addEventListener('click', function (e) {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  function formatPrice(p, priceOnRequest) {
    if (priceOnRequest || p == null) return 'Fiyat İçin İletişime Geçin';
    return p.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
  }

  function runSearch(q) {
    if (!window.ORTIVA_DATA) return;
    q = (q || '').trim().toLowerCase();
    searchResults.innerHTML = '';
    if (q.length < 2) return;
    var products = window.ORTIVA_DATA.products;
    var catBySlug = {};
    window.ORTIVA_DATA.categories.forEach(function (c) { catBySlug[c.slug] = c; });

    var scored = [];
    products.forEach(function (p) {
      var hay = (p.code + ' ' + p.name + ' ' + (catBySlug[p.category] ? catBySlug[p.category].name : '') + ' ' + Object.values(p.specs || {}).join(' ')).toLowerCase();
      var score = 0;
      if (p.code.toLowerCase().replace(/\s+/g, '') === q.replace(/\s+/g, '')) score += 100;
      else if (p.code.toLowerCase().indexOf(q) !== -1) score += 40;
      if (hay.indexOf(q) !== -1) score += 10;
      q.split(/\s+/).forEach(function (term) {
        if (term.length > 1 && hay.indexOf(term) !== -1) score += 3;
      });
      if (score > 0) scored.push({ p: p, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    scored = scored.slice(0, 8);

    if (!scored.length) {
      searchResults.innerHTML = '<div class="search-empty">"' + q.replace(/</g, '') + '" için sonuç bulunamadı. Kataloğumuzda binlerce kalem bulunuyor — satış ekibimize sorabilirsiniz.</div>';
      return;
    }
    scored.forEach(function (item) {
      var p = item.p;
      var cat = catBySlug[p.category];
      var a = document.createElement('a');
      a.className = 'search-result';
      a.href = ROOT_PREFIX + 'product/' + p.slug + '/index.html';
      a.innerHTML =
        '<span>' +
          '<span class="r-name">' + p.name + '</span><br>' +
          '<span class="r-meta">' + (cat ? cat.name : '') + '</span>' +
        '</span>' +
        '<span class="r-code">' + p.code + '</span>';
      searchResults.appendChild(a);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () { runSearch(searchInput.value); });
  }
  document.querySelectorAll('.search-hint button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      searchInput.value = btn.getAttribute('data-q');
      searchInput.focus();
      runSearch(searchInput.value);
    });
  });

  /* ---------------------------------------------------------------- */
  /* Reveal on scroll                                                   */
  /* ---------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------- */
  /* Back-to-top                                                        */
  /* ---------------------------------------------------------------- */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    function onScrollBackToTop() {
      if (window.scrollY > 480) backToTop.classList.add('is-visible');
      else backToTop.classList.remove('is-visible');
    }
    window.addEventListener('scroll', onScrollBackToTop, { passive: true });
    onScrollBackToTop();
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Misc                                                               */
  /* ---------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  window.ORTIVA = window.ORTIVA || {};
  window.ORTIVA.formatPrice = formatPrice;
  window.ORTIVA.rootPrefix = ROOT_PREFIX;
  window.ORTIVA.prefersReducedMotion = prefersReducedMotion;
})();
