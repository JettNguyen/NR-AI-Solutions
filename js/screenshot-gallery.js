/* ========================================
   N&R AI Solutions | Screenshot Gallery
   js/screenshot-gallery.js

   Duplicates each track's items once so the CSS marquee
   animation (translateX -50%) loops seamlessly, then sizes the
   animation duration to the track's actual content width so the
   scroll speed stays constant no matter how many screenshots are
   in it. Add more screenshots by adding more
   .screenshot-gallery-item elements to the track in HTML - no JS
   changes needed.

   The animation starts paused and only switches to running once
   every image has loaded - otherwise the track's width (and so
   the -50% loop point) keeps changing as images finish loading,
   which makes the loop visibly jump.
   ======================================== */

(function () {
  'use strict';

  var PIXELS_PER_SECOND = 35;

  document.querySelectorAll('.screenshot-gallery-track').forEach(function (track) {
    var items = Array.from(track.children);
    items.forEach(function (item) {
      var clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    var images = Array.from(track.querySelectorAll('img'));
    var imagesReady = images.map(function (img) {
      if (img.complete) return Promise.resolve();
      return new Promise(function (resolve) {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      });
    });

    Promise.all(imagesReady).then(function () {
      var loopDistance = track.scrollWidth / 2;
      var duration = Math.max(loopDistance / PIXELS_PER_SECOND, 4);
      track.style.animationDuration = duration + 's';
      track.classList.add('is-ready');
    });
  });
})();
