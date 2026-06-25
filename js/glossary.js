/* ========================================
   N&R AI Solutions | Glossary Page
   js/glossary.js
   ======================================== */

(function () {
  'use strict';

  var DATA_PATH = '../assets/ai-glossary-final.md';
  var START_HERE_TERMS = [
    'AI Assistant',
    'AI Agent',
    'Chatbot',
    'Human-in-the-Loop',
    'Hallucination',
    'Prompt',
    'Personal CRM',
    'Automation',
    'Generative AI',
    'ChatGPT',
    'Conversational AI',
    'Context Window'
  ];
  var BIG_PICTURE_TERMS = [
    'AGI (Artificial General Intelligence)',
    'ASI (Artificial Super Intelligence)',
    'Singularity',
    'Anthropomorphism',
    'Emergent Behavior'
  ];

  var searchInput = document.getElementById('glossarySearch');
  var jumpWrap = document.getElementById('azJumpNav');
  var startHereWrap = document.getElementById('startHereList');
  var bigPictureWrap = document.getElementById('bigPictureList');
  var entriesWrap = document.getElementById('glossaryEntries');
  var countEl = document.getElementById('glossaryCount');

  function cleanText(value) {
    return String(value || '')
      .replace(/\u00e2\u20ac[\u201c\u201d]/g, ' - ')
      .replace(/â€“|â€”/g, ' - ')
      .replace(/[\u2013\u2014]/g, ' - ')
      .replace(/\s+-\s+/g, ' - ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function slugify(term) {
    return term
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  function parseGlossaryMarkdown(markdown) {
    var lines = markdown.split(/\r?\n/);
    var entries = [];

    for (var i = 0; i < lines.length; i += 1) {
      var line = cleanText(lines[i].trim());
      var entryMatch = line.match(/^\*\*(.+?)\*\*\s*-\s*(.+)$/);
      if (entryMatch) {
        var term = entryMatch[1].trim();
        var definition = cleanText(entryMatch[2].trim());
        var example = '';

        for (var j = i + 1; j < lines.length; j += 1) {
          var next = lines[j].trim();
          var exampleMatch = next.match(/^Example:\s*(.+)$/);
          if (exampleMatch) {
            example = cleanText(exampleMatch[1].trim());
            break;
          }
          if (/^\*\*.+\*\*/.test(next)) {
            break;
          }
        }

        entries.push({
          type: 'entry',
          term: term,
          definition: definition,
          example: example,
          slug: slugify(term)
        });
        continue;
      }
    }

    return entries;
  }

  function dedupeEntries(entries) {
    var seen = {};
    return entries.filter(function (entry) {
      var key = entry.term.toLowerCase();
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function makeEntryCard(entry) {
    return [
      '<article class="glossary-entry" id="' + entry.slug + '" data-term="' + entry.term.toLowerCase() + '">',
      '<button class="glossary-trigger" aria-expanded="false">',
      '<span>' + entry.term + '</span>',
      '<span class="glossary-plus" aria-hidden="true">+</span>',
      '</button>',
      '<div class="glossary-body">',
      '<p>' + entry.definition + '</p>',
      (entry.example ? '<p><strong>Example:</strong> ' + entry.example + '</p>' : ''),
      '</div>',
      '</article>'
    ].join('');
  }

  function renderStartHere(entries) {
    var byTerm = {};
    entries.forEach(function (entry) {
      if (entry.type === 'entry') {
        byTerm[entry.term] = entry;
      }
    });

    var html = START_HERE_TERMS
      .map(function (term) {
        if (!byTerm[term]) return '';
        return '<a href="#' + byTerm[term].slug + '" class="start-here-pill">' + term + '</a>';
      })
      .filter(Boolean)
      .join('');

    startHereWrap.innerHTML = html;
  }

  function renderBigPicture(entries) {
    var byTerm = {};
    entries.forEach(function (entry) {
      if (entry.type === 'entry') {
        byTerm[entry.term] = entry;
      }
    });

    var html = BIG_PICTURE_TERMS
      .map(function (term) {
        if (!byTerm[term]) return '';
        return '<a href="#' + byTerm[term].slug + '" class="big-picture-link">' + term + '</a>';
      })
      .filter(Boolean)
      .join('');

    bigPictureWrap.innerHTML = html;
  }

  function renderJumpNav(entries) {
    var letters = {};
    entries.forEach(function (entry) {
      var letter = entry.term.charAt(0).toUpperCase();
      if (!/[A-Z]/.test(letter)) return;
      if (!letters[letter]) {
        letters[letter] = entry.slug;
      }
    });

    var allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    jumpWrap.innerHTML = allLetters.map(function (letter) {
      if (!letters[letter]) {
        return '<span class="az-letter disabled">' + letter + '</span>';
      }
      return '<a class="az-letter" href="#' + letters[letter] + '">' + letter + '</a>';
    }).join('');
  }

  function getScrollOffset() {
    var nav = document.getElementById('nav');
    return (nav ? nav.offsetHeight : 72) + 16;
  }

  function scrollToEntry(card) {
    var top = card.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function openEntry(card) {
    if (!card || card.classList.contains('open')) return;
    var button = card.querySelector('.glossary-trigger');
    var body = card.querySelector('.glossary-body');
    if (!button || !body) return;
    card.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    body.style.maxHeight = body.scrollHeight + 'px';
  }

  function bindJumpLinks() {
    var selectors = '.start-here-pill, .big-picture-link, .az-letter[href^="#"]';
    document.querySelectorAll(selectors).forEach(function (link) {
      link.addEventListener('click', function (event) {
        var hash = link.getAttribute('href') || '';
        if (!hash.startsWith('#')) return;
        var card = document.querySelector(hash);
        if (!card) return;

        event.preventDefault();
        if (link.classList.contains('start-here-pill') || link.classList.contains('big-picture-link')) {
          openEntry(card);
        }
        scrollToEntry(card);
        if (history && history.replaceState) {
          history.replaceState(null, '', hash);
        }
      });
    });
  }

  function openFromHashIfPresent() {
    if (!window.location.hash) return;
    var card = document.querySelector(window.location.hash);
    if (!card) return;
    openEntry(card);
    setTimeout(function () {
      scrollToEntry(card);
    }, 0);
  }

  function bindAccordion() {
    var triggers = entriesWrap.querySelectorAll('.glossary-trigger');
    triggers.forEach(function (button) {
      button.addEventListener('click', function () {
        var card = button.closest('.glossary-entry');
        var body = card.querySelector('.glossary-body');
        var isOpen = card.classList.contains('open');

        card.classList.toggle('open', !isOpen);
        button.setAttribute('aria-expanded', String(!isOpen));
        body.style.maxHeight = !isOpen ? (body.scrollHeight + 'px') : null;
      });
    });
  }

  function bindSearch() {
    searchInput.addEventListener('input', function () {
      var query = searchInput.value.trim().toLowerCase();
      var visibleCount = 0;
      var cards = entriesWrap.querySelectorAll('.glossary-entry');

      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var match = !query || text.indexOf(query) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) visibleCount += 1;
      });

      countEl.textContent = String(visibleCount);
    });
  }

  function init(entries) {
    renderStartHere(entries);
    renderBigPicture(entries);
    renderJumpNav(entries);

    entriesWrap.innerHTML = entries
      .map(function (entry) { return makeEntryCard(entry); })
      .join('');

    bindAccordion();
    bindSearch();
    bindJumpLinks();
    openFromHashIfPresent();
    countEl.textContent = String(entries.length);
  }

  fetch(DATA_PATH)
    .then(function (res) {
      if (!res.ok) {
        throw new Error('Failed to load glossary markdown');
      }
      return res.text();
    })
    .then(function (markdown) {
      var entries = dedupeEntries(parseGlossaryMarkdown(markdown));
      init(entries);
    })
    .catch(function () {
      entriesWrap.innerHTML = '<p>Unable to load glossary entries right now.</p>';
    });
})();
