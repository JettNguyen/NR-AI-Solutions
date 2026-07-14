/* Demo player — the Archie recording plays by itself, silently, on a loop.
 *
 * Three things this has to get right, none of which a bare `autoplay loop` attribute does:
 *
 *  1. Don't fetch 6 MB until it's wanted. The <video> carries no src — only data-src — so the
 *     browser fetches nothing but the poster until an IntersectionObserver says the figure is
 *     actually on screen. Someone who bounces from the hero never pays for it.
 *
 *  2. Don't play to an empty room. Playback pauses when the figure scrolls away and resumes
 *     when it comes back, so we're not decoding video into a viewport nobody is looking at —
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

  Array.prototype.forEach.call(players, function (player) {
    var video = player.querySelector('video');
    var toggle = player.querySelector('.demo-player-toggle');
    if (!video) return;

    var src = video.getAttribute('data-src');
    var loaded = false;
    // Set when the visitor pauses by hand, so scrolling away and back doesn't override them and
    // start it up again — the one thing more annoying than autoplay is autoplay you can't stop.
    var pausedByUser = false;

    function load() {
      if (loaded || !src) return;
      loaded = true;
      video.src = src;
    }

    function play() {
      if (pausedByUser) return;
      load();
      var started = video.play();
      if (started && typeof started.catch === 'function') {
        // Autoplay can still be refused (a data-saver setting, an aggressive browser policy).
        // Fall back to the paused state rather than pretending it's playing.
        started.catch(function () {
          player.classList.add('is-paused');
          if (toggle) toggle.setAttribute('aria-label', 'Play the demo');
        });
      }
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        if (video.paused) {
          pausedByUser = false;
          load();
          video.play();
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
