/* Ortiva — tema düğmesi ve imlece tepki veren arka plan alanı.
 * Arka plan: mühendislik çizim kâğıdını andıran nokta ızgarası. İmleç yaklaştıkça
 * noktalar itilip dağılır, yeşile döner ve komşularıyla ince bir ağ çizgisi kurar;
 * imleç uzaklaşınca yaylanarak yerine oturur. Sayfa kaydıkça ızgara hafifçe kayar.
 * "Hareketi azalt" tercihinde alan sabit çizilir, animasyon çalışmaz. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------ tema
  function currentTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function applyTheme(t, animate) {
    if (animate && !reduce) {
      root.classList.add('theme-anim');
      clearTimeout(applyTheme._t);
      applyTheme._t = setTimeout(function () { root.classList.remove('theme-anim'); }, 450);
    }
    root.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0B0E0C' : '#F5F7F5');
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      b.setAttribute('aria-label', t === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç');
      b.setAttribute('title', t === 'dark' ? 'Açık tema' : 'Koyu tema');
    });
    if (field) field.recolor();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.theme-toggle');
    if (!b) return;
    var t = currentTheme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('ortiva-theme', t); } catch (err) { /* depolama kapalı olabilir */ }
    applyTheme(t, true);
  });
  // kullanıcı seçim yapmadıysa sistem temasını izle
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var onScheme = function (e) {
    var saved = null;
    try { saved = localStorage.getItem('ortiva-theme'); } catch (err) { /* yok */ }
    if (saved !== 'light' && saved !== 'dark') applyTheme(e.matches ? 'dark' : 'light', true);
  };
  if (mq.addEventListener) mq.addEventListener('change', onScheme); else if (mq.addListener) mq.addListener(onScheme);

  // ------------------------------------------------------------------ arka plan alanı
  var field = null;
  var canvas = document.querySelector('.bg-field');
  if (canvas && canvas.getContext) field = createField(canvas);
  applyTheme(currentTheme(), false);

  function createField(cv) {
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, dpr = 1, S = 26, cols = 0, rows = 0;
    var dx, dy, vx, vy, glow;                       // noktaların sapma, hız ve parlaklık durumu
    var mouse = { x: -9999, y: -9999, px: -9999, py: -9999, vx: 0, vy: 0, active: false, last: 0 };
    var R = 150;                                    // etki yarıçapı (px)
    var col = {};
    var running = false, lastFrame = 0, lastScroll = 0, t0 = performance.now();
    // ince ışık dalgası yalnızca fareli cihazlarda sürekli akar
    var continuous = !reduce && window.matchMedia('(pointer: fine)').matches;

    function recolor() {
      var dark = currentTheme() === 'dark';
      col = dark
        ? { dot: 'rgba(214,226,219,', base: 0.15, line: 'rgba(94,194,158,', green: [94, 194, 158], halo: 'rgba(59,171,134,' , haloA: 0.10 }
        : { dot: 'rgba(22,30,26,', base: 0.2, line: 'rgba(35,107,79,', green: [35, 140, 104], halo: 'rgba(59,171,134,', haloA: 0.08 };
      kick();
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      S = W < 700 ? 24 : 28;
      R = W < 700 ? 110 : 160;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cols = Math.ceil(W / S) + 2; rows = Math.ceil(H / S) + 3;
      var n = cols * rows;
      dx = new Float32Array(n); dy = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n); glow = new Float32Array(n);
      kick();
    }

    function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

    function onMove(x, y) {
      var now = performance.now();
      if (mouse.x > -9000) {
        var dt = Math.max(8, now - mouse.last);
        mouse.vx = (x - mouse.x) / dt * 16; mouse.vy = (y - mouse.y) / dt * 16;
      }
      mouse.x = x; mouse.y = y; mouse.last = now; mouse.active = true;
      kick();
    }
    window.addEventListener('pointermove', function (e) { onMove(e.clientX, e.clientY); }, { passive: true });
    window.addEventListener('touchmove', function (e) { var t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); }, { passive: true });
    document.addEventListener('pointerleave', function () { mouse.active = false; kick(); });
    window.addEventListener('blur', function () { mouse.active = false; kick(); });
    window.addEventListener('scroll', function () { lastScroll = performance.now(); kick(); }, { passive: true });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });

    function frame(now) {
      if (document.hidden) { running = false; return; }
      var idle = !mouse.active && now - mouse.last > 1600;
      // imleç yokken ortam dalgası için ~30 fps yeterli
      if (idle && now - lastFrame < 33) { requestAnimationFrame(frame); return; }
      lastFrame = now;
      var energy = step(now);
      draw(now);
      if (reduce) { running = false; return; }
      // dokunmatik cihazlarda pil için: alan durulunca döngü durur (dokunuş/kaydırma yeniden başlatır)
      if (!continuous && idle && energy < 0.02 && now - lastScroll > 400) { running = false; return; }
      requestAnimationFrame(frame);
    }

    function step(now) {
      var n = cols * rows, e = 0;
      var oy = -((window.scrollY * 0.25) % S);
      var mx = mouse.x, my = mouse.y, act = mouse.active && !reduce;
      mouse.vx *= 0.9; mouse.vy *= 0.9;
      var R2 = R * R;
      for (var j = 0; j < rows; j++) {
        var hy = (j - 1) * S + oy;
        for (var i = 0; i < cols; i++) {
          var k = j * cols + i, hx = (i - 0.5) * S;
          var g = 0;
          if (act) {
            var px = hx + dx[k] - mx, py = hy + dy[k] - my, d2 = px * px + py * py;
            if (d2 < R2) {
              var d = Math.sqrt(d2) || 1, f = 1 - d / R, f2 = f * f;
              vx[k] += (px / d) * f2 * 2.6 + mouse.vx * f2 * 0.18;   // dışa itme + sürüklenme
              vy[k] += (py / d) * f2 * 2.6 + mouse.vy * f2 * 0.18;
              g = f;
            }
          }
          vx[k] += -dx[k] * 0.055; vy[k] += -dy[k] * 0.055;        // yay
          vx[k] *= 0.84; vy[k] *= 0.84;                               // sönüm
          dx[k] += vx[k]; dy[k] += vy[k];
          glow[k] += (g - glow[k]) * (g > glow[k] ? 0.35 : 0.06);
          e += Math.abs(vx[k]) + Math.abs(vy[k]) + glow[k];
        }
      }
      return e / n;
    }

    function draw(now) {
      var t = (now - t0) / 1000;
      var oy = -((window.scrollY * 0.25) % S);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // 1) taban noktalar tek geçişte; hafif, yavaş ilerleyen tarama dalgası
      var wave = continuous ? 1 : 0;
      ctx.fillStyle = col.dot + col.base + ')';
      ctx.beginPath();
      var j, i, k, x, y;
      for (j = 0; j < rows; j++) {
        for (i = 0; i < cols; i++) {
          k = j * cols + i;
          if (glow[k] > 0.04) continue;
          x = (i - 0.5) * S + dx[k]; y = (j - 1) * S + oy + dy[k];
          ctx.rect(x - 0.9, y - 0.9, 1.8, 1.8);
        }
      }
      ctx.fill();
      if (wave) {
        // çapraz ilerleyen ince ışık bandı: noktaların bir kısmı biraz daha belirgin
        ctx.fillStyle = col.line + '0.22)';
        ctx.beginPath();
        var band = ((t * 90) % (W + H + 600)) - 300;
        for (j = 0; j < rows; j++) {
          for (i = 0; i < cols; i++) {
            k = j * cols + i;
            x = (i - 0.5) * S + dx[k]; y = (j - 1) * S + oy + dy[k];
            var dd = Math.abs(x + y - band);
            if (dd < 60 && glow[k] <= 0.04) { var s = 1.6 * (1 - dd / 60) + 0.6; ctx.rect(x - s / 2, y - s / 2, s, s); }
          }
        }
        ctx.fill();
      }
      // imlecin altında yumuşak yeşil hale
      if (mouse.active && !reduce) {
        var hg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, R * 1.6);
        hg.addColorStop(0, col.halo + col.haloA + ')'); hg.addColorStop(1, col.halo + '0)');
        ctx.fillStyle = hg; ctx.fillRect(mouse.x - R * 1.6, mouse.y - R * 1.6, R * 3.2, R * 3.2);
      }
      // 2) imleç çevresi: ağ çizgileri
      ctx.lineWidth = 1;
      for (j = 0; j < rows; j++) {
        for (i = 0; i < cols; i++) {
          k = j * cols + i;
          if (glow[k] <= 0.04) continue;
          x = (i - 0.5) * S + dx[k]; y = (j - 1) * S + oy + dy[k];
          var a = glow[k] * 0.5;
          if (i + 1 < cols) {
            var r = k + 1; ctx.strokeStyle = col.line + (Math.min(a, glow[r] * 0.5 + 0.05)).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo((i + 0.5) * S + dx[r], (j - 1) * S + oy + dy[r]); ctx.stroke();
          }
          if (j + 1 < rows) {
            var b = k + cols; ctx.strokeStyle = col.line + (Math.min(a, glow[b] * 0.5 + 0.05)).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo((i - 0.5) * S + dx[b], j * S + oy + dy[b]); ctx.stroke();
          }
        }
      }
      // 3) imleç çevresi: parlayan noktalar
      var G = col.green;
      for (j = 0; j < rows; j++) {
        for (i = 0; i < cols; i++) {
          k = j * cols + i;
          if (glow[k] <= 0.04) continue;
          x = (i - 0.5) * S + dx[k]; y = (j - 1) * S + oy + dy[k];
          var q = glow[k], rad = 0.9 + q * 1.9;
          ctx.fillStyle = 'rgba(' + G[0] + ',' + G[1] + ',' + G[2] + ',' + (0.25 + q * 0.75).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832); ctx.fill();
        }
      }
    }

    resize();
    recolor();
    return { recolor: recolor };
  }
})();
