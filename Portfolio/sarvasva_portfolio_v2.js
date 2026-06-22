/* ASCII + PIXEL BOOT SEQUENCE */
(function () {
  var overlay = document.getElementById('bootSequence');
  var canvas = document.getElementById('bootRain');
  if (!overlay || !canvas) {
    document.body.classList.remove('booting');
    return;
  }

  var ctx = canvas.getContext('2d');
  var meter = document.getElementById('bootMeter');
  var percent = document.getElementById('bootPercent');
  var status = document.getElementById('bootStatus');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var glyphs = '01<>/\\{}[]#@%&*+SARVASVA'.split('');
  var colors = ['#f5f0e8', '#d4ff00', '#00ffea', '#ff0040', '#bf00ff'];
  var drops = [];
  var start = performance.now();
  var duration = reducedMotion ? 450 : 2450;
  var animationFrame;
  var finished = false;

  function resizeBootCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeDrop(initial) {
    var pixel = Math.random() < .28;
    return {
      x: Math.random() * window.innerWidth,
      y: initial ? Math.random() * window.innerHeight : -30 - Math.random() * 180,
      speed: 2.5 + Math.random() * 8,
      size: pixel ? 3 + Math.random() * 11 : 9 + Math.random() * 11,
      pixel: pixel,
      glyph: glyphs[(Math.random() * glyphs.length) | 0],
      color: colors[(Math.random() * colors.length) | 0],
      alpha: .28 + Math.random() * .72,
      drift: (Math.random() - .5) * .7
    };
  }

  function seedDrops() {
    drops.length = 0;
    var amount = Math.min(150, Math.max(58, Math.floor(window.innerWidth / 10)));
    for (var i = 0; i < amount; i++) drops.push(makeDrop(true));
  }

  function drawBoot(now) {
    var elapsed = now - start;
    var progress = Math.min(1, elapsed / duration);
    ctx.fillStyle = 'rgba(5,5,5,' + (progress > .82 ? '.28' : '.18') + ')';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    for (var i = 0; i < drops.length; i++) {
      var drop = drops[i];
      drop.y += drop.speed * (1 + progress * 1.8);
      drop.x += drop.drift;
      ctx.globalAlpha = drop.alpha;
      ctx.fillStyle = drop.color;
      if (drop.pixel) {
        ctx.fillRect(Math.round(drop.x), Math.round(drop.y), drop.size, drop.size);
      } else {
        ctx.font = '700 ' + drop.size + 'px "Space Mono", monospace';
        ctx.fillText(drop.glyph, drop.x, drop.y);
      }
      if (drop.y > window.innerHeight + 30) drops[i] = makeDrop(false);
    }
    ctx.globalAlpha = 1;

    var displayProgress = Math.min(100, Math.floor(progress * 104));
    meter.style.width = displayProgress + '%';
    percent.textContent = String(displayProgress).padStart(3, '0') + '%';
    if (progress > .76) status.textContent = 'LOCKING SIGNAL';
    else if (progress > .46) status.textContent = 'ASSEMBLING INTERFACE';
    else if (progress > .2) status.textContent = 'PARSING CREATIVE ARCHIVE';

    if (progress < 1) animationFrame = requestAnimationFrame(drawBoot);
    else finishBoot();
  }

  function finishBoot() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(animationFrame);
    meter.style.width = '100%';
    percent.textContent = '100%';
    status.textContent = 'SIGNAL LOCKED // ENTERING';
    overlay.classList.add('boot-complete');
    setTimeout(function () {
      document.body.classList.remove('booting');
      document.body.classList.add('site-revealed');
      overlay.classList.add('boot-exit');
      if (typeof window.startTyping === 'function') {
        window.startTyping();
      }
    }, reducedMotion ? 80 : 260);
    setTimeout(function () {
      overlay.remove();
    }, reducedMotion ? 400 : 1150);
  }

  resizeBootCanvas();
  seedDrops();
  window.addEventListener('resize', function () {
    resizeBootCanvas();
    seedDrops();
  });
  animationFrame = requestAnimationFrame(drawBoot);
}());

/* CURSOR & GENERAL ANIMATION LOOP */
    var cD = document.getElementById('cDot'), cR = document.getElementById('cRing');
    var mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cD.style.left = mx + 'px'; cD.style.top = my + 'px';

      // Sleek glowing red trace particles instead of multicolored confetti
      if (Math.random() < 0.33) {
        var t = document.createElement('div');
        t.className = 'pxt';
        var sz = (Math.random() * 4 + 4) + 'px';
        t.style.width = sz;
        t.style.height = sz;
        t.style.left = (mx - parseInt(sz) / 2 + Math.random() * 8 - 4) + 'px';
        t.style.top = (my - parseInt(sz) / 2 + Math.random() * 8 - 4) + 'px';
        document.body.appendChild(t);

        // Smooth trail shrink-fade
        setTimeout(function () {
          t.style.opacity = '0';
          t.style.transform = 'scale(0.1)';
        }, 50);
        setTimeout(function () { t.remove() }, 450);
      }
    });

    /* OPTIMIZED PRE-GENERATED NOISE FRAMES */
    var nc = document.getElementById('noiseCanvas');
    nc.width = 256; nc.height = 256;
    var nctx = nc.getContext('2d');
    var noiseFrames = [];
    for (var f = 0; f < 5; f++) {
      var canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 256;
      var ctx = canvas.getContext('2d');
      var id = ctx.createImageData(256, 256), d = id.data;
      for (var i = 0; i < d.length; i += 4) {
        var v = (Math.random() * 255) | 0;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 16; // soft opacity pre-baked inside pixel data
      }
      ctx.putImageData(id, 0, 0);
      noiseFrames.push(canvas);
    }
    var curNoiseFrame = 0;
    function drawNoise() {
      nctx.clearRect(0, 0, 256, 256);
      nctx.drawImage(noiseFrames[curNoiseFrame], 0, 0);
      curNoiseFrame = (curNoiseFrame + 1) % noiseFrames.length;
    }

    /* HARDWARE-ACCELERATED REQUESTANIMATIONFRAME LOOP */
    function animateFrame() {
      // Smooth cursor lag
      rx += (mx - rx) * .18;
      ry += (my - ry) * .18;
      cR.style.left = rx + 'px';
      cR.style.top = ry + 'px';

      // High-performance noise cycle
      if (Math.random() < 0.33) {
        drawNoise();
      }

      requestAnimationFrame(animateFrame);
    }
    requestAnimationFrame(animateFrame);

    /* FLICKER */
    var fl = document.getElementById('flickerEl');
    setInterval(function () {
      if (Math.random() < 0.04) {
        fl.style.background = 'rgba(255,255,255,0.04)';
        setTimeout(function () { fl.style.background = 'rgba(255,255,255,0)' }, 50 + Math.random() * 80);
      }
    }, 200);

    /* CLOCK */
    function tc() {
      var n = new Date(), el = document.getElementById('clk');
      if (el) el.textContent = [n.getHours(), n.getMinutes(), n.getSeconds()].map(function (v) { return String(v).padStart(2, '0') }).join(':');
    }
    setInterval(tc, 1000); tc();

    /* TAG BOUNCE */
    function bTag(el) { el.style.transform = 'scale(1.28) rotate(-4deg)'; el.style.boxShadow = '0 0 20px var(--hot)'; setTimeout(function () { el.style.transform = ''; el.style.boxShadow = '' }, 280); }

    /* SECTION NAV */
    var scr = document.getElementById('scroller');
    var secs = ['s0', 's1', 's2', 's3', 's4', 's5', 's6'];
    var curSec = -1;

    function goSec(i) {
      var el = document.getElementById(secs[i]);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    function setActive(btn) {
      document.querySelectorAll('.nsb').forEach(function (b) { b.classList.remove('active') });
      btn.classList.add('active');
    }

    function updateNav(i) {
      if (i === curSec) return;
      curSec = i;
      document.querySelectorAll('.ndot').forEach(function (d, j) { d.classList.toggle('active', j === i) });
      document.querySelectorAll('.nsb').forEach(function (b, j) { b.classList.toggle('active', j === i) });
      triggerReveal(secs[i]);
      if (i === 2) animateBars();
      if (i === 6 && !qStarted) initQ();
    }

    scr.addEventListener('scroll', function () {
      var sh = scr.clientHeight;
      var sr = scr.getBoundingClientRect();
      secs.forEach(function (id, i) {
        var el = document.getElementById(id); if (!el) return;
        var top = el.getBoundingClientRect().top - sr.top;
        if (top > -sh * 0.5 && top < sh * 0.5) updateNav(i);
      });
    }, { passive: true });

    /* SCROLL-DRIVEN DESIGN SPIRAL */
    var designSection = document.getElementById('s4');
    var spiralStage = designSection ? designSection.querySelector('.design-spiral-stage') : null;
    var designCards = designSection ? Array.from(designSection.querySelectorAll('.di')) : [];
    var spiralCurrent = document.getElementById('spiralCurrent');
    var spiralTicking = false;

    designCards.forEach(function (card, index) {
      card.classList.remove('rv');
      card.style.removeProperty('transition-delay');
      card.style.zIndex = String(designCards.length - index);
    });

    // Initialize 3D spiral dots for S4 Design Gallery
    var designDotsContainer = null;
    var designDotsCount = 80;
    var designDots = [];
    if (spiralStage) {
      designDotsContainer = document.createElement('div');
      designDotsContainer.className = 'spiral-dots-container';
      designDotsContainer.style.setProperty('--dot-color', 'var(--hot)');
      spiralStage.appendChild(designDotsContainer);
      for (var dIdx = 0; dIdx < designDotsCount; dIdx++) {
        var dot = document.createElement('span');
        dot.className = 'spiral-dot';
        designDotsContainer.appendChild(dot);
        designDots.push(dot);
      }
    }

    function updateDesignSpiral() {
      spiralTicking = false;
      if (!designSection || !spiralStage || !designCards.length) return;

      var scrollRange = Math.max(1, designSection.offsetHeight - scr.clientHeight);
      var sectionProgress = Math.max(0, Math.min(1, (scr.scrollTop - designSection.offsetTop) / scrollRange));
      var cardProgress = sectionProgress * (designCards.length - 1);
      var radiusX = Math.min(390, scr.clientWidth * (scr.clientWidth < 720 ? .28 : .31));
      var verticalStep = scr.clientWidth < 720 ? 82 : 104;
      var activeIndex = Math.max(0, Math.min(designCards.length - 1, Math.round(cardProgress)));

      designCards.forEach(function (card, index) {
        var distance = index - cardProgress;
        var angle = distance * 1.05;
        var absDistance = Math.abs(distance);
        var x = Math.sin(angle) * radiusX;
        var y = distance * verticalStep + Math.cos(angle) * 16;
        var z = Math.cos(angle) * 115 - absDistance * 105;
        var scale = Math.max(.42, 1 - absDistance * .18 + Math.cos(angle) * .035);
        var rotation = Math.sin(angle) * -18;
        var opacity = Math.max(0, Math.min(1, 1.12 - absDistance * .27));

        card.style.setProperty('--spiral-transform', 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + rotation.toFixed(1) + 'deg) scale(' + scale.toFixed(3) + ')');
        card.style.setProperty('--spiral-opacity', opacity.toFixed(3));
        card.style.zIndex = String(30 - Math.round(absDistance * 4));
        card.classList.toggle('is-active', index === activeIndex);
        card.classList.toggle('is-near', absDistance < .72);
      });

      // Update dots positions in S4 Design Spiral
      if (designDots.length) {
        var t_min = -0.5 - cardProgress;
        var t_max = (designCards.length - 1) + 0.5 - cardProgress;
        designDots.forEach(function (dot, index) {
          var t = t_min + (index / (designDots.length - 1)) * (t_max - t_min);
          var angle = t * 1.05;
          var absT = Math.abs(t);
          var x = Math.sin(angle) * radiusX;
          var y = t * verticalStep + Math.cos(angle) * 16;
          var z = Math.cos(angle) * 115 - absT * 105;
          var scale = Math.max(.42, 1 - absT * .18 + Math.cos(angle) * .035);
          var opacity = Math.max(0, Math.min(1, 1.12 - absT * .27));

          dot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
          dot.style.opacity = opacity.toFixed(3);
        });
      }

      if (spiralCurrent) spiralCurrent.textContent = String(activeIndex + 1).padStart(2, '0');
      spiralStage.style.setProperty('--spiral-progress', sectionProgress.toFixed(3));
    }

    function requestSpiralUpdate() {
      if (spiralTicking) return;
      spiralTicking = true;
      requestAnimationFrame(updateDesignSpiral);
    }

    scr.addEventListener('scroll', requestSpiralUpdate, { passive: true });
    window.addEventListener('resize', requestSpiralUpdate);
    updateDesignSpiral();

    /* REUSABLE SPIRAL STAGES FOR THE REMAINING SECTIONS */
    var sectionSpiralConfigs = [
      { id: 's1', stage: '.asplit', items: '.aleft, .aright' },
      { id: 's2', stage: '.sg', items: '.sk' },
      { id: 's3', stage: '.pg', items: '.pc-link' },
      { id: 's5', stage: '.speak-grid', items: '.speak-card' },
      { id: 's6', stage: '.qwrap', items: null, single: true }
    ];
    var sectionSpirals = [];
    var sectionSpiralTicking = false;

    sectionSpiralConfigs.forEach(function (config) {
      var section = document.getElementById(config.id);
      if (!section) return;

      var sticky = document.createElement('div');
      sticky.className = 'section-spiral-sticky';
      while (section.firstChild) sticky.appendChild(section.firstChild);
      section.appendChild(sticky);
      section.classList.add('spiral-section');

      var stage = sticky.querySelector(config.stage);
      if (!stage) return;
      stage.classList.add('section-spiral-stage');

      var items = config.items ? Array.from(stage.querySelectorAll(config.items)) : [];
      if (config.single || items.length < 2) {
        section.classList.add('single-step-spiral');
        section.style.setProperty('--section-spiral-length', '1');
        return;
      }

      var length = 1 + (items.length - 1) * .92;
      section.style.setProperty('--section-spiral-length', length.toFixed(2));

      var progress = document.createElement('div');
      progress.className = 'section-spiral-progress';
      progress.setAttribute('aria-hidden', 'true');
      progress.innerHTML = '<span>01</span><i></i><span>' + String(items.length).padStart(2, '0') + '</span>';
      stage.appendChild(progress);

      var label = document.createElement('div');
      label.className = 'section-spiral-label';
      label.setAttribute('aria-hidden', 'true');
      label.textContent = 'SCROLL // ROTATE';
      stage.appendChild(label);

      items.forEach(function (item) {
        item.classList.add('section-spiral-item');
        item.classList.remove('rv', 'in', 'sl', 'sr', 'sc');
        item.style.removeProperty('transition-delay');
      });

      // Initialize 3D spiral dots for this section
      var dotsContainer = document.createElement('div');
      dotsContainer.className = 'spiral-dots-container';
      var dotColor = 'var(--cyan)';
      if (config.id === 's1') dotColor = 'var(--acid)';
      else if (config.id === 's2') dotColor = 'var(--cyan)';
      else if (config.id === 's3') dotColor = 'var(--purple)';
      else if (config.id === 's5') dotColor = 'var(--pink)';
      dotsContainer.style.setProperty('--dot-color', dotColor);
      stage.appendChild(dotsContainer);

      var sectionDotsCount = 45;
      var dots = [];
      for (var dIdx = 0; dIdx < sectionDotsCount; dIdx++) {
        var dot = document.createElement('span');
        dot.className = 'spiral-dot';
        dotsContainer.appendChild(dot);
        dots.push(dot);
      }

      sectionSpirals.push({
        section: section,
        stage: stage,
        items: items,
        current: progress.querySelector('span'),
        dots: dots
      });
    });

    function updateSectionSpirals() {
      sectionSpiralTicking = false;

      sectionSpirals.forEach(function (spiral) {
        var scrollRange = Math.max(1, spiral.section.offsetHeight - scr.clientHeight);
        var sectionProgress = Math.max(0, Math.min(1, (scr.scrollTop - spiral.section.offsetTop) / scrollRange));
        var itemProgress = sectionProgress * (spiral.items.length - 1);
        var radiusX = Math.min(360, scr.clientWidth * (scr.clientWidth < 720 ? .25 : .29));
        var verticalStep = scr.clientWidth < 720 ? 72 : 92;
        var activeIndex = Math.max(0, Math.min(spiral.items.length - 1, Math.round(itemProgress)));

        spiral.items.forEach(function (item, index) {
          var distance = index - itemProgress;
          var angle = distance * 1.08;
          var absDistance = Math.abs(distance);
          var x = Math.sin(angle) * radiusX;
          var y = distance * verticalStep + Math.cos(angle) * 12;
          var z = Math.cos(angle) * 100 - absDistance * 125;
          var scale = Math.max(.48, .94 - absDistance * .2 + Math.cos(angle) * .035);
          var rotation = Math.sin(angle) * -16;
          var opacity = Math.max(0, Math.min(1, 1.08 - absDistance * .35));

          item.style.setProperty('--section-item-transform', 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + rotation.toFixed(1) + 'deg) scale(' + scale.toFixed(3) + ')');
          item.style.setProperty('--section-item-opacity', opacity.toFixed(3));
          item.style.zIndex = String(30 - Math.round(absDistance * 5));
          item.classList.toggle('section-item-active', index === activeIndex);
          item.classList.toggle('section-item-near', absDistance < .7);
        });

        // Update dots positions in Section Spiral
        if (spiral.dots && spiral.dots.length) {
          var t_min = -0.5 - itemProgress;
          var t_max = (spiral.items.length - 1) + 0.5 - itemProgress;
          spiral.dots.forEach(function (dot, index) {
            var t = t_min + (index / (spiral.dots.length - 1)) * (t_max - t_min);
            var angle = t * 1.08;
            var absT = Math.abs(t);
            var x = Math.sin(angle) * radiusX;
            var y = t * verticalStep + Math.cos(angle) * 12;
            var z = Math.cos(angle) * 100 - absT * 125;
            var scale = Math.max(.48, .94 - absT * .2 + Math.cos(angle) * .035);
            var opacity = Math.max(0, Math.min(1, 1.08 - absT * .35));

            dot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
            dot.style.opacity = opacity.toFixed(3);
          });
        }

        spiral.current.textContent = String(activeIndex + 1).padStart(2, '0');
        spiral.stage.style.setProperty('--section-progress', sectionProgress.toFixed(3));
      });
    }

    function requestSectionSpiralUpdate() {
      if (sectionSpiralTicking) return;
      sectionSpiralTicking = true;
      requestAnimationFrame(updateSectionSpirals);
    }

    scr.addEventListener('scroll', requestSectionSpiralUpdate, { passive: true });
    window.addEventListener('resize', requestSectionSpiralUpdate);
    updateSectionSpirals();

    /* 3D TILT EFFECT FOR CARDS */
    function initCardTilt() {
      var cards = document.querySelectorAll('.section-spiral-item, .dg-grid .di');
      cards.forEach(function (card) {
        if (card.closest('#s6')) return;

        var rect = null;
        var tiltTicking = false;

        card.addEventListener('mouseenter', function () {
          rect = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', function (e) {
          if (!rect) rect = card.getBoundingClientRect();
          var clientX = e.clientX;
          var clientY = e.clientY;

          if (!tiltTicking) {
            tiltTicking = true;
            requestAnimationFrame(function () {
              if (!rect) {
                tiltTicking = false;
                return;
              }
              var x = clientX - rect.left;
              var y = clientY - rect.top;
              var centerX = rect.width / 2;
              var centerY = rect.height / 2;
              var deltaX = (x - centerX) / centerX;
              var deltaY = (y - centerY) / centerY;

              var maxRotation = 10; // Subtle rotation
              var rx = deltaY * maxRotation;
              var ry = -deltaX * maxRotation;

              card.style.setProperty('--tilt-transform', 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateZ(25px)');
              tiltTicking = false;
            });
          }
        });

        card.addEventListener('mouseleave', function () {
          rect = null;
          card.style.removeProperty('--tilt-transform');
        });
      });
    }
    initCardTilt();

    /* REVEAL */
    function triggerReveal(secId) {
      var sec = document.getElementById(secId); if (!sec) return;
      sec.querySelectorAll('.rv').forEach(function (el, i) {
        setTimeout(function () { el.classList.add('in') }, i * 65 + 90);
      });
    }
    setTimeout(function () { triggerReveal('s0') }, 160);

    /* SKILL BARS */
    function animateBars() {
      setTimeout(function () {
        document.querySelectorAll('#s2 .sr-fill').forEach(function (b) { b.style.width = b.dataset.w + '%' });
      }, 320);
    }

    /* KONAMI */
    var kseq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'], ki = 0;
    document.addEventListener('keydown', function (e) {
      ki = e.code === kseq[ki] ? ki + 1 : 0;
      if (ki === kseq.length) { document.getElementById('konami').classList.add('show'); ki = 0; }
    });

    /* QUIZ */
    var qs = [
      { q: "Which tool is the go-to for network scanning and reconnaissance?", opts: ["Metasploit", "Nmap", "Burp Suite", "Hydra"], ans: 1, exp: "Nmap is the recon workhorse of every pentest." },
      { q: "What does RAT stand for in cybersecurity?", opts: ["Remote Access Trojan", "Random Attack Tool", "Rapid Auth Token", "Reverse App Testing"], ans: 0, exp: "Remote Access Trojan — a stealthy backdoor for persistent remote control." },
      { q: "Which HTTP method is most exploited in CSRF attacks?", opts: ["GET", "POST", "DELETE", "OPTIONS"], ans: 1, exp: "POST requests carry state-changing actions — CSRF forges them on behalf of victims." },
      { q: "What is prompt injection in LLM security?", opts: ["Overloading GPU memory", "Injecting malicious instructions via user input", "SQL injection for AI", "Buffer overflow in NLP"], ans: 1, exp: "Prompt injection tricks an LLM into following attacker-controlled instructions." },
      { q: "Which Rick & Morty character would be the best pentester?", opts: ["Jerry (too scared)", "Bird Person (no hands)", "Rick Sanchez (galaxy-brain)", "Mr. Meeseeks (LOOK AT ME)"], ans: 2, exp: "Obviously Rick. He once hacked the Galactic Federation with a butter robot." },
      { q: "In CTF, the 'pwn' category typically involves what?", opts: ["Web vulnerabilities", "Binary exploitation", "Crypto puzzles", "Network forensics"], ans: 1, exp: "Pwn = binary exploitation — stack overflows, ROP chains, the real fun stuff." },
      { q: "Which framework powers Sarvasva's AI Sales Agent backend?", opts: ["Django", "Flask", "FastAPI", "Express.js"], ans: 2, exp: "FastAPI — async Python with auto-generated docs and real Outlook + Zoho integrations." },
      { q: "What does OWASP stand for?", opts: ["Open Web Application Security Project", "Official Web Audit Security Protocol", "Open Worldwide Access Security Platform", "Online Web Attack Simulation Protocol"], ans: 0, exp: "Open Web Application Security Project — the bible of web security." },
    ];
    var qC = 0, qSc = 0, qAns = [], qStarted = false;

    function initQ() {
      qC = 0; qSc = 0; qAns = []; qStarted = true;
      document.getElementById('qgame').style.display = 'block';
      document.getElementById('qres').style.display = 'none';
      var pips = document.getElementById('qpips'); pips.innerHTML = '';
      qs.forEach(function (_, i) { var d = document.createElement('div'); d.className = 'pip'; d.id = 'p' + i; pips.appendChild(d); });
      renderQ();
    }

    function renderQ() {
      var q = qs[qC];
      document.getElementById('qtxt').textContent = (qC + 1) + '. ' + q.q;
      document.getElementById('qfb').textContent = ''; document.getElementById('qfb').style.color = '';
      document.getElementById('qnxt').style.display = 'none';
      document.getElementById('sv').textContent = qSc;
      for (var i = 0; i < qs.length; i++) {
        var pDocument = document.getElementById('p' + i); if (!pDocument) continue;
        pDocument.className = 'pip' + (i < qC ? (qAns[i] ? ' c' : ' w') : i === qC ? ' cur' : '');
      }
      var L = ['A', 'B', 'C', 'D'], opts = document.getElementById('qopts'); opts.innerHTML = '';
      q.opts.forEach(function (o, i) {
        var b = document.createElement('button'); b.className = 'qopt'; b.setAttribute('data-l', L[i]); b.textContent = o;
        b.addEventListener('click', function () { selA(i, this) }); opts.appendChild(b);
      });
    }

    function selA(idx, btn) {
      var q = qs[qC];
      document.querySelectorAll('.qopt').forEach(function (b) { b.disabled = true });
      var fb = document.getElementById('qfb');
      if (idx === q.ans) { btn.classList.add('c'); qSc++; qAns.push(true); fb.textContent = '✔ CORRECT! ' + q.exp; fb.style.color = 'var(--acid)'; }
      else { btn.classList.add('w'); document.querySelectorAll('.qopt')[q.ans].classList.add('c'); qAns.push(false); fb.textContent = '✘ NOPE! ' + q.exp; fb.style.color = 'var(--hot)'; }
      document.getElementById('sv').textContent = qSc;
      if (qC < qs.length - 1) document.getElementById('qnxt').style.display = 'block';
      else setTimeout(showRes, 1300);
    }

    function nextQ() { qC++; renderQ(); }

    function showRes() {
      document.getElementById('qgame').style.display = 'none';
      document.getElementById('qres').style.display = 'block';
      document.getElementById('rsc').textContent = qSc + '/' + qs.length;
      var msgs = [[0, 2, 'GAME OVER.\nRick is disappointed.\nBut hey, you tried.'], [3, 4, 'NOT BAD.\nYou\'re a Morty in training.'], [5, 6, 'SOLID.\nRick Sanchez energy detected.'], [7, 7, 'IMPRESSIVE.\nLegendary dev unlocked.'], [8, 8, 'PERFECT SCORE.\nWUBBA LUBBA DUB DUB.']];
      var msg = msgs[0][2]; msgs.forEach(function (m) { if (qSc >= m[0] && qSc <= m[1]) msg = m[2]; });
      document.getElementById('rmsg').textContent = msg;
    }

    /* HIGH-FIDELITY DYNAMIC DESIGN LIGHTBOX MODAL */
    var modal = document.getElementById('designModal');
    var modalImg = document.getElementById('modalImg');
    var modalCap = document.getElementById('modalCap');

    document.querySelectorAll('.di').forEach(function (card) {
      card.addEventListener('click', function () {
        var img = card.querySelector('.di-img');
        var title = card.querySelector('.di-ov-title').textContent;
        var sub = card.querySelector('.di-ov-sub').textContent;

        if (img) {
          modalImg.src = img.src;
          modalCap.textContent = title + ' — ' + sub;
          modal.style.display = 'flex';
          // Add a slight dramatic tilt typical of high-fidelity brutalist designs
          modalImg.style.transform = 'rotate(' + (Math.random() * 4 - 2) + 'deg) scale(0.95)';
          setTimeout(function () {
            modalImg.style.transition = 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)';
            modalImg.style.transform = 'rotate(' + (Math.random() * 2 - 1) + 'deg) scale(1)';
          }, 50);
        }
      });
    });

    document.getElementById('modalClose').addEventListener('click', function () {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.style.display = 'none';
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') modal.style.display = 'none';
    });

    /* ARCADE HACKER GAME LOGIC */
    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');
    var gameRunning = false;
    var dinoY = 142;
    var dinoVelocity = 0;
    var dinoJumping = false;
    var obstacles = [];
    var gameScore = 0;
    var gameFrame = 0;
    var speedMultiplier = 1;

    function closeGame() {
      document.getElementById('konami').classList.remove('show');
      gameRunning = false;
    }

    function startGame() {
      document.getElementById('gameOverScreen').style.display = 'none';
      dinoY = 142;
      dinoVelocity = 0;
      dinoJumping = false;
      obstacles = [];
      gameScore = 0;
      gameFrame = 0;
      speedMultiplier = 1;
      gameRunning = true;
      requestAnimationFrame(gameLoop);
    }

    // Player jump trigger on canvas click or keydown
    canvas.addEventListener('click', function () {
      if (gameRunning && !dinoJumping) {
        dinoVelocity = -11;
        dinoJumping = true;
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.code === 'Space') {
        if (document.getElementById('konami').classList.contains('show')) {
          e.preventDefault(); // prevent page scrolling
          if (gameRunning && !dinoJumping) {
            dinoVelocity = -11;
            dinoJumping = true;
          }
        }
      }
    });

    function gameLoop() {
      if (!gameRunning) return;

      // Clear canvas
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, 600, 200);

      // Draw floor line (Grid aesthetic)
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 170);
      ctx.lineTo(600, 170);
      ctx.stroke();

      // Draw grid lines perspective (subtle retro lines)
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      for (var i = 0; i < 680; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 170);
        ctx.lineTo(i - 60, 200);
        ctx.stroke();
      }

      // Player physics
      dinoVelocity += 0.65; // gravity
      dinoY += dinoVelocity;
      if (dinoY >= 142) {
        dinoY = 142;
        dinoVelocity = 0;
        dinoJumping = false;
      }

      // Draw player (Glowing Hacker Packet Box)
      ctx.fillStyle = 'var(--cyan)';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.fillRect(50, dinoY, 24, 28);
      ctx.strokeRect(50, dinoY, 24, 28);

      // Inner matrix packet styling
      ctx.fillStyle = '#000';
      ctx.fillRect(56, dinoY + 6, 4, 4);
      ctx.fillRect(64, dinoY + 6, 4, 4);

      // Spawn obstacles
      gameFrame++;
      if (gameFrame % 90 === 0) {
        obstacles.push({
          x: 600,
          width: 14 + Math.random() * 12,
          height: 20 + Math.random() * 24,
          color: Math.random() < 0.5 ? 'var(--hot)' : 'var(--orange)'
        });
      }

      // Increase speed slightly over time
      if (gameFrame % 300 === 0) {
        speedMultiplier += 0.15;
      }

      // Update and draw obstacles (firewall spikes)
      for (var i = obstacles.length - 1; i >= 0; i--) {
        var obs = obstacles[i];
        obs.x -= 5 * speedMultiplier;

        // Draw firewall spikes
        ctx.fillStyle = obs.color;
        ctx.beginPath();
        ctx.moveTo(obs.x, 170);
        ctx.lineTo(obs.x + obs.width / 2, 170 - obs.height);
        ctx.lineTo(obs.x + obs.width, 170);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Collision detection
        if (obs.x < 74 && obs.x + obs.width > 50 && dinoY + 28 > 170 - obs.height) {
          // Crash!
          gameRunning = false;
          document.getElementById('finalScore').textContent = 'DATA PACKETS EXFILTRATED: ' + gameScore;
          document.getElementById('gameOverScreen').style.display = 'flex';
          return;
        }

        // Score increase
        if (obs.x < 45 && !obs.passed) {
          obs.passed = true;
          gameScore++;
        }

        // Remove offscreen
        if (obs.x < -40) {
          obstacles.splice(i, 1);
        }
      }

      // Draw score display
      ctx.fillStyle = 'var(--acid)';
      ctx.font = '10px "Space Mono", monospace';
      ctx.fillText('SYS_LOG: EXFILTRATED ' + gameScore + ' PACKETS', 10, 20);
      ctx.fillText('SPEED_MOD: ' + speedMultiplier.toFixed(2) + 'x', 10, 36);

      // Loop
      requestAnimationFrame(gameLoop);
    }

    // Hook Konami launch to auto-init game
    document.addEventListener('keydown', function (e) {
      setTimeout(function () {
        if (document.getElementById('konami').classList.contains('show') && !gameRunning) {
          startGame();
        }
      }, 100);
    });

    /* PROFILE PHOTO EASTER EGG */
    var pokeQuotes = [
      "STOP! STOP! DON'T TOUCH ME!",
      "OUCH! THAT HURTS!",
      "HEY! SECURE SHIELD BREACHED!",
      "PORTAL ERROR: DO NOT PROBE!",
      "SYSTEM OVERLOAD! STOP IT!",
      "WUBBA LUBBA DUB DUB!",
      "USER_INTERRUPT: POKE DETECTED!",
      "STOP! IT TICKLES!",
      "ACCESS DENIED! SYSTEM UNSTABLE!",
      "OUCH! MIND THE RESOLUTION!"
    ];
    var pokeTimer = null;
    var profilePhoto = document.getElementById('profilePhotoContainer');
    var pokeBubble = document.getElementById('pokeDialog');

    if (profilePhoto && pokeBubble) {
      profilePhoto.addEventListener('click', function () {
        // Select random dialog quote
        var randomQuote = pokeQuotes[Math.floor(Math.random() * pokeQuotes.length)];
        pokeBubble.textContent = randomQuote;

        // Add classes for styling zoom and bubble popup
        profilePhoto.classList.add('poked');
        pokeBubble.classList.add('active');

        // Clear previous timeouts if clicked repeatedly
        if (pokeTimer) clearTimeout(pokeTimer);

        // Shrink back after 1.5 seconds
        pokeTimer = setTimeout(function () {
          profilePhoto.classList.remove('poked');
          pokeBubble.classList.remove('active');
        }, 1500);
      });
    }

    /* TYPING ANIMATION FOR HERO SUBHEADING */
    var positions = [
      "Cybersecurity Enthusiast",
      "Full stack developer",
      "quizmaster",
      "graphic designer",
      "public speaker"
    ];
    var posIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typingSpeed = 100;
    var deletingSpeed = 50;
    var pauseBetweenRoles = 2000;
    var typedEl = document.getElementById("typedPosition");

    window.startTyping = function() {
      if (!typedEl) typedEl = document.getElementById("typedPosition");
      if (!typedEl) return;
      var currentRole = positions[posIndex];
      if (isDeleting) {
        typedEl.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          posIndex = (posIndex + 1) % positions.length;
          setTimeout(window.startTyping, 400); // Small pause before starting next typing
          return;
        }
        setTimeout(window.startTyping, deletingSpeed);
      } else {
        typedEl.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentRole.length) {
          isDeleting = true;
          setTimeout(window.startTyping, pauseBetweenRoles); // Pause on fully typed word
          return;
        }
        setTimeout(window.startTyping, typingSpeed);
      }
    };