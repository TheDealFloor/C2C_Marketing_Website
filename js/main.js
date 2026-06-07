/* ============================================================
   Coast 2 Coast — Home interactions
   Header state · mobile menu · scroll-reveal choreography ·
   hero parallax. Vanilla JS, no dependencies.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: solidify on scroll ---------- */
  var header = document.getElementById("header");
  function onScrollHeader() {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  onScrollHeader();

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll-reveal choreography ----------
     Resilient by design: content must NEVER stay hidden. We reveal
     anything in (or near) the viewport on load + on scroll, use
     IntersectionObserver only as progressive enhancement, and keep a
     failsafe timer so a non-firing observer can't trap content at
     opacity:0. */
  var reveals = [].slice.call(document.querySelectorAll(".reveal"));
  function show(el) { el.classList.add("in"); }

  if (reduce) {
    reveals.forEach(show);
  } else {
    var vhOf = function () { return window.innerHeight || document.documentElement.clientHeight; };
    function revealInView() {
      var vh = vhOf();
      for (var i = 0; i < reveals.length; i++) {
        var el = reveals[i];
        if (el.classList.contains("in")) continue;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) show(el);
      }
    }

    // Progressive enhancement: reveal as elements enter, if IO works.
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    }

    // Reveal what's already on screen right now (IO may not fire in some embeds).
    revealInView();
    window.addEventListener("scroll", revealInView, { passive: true });
    window.addEventListener("resize", revealInView, { passive: true });
    window.addEventListener("load", revealInView);
    // Failsafe: nothing stays invisible past this point.
    setTimeout(revealInView, 600);
    setTimeout(function () { reveals.forEach(show); }, 2600);
  }

  /* ---------- Hero parallax + fade on scroll ---------- */
  var hero = document.getElementById("hero");
  var pEls = [].slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false, heroVisible = true;

  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; }, { threshold: 0 })
      .observe(hero);
  }

  function applyParallax() {
    var y = window.scrollY;
    for (var i = 0; i < pEls.length; i++) {
      var f = parseFloat(pEls[i].getAttribute("data-parallax")) || 0;
      pEls[i].style.transform = "translate3d(0," + (y * f * 100).toFixed(2) + "px,0)";
    }
    // gentle fade of hero content as it leaves
    var inner = hero && hero.querySelector(".hero__in");
    if (inner) {
      var vh = window.innerHeight || 1;
      inner.style.opacity = Math.max(0, 1 - (y / vh) * 1.15).toFixed(3);
    }
    ticking = false;
  }

  function onScroll() {
    onScrollHeader();
    if (reduce || !heroVisible) return;
    if (!ticking) { ticking = true; requestAnimationFrame(applyParallax); }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  if (!reduce) applyParallax();
})();
