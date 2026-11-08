/* ==============================================================
   Avatar easter egg.
   1 click  -> small tremble
   2 clicks -> bigger tremble
   3 clicks -> tremble escalates, avatar shatters and spirals in,
               a black hole grows, the page text trembles and is
               dragged inwards, then sucked in by distance while
               still trembling, the hole collapses and explodes,
               throwing every letter back.
   Requires: gsap + SplitText (loaded only on the home page).
   ============================================================== */
(function () {
  'use strict';

  var avatarSvg = document.querySelector('.profile-orbital-portrait');
  if (!avatarSvg) return;
  if (!window.gsap || !window.SplitText) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var gsap = window.gsap;
  var SplitText = window.SplitText;
  var TAU = Math.PI * 2;

  var CLICK_WINDOW = 1700;
  var CHARGE_TIME = 1.15;
  var GROW_TIME = 1.55;
  var SUCK_DURATION = 0.65;
  var SUCK_SPREAD = 2.1;
  var COLLAPSE_TIME = 1.25;
  var RETURN_TIME = 1.0;
  var DUST_COUNT = 30;

  var clickCount = 0;
  var resetTimer = 0;
  var busy = false;

  var stage = null;
  var voidEl = null;
  var vignette = null;
  var holeEl = null;
  var wobbleEl = null;
  var photonEl = null;
  var chromaEl = null;
  var glowEl = null;
  var warpDisp = null;
  var flares = [];
  var lastWarp = 0;
  var rings = [];
  var disks = [];
  var jets = [];
  var streaksEl = null;
  var dustLayer = null;
  var dust = [];
  var flashEl = null;
  var flashFull = null;
  var shocks = [];
  var shards = [];
  var spinTweens = [];
  var split = null;
  var chars = [];
  var vibAmp = 0;
  var holeProgress = 0;
  var holeAlive = false;
  var wobbleAmount = 0.022;
  var lastTick = 0;
  var htmlOverflow = '';
  var htmlPaddingRight = '';

  var avatarImage = avatarSvg.querySelector('.avatar-svg-image');
  var avatarRim = avatarSvg.querySelector('.avatar-rim');
  var orbitParts = [];
  var orbitNodes = avatarSvg.querySelectorAll('.svg-orbits, .svg-orbits-front, .orbiting-objects');
  for (var oi = 0; oi < orbitNodes.length; oi++) orbitParts.push(orbitNodes[oi]);

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function el(tag, cls, parent) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (parent) parent.appendChild(node);
    return node;
  }

  function measureAvatar() {
    var rect = avatarSvg.getBoundingClientRect();
    return {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      size: rect.width,
      photoSide: rect.width * (164 / 320),
      radius: rect.width * (82 / 320)
    };
  }

  function lockScroll() {
    var root = document.documentElement;
    htmlOverflow = root.style.overflow;
    htmlPaddingRight = root.style.paddingRight;
    var gap = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    if (gap > 0) root.style.paddingRight = gap + 'px';
  }

  function unlockScroll() {
    var root = document.documentElement;
    root.style.overflow = htmlOverflow;
    root.style.paddingRight = htmlPaddingRight;
  }

  /* the SVG turbulence filter that makes the horizon ragged (built once, pre-warmed) */
  function buildWarpFilter() {
    var NS = 'http://www.w3.org/2000/svg';
    var warpSvg = document.createElementNS(NS, 'svg');
    warpSvg.setAttribute('aria-hidden', 'true');
    warpSvg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    var warpFilter = document.createElementNS(NS, 'filter');
    warpFilter.setAttribute('id', 'ae-hole-warp');
    warpFilter.setAttribute('x', '-250%');
    warpFilter.setAttribute('y', '-250%');
    warpFilter.setAttribute('width', '600%');
    warpFilter.setAttribute('height', '600%');
    warpFilter.setAttribute('color-interpolation-filters', 'sRGB');
    var warpNoise = document.createElementNS(NS, 'feTurbulence');
    warpNoise.setAttribute('type', 'fractalNoise');
    warpNoise.setAttribute('baseFrequency', '0.018');
    warpNoise.setAttribute('numOctaves', '2');
    warpNoise.setAttribute('seed', '7');
    warpNoise.setAttribute('result', 'noise');
    warpDisp = document.createElementNS(NS, 'feDisplacementMap');
    warpDisp.setAttribute('in', 'SourceGraphic');
    warpDisp.setAttribute('in2', 'noise');
    warpDisp.setAttribute('scale', '18');
    warpDisp.setAttribute('xChannelSelector', 'R');
    warpDisp.setAttribute('yChannelSelector', 'G');
    warpFilter.appendChild(warpNoise);
    warpFilter.appendChild(warpDisp);
    warpSvg.appendChild(warpFilter);
    document.body.appendChild(warpSvg);

    // warm up the filter pipeline so the first frame of the hole does not hitch
    var warm = document.createElement('div');
    warm.style.cssText = 'position:fixed;left:-200px;top:-200px;width:60px;height:60px;border-radius:50%;background:#000;filter:url(#ae-hole-warp);opacity:0.01;pointer-events:none;z-index:-1';
    document.body.appendChild(warm);
    setTimeout(function () {
      if (warm.parentNode) warm.parentNode.removeChild(warm);
    }, 1200);
  }

  buildWarpFilter();

  /* ---------------------------------------------------------- */
  /* stage + black hole                                          */
  /* ---------------------------------------------------------- */

  function buildStage(geo) {
    var cxPct = (geo.cx / window.innerWidth) * 100;
    var cyPct = (geo.cy / window.innerHeight) * 100;

    stage = el('div', 'ae-stage');
    stage.setAttribute('aria-hidden', 'true');
    document.body.appendChild(stage);

    vignette = el('div', 'ae-vignette');
    vignette.style.setProperty('--ae-vx', cxPct.toFixed(2) + '%');
    vignette.style.setProperty('--ae-vy', cyPct.toFixed(2) + '%');
    vignette.style.setProperty('--ae-fx', cxPct.toFixed(2) + '%');
    vignette.style.setProperty('--ae-fy', cyPct.toFixed(2) + '%');
    document.body.appendChild(vignette);

    var voidSide = geo.photoSide * 1.32;
    voidEl = el('div', 'ae-void', stage);
    voidEl.style.width = voidSide + 'px';
    voidEl.style.height = voidSide + 'px';
    voidEl.style.left = (geo.cx - voidSide / 2) + 'px';
    voidEl.style.top = (geo.cy - voidSide / 2) + 'px';

    var side = geo.radius * 2;
    holeEl = el('div', 'ae-hole', stage);
    holeEl.style.width = side + 'px';
    holeEl.style.height = side + 'px';
    holeEl.style.left = (geo.cx - geo.radius) + 'px';
    holeEl.style.top = (geo.cy - geo.radius) + 'px';
    gsap.set(holeEl, { scale: 0.02, opacity: 0 });

    wobbleEl = el('div', 'ae-hole__wobble', holeEl);
    glowEl = el('div', 'ae-hole__glow', wobbleEl);
    el('div', 'ae-hole__lens', wobbleEl);
    el('div', 'ae-hole__lens ae-hole__lens--b', wobbleEl);
    el('div', 'ae-hole__lens ae-hole__lens--c', wobbleEl);
    el('div', 'ae-hole__jet ae-hole__jet--up', wobbleEl);
    el('div', 'ae-hole__jet ae-hole__jet--down', wobbleEl);
    el('div', 'ae-hole__ring', wobbleEl);
    el('div', 'ae-hole__ring ae-hole__ring--b', wobbleEl);
    el('div', 'ae-hole__flare', wobbleEl);
    el('div', 'ae-hole__flare ae-hole__flare--b', wobbleEl);
    el('div', 'ae-hole__streaks', wobbleEl);

    var edge = el('div', 'ae-hole__edge', wobbleEl);
    edge.style.filter = 'url(#ae-hole-warp)';
    el('div', 'ae-hole__disk', edge);
    el('div', 'ae-hole__disk-streaks', edge);
    el('div', 'ae-hole__core', edge);
    el('div', 'ae-hole__disk ae-hole__disk--front', edge);
    chromaEl = el('div', 'ae-hole__chroma', edge);
    photonEl = el('div', 'ae-hole__photon', edge);

    dustLayer = el('div', 'ae-hole__dust', wobbleEl);
    el('div', 'ae-hole__grain', wobbleEl);

    rings = [].slice.call(wobbleEl.querySelectorAll('.ae-hole__ring'));
    flares = [].slice.call(wobbleEl.querySelectorAll('.ae-hole__flare'));
    disks = [].slice.call(wobbleEl.querySelectorAll('.ae-hole__disk'));
    jets = [].slice.call(wobbleEl.querySelectorAll('.ae-hole__jet'));
    streaksEl = wobbleEl.querySelector('.ae-hole__streaks');

    for (var i = 0; i < DUST_COUNT; i++) {
      var dot = el('div', 'ae-dust', dustLayer);
      var maxR = geo.radius * rand(0.55, 1.9);
      dust.push({
        el: dot,
        angle: Math.random() * TAU,
        radius: rand(geo.radius * 0.2, maxR),
        maxRadius: maxR,
        speed: rand(1.1, 3.6),
        scale: rand(0.5, 1.5)
      });
      gsap.set(dot, { opacity: 0 });
    }
    dustLayer.style.opacity = '0';

    flashEl = el('div', 'ae-flash', stage);
    flashEl.style.width = side + 'px';
    flashEl.style.height = side + 'px';
    flashEl.style.left = (geo.cx - geo.radius) + 'px';
    flashEl.style.top = (geo.cy - geo.radius) + 'px';
    gsap.set(flashEl, { scale: 0.2, opacity: 0 });

    var shockSpecs = ['', ' ae-shock--red', ' ae-shock--blue'];
    for (var s = 0; s < shockSpecs.length; s++) {
      var ring = el('div', 'ae-shock' + shockSpecs[s], stage);
      ring.style.width = side + 'px';
      ring.style.height = side + 'px';
      ring.style.left = (geo.cx - geo.radius) + 'px';
      ring.style.top = (geo.cy - geo.radius) + 'px';
      gsap.set(ring, { scale: 0.2, opacity: 0 });
      shocks.push(ring);
    }

    flashFull = el('div', 'ae-flashfull');
    flashFull.style.setProperty('--ae-fx', cxPct.toFixed(2) + '%');
    flashFull.style.setProperty('--ae-fy', cyPct.toFixed(2) + '%');
    document.body.appendChild(flashFull);
  }

  function startHole() {
    holeAlive = true;
    lastTick = performance.now();
    gsap.ticker.add(holeTick);
    dustLayer.style.opacity = '1';
    for (var i = 0; i < dust.length; i++) gsap.set(dust[i].el, { opacity: 0.9 });
    spinTweens.push(gsap.to(rings, { rotation: '+=360', duration: 2.4, ease: 'none', repeat: -1 }));
    spinTweens.push(gsap.to(streaksEl, { rotation: '-=360', duration: 3.1, ease: 'none', repeat: -1 }));
    spinTweens.push(gsap.to(jets, { scaleY: 1.22, duration: 0.38, ease: 'sine.inOut', repeat: -1, yoyo: true }));
    spinTweens.push(gsap.to(photonEl, { scale: 1.06, duration: 0.55, ease: 'sine.inOut', repeat: -1, yoyo: true }));
    spinTweens.push(gsap.to(flares[0], { rotation: '+=360', duration: 7.2, ease: 'none', repeat: -1 }));
    spinTweens.push(gsap.to(flares[1], { rotation: '-=360', duration: 11.5, ease: 'none', repeat: -1 }));
    var plasma = wobbleEl.querySelector('.ae-hole__disk-streaks');
    if (plasma) spinTweens.push(gsap.to(plasma, { x: 34, duration: 2.9, ease: 'sine.inOut', repeat: -1, yoyo: true }));
  }

  function holeTick() {
    if (!holeAlive || !wobbleEl) return;
    var now = performance.now();
    var dt = Math.min(60, now - lastTick) / 1000;
    lastTick = now;
    var t = now * 0.001;
    var w = wobbleAmount;
    var sx = 1 + Math.sin(t * 7.7) * w + Math.sin(t * 17.3) * w * 0.45;
    var sy = 1 + Math.cos(t * 8.9) * w + Math.sin(t * 13.1) * w * 0.4;
    var rot = Math.sin(t * 5.3) * w * 14;
    wobbleEl.style.transform = 'scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ') rotate(' + rot.toFixed(2) + 'deg)';
    if (chromaEl) {
      chromaEl.style.transform = 'translate(' + (Math.sin(t * 2.3) * 5 + rand(-2.5, 2.5)).toFixed(1) + 'px,' + (Math.cos(t * 3.1) * 4 + rand(-2.5, 2.5)).toFixed(1) + 'px) rotate(' + (Math.sin(t * 1.7) * 18).toFixed(1) + 'deg)';
    }
    if (glowEl) {
      glowEl.style.opacity = (0.72 + 0.28 * Math.sin(t * 6.1)).toFixed(3);
    }
    if (warpDisp && now - lastWarp > 70) {
      lastWarp = now;
      warpDisp.setAttribute('scale', (17 + Math.sin(t * 2.7) * 7 + Math.sin(t * 6.9) * 4).toFixed(1));
    }
    var pull = 14 + 34 * holeProgress;
    for (var i = 0; i < dust.length; i++) {
      var p = dust[i];
      p.angle += p.speed * dt * (1 + holeProgress * 1.8);
      p.radius -= (pull * 1.4) * dt;
      if (p.radius < 3) {
        p.radius = p.maxRadius;
        p.angle = Math.random() * TAU;
      }
      var dx = Math.cos(p.angle) * p.radius;
      var dy = Math.sin(p.angle) * p.radius * 0.72;
      p.el.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(' + p.scale.toFixed(2) + ')';
      p.el.style.opacity = String(Math.max(0.15, Math.min(0.95, (p.radius / p.maxRadius) * 1.4)));
    }
  }

  /* ---------------------------------------------------------- */
  /* phase 1: tremble                                            */
  /* ---------------------------------------------------------- */

  function shakeAvatar(level) {
    gsap.killTweensOf(avatarSvg);
    var amp = level === 1 ? 3.2 : 7.4;
    gsap.fromTo(avatarSvg, { x: 0, y: 0, rotation: 0 }, {
      duration: 0.052,
      repeat: level === 1 ? 5 : 8,
      yoyo: true,
      ease: 'none',
      repeatRefresh: true,
      x: function () { return rand(-amp, amp); },
      y: function () { return rand(-amp * 0.75, amp * 0.75); },
      rotation: function () { return rand(-amp * 0.22, amp * 0.22); },
      onComplete: function () { gsap.set(avatarSvg, { x: 0, y: 0, rotation: 0 }); }
    });
  }

  /* ---------------------------------------------------------- */
  /* phase 2: shatter (violent pop, then spiral into the centre)  */
  /* ---------------------------------------------------------- */

  function wedgePolygon(index, total) {
    var c = 50;
    var r = 50;
    var start = (index / total) * TAU - Math.PI / 2;
    var end = ((index + 1) / total) * TAU - Math.PI / 2;
    var points = [c + '% ' + c + '%'];
    var steps = 6;
    for (var s = 0; s <= steps; s++) {
      var angle = start + (end - start) * (s / steps);
      var rr = r * (0.95 + 0.05 * Math.sin(index * 5.7 + s * 2.3));
      points.push((c + Math.cos(angle) * rr).toFixed(2) + '% ' + (c + Math.sin(angle) * rr).toFixed(2) + '%');
    }
    return 'polygon(' + points.join(',') + ')';
  }

  function shatterAvatar(geo) {
    gsap.killTweensOf(avatarSvg);
    gsap.set(avatarSvg, { x: 0, y: 0, rotation: 0 });
    gsap.fromTo(voidEl, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' });
    gsap.to([avatarImage, avatarRim], { opacity: 0, duration: 0.12 });
    gsap.to(orbitParts, { opacity: 0, duration: 0.85, delay: 0.08 });

    var src = avatarImage.getAttribute('href');
    if (!src) src = avatarImage.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
    var count = geo.photoSide > 420 ? 15 : 12;
    var half = geo.photoSide / 2;

    for (var i = 0; i < count; i++) {
      var shard = el('div', 'ae-shard', stage);
      shard.style.left = (geo.cx - half) + 'px';
      shard.style.top = (geo.cy - half) + 'px';
      shard.style.width = geo.photoSide + 'px';
      shard.style.height = geo.photoSide + 'px';
      shard.style.clipPath = wedgePolygon(i, count);
      shard.style.webkitClipPath = shard.style.clipPath;
      var img = el('img', '', shard);
      img.src = src;
      img.alt = '';
      img.draggable = false;
      shards.push(shard);

      var angle = ((i + 0.5) / count) * TAU - Math.PI / 2;
      var out = rand(22, 60);
      var ox = Math.cos(angle) * out;
      var oy = Math.sin(angle) * out;
      var spin = rand(-36, 36);
      var swirl = (Math.random() < 0.5 ? -1 : 1) * rand(80, 170);
      var delay = rand(0, 0.12);

      var tl = gsap.timeline({ delay: delay });
      tl.to(shard, {
        x: ox,
        y: oy,
        rotation: spin,
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
      }, 0);
      tl.to(shard, {
        x: ox * 0.45 - Math.sin(angle) * out * 0.55,
        y: oy * 0.45 + Math.cos(angle) * out * 0.55,
        rotation: spin * 2.1,
        duration: 0.32,
        ease: 'power1.inOut'
      }, 0.3);
      tl.to(shard, {
        x: 0,
        y: 0,
        rotation: spin * 4 + swirl,
        scale: 0.02,
        duration: 0.6,
        ease: 'power3.in'
      }, 0.62);
      tl.to(shard, {
        opacity: 0,
        duration: 0.18,
        ease: 'power1.in'
      }, 1.02);
    }
  }

  /* ---------------------------------------------------------- */
  /* phase 3: text split, endless tremble + gravitational drag    */
  /* ---------------------------------------------------------- */

  function splitPageText(geo) {
    if (split) return;
    try {
      var selectors = ['.nav-brand', '.top-nav .nav-links a', '.profile-info', '.home-sections'];
      var targets = [];
      for (var s = 0; s < selectors.length; s++) {
        var nodes = document.querySelectorAll(selectors[s]);
        for (var n = 0; n < nodes.length; n++) targets.push(nodes[n]);
      }
      if (!targets.length) return;
      split = SplitText.create(targets, {
        type: 'chars,words',
        charsClass: 'ae-c',
        wordsClass: 'ae-w',
        aria: 'auto'
      });
      chars = split.chars || [];
      var maxDist = 1;
      for (var i = 0; i < chars.length; i++) {
        var node = chars[i];
        var rect = node.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = geo.cx - cx;
        var dy = geo.cy - cy;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        node._cx = cx;
        node._cy = cy;
        node._dist = dist;
        node._ux = dx / dist;
        node._uy = dy / dist;
        node._rotBias = rand(-1, 1);
        node._sucked = false;
        if (dist > maxDist) maxDist = dist;
      }
      for (var k = 0; k < chars.length; k++) {
        chars[k]._falloff = Math.pow(Math.max(0, 1 - chars[k]._dist / maxDist), 1.7);
      }
    } catch (err) {
      split = null;
      chars = [];
    }
  }

  function vibrate() {
    var amp = vibAmp;
    var pull = 34 * holeProgress * holeProgress;
    for (var i = 0; i < chars.length; i++) {
      var node = chars[i];
      if (node._sucked) continue;
      var x = rand(-amp, amp) + node._ux * node._falloff * pull;
      var y = rand(-amp * 0.85, amp * 0.85) + node._uy * node._falloff * pull;
      var rot = node._rotBias * node._falloff * pull * 0.22;
      node._ox = x;
      node._oy = y;
      node.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
    }
  }

  /* ---------------------------------------------------------- */
  /* phase 4: suction (keeps trembling until each char starts)    */
  /* ---------------------------------------------------------- */

  function suction(geo) {
    var list = [];
    for (var i = 0; i < chars.length; i++) {
      var node = chars[i];
      var dx = geo.cx - node._cx;
      var dy = geo.cy - node._cy;
      list.push({
        el: node,
        dx: dx,
        dy: dy,
        dist: node._dist,
        angle: Math.atan2(dy, dx) * 180 / Math.PI - 90
      });
    }
    if (!list.length) {
      gsap.ticker.remove(vibrate);
      return Promise.resolve();
    }
    list.sort(function (p, q) { return p.dist - q.dist; });
    var maxDist = list[list.length - 1].dist || 1;
    var tl = gsap.timeline();
    for (var k = 0; k < list.length; k++) {
      var item = list[k];
      var delay = Math.pow(item.dist / maxDist, 0.85) * SUCK_SPREAD;
      tl.to(item.el, {
        x: item.dx,
        y: item.dy,
        rotation: item.angle + rand(-14, 14),
        scaleX: 0.1,
        scaleY: 2.9,
        opacity: 0,
        duration: SUCK_DURATION,
        ease: 'power2.in',
        onStart: (function (target) {
          return function () { target._sucked = true; };
        })(item.el)
      }, delay);
    }
    return tl.then(function () { gsap.ticker.remove(vibrate); });
  }

  /* ---------------------------------------------------------- */
  /* phase 5: collapse                                           */
  /* ---------------------------------------------------------- */

  function collapseHole() {
    return new Promise(function (resolve) {
      var spin = { v: 1 };
      var tl = gsap.timeline({ onComplete: resolve });
      tl.to(holeEl, {
        scale: 0.012,
        duration: COLLAPSE_TIME,
        ease: 'power2.in',
        onUpdate: function () {
          var p = this.progress();
          var j = 2 + 22 * p * p;
          gsap.set(holeEl, { x: rand(-j, j), y: rand(-j, j) });
          wobbleAmount = 0.026 + 0.34 * p * p;
        }
      }, 0);
      tl.to(spin, {
        v: 6,
        duration: COLLAPSE_TIME,
        ease: 'power2.in',
        onUpdate: function () {
          for (var i = 0; i < spinTweens.length; i++) spinTweens[i].timeScale(spin.v);
        }
      }, 0);
      tl.to(vignette, { opacity: 0.9, duration: COLLAPSE_TIME, ease: 'power2.in' }, 0);
      tl.to(jets, { scaleY: 1.9, opacity: 0.4, duration: COLLAPSE_TIME }, 0);
      tl.to(photonEl, { scale: 1.4, duration: COLLAPSE_TIME, ease: 'power2.in' }, 0);
    });
  }

  /* ---------------------------------------------------------- */
  /* phase 6: boom + text fly-back                               */
  /* ---------------------------------------------------------- */

  function boom(geo) {
    holeAlive = false;
    gsap.ticker.remove(holeTick);
    gsap.set(holeEl, { opacity: 0 });
    var burst = new Promise(function (resolve) {
      var tl = gsap.timeline({ onComplete: resolve });
      tl.fromTo(flashEl, { scale: 0.25, opacity: 1 }, { scale: 5.5, opacity: 0, duration: 0.72, ease: 'expo.out' }, 0);
      tl.fromTo(shocks[0], { scale: 0.2, opacity: 1 }, { scale: 10, opacity: 0, duration: 0.95, ease: 'expo.out' }, 0);
      tl.fromTo(shocks[1], { scale: 0.2, opacity: 0.85 }, { scale: 8, opacity: 0, duration: 1.0, ease: 'power3.out' }, 0.04);
      tl.fromTo(shocks[2], { scale: 0.2, opacity: 0.85 }, { scale: 9, opacity: 0, duration: 1.05, ease: 'power3.out' }, 0.08);
      tl.fromTo(flashFull, { opacity: 0 }, { opacity: 0.32, duration: 0.08, ease: 'none' }, 0);
      tl.to(flashFull, { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.1);
      tl.to(vignette, { opacity: 0, duration: 0.4, ease: 'power2.out' }, 0);
      tl.to([avatarImage, avatarRim], { opacity: 1, duration: 0.3 }, 0.05);
      tl.to(orbitParts, { opacity: 1, duration: 0.45 }, 0.1);
      tl.fromTo(avatarSvg, { scale: 0.86 }, { scale: 1, duration: 0.62, ease: 'back.out(2.4)' }, 0.05);
    });
    return Promise.all([burst, returnText()]);
  }

  function returnText() {
    return new Promise(function (resolve) {
      if (!chars.length) { resolve(); return; }
      var tl = gsap.timeline({ onComplete: resolve });
      tl.to(chars, {
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        duration: RETURN_TIME,
        ease: 'back.out(1.9)',
        stagger: { each: 0.0011, from: 'random' }
      }, 0);
    });
  }

  /* ---------------------------------------------------------- */
  /* lifecycle                                                   */
  /* ---------------------------------------------------------- */

  function finish() {
    holeAlive = false;
    gsap.ticker.remove(vibrate);
    gsap.ticker.remove(holeTick);
    for (var i = 0; i < spinTweens.length; i++) spinTweens[i].kill();
    spinTweens = [];
    try {
      if (split) split.revert();
    } catch (err) { /* ignore */ }
    split = null;
    chars = [];
    vibAmp = 0;
    holeProgress = 0;
    wobbleAmount = 0.022;
    gsap.killTweensOf([avatarSvg, avatarImage, avatarRim, holeEl, wobbleEl, flashEl, flashFull, vignette].concat(orbitParts, rings, disks, jets, shocks));
    gsap.set(avatarSvg, { clearProps: 'all' });
    gsap.set([avatarImage, avatarRim].concat(orbitParts), { opacity: 1 });
    gsap.set([avatarImage, avatarRim].concat(orbitParts), { clearProps: 'opacity' });
    if (stage && stage.parentNode) stage.parentNode.removeChild(stage);
    if (vignette && vignette.parentNode) vignette.parentNode.removeChild(vignette);
    if (flashFull && flashFull.parentNode) flashFull.parentNode.removeChild(flashFull);
    stage = null;
    voidEl = null;
    vignette = null;
    flashFull = null;
    holeEl = null;
    wobbleEl = null;
    photonEl = null;
    chromaEl = null;
    glowEl = null;
    rings = [];
    disks = [];
    jets = [];
    streaksEl = null;
    dustLayer = null;
    dust = [];
    flashEl = null;
    shocks = [];
    shards = [];
    unlockScroll();
    document.body.classList.remove('ae-running');
    clickCount = 0;
    busy = false;
  }

  function run() {
    busy = true;
    document.body.classList.add('ae-running');
    var geo = measureAvatar();
    buildStage(geo);
    lockScroll();

    var charge = { t: 0 };
    var tl = gsap.timeline();
    tl.to(charge, {
      t: 1,
      duration: CHARGE_TIME,
      ease: 'power2.in',
      onUpdate: function () {
        var amp = 2 + 16 * charge.t * charge.t;
        gsap.set(avatarSvg, {
          x: rand(-amp, amp),
          y: rand(-amp * 0.8, amp * 0.8),
          rotation: rand(-amp * 0.16, amp * 0.16)
        });
      }
    }, 0);
    tl.call(function () { splitPageText(geo); }, null, CHARGE_TIME + 0.02);
    tl.call(function () { shatterAvatar(geo); }, null, CHARGE_TIME);
    tl.call(function () {
      gsap.set(holeEl, { opacity: 1 });
      startHole();
      gsap.ticker.add(vibrate);
    }, null, CHARGE_TIME + 0.52);
    tl.to(holeEl, {
      scale: 1.04,
      duration: GROW_TIME,
      ease: 'power2.in',
      onUpdate: function () {
        holeProgress = this.progress();
        vibAmp = 8.6 * holeProgress;
        vignette.style.opacity = String(0.78 * holeProgress);
        if (voidEl) voidEl.style.opacity = String(Math.max(0, 1 - holeProgress * 3.2));
      }
    }, CHARGE_TIME + 0.52);

    tl.then(function () { return suction(geo); })
      .then(function () { return collapseHole(); })
      .then(function () { return boom(geo); })
      .then(function () { finish(); })
      .catch(function () { finish(); });
  }

  function onAvatarClick() {
    if (busy) return;
    clickCount += 1;
    window.clearTimeout(resetTimer);
    if (clickCount >= 3) {
      clickCount = 0;
      run();
      return;
    }
    shakeAvatar(clickCount);
    resetTimer = window.setTimeout(function () { clickCount = 0; }, CLICK_WINDOW);
  }

  avatarSvg.addEventListener('click', onAvatarClick);
})();
