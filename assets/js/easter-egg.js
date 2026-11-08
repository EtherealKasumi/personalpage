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
  var GROW_TIME = 1.45;
  var SUCK_DURATION = 0.65;
  var SUCK_SPREAD = 2.1;
  var COLLAPSE_TIME = 1.25;
  var RETURN_TIME = 1.0;
  var DUST_COUNT = 46;

  var clickCount = 0;
  var resetTimer = 0;
  var busy = false;

  var stage = null;
  var dimEl = null;
  var paperEl = null;
  var shakeAmp = 0;
  var shakeFrame = 0;
  var pageShake = true;
  var implodeLock = [];
  var implodeTickOn = false;
  var implodeAge = 0;
  var vignette = null;
  var holeEl = null;
  var wobbleEl = null;
  var photonEl = null;
  var glowEl = null;
  var flares = [];
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
  var flyUnits = [];
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

  var SIN_TABLE = new Float32Array(2048);
  (function () {
    for (var si = 0; si < 2048; si++) SIN_TABLE[si] = Math.sin((si / 2048) * Math.PI * 2);
  })();
  function fastSin(x) {
    return SIN_TABLE[((x * 325.94932345220167) | 0) & 2047];
  }
  function fastCos(x) {
    return SIN_TABLE[((x * 325.94932345220167 + 512) | 0) & 2047];
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function el(tag, cls, parent) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (parent) parent.appendChild(node);
    return node;
  }

  var gooDisp = null;
  function buildGooFilter() {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    var filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', 'ae-goo');
    filter.setAttribute('x', '-30%');
    filter.setAttribute('y', '-30%');
    filter.setAttribute('width', '160%');
    filter.setAttribute('height', '160%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    var noise = document.createElementNS(NS, 'feTurbulence');
    noise.setAttribute('type', 'fractalNoise');
    noise.setAttribute('baseFrequency', '0.016');
    noise.setAttribute('numOctaves', '2');
    noise.setAttribute('seed', '11');
    noise.setAttribute('result', 'noise');
    gooDisp = document.createElementNS(NS, 'feDisplacementMap');
    gooDisp.setAttribute('in', 'SourceGraphic');
    gooDisp.setAttribute('in2', 'noise');
    gooDisp.setAttribute('scale', '0');
    gooDisp.setAttribute('xChannelSelector', 'R');
    gooDisp.setAttribute('yChannelSelector', 'G');
    filter.appendChild(noise);
    filter.appendChild(gooDisp);
    svg.appendChild(filter);
    document.body.appendChild(svg);

    // warm the filter up so the first frame of the implosion does not stall
    var warm = document.createElement('div');
    warm.style.cssText = 'position:fixed;left:-300px;top:-300px;width:40px;height:40px;border-radius:50%;background:#000;filter:url(#ae-goo);opacity:0.01;pointer-events:none;z-index:-1';
    document.body.appendChild(warm);
    setTimeout(function () {
      if (warm.parentNode) warm.parentNode.removeChild(warm);
    }, 1500);
  }
  buildGooFilter();

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

  /* the horizon and the photon ring are baked once on a canvas so the ragged,
     irregular silhouette costs nothing per frame (no live SVG filters) */
  function bakeDisc(size, opts) {
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    var cx = size / 2;
    var cy = size / 2;
    var baseR = size * opts.radius;
    var amp = size * opts.amp;
    var phase = [];
    for (var q = 0; q < 5; q++) phase.push(Math.random() * Math.PI * 2);
    function edgeRadius(angle) {
      var n = Math.sin(angle * 3 + phase[0]) * 0.5 +
        Math.sin(angle * 5 + phase[1]) * 0.3 +
        Math.sin(angle * 9 + phase[2]) * 0.14 +
        Math.sin(angle * 17 + phase[3]) * 0.06;
      return baseR + n * amp;
    }
    ctx.beginPath();
    for (var i = 0; i <= 360; i++) {
      var a = (i / 360) * Math.PI * 2;
      var r = edgeRadius(a);
      var x = cx + Math.cos(a) * r;
      var y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.save();
    ctx.clip();
    var gradient = ctx.createRadialGradient(cx, cy, baseR * opts.inner, cx, cy, baseR * 1.02);
    var stops = opts.stops;
    for (var s = 0; s < stops.length; s++) gradient.addColorStop(stops[s][0], stops[s][1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
    return canvas.toDataURL();
  }

  function bakeRing(size, opts) {
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    var cx = size / 2;
    var cy = size / 2;
    var baseR = size * opts.radius;
    var amp = size * opts.amp;
    var thickness = size * opts.thickness;
    var phase = [];
    for (var q = 0; q < 4; q++) phase.push(Math.random() * Math.PI * 2);
    function ringRadius(angle) {
      return baseR + (Math.sin(angle * 2 + phase[0]) * 0.5 +
        Math.sin(angle * 5 + phase[1]) * 0.3 +
        Math.sin(angle * 11 + phase[2]) * 0.14 +
        Math.sin(angle * 19 + phase[3]) * 0.06) * amp;
    }
    var gradient = ctx.createRadialGradient(cx, cy, baseR * 0.4, cx, cy, baseR * opts.fade);
    var stops = opts.stops;
    for (var s = 0; s < stops.length; s++) gradient.addColorStop(stops[s][0], stops[s][1]);
    ctx.beginPath();
    for (var i = 0; i <= 360; i++) {
      var a = (i / 360) * Math.PI * 2;
      var r = ringRadius(a) + thickness / 2;
      var x = cx + Math.cos(a) * r;
      var y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    for (var j = 360; j >= 0; j--) {
      var a2 = (j / 360) * Math.PI * 2;
      var r2 = ringRadius(a2) - thickness / 2;
      ctx.lineTo(cx + Math.cos(a2) * r2, cy + Math.sin(a2) * r2);
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    return canvas.toDataURL();
  }

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

    el('div', 'ae-hole__shadow', wobbleEl);
    el('div', 'ae-hole__bloom', wobbleEl);
    el('div', 'ae-hole__bloom ae-hole__bloom--b', wobbleEl);
    el('div', 'ae-hole__accretion', wobbleEl);
    el('div', 'ae-hole__hair', wobbleEl);
    var edge = el('div', 'ae-hole__edge', wobbleEl);
    var coreEl = el('div', 'ae-hole__core', edge);
    coreEl.style.backgroundImage = 'url("' + bakeDisc(320, {
      radius: 0.43,
      amp: 0.028,
      inner: 0.55,
      stops: [[0, 'rgba(0,0,0,1)'], [0.72, 'rgba(0,0,0,1)'], [0.88, 'rgba(0,0,0,0.92)'], [0.97, 'rgba(0,0,0,0.5)'], [1, 'rgba(0,0,0,0)']]
    }) + '")';
    photonEl = el('div', 'ae-hole__photon', edge);
    photonEl.style.backgroundImage = 'url("' + bakeRing(320, {
      radius: 0.435,
      amp: 0.026,
      thickness: 0.035,
      fade: 0.72,
      stops: [[0, 'rgba(255,236,196,0.9)'], [0.4, 'rgba(255,214,150,1)'], [0.72, 'rgba(255,170,74,0.75)'], [1, 'rgba(255,130,30,0)']]
    }) + '")';
    photonEl.style.backgroundSize = '100% 100%';
    coreEl.style.backgroundSize = '100% 100%';

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

    dimEl = el('div', 'ae-dim');
    document.body.appendChild(dimEl);
    paperEl = document.querySelector('.paper-container');
    if (paperEl) paperEl.style.willChange = 'transform';

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
    var hairEl = wobbleEl.querySelector('.ae-hole__hair');
    if (hairEl) spinTweens.push(gsap.to(hairEl, { rotation: '+=360', duration: 26, ease: 'none', repeat: -1 }));
    spinTweens.push(gsap.to(flares[0], { rotation: '+=360', duration: 7.2, ease: 'none', repeat: -1 }));
    spinTweens.push(gsap.to(flares[1], { rotation: '-=360', duration: 11.5, ease: 'none', repeat: -1 }));
  }

  function holeTick() {
    if (!holeAlive || !wobbleEl) return;
    var now = performance.now();
    var dt = Math.min(60, now - lastTick) / 1000;
    lastTick = now;
    var t = now * 0.001;
    var w = wobbleAmount;
    var breath = 1 + Math.sin(t * 2.1) * 0.018;
    var sx = breath * (1 + Math.sin(t * 7.7) * w + Math.sin(t * 17.3) * w * 0.45);
    var sy = breath * (1 + Math.cos(t * 8.9) * w + Math.sin(t * 13.1) * w * 0.4);
    var rot = Math.sin(t * 5.3) * w * 14;
    wobbleEl.style.transform = 'scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ') rotate(' + rot.toFixed(2) + 'deg)';
    if (glowEl) {
      glowEl.style.opacity = (0.72 + 0.28 * Math.sin(t * 6.1)).toFixed(3);
    }
    if (shakeAmp > 0.05 && (++shakeFrame % 3 === 0)) {
      var shx = rand(-shakeAmp, shakeAmp);
      var shy = rand(-shakeAmp, shakeAmp);
      if (paperEl && pageShake) paperEl.style.transform = 'translate3d(' + shx.toFixed(2) + 'px,' + shy.toFixed(2) + 'px,0)';
      if (stage) stage.style.transform = 'translate3d(' + shx.toFixed(2) + 'px,' + shy.toFixed(2) + 'px,0)';
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
      repeat: level === 1 ? 5 : 7,
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

  function implodeTick() {
    if (!implodeTickOn) return;
    implodeAge += 0.02;
    if (gooDisp) {
      var warp = 4 + 52 * Math.min(1, implodeAge / 1.15) * (0.85 + Math.random() * 0.3);
      gooDisp.setAttribute('scale', warp.toFixed(1));
    }
    for (var i = 0; i < implodeLock.length; i++) {
      var item = implodeLock[i];
      if (!item.node || !item.node.parentNode) continue;
      var amp = item.amp * (1 + Math.min(1.6, implodeAge));
      var x = rand(-amp, amp);
      var y = rand(-amp * 0.9, amp * 0.9);
      var r = rand(-amp * 2.2, amp * 2.2);
      item.node.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) rotate(' + r.toFixed(2) + 'deg)';
    }
  }

  function implodeAvatar(geo) {
    var shakeX = gsap.getProperty(avatarSvg, 'x') || 0;
    var shakeY = gsap.getProperty(avatarSvg, 'y') || 0;
    var shakeR = gsap.getProperty(avatarSvg, 'rotation') || 0;
    gsap.killTweensOf(avatarSvg);
    gsap.to(avatarSvg, { x: 0, y: 0, rotation: 0, duration: 0.3, ease: 'power2.out' });
    gsap.to([avatarImage, avatarRim], { opacity: 0, duration: 0.18 });
    gsap.to(orbitParts, { opacity: 0, duration: 0.7, delay: 0.06 });

    var src = avatarImage.getAttribute('href');
    if (!src) src = avatarImage.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
    var size = geo.photoSide;

    var vortex = el('div', 'ae-vortex', stage);
    vortex.style.width = size * 2 + 'px';
    vortex.style.height = size * 2 + 'px';
    vortex.style.left = (geo.cx - size) + 'px';
    vortex.style.top = (geo.cy - size) + 'px';
    gsap.set(vortex, { scale: 0.4, opacity: 0 });
    gsap.to(vortex, { scale: 1.2, opacity: 0.55, rotation: 160, duration: 1.1, ease: 'power2.in' });
    gsap.to(vortex, { opacity: 0, duration: 0.25, delay: 0.95 });

    implodeLock = [];
    var layers = 2;
    var wrappers = [];
    for (var i = 0; i < layers; i++) {
      var wrap = el('div', 'ae-implode-wrap', stage);
      wrap.style.width = size + 'px';
      wrap.style.height = size + 'px';
      wrap.style.left = (geo.cx - size / 2) + 'px';
      wrap.style.top = (geo.cy - size / 2) + 'px';
      var inner = el('div', 'ae-implode-core', wrap);
      inner.style.backgroundImage = 'url("' + src + '")';
      inner.style.filter = 'url(#ae-goo)';
      implodeLock.push({ node: inner, amp: 1.3 + i * 0.5 });
      gsap.set(wrap, {
        x: shakeX,
        y: shakeY,
        rotation: shakeR,
        scale: i === 0 ? 1 : 0.95,
        opacity: i === 0 ? 1 : 0.3
      });
      wrappers.push({ wrap: wrap, index: i });
    }

    implodeAge = 0;
    implodeTickOn = true;
    gsap.ticker.add(implodeTick);

    for (var w = 0; w < wrappers.length; w++) {
      (function (item) {
        var lag = item.index * 0.07;
        var tl = gsap.timeline({ delay: lag });
        tl.to(item.wrap, {
          scale: 1.06,
          rotation: shakeR + 14,
          duration: 0.3,
          ease: 'power2.out'
        }, 0);
        tl.to(item.wrap, {
          x: 0,
          y: 0,
          scale: 0.92,
          rotation: shakeR + 46,
          duration: 0.5,
          ease: 'power1.inOut',
          filter: 'blur(1px)'
        }, 0.3);
        tl.to(item.wrap, {
          scale: 0.34,
          rotation: shakeR + 112,
          duration: 0.45,
          ease: 'power1.in',
          filter: 'blur(3px)'
        }, 0.8);
        tl.to(item.wrap, {
          scale: 0.02,
          rotation: shakeR + 190,
          duration: 0.5,
          ease: 'power2.in',
          filter: 'blur(8px)'
        }, 1.25);
        tl.to(item.wrap, { opacity: 0, duration: 0.18, ease: 'power1.in' }, 1.6);
      })(wrappers[w]);
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
        node._phase = (cx * 0.0137 + cy * 0.0113) % (Math.PI * 2);
        node._rphase = rand(0, Math.PI * 2);
        node._rfreq = rand(0.82, 1.2);
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
    var pull = 72 * holeProgress * holeProgress;
    var t = performance.now() * 0.001;
    for (var i = 0; i < chars.length; i++) {
      var node = chars[i];
      if (node._sucked) continue;
      // every letter gets its own phase and rate (with a hint of a travelling wave)
      var ph = (node._phase || 0) * 0.5 + (node._rphase || 0) * 0.5;
      var fr = node._rfreq || 1;
      var wx = fastSin(t * 6.1 * fr + ph) * 0.62 + fastSin(t * 11.3 * fr + ph * 1.71) * 0.26 + fastSin(t * 3.3 * fr + ph * 0.5) * 0.12;
      var wy = fastCos(t * 5.2 * fr + ph * 1.27) * 0.58 + fastSin(t * 9.7 * fr + ph * 1.93) * 0.3 + fastCos(t * 2.7 * fr + ph * 0.7) * 0.12;
      var x = wx * amp + node._ux * node._falloff * pull;
      var y = wy * amp * 0.9 + node._uy * node._falloff * pull;
      var rot = (fastSin(t * 4.4 * fr + ph * 1.5) * 0.7 + fastSin(t * 8.2 * fr + ph) * 0.3) * amp * 0.7;
      node._ox = x;
      node._oy = y;
      node.style.transform = 'translate3d(' + ((x * 10) | 0) / 10 + 'px,' + ((y * 10) | 0) / 10 + 'px,0) rotate(' + ((rot * 10) | 0) / 10 + 'deg)';
    }
  }

  /* ---------------------------------------------------------- */
  /* phase 4: suction (keeps trembling until each char starts)    */
  /* ---------------------------------------------------------- */

  function suction(geo) {
    pageShake = false;
    if (!chars.length) {
      gsap.ticker.remove(vibrate);
      return Promise.resolve();
    }
    var list = [];
    var maxDist = 1;
    var STEPS = 25;
    for (var i = 0; i < chars.length; i++) {
      var node = chars[i];
      var dx = geo.cx - node._cx;
      var dy = geo.cy - node._cy;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist > maxDist) maxDist = dist;
      var item = {
        el: node,
        dx: dx,
        dy: dy,
        r0: dist,
        perpX: -dy / dist,
        perpY: dx / dist,
        curve: (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 16),
        dur: SUCK_DURATION + Math.random() * 0.16,
        delay: 0,
        phase: Math.random() * Math.PI * 2,
        freq: 9 + Math.random() * 5,
        tilt: rand(-28, 28),
        started: false,
        done: false
      };
      var px = (item.px = new Float32Array(STEPS));
      var py = (item.py = new Float32Array(STEPS));
      for (var q = 0; q < STEPS; q++) {
        var pr = q / (STEPS - 1);
        var ease = pr * pr * (3 - 2 * pr) * 0.35 + pr * pr * 0.65;
        var bow = fastSin(pr * 3.14159) * item.curve;
        px[q] = item.dx * ease + item.perpX * bow;
        py[q] = item.dy * ease + item.perpY * bow;
      }
      list.push(item);
    }
    for (var u = 0; u < list.length; u++) {
      list[u].delay = Math.pow(list[u].r0 / maxDist, 0.85) * SUCK_SPREAD;
    }
    flyUnits = chars;
    var startedAt = 0;

    return new Promise(function (resolve) {
      function frame(now) {
        if (!startedAt) startedAt = now;
        var t = (now - startedAt) / 1000;
        var allDone = true;
        for (var k = 0; k < list.length; k++) {
          var it = list[k];
          if (it.done) continue;
          var p = (t - it.delay) / it.dur;
          if (p <= 0) {
            allDone = false;
            continue;
          }
          if (p >= 1) {
            it.done = true;
            it.el.style.opacity = '0';
            continue;
          }
          allDone = false;
          if (!it.started) {
            it.started = true;
            it.el._sucked = true;
            it.el.style.transform = '';
          }
          var idx = p * (STEPS - 1);
          var i0 = idx | 0;
          var frac = idx - i0;
          var i1 = i0 + 1 > STEPS - 1 ? STEPS - 1 : i0 + 1;
          var bx = it.px[i0] + (it.px[i1] - it.px[i0]) * frac;
          var by = it.py[i0] + (it.py[i1] - it.py[i0]) * frac;
          var tremble = 4.8 * (1 - p) * (1 - p);
          var wob = fastSin(t * it.freq * 6.283 + it.phase);
          var x = bx + wob * tremble;
          var y = by + fastCos(t * it.freq * 6.283 * 0.9 + it.phase) * tremble;
          var rot = it.tilt * p * p + wob * 6 * (1 - p);
          var shrink = 1 - 0.86 * p * p;
          it.el.style.transform =
            'translate3d(' + ((x * 10) | 0) / 10 + 'px,' + ((y * 10) | 0) / 10 + 'px,0)' +
            ' rotate(' + ((rot * 10) | 0) / 10 + 'deg)' +
            ' scale(' + ((shrink * 1000) | 0) / 1000 + ')';
          it.el.style.opacity = ((1 - p * p) * 100 | 0) / 100;
        }
        if (allDone) {
          gsap.ticker.remove(vibrate);
          resolve();
        } else {
          requestAnimationFrame(frame);
        }
      }
      requestAnimationFrame(frame);
    });
  }

  /* ---------------------------------------------------------- */
  /* phase 5: collapse                                           */
  /* ---------------------------------------------------------- */

  function collapseHole() {
    pageShake = true;
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
          wobbleAmount = 0.026 + 0.42 * p * p;
          shakeAmp = 3 + 5 * p * p;
          if (dimEl) dimEl.style.opacity = String(0.55 + 0.22 * p);
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
      if (dimEl) tl.to(dimEl, { opacity: 0.66, duration: COLLAPSE_TIME, ease: 'power2.in' }, 0);
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
      if (dimEl) tl.to(dimEl, { opacity: 0, duration: 0.45, ease: 'power2.out' }, 0);
      tl.to({}, { duration: 0.4, onUpdate: function () { shakeAmp *= 0.92; } }, 0);
      tl.to([avatarImage, avatarRim], { opacity: 1, duration: 0.3 }, 0.05);
      tl.to(orbitParts, { opacity: 1, duration: 0.45 }, 0.1);
      tl.fromTo(avatarSvg, { scale: 0.86 }, { scale: 1, duration: 0.62, ease: 'back.out(2.4)' }, 0.05);
    });
    return Promise.all([burst, returnText()]);
  }

  function returnText() {
    return new Promise(function (resolve) {
      var targets = flyUnits.length ? flyUnits : chars;
      if (!targets.length) { resolve(); return; }
      for (var i = 0; i < targets.length; i++) {
        targets[i].style.opacity = '1';
        if (targets[i].style.visibility === 'hidden') targets[i].style.visibility = '';
      }
      var tl = gsap.timeline({ onComplete: resolve });
      tl.to(targets, {
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        duration: RETURN_TIME,
        ease: 'back.out(1.9)',
        stagger: { each: 0.0012, from: 'random' }
      }, 0);
    });
  }

  /* ---------------------------------------------------------- */
  /* lifecycle                                                   */
  /* ---------------------------------------------------------- */

  function finish() {
    holeAlive = false;
    implodeTickOn = false;
    gsap.ticker.remove(implodeTick);
    implodeLock = [];
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
    if (paperEl) { paperEl.style.transform = ''; paperEl.style.willChange = ''; }
    if (dimEl && dimEl.parentNode) dimEl.parentNode.removeChild(dimEl);
    dimEl = null;
    paperEl = null;
    shakeAmp = 0;
    if (stage && stage.parentNode) stage.parentNode.removeChild(stage);
    if (vignette && vignette.parentNode) vignette.parentNode.removeChild(vignette);
    if (flashFull && flashFull.parentNode) flashFull.parentNode.removeChild(flashFull);
    stage = null;
    vignette = null;
    flashFull = null;
    holeEl = null;
    wobbleEl = null;
    photonEl = null;
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
    tl.call(function () { implodeAvatar(geo); }, null, CHARGE_TIME);
    tl.to(dimEl, { opacity: 0.5, duration: 2.3, ease: 'sine.inOut' }, CHARGE_TIME + 0.05);
    tl.call(function () {
      gsap.to(holeEl, { opacity: 1, duration: 0.2, ease: 'power1.out' });
      startHole();
      gsap.ticker.add(vibrate);
    }, null, CHARGE_TIME + 0.78);
    tl.to(holeEl, {
      scale: 1.55,
      duration: 1.45,
      ease: 'power2.in',
      onUpdate: function () {
        holeProgress = this.progress();
        vibAmp = 8.6 * holeProgress;
        vignette.style.opacity = String(0.95 * holeProgress);
        shakeAmp = 1.6 + 4.2 * holeProgress;
      }
    }, CHARGE_TIME + 0.78);

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
