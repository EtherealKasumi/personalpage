/* ==============================================================
   Avatar easter egg.
   1 click  -> small tremble
   2 clicks -> bigger tremble
   3 clicks -> tremble escalates, avatar shatters and compresses,
               a black hole grows, the page text vibrates harder
               and is pulled in by distance, the hole collapses
               and explodes, throwing every letter back.
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
  var GROW_TIME = 1.5;
  var SUCK_DURATION = 0.62;
  var SUCK_SPREAD = 2.05;
  var COLLAPSE_TIME = 1.15;
  var RETURN_TIME = 1.0;

  var clickCount = 0;
  var resetTimer = 0;
  var busy = false;

  var stage = null;
  var holeEl = null;
  var ringA = null;
  var ringB = null;
  var flashEl = null;
  var shockEl = null;
  var shards = [];
  var split = null;
  var splitNodes = [];
  var chars = [];
  var charData = [];
  var vibAmp = 0;
  var vibFrame = 0;
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

  /* ---------- stage / props ---------- */

  function buildStage(geo) {
    stage = document.createElement('div');
    stage.className = 'ae-stage';
    stage.setAttribute('aria-hidden', 'true');
    document.body.appendChild(stage);

    var side = geo.radius * 2;
    holeEl = document.createElement('div');
    holeEl.className = 'ae-hole';
    holeEl.style.width = side + 'px';
    holeEl.style.height = side + 'px';
    holeEl.style.left = (geo.cx - geo.radius) + 'px';
    holeEl.style.top = (geo.cy - geo.radius) + 'px';
    var glow = document.createElement('div');
    glow.className = 'ae-hole__glow';
    ringA = document.createElement('div');
    ringA.className = 'ae-hole__ring';
    ringB = document.createElement('div');
    ringB.className = 'ae-hole__ring ae-hole__ring--b';
    var core = document.createElement('div');
    core.className = 'ae-hole__core';
    holeEl.appendChild(glow);
    holeEl.appendChild(ringA);
    holeEl.appendChild(ringB);
    holeEl.appendChild(core);
    gsap.set(holeEl, { scale: 0.03, opacity: 0 });
    stage.appendChild(holeEl);

    flashEl = document.createElement('div');
    flashEl.className = 'ae-flash';
    flashEl.style.width = side + 'px';
    flashEl.style.height = side + 'px';
    flashEl.style.left = (geo.cx - geo.radius) + 'px';
    flashEl.style.top = (geo.cy - geo.radius) + 'px';
    gsap.set(flashEl, { scale: 0.2, opacity: 0 });
    stage.appendChild(flashEl);

    shockEl = document.createElement('div');
    shockEl.className = 'ae-shock';
    shockEl.style.width = side + 'px';
    shockEl.style.height = side + 'px';
    shockEl.style.left = (geo.cx - geo.radius) + 'px';
    shockEl.style.top = (geo.cy - geo.radius) + 'px';
    stage.appendChild(shockEl);
  }

  function wedgePolygon(index, total) {
    var c = 50;
    var r = 50;
    var start = (index / total) * TAU - Math.PI / 2;
    var end = ((index + 1) / total) * TAU - Math.PI / 2;
    var points = [c + '% ' + c + '%'];
    var steps = 6;
    for (var s = 0; s <= steps; s++) {
      var a = start + (end - start) * (s / steps);
      var rr = r * (0.96 + 0.04 * Math.sin(index * 5.7 + s * 2.3));
      points.push((c + Math.cos(a) * rr).toFixed(2) + '% ' + (c + Math.sin(a) * rr).toFixed(2) + '%');
    }
    return 'polygon(' + points.join(',') + ')';
  }

  /* ---------- phase 1: tremble ---------- */

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

  /* ---------- phase 2: shatter ---------- */

  function shatterAvatar(geo) {
    gsap.killTweensOf(avatarSvg);
    gsap.set(avatarSvg, { x: 0, y: 0, rotation: 0 });
    gsap.to([avatarImage, avatarRim], { opacity: 0, duration: 0.14 });
    gsap.to(orbitParts, { opacity: 0, duration: 0.9, delay: 0.1 });

    var src = avatarImage.getAttribute('href');
    if (!src) {
      src = avatarImage.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
    }
    var count = geo.photoSide > 420 ? 12 : 10;
    var half = geo.photoSide / 2;
    for (var i = 0; i < count; i++) {
      var shard = document.createElement('div');
      shard.className = 'ae-shard';
      shard.style.left = (geo.cx - half) + 'px';
      shard.style.top = (geo.cy - half) + 'px';
      shard.style.width = geo.photoSide + 'px';
      shard.style.height = geo.photoSide + 'px';
      shard.style.clipPath = wedgePolygon(i, count);
      shard.style.webkitClipPath = shard.style.clipPath;
      var img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.draggable = false;
      shard.appendChild(img);
      var angle = ((i + 0.5) / count) * TAU - Math.PI / 2;
      var out = rand(9, 24);
      shard._ox = Math.cos(angle) * out;
      shard._oy = Math.sin(angle) * out;
      shard._spin = rand(-12, 12);
      stage.appendChild(shard);
      shards.push(shard);
    }

    var tl = gsap.timeline();
    tl.to(shards, {
      x: function (i, target) { return target._ox; },
      y: function (i, target) { return target._oy; },
      rotation: function (i, target) { return target._spin; },
      duration: 0.22,
      ease: 'power2.out'
    }, 0);
    tl.to(shards, {
      x: 0,
      y: 0,
      scale: 0.1,
      rotation: function (i, target) { return target._spin * 5; },
      opacity: 0,
      duration: 0.62,
      ease: 'power3.in'
    }, 0.22);
  }

  /* ---------- phase 3: text split + vibration ---------- */

  function splitPageText() {
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
      charData = [];
      for (var i = 0; i < chars.length; i++) {
        chars[i]._ox = 0;
        chars[i]._oy = 0;
        charData.push({ phaseA: Math.random() * TAU, phaseB: Math.random() * TAU });
      }
    } catch (err) {
      split = null;
      chars = [];
      charData = [];
    }
  }

  function vibrate() {
    if (!vibAmp && vibFrame++ % 3 !== 0) return;
    var amp = vibAmp;
    for (var i = 0; i < chars.length; i++) {
      var el = chars[i];
      var x = rand(-amp, amp);
      var y = rand(-amp * 0.85, amp * 0.85);
      el._ox = x;
      el._oy = y;
      el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';
    }
  }

  function startVibration() {
    vibAmp = 0;
    gsap.ticker.add(vibrate);
  }

  /* ---------- phase 4: suck ---------- */

  function suction(geo) {
    gsap.ticker.remove(vibrate);
    var list = [];
    for (var i = 0; i < chars.length; i++) {
      var el = chars[i];
      var rect = el.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2 - (el._ox || 0);
      var centerY = rect.top + rect.height / 2 - (el._oy || 0);
      var dx = geo.cx - centerX;
      var dy = geo.cy - centerY;
      list.push({
        el: el,
        dx: dx,
        dy: dy,
        dist: Math.sqrt(dx * dx + dy * dy),
        angle: Math.atan2(dy, dx) * 180 / Math.PI - 90,
        ox: el._ox || 0,
        oy: el._oy || 0
      });
    }
    if (!list.length) return Promise.resolve();
    list.sort(function (a, b) { return a.dist - b.dist; });
    var maxDist = list[list.length - 1].dist || 1;
    var tl = gsap.timeline();
    for (var k = 0; k < list.length; k++) {
      var item = list[k];
      var ratio = Math.pow(item.dist / maxDist, 0.85);
      var delay = ratio * SUCK_SPREAD;
      tl.fromTo(item.el,
        { x: item.ox, y: item.oy, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 },
        {
          x: item.dx,
          y: item.dy,
          rotation: item.angle + rand(-9, 9),
          scaleX: 0.12,
          scaleY: 2.5,
          opacity: 0,
          duration: SUCK_DURATION,
          ease: 'power2.in'
        },
        delay
      );
    }
    return tl.then();
  }

  /* ---------- phase 5: collapse ---------- */

  function collapseHole() {
    return new Promise(function (resolve) {
      var tl = gsap.timeline({ onComplete: resolve });
      tl.to(holeEl, {
        scale: 0.02,
        duration: COLLAPSE_TIME,
        ease: 'power2.in',
        onUpdate: function () {
          var p = this.progress();
          var jitter = 1.5 + 16 * p * p;
          gsap.set(holeEl, { x: rand(-jitter, jitter), y: rand(-jitter, jitter) });
        }
      }, 0);
      tl.to(ringA, { rotation: '+=780', duration: COLLAPSE_TIME, ease: 'power2.in' }, 0);
      tl.to(ringB, { rotation: '-=560', duration: COLLAPSE_TIME, ease: 'power2.in' }, 0);
    });
  }

  /* ---------- phase 6: boom + return ---------- */

  function boom(geo) {
    var flash = new Promise(function (resolve) {
      var tl = gsap.timeline({ onComplete: resolve });
      gsap.set(holeEl, { opacity: 0, x: 0, y: 0 });
      tl.fromTo(flashEl, { scale: 0.25, opacity: 0.95 }, {
        scale: 4.6, opacity: 0, duration: 0.55, ease: 'power2.out'
      }, 0);
      tl.fromTo(shockEl, { scale: 0.2, opacity: 0.9 }, {
        scale: 7, opacity: 0, duration: 0.8, ease: 'power3.out'
      }, 0.03);
      tl.to([avatarImage, avatarRim], { opacity: 1, duration: 0.3 }, 0.08);
      tl.to(orbitParts, { opacity: 1, duration: 0.45 }, 0.12);
      tl.fromTo(avatarSvg, { scale: 0.9 }, { scale: 1, duration: 0.55, ease: 'back.out(2)' }, 0.08);
    });
    return Promise.all([flash, returnText()]);
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
        ease: 'back.out(1.7)',
        stagger: { each: 0.0012, from: 'random' }
      }, 0);
    });
  }

  /* ---------- lifecycle ---------- */

  function finish() {
    gsap.ticker.remove(vibrate);
    try {
      if (split) split.revert();
    } catch (err) { /* ignore */ }
    split = null;
    chars = [];
    charData = [];
    vibAmp = 0;
    gsap.killTweensOf([avatarSvg, avatarImage, avatarRim, holeEl, flashEl, shockEl].concat(orbitParts));
    gsap.set(avatarSvg, { clearProps: 'all' });
    gsap.set([avatarImage, avatarRim].concat(orbitParts), { opacity: 1 });
    gsap.set([avatarImage, avatarRim].concat(orbitParts), { clearProps: 'opacity' });
    if (stage && stage.parentNode) stage.parentNode.removeChild(stage);
    stage = null;
    holeEl = null;
    ringA = null;
    ringB = null;
    flashEl = null;
    shockEl = null;
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
        var amp = 2 + 15 * charge.t * charge.t;
        gsap.set(avatarSvg, {
          x: rand(-amp, amp),
          y: rand(-amp * 0.8, amp * 0.8),
          rotation: rand(-amp * 0.14, amp * 0.14)
        });
      }
    }, 0);
    tl.call(splitPageText, null, CHARGE_TIME + 0.02);
    tl.call(function () { shatterAvatar(geo); }, null, CHARGE_TIME);
    tl.call(function () {
      gsap.set(holeEl, { opacity: 1 });
      startVibration();
    }, null, CHARGE_TIME + 0.62);
    tl.to(holeEl, {
      scale: 1.04,
      duration: GROW_TIME,
      ease: 'power2.in',
      onUpdate: function () { vibAmp = 8.4 * this.progress(); }
    }, CHARGE_TIME + 0.62);

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
