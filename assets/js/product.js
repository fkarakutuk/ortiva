(function () {
  'use strict';

  var viewer = document.getElementById('productViewer');
  if (!viewer) return;

  var stage = viewer.querySelector('.viewer-stage');
  var img = viewer.querySelector('.viewer-stage img');
  var thumbs = Array.prototype.slice.call(viewer.querySelectorAll('.viewer-thumb'));
  var frames = [];
  try { frames = JSON.parse(viewer.getAttribute('data-frames') || '[]'); } catch (e) { frames = []; }

  var frameCount = frames.length;
  var currentFrame = 0;
  var zoomed = false;
  var dragging = false;
  var dragStartX = 0;
  var dragAccum = 0;
  var DRAG_PER_FRAME = 34; // px of drag needed to advance one frame

  function setFrame(i) {
    if (!frameCount) return;
    currentFrame = ((i % frameCount) + frameCount) % frameCount;
    if (img) img.src = frames[currentFrame];
    thumbs.forEach(function (t, idx) { t.classList.toggle('is-active', idx === currentFrame); });
  }

  // Real drag-to-rotate across available frames when >1 image exists.
  if (frameCount > 1 && stage) {
    stage.addEventListener('pointerdown', function (e) {
      dragging = true;
      dragStartX = e.clientX;
      dragAccum = 0;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragStartX;
      dragAccum += dx;
      dragStartX = e.clientX;
      if (Math.abs(dragAccum) >= DRAG_PER_FRAME) {
        var steps = Math.trunc(dragAccum / DRAG_PER_FRAME);
        setFrame(currentFrame - steps);
        dragAccum -= steps * DRAG_PER_FRAME;
      }
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (evt) {
      stage.addEventListener(evt, function () { dragging = false; });
    });
  } else if (stage) {
    // Only one confirmed product angle available: offer a subtle tilt/parallax
    // interaction instead of simulating rotation we don't have imagery for.
    stage.addEventListener('pointermove', function (e) {
      var rect = stage.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      if (img) img.style.transform = 'scale(' + (zoomed ? 1.6 : 1) + ') rotate(' + (relX * 3) + 'deg) translate(' + (relX * -6) + 'px,' + (relY * -6) + 'px)';
    });
    stage.addEventListener('pointerleave', function () {
      if (img) img.style.transform = 'scale(' + (zoomed ? 1.6 : 1) + ')';
    });
  }

  thumbs.forEach(function (t, idx) {
    t.addEventListener('click', function () { setFrame(idx); });
  });

  var zoomBtn = viewer.querySelector('[data-viewer-zoom]');
  var resetBtn = viewer.querySelector('[data-viewer-reset]');
  var fullscreenBtn = viewer.querySelector('[data-viewer-fullscreen]');

  if (zoomBtn) {
    zoomBtn.addEventListener('click', function () {
      zoomed = !zoomed;
      if (img) img.style.transform = zoomed ? 'scale(1.6)' : 'scale(1)';
      zoomBtn.classList.toggle('is-active', zoomed);
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      zoomed = false;
      setFrame(0);
      if (img) img.style.transform = 'scale(1)';
      if (zoomBtn) zoomBtn.classList.remove('is-active');
    });
  }
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', function () {
      if (viewer.requestFullscreen) viewer.requestFullscreen();
      else if (viewer.webkitRequestFullscreen) viewer.webkitRequestFullscreen();
    });
  }

  if (frameCount) setFrame(0);
})();
