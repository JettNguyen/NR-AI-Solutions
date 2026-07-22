/* Demo player: the Archie recording plays by itself, silently, on a loop.
 *
 * Four things this has to get right, none of which a bare `autoplay loop` attribute does:
 *
 *  0. Send the right encode. The same recording ships as AV1, HEVC and H.264 at two widths, and
 *     the choice is made on decode COST, not just codec support (see pickSource below). This is
 *     the difference between a hero that idles at nothing and one that pins a core on an old
 *     laptop.
 *
 *  1. Don't fetch megabytes until they're wanted. Neither the <video> nor its <source>s carry a
 *     real src, only data-src, so the browser fetches nothing but the poster until an
 *     IntersectionObserver says the figure is actually on screen. Someone who bounces never pays.
 *
 *  2. Don't play to an empty room. Playback pauses when the figure scrolls away and resumes
 *     when it comes back, so we're not decoding video into a viewport nobody is looking at,
 *     which on a laptop is just battery, quietly.
 *
 *  3. Respect prefers-reduced-motion. Anyone who has asked the OS for less movement gets the
 *     poster and a play button, and the video is only fetched if they ask for it. Autoplaying
 *     at them would be exactly the thing they turned off.
 *
 * The visible control is a pause toggle, not player chrome: WCAG 2.2.2 requires a way to stop
 * motion that starts on its own and runs past five seconds, and this runs for a minute.
 */
(function () {
  var players = document.querySelectorAll('.demo-player');
  if (!players.length) return;

  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Which of the encodes does this machine actually want? ──
   *
   * The markup offers the same recording as AV1, HEVC and H.264, at two widths. Picking with a
   * plain <source> list would be wrong, because the browser only asks "can I decode this?", and
   * the answer is yes far more often than it should be. A 2019 laptop will cheerfully claim it
   * supports AV1 and then software-decode 2560px of it, burning a core to do it. "Supported" and
   * "free to play" are different questions.
   *
   * MediaCapabilities answers the second one: powerEfficient means there is a hardware decoder
   * behind it. So we take the best candidate that is hardware-decoded and skip anything that
   * would be decoded in software, which is how a machine that can't do AV1 in hardware quietly
   * ends up on the HEVC or H.264 line instead of stuttering through the pretty one.
   *
   * If nothing is hardware-decoded, we take the LAST candidate rather than the first: the list is
   * ordered best-quality-first, and the last one is H.264, which is the cheapest thing to grind
   * out in software.
   *
   * Browsers too old to have MediaCapabilities are also too old to have AV1 (it shipped in Chrome
   * 70; MediaCapabilities in 66), so canPlayType alone is safe for them: they cannot pick the
   * expensive option even if we let them.
   */
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function pickSource(video, theme) {
    var sources = Array.prototype.slice.call(video.querySelectorAll('source[data-src]'));

    // Older markup (and anything with a single encode) still just carries data-src on the video.
    if (!sources.length) return Promise.resolve(video.getAttribute('data-src'));

    var matching = sources.filter(function (s) {
      // The recording exists in a light build and a dark build; the app itself is themed, so a
      // light screenshot on a dark page would look like a bug. A source with no data-theme is
      // theme-agnostic and always eligible.
      var forTheme = s.getAttribute('data-theme');
      if (forTheme && forTheme !== theme) return false;

      var q = s.getAttribute('media');
      return !q || !window.matchMedia || window.matchMedia(q).matches;
    });
    if (!matching.length) matching = sources;

    var playable = matching.filter(function (s) {
      return video.canPlayType(s.getAttribute('type')) !== '';
    });
    if (!playable.length) return Promise.resolve(null);

    var mc = navigator.mediaCapabilities;
    if (!mc || !mc.decodingInfo) {
      return Promise.resolve(playable[0].getAttribute('data-src'));
    }

    var checks = playable.map(function (s) {
      return mc
        .decodingInfo({
          type: 'file',
          video: {
            contentType: s.getAttribute('type'),
            width: parseInt(s.getAttribute('data-w'), 10),
            height: parseInt(s.getAttribute('data-h'), 10),
            bitrate: 2000000,
            framerate: 30
          }
        })
        .catch(function () {
          return { supported: false };
        });
    });

    return Promise.all(checks).then(function (infos) {
      for (var i = 0; i < infos.length; i++) {
        if (infos[i].supported && infos[i].smooth && infos[i].powerEfficient) {
          return playable[i].getAttribute('data-src');
        }
      }
      return playable[playable.length - 1].getAttribute('data-src');
    });
  }

  Array.prototype.forEach.call(players, function (player) {
    var video = player.querySelector('video');
    var toggle = player.querySelector('.demo-player-toggle');
    if (!video) return;

    var chosen = null; // resolves once per theme
    var chosenTheme = null;
    var loaded = false;
    // Set when the visitor pauses by hand, so scrolling away and back doesn't override them and
    // start it up again; the one thing more annoying than autoplay is autoplay you can't stop.
    var pausedByUser = false;

    // The poster is themed too, for the same reason the video is.
    function applyPoster(theme) {
      var p = video.getAttribute('data-poster-' + theme);
      if (p) video.setAttribute('poster', p);
    }
    applyPoster(currentTheme());

    // Choosing a source means asking the browser about its decoders, which is async, so load()
    // hands back a promise and everything downstream waits on it. It resolves once per theme;
    // later calls get the same promise back and no second fetch.
    function load() {
      if (!chosen) {
        chosenTheme = currentTheme();
        chosen = pickSource(video, chosenTheme).then(function (url) {
          if (url && !loaded) {
            loaded = true;
            video.src = url;
          }
        });
      }
      return chosen;
    }

    /* Flipping the theme swaps in the other build of the recording. The two are the same take,
       frame for frame, so we carry currentTime across: the picture recolours where it stands
       instead of jumping back to the beginning, which is what you'd get from a bare src swap. */
    function swapTheme() {
      var theme = currentTheme();
      if (theme === chosenTheme) return;
      chosenTheme = theme;
      applyPoster(theme);

      // Nothing has been fetched yet; whenever load() does run, it will read the new theme.
      if (!loaded) {
        chosen = null;
        return;
      }

      var at = video.currentTime;
      var wasPlaying = !video.paused;

      chosen = pickSource(video, theme).then(function (url) {
        if (!url) return;
        video.addEventListener('loadedmetadata', function once() {
          video.removeEventListener('loadedmetadata', once);
          try {
            video.currentTime = at;
          } catch (e) {
            /* seek refused; it will just start from the top */
          }
          if (wasPlaying && !pausedByUser) {
            var r = video.play();
            if (r && typeof r.catch === 'function') r.catch(function () {});
          }
        });
        // The <video> ships preload="none", so simply pointing src at the new build fires
        // loadstart and then waits: nothing is fetched until something asks to play, and the
        // seek-and-resume above is gated behind loadedmetadata, which would never arrive. Lifting
        // preload makes the browser pull the metadata on its own, so the swap completes even for a
        // player that is currently paused. We have already fetched one build by now, so this isn't
        // spending bytes we were trying to save.
        video.preload = 'auto';
        video.src = url;
      });
    }

    if (window.MutationObserver) {
      new MutationObserver(swapTheme).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }

    function play() {
      if (pausedByUser) return;
      load().then(function () {
        // They may have hit pause while we were still deciding.
        if (pausedByUser) return;
        var started = video.play();
        if (started && typeof started.catch === 'function') {
          // Autoplay can still be refused (a data-saver setting, an aggressive browser policy).
          // Fall back to the paused state rather than pretending it's playing.
          started.catch(function () {
            player.classList.add('is-paused');
            if (toggle) toggle.setAttribute('aria-label', 'Play the demo');
          });
        }
      });
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        if (video.paused) {
          pausedByUser = false;
          play();
          player.classList.remove('is-paused');
          toggle.setAttribute('aria-label', 'Pause the demo');
        } else {
          pausedByUser = true;
          video.pause();
          player.classList.add('is-paused');
          toggle.setAttribute('aria-label', 'Play the demo');
        }
      });
    }

    if (reduceMotion) {
      // Poster only. Nothing is fetched and nothing moves until they press play.
      player.classList.add('is-paused');
      if (toggle) toggle.setAttribute('aria-label', 'Play the demo');
      return;
    }

    if (!('IntersectionObserver' in window)) {
      play(); // Old browser: just play it. Better than a permanently blank frame.
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) play();
          else if (!video.paused) video.pause();
        });
      },
      // Start a little before it's actually on screen so it's already running by the time the
      // visitor's eye lands on it, rather than blinking to life underneath them.
      { rootMargin: '200px 0px', threshold: 0.01 }
    );
    observer.observe(player);
  });
})();
