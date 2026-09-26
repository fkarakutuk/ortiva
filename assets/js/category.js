(function () {
  'use strict';

  var grid = document.getElementById('productGrid');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card-product'));
  var resultCount = document.getElementById('resultCount');
  var noResults = document.getElementById('noResults');
  var filterBar = document.getElementById('filterBar');
  if (!filterBar) return;

  var state = { phase: 'all', amperage: 'all', type: 'all', ip: 'all', q: '' };

  function applyFilters() {
    var visible = 0;
    cards.forEach(function (card) {
      var matches =
        (state.phase === 'all' || card.dataset.phase === state.phase) &&
        (state.amperage === 'all' || card.dataset.amperage === state.amperage) &&
        (state.type === 'all' || card.dataset.type === state.type) &&
        (state.ip === 'all' || card.dataset.ip === state.ip) &&
        (state.q === '' || (card.dataset.search || '').indexOf(state.q) !== -1);
      card.style.display = matches ? '' : 'none';
      if (matches) visible++;
    });
    if (resultCount) resultCount.textContent = visible + (visible === 1 ? ' ürün listeleniyor' : ' ürün listeleniyor');
    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
  }

  filterBar.querySelectorAll('[data-filter-chip]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var group = chip.getAttribute('data-filter-chip');
      var value = chip.getAttribute('data-value');
      filterBar.querySelectorAll('[data-filter-chip="' + group + '"]').forEach(function (c) {
        c.classList.remove('is-active');
      });
      chip.classList.add('is-active');
      state[group] = value;
      applyFilters();
    });
  });

  filterBar.querySelectorAll('[data-filter-select]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      state[sel.getAttribute('data-filter-select')] = sel.value;
      applyFilters();
    });
  });

  var miniSearch = document.getElementById('categorySearch');
  if (miniSearch) {
    miniSearch.addEventListener('input', function () {
      state.q = miniSearch.value.trim().toLowerCase();
      applyFilters();
    });
  }

  var resetBtn = document.getElementById('filterReset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      state = { phase: 'all', amperage: 'all', type: 'all', ip: 'all', q: '' };
      filterBar.querySelectorAll('.chip-toggle').forEach(function (c, i) {
        c.classList.toggle('is-active', c.getAttribute('data-value') === 'all');
      });
      filterBar.querySelectorAll('select').forEach(function (s) { s.value = 'all'; });
      if (miniSearch) miniSearch.value = '';
      applyFilters();
    });
  }

  applyFilters();
})();
