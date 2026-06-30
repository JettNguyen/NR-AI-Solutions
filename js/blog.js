/* ========================================
   N&R AI Solutions | Blog Page
   js/blog.js
   ======================================== */

(function () {
  'use strict';

  var DATA_PATH = '../assets/articles.json';

  var featuredEl = document.getElementById('resourceFeatured');
  var gridEl = document.getElementById('resourceGrid');
  var searchEl = document.getElementById('blogSearch');
  var filtersEl = document.getElementById('resourceCategoryFilters');
  var countEl = document.getElementById('resourceCount');

  if (!featuredEl || !gridEl || !searchEl || !filtersEl || !countEl) {
    return;
  }

  var selectedCategory = 'All';

  function formatDate(isoDate) {
    var date = new Date(isoDate + 'T00:00:00');
    if (isNaN(date.getTime())) {
      return isoDate;
    }
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function makeFeatured(article) {
    var titleHtml = article.url
      ? '<h3><a href="' + article.url + '">' + article.title + '</a></h3>'
      : '<h3>' + article.title + '</h3>';
    var readMoreHtml = article.url
      ? '<a class="resource-read-more" href="' + article.url + '">Read the full story &rarr;</a>'
      : '';
    return [
      '<span class="resource-featured-label">Featured</span>',
      titleHtml,
      '<p>' + article.summary + '</p>',
      '<div class="resource-meta">',
      '<span>' + article.author + '</span>',
      '<span>' + formatDate(article.date) + '</span>',
      '<span>' + article.readTime + '</span>',
      '</div>',
      '<div class="resource-tag-cloud">',
      '<span class="resource-tag">' + article.category + '</span>',
      article.tags.map(function (tag) {
        return '<span class="resource-tag">' + tag + '</span>';
      }).join(''),
      '</div>',
      readMoreHtml
    ].join('');
  }

  function makeCard(article) {
    var titleHtml = article.url
      ? '<h3><a href="' + article.url + '">' + article.title + '</a></h3>'
      : '<h3>' + article.title + '</h3>';
    return [
      '<article class="resource-card" role="listitem">',
      '<p class="resource-card-kicker">' + article.category + '</p>',
      titleHtml,
      '<p>' + article.summary + '</p>',
      '<div class="resource-meta">',
      '<span>' + article.author + '</span>',
      '<span>' + formatDate(article.date) + '</span>',
      '<span>' + article.readTime + '</span>',
      '</div>',
      '</article>'
    ].join('');
  }

  function uniqueCategories(items) {
    var map = { All: true };
    items.forEach(function (item) {
      map[item.category] = true;
    });
    return Object.keys(map);
  }

  function renderFilters(items, onChange) {
    var categories = uniqueCategories(items);
    if (categories.length <= 1) {
      filtersEl.innerHTML = '';
      return;
    }

    filtersEl.innerHTML = categories.map(function (category) {
      var isActive = category === selectedCategory;
      return '<button class="resource-filter' + (isActive ? ' is-active' : '') + '" data-category="' + category + '" type="button">' + category + '</button>';
    }).join('');

    filtersEl.querySelectorAll('.resource-filter').forEach(function (button) {
      button.addEventListener('click', function () {
        selectedCategory = button.getAttribute('data-category') || 'All';
        onChange();
      });
    });
  }

  function matchesQuery(article, query) {
    if (!query) return true;
    var haystack = [
      article.title,
      article.summary,
      article.author,
      article.category,
      article.tags.join(' ')
    ].join(' ').toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function filterItems(items) {
    var query = searchEl.value.trim().toLowerCase();
    return items.filter(function (item) {
      var categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
      return categoryMatch && matchesQuery(item, query);
    });
  }

  function render(articles) {
    var filtered = filterItems(articles);
    var featured = filtered[0] || articles[0];

    if (!articles.length) {
      featuredEl.innerHTML = [
        '<span class="resource-featured-label">No Posts Yet</span>',
        '<h3>New articles are on the way.</h3>',
        '<p>Check back soon for AI notes and call recaps from the N&amp;R AI Solutions team.</p>'
      ].join('');
      gridEl.innerHTML = '';
      countEl.textContent = 'No published posts yet.';
      filtersEl.innerHTML = '';
      return;
    }

    featuredEl.innerHTML = featured ? makeFeatured(featured) : '<p>No featured article yet.</p>';

    gridEl.innerHTML = filtered.slice(1).map(makeCard).join('');
    countEl.textContent = filtered.length ? 'Showing ' + filtered.length + ' article' + (filtered.length > 1 ? 's' : '') + '.' : 'No matching articles yet.';

    renderFilters(articles, function () {
      render(articles);
    });
  }

  function normalizeArticles(value) {
    if (!Array.isArray(value) || !value.length) {
      return [];
    }
    return value.filter(function (entry) {
      return entry && entry.title && entry.summary && entry.author && entry.date && entry.category && Array.isArray(entry.tags);
    });
  }

  function boot(articles) {
    var activeArticles = normalizeArticles(articles);
    searchEl.addEventListener('input', function () {
      render(activeArticles);
    });
    render(activeArticles);
  }

  fetch(DATA_PATH)
    .then(function (res) {
      if (!res.ok) {
        throw new Error('Failed to load articles.json');
      }
      return res.json();
    })
    .then(function (data) {
      boot(data);
    })
    .catch(function () {
      boot([]);
    });
})();