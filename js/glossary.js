/* ========================================
   N&R AI Solutions | Glossary Page
   js/glossary.js
   ======================================== */

(function () {
  'use strict';

  var DATA_PATH = '../assets/ai-glossary-final.md';
  var FALLBACK_GLOSSARY_MARKDOWN = [
    '**AGI (Artificial General Intelligence)** - A theoretical AI that can learn and reason across many tasks at human-like level.',
    'Example: "A single system that could plan your week, learn accounting basics, and help write legal drafts without retraining."',
    '',
    '**AI Agent** - An AI system that can take actions in steps to complete a goal, not just answer once.',
    'Example: "Book a meeting, email the invite, and update your calendar notes automatically."',
    '',
    '**AI Assistant** - A practical AI helper that supports your day-to-day tasks through chat, email, or voice.',
    'Example: "Draft this reply, summarize this thread, and remind me what to send next."',
    '',
    '**Anthropomorphism** - Treating AI like it has human intentions or emotions when it is still software.',
    'Example: "It sounded confident, so I assumed it understood me emotionally."',
    '',
    '**ASI (Artificial Super Intelligence)** - A hypothetical AI that would exceed human ability in nearly all domains.',
    'Example: "People discussing future scenarios where AI can outperform top experts everywhere."',
    '',
    '**Automation** - Using software rules and AI to handle repetitive tasks with less manual effort.',
    'Example: "Automatically label incoming emails and draft responses for approval."',
    '',
    '**Chatbot** - A conversational interface that answers questions or completes simple flows.',
    'Example: "A website bot that handles common support questions 24/7."',
    '',
    '**ChatGPT** - A widely used conversational AI product built on large language models.',
    'Example: "Use ChatGPT to brainstorm, summarize documents, or draft a first version of an email."',
    '',
    '**Context Window** - The amount of text an AI model can consider at once when generating an answer.',
    'Example: "If a long thread exceeds context, the model may miss earlier details unless summarized."',
    '',
    '**Conversational AI** - AI designed to interact in natural language through chat or voice.',
    'Example: "A voice assistant that can answer follow-up questions in the same conversation."',
    '',
    '**Emergent Behavior** - Unexpected capabilities or patterns that appear when a model becomes large or complex.',
    'Example: "A model starts solving tasks it was not explicitly trained to do."',
    '',
    '**Generative AI** - AI that creates new content like text, images, audio, or code from prompts.',
    'Example: "Generate a first draft of a client proposal from bullet points."',
    '',
    '**Hallucination** - When AI produces incorrect or fabricated information that sounds plausible.',
    'Example: "The assistant cites a policy that does not actually exist."',
    '',
    '**Human-in-the-Loop** - A workflow where a person reviews, approves, or corrects AI output before final action.',
    'Example: "AI drafts customer replies, then you approve before sending."',
    '',
    '**Personal CRM** - A lightweight system for tracking relationships, conversations, and follow-ups.',
    'Example: "Remember who you met, what you discussed, and when to check in."',
    '',
    '**Prompt** - The instruction or input you give an AI to guide its response.',
    'Example: "Summarize this email thread into three action items and one decision."',
    '',
    '**Fine-Tuning** - Additional training on specific data to make a base model better at a narrow task.',
    'Example: "Train a support model on your past ticket style so responses match your team tone."',
    '',
    '**Inference** - The step where a trained model generates an output for a new input.',
    'Example: "You ask a question and the model returns an answer in real time."',
    '',
    '**Knowledge Base** - A structured set of documents and data an assistant can reference for accurate answers.',
    'Example: "Policies, SOPs, and onboarding docs your assistant can search before responding."',
    '',
    '**Large Language Model (LLM)** - A model trained on massive text datasets to understand and generate language.',
    'Example: "An LLM can draft emails, summarize calls, and rewrite content."',
    '',
    '**Latency** - The time delay between your request and the AI response.',
    'Example: "A 2-second latency feels instant; 15 seconds feels slow for chat."',
    '',
    '**Model Drift** - Performance changes over time as real-world inputs shift away from original training conditions.',
    'Example: "A workflow that worked last quarter now misses new customer phrasing."',
    '',
    '**Multimodal AI** - AI that can work with multiple input/output types like text, images, audio, and video.',
    'Example: "Upload a screenshot and ask the assistant to explain what is wrong."',
    '',
    '**RAG (Retrieval-Augmented Generation)** - A method where AI retrieves relevant documents first, then writes an answer using them.',
    'Example: "Assistant searches your policy docs before drafting a compliant customer reply."',
    '',
    '**Token** - A small text unit models use internally for processing and pricing.',
    'Example: "Longer prompts use more tokens and can cost more to run."',
    '',
    '**Vector Database** - A database optimized to store embeddings and find semantically similar content quickly.',
    'Example: "Find past notes related to this customer issue even when wording differs."',
    '',
    '**Workflow Orchestration** - Coordinating multiple tools, steps, and approvals so an AI process runs reliably end to end.',
    'Example: "Collect lead info, enrich data, draft outreach, and queue human approval in one flow."',
    '',
    '**Singularity** - A speculative point where AI progress accelerates beyond normal human control or prediction.',
    'Example: "A future scenario often discussed in AI philosophy and forecasting."'
  ].join('\n');
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
      var line = lines[i].trim();
      var entryMatch = line.match(/^\*\*(.+?)\*\*\s+[–-]\s+(.+)$/);
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
      var entries = dedupeEntries(parseGlossaryMarkdown(FALLBACK_GLOSSARY_MARKDOWN));
      init(entries);
    });
})();
