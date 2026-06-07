/* ============================================================
   Coast 2 Coast — "Deal Floor" animated background
   A calm, luxury-grade field: slow-drifting gold light blobs +
   a fine field of gold dust motes with gentle twinkle. Pure canvas,
   no libraries. Designed to sit UNDER a navy gradient + grain so it
   reads as depth, never as a tech demo.

   Performance:
   - device pixel ratio capped at 1.5
   - mote count scales with area, hard-capped
   - loop pauses when the canvas is off-screen or the tab is hidden
   - prefers-reduced-motion → one static frame, no loop
   ============================================================ */
(function () {
  "use strict";
  var canvas = document.getElementById("floor-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  var motes = [], lights = [];
  var running = false, visible = true, inView = true, t = 0;

  var GOLD = [227, 200, 120];     // --gold-300
  var GOLD_DEEP = [200, 162, 74]; // --gold-500

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.max(1, Math.round(W * DPR));
    canvas.height = Math.max(1, Math.round(H * DPR));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  function build() {
    // Soft drifting light blobs — the "gold light that drifts"
    lights = [];
    var lc = W < 700 ? 2 : 3;
    for (var i = 0; i < lc; i++) {
      lights.push({
        x: rand(0.15, 0.85) * W,
        y: rand(0.05, 0.7) * H,
        r: rand(0.28, 0.5) * Math.max(W, H),
        a: rand(0.05, 0.11),
        dx: rand(-0.05, 0.05),
        dy: rand(-0.03, 0.03),
        ph: rand(0, Math.PI * 2)
      });
    }
    // Gold dust motes
    motes = [];
    var target = Math.min(Math.round((W * H) / 14000), 150);
    for (var j = 0; j < target; j++) {
      motes.push(newMote(true));
    }
  }

  function newMote(seed) {
    var depth = rand(0.3, 1); // parallax-ish: deeper = smaller, dimmer, slower
    return {
      x: rand(0, W),
      y: seed ? rand(0, H) : H + 8,
      z: depth,
      size: rand(0.5, 2.2) * depth + 0.3,
      a: rand(0.15, 0.7) * depth,
      vx: rand(-0.12, 0.12) * depth,
      vy: -rand(0.05, 0.28) * depth,           // gentle rise
      tw: rand(0.6, 1.6),                        // twinkle speed
      ph: rand(0, Math.PI * 2),
      bright: Math.random() < 0.22               // a few brighter sparks
    };
  }

  function frame() {
    if (!running) return;
    t += 0.016;
    ctx.clearRect(0, 0, W, H);

    // --- drifting gold light ---
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < lights.length; i++) {
      var l = lights[i];
      var lx = l.x + Math.sin(t * 0.12 + l.ph) * 40;
      var ly = l.y + Math.cos(t * 0.09 + l.ph) * 28;
      l.x += l.dx; l.y += l.dy;
      if (l.x < -l.r) l.x = W + l.r; if (l.x > W + l.r) l.x = -l.r;
      if (l.y < -l.r) l.y = H + l.r; if (l.y > H + l.r) l.y = -l.r;
      var g = ctx.createRadialGradient(lx, ly, 0, lx, ly, l.r);
      var pulse = l.a * (0.8 + 0.2 * Math.sin(t * 0.5 + l.ph));
      g.addColorStop(0, "rgba(" + GOLD_DEEP[0] + "," + GOLD_DEEP[1] + "," + GOLD_DEEP[2] + "," + pulse + ")");
      g.addColorStop(1, "rgba(" + GOLD_DEEP[0] + "," + GOLD_DEEP[1] + "," + GOLD_DEEP[2] + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // --- gold dust motes ---
    for (var m = 0; m < motes.length; m++) {
      var p = motes[m];
      p.x += p.vx; p.y += p.vy;
      if (p.y < -8 || p.x < -8 || p.x > W + 8) { motes[m] = newMote(false); continue; }
      var tw = 0.6 + 0.4 * Math.sin(t * p.tw + p.ph);
      var alpha = p.a * tw;
      var col = p.bright ? GOLD : GOLD_DEEP;
      if (p.bright) {
        var halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        halo.addColorStop(0, "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + (alpha * 0.5) + ")");
        halo.addColorStop(1, "rgba(" + col[0] + "," + col[1] + "," + col[2] + ",0)");
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4, 0, 6.2832); ctx.fill();
      }
      ctx.fillStyle = "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + alpha + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.2832); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(frame);
  }

  function staticFrame() {
    // Reduced-motion: paint a single calm frame, no animation.
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < lights.length; i++) {
      var l = lights[i];
      var g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
      g.addColorStop(0, "rgba(" + GOLD_DEEP[0] + "," + GOLD_DEEP[1] + "," + GOLD_DEEP[2] + "," + l.a + ")");
      g.addColorStop(1, "rgba(" + GOLD_DEEP[0] + "," + GOLD_DEEP[1] + "," + GOLD_DEEP[2] + ",0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    for (var m = 0; m < motes.length; m++) {
      var p = motes[m];
      ctx.fillStyle = "rgba(" + GOLD_DEEP[0] + "," + GOLD_DEEP[1] + "," + GOLD_DEEP[2] + "," + p.a + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.2832); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function start() { if (running || reduce) return; if (visible && inView) { running = true; requestAnimationFrame(frame); } }
  function stop() { running = false; }

  // Pause when tab hidden
  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
    if (visible) start(); else stop();
  });

  // Pause when hero scrolled out of view
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      inView = e[0].isIntersecting;
      if (inView) start(); else stop();
    }, { threshold: 0 }).observe(canvas);
  }

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); if (reduce) staticFrame(); }, 150);
  });

  resize();
  if (reduce) staticFrame(); else start();
})();
