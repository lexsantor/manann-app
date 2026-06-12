/* Manann landing — motion & interactions */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) document.body.dataset.motion = "off";
  function motionOn() { return document.body.dataset.motion !== "off"; }

  /* ---------- nav scroll state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- smooth anchor nav (no scrollIntoView) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: top, behavior: motionOn() ? "smooth" : "auto" });
    });
  });

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });

  /* flow progress */
  var flow = document.querySelector(".flow");
  if (flow) {
    var fio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { flow.classList.add("in"); fio.disconnect(); }
        });
      },
      { threshold: 0.4 }
    );
    fio.observe(flow);
  }

  /* hero dashboard bar growth */
  var dash = document.querySelector(".dash");
  if (dash) setTimeout(function () { dash.classList.add("grow"); }, 200);

  /* ---------- count-up metrics ---------- */
  var fmtCache = {};
  function fmt(n, dec) {
    var key = dec || 0;
    if (!fmtCache[key]) {
      fmtCache[key] = new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: dec || 0,
        maximumFractionDigits: dec || 0
      });
    }
    return fmtCache[key].format(n);
  }
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || "0", 10);
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    if (!motionOn()) {
      el.textContent = prefix + fmt(target, dec) + suffix;
      return;
    }
    var dur = 1700;
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = prefix + fmt(target * eased, dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var cio = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          countUp(en.target);
          cio.unobserve(en.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });

  /* ---------- product tabs ---------- */
  var tabs = document.querySelectorAll(".tab");
  var panels = document.querySelectorAll(".pp");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("active"); });
      panels.forEach(function (p) { p.classList.remove("active"); });
      tab.classList.add("active");
      var panel = document.getElementById(tab.dataset.panel);
      if (panel) panel.classList.add("active");
    });
  });

  /* ---------- hero tilt ---------- */
  var hero = document.querySelector(".hero");
  var dashWrap = document.getElementById("dashWrap");
  var tiltX = 0, tiltY = 0, curX = 0, curY = 0;
  if (hero && dashWrap && window.matchMedia("(hover: hover)").matches) {
    hero.addEventListener("mousemove", function (e) {
      var r = dashWrap.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      tiltY = dx * 4;
      tiltX = -dy * 3;
    });
    hero.addEventListener("mouseleave", function () { tiltX = 0; tiltY = 0; });
  }

  /* ---------- parallax orbs ---------- */
  var orbA = document.querySelector(".orb-a");
  var orbB = document.querySelector(".orb-b");

  /* ---------- cursor glow ---------- */
  var glow = document.getElementById("cursorGlow");
  var mx = innerWidth / 2, my = innerHeight / 3, gx = mx, gy = my;
  window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });

  /* ---------- feature card mouse highlight ---------- */
  document.querySelectorAll(".feature-card").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- ambient particles ---------- */
  var canvas = document.getElementById("bg-canvas");
  var ctx = canvas.getContext("2d");
  var parts = [];
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  var N = 64;
  for (var i = 0; i < N; i++) {
    parts.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.12,
      tw: Math.random() * Math.PI * 2,
      depth: Math.random() * 0.8 + 0.2
    });
  }

  var frame = 0;
  function loop() {
    requestAnimationFrame(loop);
    frame++;

    /* glow follows cursor with lerp (cheap, run always) */
    gx += (mx - gx) * 0.06;
    gy += (my - gy) * 0.06;
    if (glow) glow.style.transform = "translate(" + (gx - 350) + "px," + (gy - 350) + "px)";

    /* tilt lerp */
    curX += (tiltX - curX) * 0.07;
    curY += (tiltY - curY) * 0.07;
    if (dashWrap && motionOn()) {
      dashWrap.style.transform = "rotateX(" + curX.toFixed(2) + "deg) rotateY(" + curY.toFixed(2) + "deg)";
    } else if (dashWrap) {
      dashWrap.style.transform = "none";
    }

    /* orb parallax on scroll */
    if (motionOn()) {
      var sc = window.scrollY;
      if (orbA) orbA.style.transform = "translateY(" + sc * 0.12 + "px)";
      if (orbB) orbB.style.transform = "translateY(" + sc * -0.08 + "px)";
    }

    /* particles */
    ctx.clearRect(0, 0, W, H);
    if (!motionOn()) return;
    for (var i = 0; i < N; i++) {
      var p = parts[i];
      p.x += p.vx; p.y += p.vy; p.tw += 0.015;
      if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
      var a = (0.22 + Math.sin(p.tw) * 0.14) * p.depth;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(140, 190, 255," + a.toFixed(3) + ")";
      ctx.fill();
    }
  }
  loop();
})();
