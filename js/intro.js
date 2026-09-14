/* ==========================================================================
   OneX — intro animada (SVG inline + CSS + JS, sem WebGL)
   Estados: idle → volume → glow → circuits → xactive → xlit → done → leave
   Pular, concluir e erro passam pela mesma rotina de limpeza (finish/cleanup).
   ========================================================================== */
(function () {
  'use strict';

  var T = {
    volume: 600, glow: 1600, circuits: 2500, xactive: 3600, done: 4100, leave: 4600, arrive: 5150, end: 5400,
    safety: 6000, staticHold: 1800, storageKey: 'onex-intro-seen',
    flight: { ease: 'cubic-bezier(0.32, 0, 0.18, 1)', smallDurFactor: 0.8, smallPath: 0.72, smallSwap: 220 },
    hero: { swap: 160, art: 240, artDur: 260, title: 320, titleDur: 360, body: 400, bodyDur: 360, facts: 440, factsDur: 340 },
    heroSmall: { swap: 220, art: 200, artDur: 260, title: 440, titleDur: 320, body: 480, bodyDur: 300, facts: 500, factsDur: 300 }
  };
  var userCfg = (window.ONEX && window.ONEX.config && window.ONEX.config.intro) || {};
  Object.keys(userCfg).forEach(function (k) {
    if ((k === 'hero' || k === 'heroSmall' || k === 'flight') && userCfg[k]) { Object.keys(userCfg[k]).forEach(function (h) { T[k][h] = userCfg[k][h]; }); }
    else { T[k] = userCfg[k]; }
  });
  var root = document.documentElement;

  var NS = 'http://www.w3.org/2000/svg';
  var XLINK = 'http://www.w3.org/1999/xlink';

  var overlay = document.getElementById('intro');
  var stage = document.getElementById('intro-stage');
  var persp = document.getElementById('intro-persp');
  if (!overlay || !stage || !persp) { return; }

  var reducedMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function prefersReduced() { return !!(reducedMQ && reducedMQ.matches); }

  /* Geometria da marca (mesmos paths do sprite em index.html) */
  var LETTERS = {
    o: 'M0 70Q0 30 40 30H152Q192 30 192 70V120Q192 160 152 160H40Q0 160 0 120ZM38 74Q38 62 50 62H142Q154 62 154 74V116Q154 128 142 128H50Q38 128 38 116Z',
    n: 'M229 160V66Q229 28 267 28H378Q416 28 416 66V160H378V72Q378 62 368 62H278Q268 62 268 72V160Z',
    e: 'M622 30H490Q451 30 451 69V121Q451 160 490 160H582L612 130H490V105H580L603 84H490V62H590Z',
    x: 'M637 28H697L758 100H698ZM805 0H865L776 102L752 74ZM693 116H773L829 192H777L733 145L690 192H637Z'
  };
  var ORDER = ['o', 'n', 'e', 'x'];

  /* Trilhas principais: O → N → E → hub do X (733,108). Ângulos de 45°/90°. */
  var TRACES = [
    { d: 'M19 95V60Q19 46 33 46H159Q173 46 173 60V88H241V60Q241 39 262 39H383Q404 39 404 60V88H463V69Q463 46 490 46H592H682L727 99L733 108', delay: 0 },
    { d: 'M19 95V130Q19 144 33 144H159Q173 144 173 130V102H255V66Q255 52 269 52H376Q390 52 390 66V102H477V121Q477 146 500 146H590H700L733 113', delay: 60 },
    { d: 'M477 95H575H720L733 108', delay: 520 }
  ];
  /* Ramificações do hub para as quatro partes do X (desenhadas na ativação) */
  var XBRANCHES = [
    'M733 108L667 34',
    'M733 108L757 96L776 74L835 6',
    'M733 112V138L666 190',
    'M733 112V138L800 190'
  ];
  /* Nós: [x, y, índice da trilha] — pontas de pontes e junções; ficam ocultos até o pulso chegar */
  var NODES = [
    [19, 95, 0], [173, 88, 0], [241, 88, 0], [404, 88, 0], [463, 88, 0], [592, 46, 0], [682, 46, 0],
    [173, 102, 1], [255, 102, 1], [390, 102, 1], [477, 102, 1], [590, 146, 1], [700, 146, 1],
    [575, 95, 2], [720, 95, 2], [733, 108, 0]
  ];
  var XNODES = [[667, 34], [835, 6], [666, 190], [800, 190]];

  var DEPTH = 20;            // camadas de extrusão
  var STEP = [1.1, 1.2];     // deslocamento por camada (x, y) → 22 × 24 unidades no total
  /* Frações de chegada dos nós (0–1 do comprimento da trilha). Pré-calculadas para a geometria acima com
     tools/node-fractions.html; regenerar se TRACES ou NODES mudarem. Evita milhares de getPointAtLength na abertura. */
  var NODE_FRACTIONS = [0, 0.25, 0.322, 0.5835, 0.6465, 0.8185, 0.9145, 0.2515, 0.3395, 0.58, 0.6735, 0.832, 0.95, 0.375, 0.9295, 1];

  var state = {
    status: 'pending', // pending | running | dismissed | done
    running: false, raf: 0, start: 0, pausedAt: 0, safety: 0, cleanupTimer: 0, staticTimer: 0, runId: 0,
    replay: false, trigger: null, isStatic: false, stageName: 'idle', flipped: false, leaving: false, swapped: false, arriveAt: 0, paused: false,
    prevScroll: null, lastBuildMs: 0,
    svg: null, sweep: null, specular: null, xOutline: null, xLen: 0, traces: [], branches: [], nodes: [], xnodes: []
  };

  /* ---------- utilitários ---------- */
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    if (attrs) { Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); }); }
    if (parent) { parent.appendChild(n); }
    return n;
  }
  function use(href, attrs, parent) {
    var u = el('use', attrs, parent);
    u.setAttribute('href', href);
    u.setAttributeNS(XLINK, 'xlink:href', href);
    return u;
  }
  function stops(grad, list) { list.forEach(function (s) { el('stop', { offset: s[0], 'stop-color': s[1] }, grad); }); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function easeInOutCubic(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function easeOutCubic(p) { return 1 - Math.pow(1 - p, 3); }
  function mix(a, b, t) {
    var c = [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); });
    return 'rgb(' + c.join(',') + ')';
  }
  function storageGet(k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } }
  function storageSet(k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* armazenamento indisponível */ } }
  function dashSetup(path, len) { path.style.strokeDasharray = len + ' ' + len; path.style.strokeDashoffset = len; }

  /* ---------- construção do SVG ---------- */
  function build(container) {
    container = container || persp;
    var t0 = performance.now();
    container.innerHTML = '';
    var svg = el('svg', { 'class': 'intro__svg', viewBox: '-40 -50 946 340', 'aria-hidden': 'true', focusable: 'false' });
    var defs = el('defs', null, svg);
    ORDER.forEach(function (k) { el('path', { id: 'in-' + k, d: LETTERS[k] }, defs); });

    /* material por letra (objectBoundingBox: cada letra recebe a mesma faixa metálica) */
    var g = el('linearGradient', { id: 'g-metal', x1: '0', y1: '0', x2: '0.35', y2: '1' }, defs);
    stops(g, [['0', '#ffffff'], ['0.4', '#d9d9df'], ['0.55', '#f7f7fa'], ['1', '#b4b4bd']]);
    g = el('linearGradient', { id: 'g-xlit', x1: '0', y1: '0', x2: '0.4', y2: '1' }, defs);
    stops(g, [['0', '#ffb27c'], ['0.45', '#ff6418'], ['1', '#c8420a']]);
    g = el('linearGradient', { id: 'g-bevel', gradientUnits: 'userSpaceOnUse', x1: '0', y1: '0', x2: '866', y2: '200' }, defs);
    stops(g, [['0', 'rgba(255,255,255,0.7)'], ['0.5', 'rgba(255,255,255,0.22)'], ['1', 'rgba(0,0,0,0.6)']]);
    g = el('linearGradient', { id: 'g-bevel-lit', x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
    stops(g, [['0', '#ffffff'], ['1', 'rgba(255,255,255,0.3)']]);
    g = el('linearGradient', { id: 'g-bevel-x', x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
    stops(g, [['0', '#ffe0cc'], ['0.5', '#ff8a45'], ['1', '#6e2404']]);
    g = el('linearGradient', { id: 'g-sweep', x1: '0', y1: '0', x2: '1', y2: '0' }, defs);
    stops(g, [['0', 'rgba(255,255,255,0)'], ['0.5', 'rgba(255,255,255,0.34)'], ['1', 'rgba(255,255,255,0)']]);
    g = el('linearGradient', { id: 'g-specular', x1: '0', y1: '0', x2: '1', y2: '0' }, defs);
    stops(g, [['0', 'rgba(255,255,255,0)'], ['0.45', 'rgba(255,255,255,0.55)'], ['0.55', 'rgba(255,255,255,0.55)'], ['1', 'rgba(255,255,255,0)']]);
    g = el('radialGradient', { id: 'g-halo', cx: '0.5', cy: '0.5', r: '0.5' }, defs);
    stops(g, [['0', 'rgba(255,138,69,0.7)'], ['0.45', 'rgba(255,100,24,0.26)'], ['1', 'rgba(255,100,24,0)']]);

    var f = el('filter', { id: 'f-blur', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    el('feGaussianBlur', { stdDeviation: '9' }, f);
    f = el('filter', { id: 'f-glow-sm', x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs);
    el('feGaussianBlur', { stdDeviation: '2.2' }, f);

    var clipLetters = el('clipPath', { id: 'clip-letters' }, defs);
    ORDER.forEach(function (k) { use('#in-' + k, null, clipLetters); });
    var clipOne = el('clipPath', { id: 'clip-one' }, defs);
    ['o', 'n', 'e'].forEach(function (k) { use('#in-' + k, null, clipOne); });
    var clipAll = el('clipPath', { id: 'clip-all' }, defs);
    ORDER.forEach(function (k) {
      [0, 0.5, 1].forEach(function (p) {
        use('#in-' + k, { transform: 'translate(' + (STEP[0] * DEPTH * p) + ' ' + (STEP[1] * DEPTH * p) + ')' }, clipAll);
      });
    });
    /* máscara dos intervalos: pontes só aparecem fora das faces */
    var mask = el('mask', { id: 'mask-gaps', maskUnits: 'userSpaceOnUse', x: '-40', y: '-50', width: '946', height: '340' }, defs);
    el('rect', { x: '-40', y: '-50', width: '946', height: '340', fill: '#fff' }, mask);
    ORDER.forEach(function (k) { use('#in-' + k, { fill: '#000' }, mask); });

    /* halo do X (atrás das letras) */
    el('ellipse', { 'class': 'x-halo', cx: '751', cy: '96', rx: '200', ry: '160', fill: 'url(#g-halo)' }, svg);

    /* letras: laterais (sombreadas por profundidade) → brilho → face escura → face iluminada → bisel */
    var near = [74, 74, 82], mid = [38, 38, 44], far = [12, 12, 14];
    ORDER.forEach(function (k) {
      var lg = el('g', { 'class': 'letter letter--' + k, 'fill-rule': 'evenodd' }, svg);
      var sides = el('g', { 'class': 'letter__sides' }, lg);
      for (var i = DEPTH; i >= 1; i--) {
        var t = (i - 1) / (DEPTH - 1);
        var col = t < 0.35 ? mix(near, mid, t / 0.35) : mix(mid, far, (t - 0.35) / 0.65);
        use('#in-' + k, { transform: 'translate(' + (STEP[0] * i).toFixed(2) + ' ' + (STEP[1] * i).toFixed(2) + ')', fill: col }, sides);
      }
      use('#in-' + k, { 'class': 'letter__glow', filter: 'url(#f-blur)' }, lg);
      use('#in-' + k, { 'class': 'letter__face' }, lg);
      use('#in-' + k, { 'class': 'letter__lit', fill: k === 'x' ? 'url(#g-xlit)' : 'url(#g-metal)' }, lg);
      use('#in-' + k, { 'class': 'letter__bevel' }, lg);
      if (k === 'x') { state.xOutline = use('#in-x', { 'class': 'letter__outline' }, lg); }
    });

    /* varredura de luz (volume) e faixa especular (glow): o recorte fica em um grupo fixo nas coordenadas
       das letras; só o retângulo filho recebe a transformação (clip-path no próprio retângulo acompanharia o translate) */
    var sweepG = el('g', { 'clip-path': 'url(#clip-all)' }, svg);
    state.sweep = el('rect', { 'class': 'sweep', x: '-440', y: '-60', width: '360', height: '340', fill: 'url(#g-sweep)' }, sweepG);
    var specG = el('g', { 'clip-path': 'url(#clip-one)' }, svg);
    state.specular = el('rect', { 'class': 'specular', x: '-300', y: '-60', width: '220', height: '340', fill: 'url(#g-specular)', transform: 'skewX(-18)' }, specG);

    /* trilhas: ponte (só nos intervalos) → sulco e trilha (só nas faces) → cometa */
    var traces = el('g', { 'class': 'traces' }, svg);
    function makeTrace(d) {
      var bridge = el('path', { 'class': 'trace trace--bridge', d: d, mask: 'url(#mask-gaps)' }, traces);
      var clipped = el('g', { 'clip-path': 'url(#clip-letters)' }, traces);
      var groove = el('path', { 'class': 'trace trace--groove', d: d }, clipped);
      var main = el('path', { 'class': 'trace', d: d }, clipped);
      var comet = el('path', { 'class': 'trace trace--comet', d: d }, traces);
      var len = main.getTotalLength ? main.getTotalLength() : 1200;
      [bridge, groove, main].forEach(function (p) { dashSetup(p, len); });
      comet.style.strokeDasharray = '34 ' + (len + 200);
      comet.style.strokeDashoffset = '34';
      comet.style.opacity = '0';
      return { paths: [bridge, groove, main], comet: comet, len: len, ref: main, p: -1 };
    }
    state.traces = TRACES.map(function (tr) { var o = makeTrace(tr.d); o.delay = tr.delay; return o; });
    state.branches = XBRANCHES.map(function (d) { return makeTrace(d); });

    /* nós (ocultos até a chegada do pulso) */
    var nodesG = el('g', { 'class': 'nodes' }, traces);
    state.nodes = NODES.map(function (n, i) {
      var c = el('circle', { 'class': 'node' + (n[0] === 733 ? ' node--hub' : ''), cx: n[0], cy: n[1], r: n[0] === 733 ? '5.5' : '4.2' }, nodesG);
      return { el: c, trace: n[2], at: NODE_FRACTIONS[i], lit: false };
    });
    state.xnodes = XNODES.map(function (n) {
      return { el: el('circle', { 'class': 'node', cx: n[0], cy: n[1], r: '4' }, nodesG), lit: false };
    });

    /* contorno do X */
    if (state.xOutline) {
      var xp = el('path', { d: LETTERS.x }, defs);
      state.xLen = xp.getTotalLength ? xp.getTotalLength() : 1000;
      dashSetup(state.xOutline, state.xLen);
    }

    /* subtítulo (reaproveita o sprite da página) */
    use('#lg-sub', { 'class': 'logo-sub' }, svg);

    container.appendChild(svg);
    state.svg = svg;
    state.lastBuildMs = Math.round((performance.now() - t0) * 10) / 10;
    return svg;
  }

  /* estado final (marca completa, trilhas desenhadas, nós acesos) — usado pela marca estática */
  function applyFinalState() {
    state.traces.concat(state.branches).forEach(function (tr) {
      tr.p = 1;
      tr.paths.forEach(function (p) { p.style.strokeDashoffset = 0; });
      tr.comet.style.opacity = '0';
    });
    state.nodes.concat(state.xnodes).forEach(function (n) { n.lit = true; n.el.classList.add('is-lit'); });
    if (state.xOutline) { state.xOutline.style.strokeDashoffset = 0; }
  }

  /* ---------- estados ---------- */
  var STAGES = ['volume', 'glow', 'circuits', 'xactive', 'xlit', 'done', 'leave', 'swap'];
  function stageTime(name) { return name === 'xlit' ? T.xactive + 260 : name === 'swap' ? (state.arriveAt || T.arrive) : T[name]; }
  function setStage(t) {
    var current = 'idle';
    STAGES.forEach(function (s) {
      if (t >= stageTime(s)) {
        current = s;
        if (!overlay.classList.contains('st-' + s)) { overlay.classList.add('st-' + s); }
      }
    });
    if (current !== state.stageName) {
      state.stageName = current;
      overlay.setAttribute('data-stage', current);
    }
  }

  function resetClasses() {
    var debug = overlay.classList.contains('is-debug');
    overlay.className = 'intro' + (debug ? ' is-debug' : '');
    overlay.setAttribute('data-stage', 'idle');
    state.stageName = 'idle';
    state.flipped = false;
    state.leaving = false;
    state.swapped = false;
    state.arriveAt = 0;
    stage.style.transform = '';
    stage.style.transition = '';
    overlay.style.transition = '';
    overlay.style.removeProperty('--leave-dur');
    overlay.style.removeProperty('--swap-dur');
  }

  /* classes no <html> que coordenam cabeçalho e hero com a intro (só durante execução animada) */
  function setPageClasses(active, enter, swap) {
    root.classList.toggle('intro-active', !!active);
    root.classList.toggle('hero-enter', !!enter);
    root.classList.toggle('brand-swap', !!swap);
  }

  /* progresso de um grupo de trilhas entre s0 e s1 */
  function driveTrace(tr, t, s0, s1) {
    var p = easeInOutCubic(clamp01((t - s0) / (s1 - s0)));
    if (p === tr.p) { return p; }
    tr.p = p;
    var off = tr.len * (1 - p);
    tr.paths.forEach(function (path) { path.style.strokeDashoffset = off; });
    tr.comet.style.strokeDashoffset = (34 - p * tr.len).toFixed(1);
    tr.comet.style.opacity = p > 0 && p < 1 ? '1' : '0';
    return p;
  }

  /* ---------- quadro a quadro ---------- */
  function frame(now) {
    if (!state.running) { return; }
    try {
      var t = now - state.start;
      setStage(t);

      /* luz rasante */
      if (state.sweep && t >= T.volume && t < T.glow + 400) {
        var ps = easeInOutCubic(clamp01((t - T.volume) / (T.glow - T.volume)));
        state.sweep.setAttribute('transform', 'translate(' + (ps * 1400).toFixed(1) + ' 0)');
      }
      /* faixa especular percorrendo O, N e E */
      if (state.specular && t >= T.glow && t < T.circuits + 300) {
        var pg = easeInOutCubic(clamp01((t - T.glow - 120) / (T.circuits - T.glow - 120)));
        state.specular.setAttribute('transform', 'translate(' + (pg * 1000).toFixed(1) + ' 0) skewX(-18)');
      }

      /* trilhas O → N → E → hub */
      if (t >= T.circuits) {
        var arrive = T.xactive - 40;
        state.traces.forEach(function (tr, i) {
          var p = driveTrace(tr, t, T.circuits + tr.delay, arrive);
          state.nodes.forEach(function (n) {
            if (n.trace === i && !n.lit && p >= n.at - 0.012) { n.lit = true; n.el.classList.add('is-lit'); }
          });
        });
      }

      /* ativação: ramificações do hub para as quatro partes do X, depois contorno */
      if (t >= T.xactive) {
        state.branches.forEach(function (br, i) {
          var p = driveTrace(br, t, T.xactive, T.xactive + 240);
          if (p >= 0.98 && !state.xnodes[i].lit) { state.xnodes[i].lit = true; state.xnodes[i].el.classList.add('is-lit'); }
        });
        if (state.xOutline) {
          var px = easeOutCubic(clamp01((t - T.xactive - 120) / 320));
          state.xOutline.style.strokeDashoffset = (state.xLen * (1 - px)).toFixed(1);
        }
      }

      /* leitura estável entre done e leave; depois a marca viaja até o cabeçalho enquanto o hero entra */
      if (t >= T.leave && !state.flipped) { flipToHeader(); }
      /* a troca acompanha a chegada efetiva desta execução (o trajeto curto chega antes de T.arrive) */
      if (t >= (state.arriveAt || T.arrive) && !state.swapped) { state.swapped = true; root.classList.add('brand-swap'); }
      if (t >= T.end) { finish('complete'); return; }
    } catch (err) {
      if (window.console) { console.error('[intro] erro na animação, liberando o site.', err); }
      finish('error');
      return;
    }
    if (!state.paused) { state.raf = window.requestAnimationFrame(frame); }
  }

  /* Saída: a marca (nítida) viaja até a geometria real do logo do cabeçalho; o fundo escuro some à parte;
     o hero entra em intervalos sobrepostos; na chegada há uma troca breve de opacidade com o logo do cabeçalho. */
  function flipToHeader() {
    state.flipped = true;
    state.leaving = true;
    var small = window.innerWidth < 640 || window.innerHeight < 520;
    var F = T.flight;
    var dur = Math.max(250, T.arrive - T.leave);
    if (small) { dur = Math.round(dur * (F.smallDurFactor || 0.8)); }
    state.arriveAt = T.leave + dur;   // chegada efetiva desta execução; a troca começa aqui
    var h = small ? T.heroSmall : T.hero;
    overlay.style.setProperty('--leave-dur', dur + 'ms');
    overlay.style.setProperty('--swap-dur', (h.swap || 160) + 'ms');
    root.style.setProperty('--hero-swap-dur', (h.swap || 160) + 'ms');
    root.style.setProperty('--hero-art-delay', h.art + 'ms'); root.style.setProperty('--hero-art-dur', h.artDur + 'ms');
    root.style.setProperty('--hero-title-delay', h.title + 'ms'); root.style.setProperty('--hero-title-dur', h.titleDur + 'ms');
    root.style.setProperty('--hero-body-delay', h.body + 'ms'); root.style.setProperty('--hero-body-dur', h.bodyDur + 'ms');
    root.style.setProperty('--hero-facts-delay', h.facts + 'ms'); root.style.setProperty('--hero-facts-dur', h.factsDur + 'ms');
    var heroVisible = !state.replay || (window.scrollY || 0) < window.innerHeight;
    if (heroVisible) { root.classList.add('hero-enter'); }
    else { root.classList.remove('intro-active'); }   // hero fora da tela (replay no rodapé): sem coreografia, conteúdo visível
    try { document.dispatchEvent(new CustomEvent('onex:introleaving', { detail: { duration: dur, arriveAt: state.arriveAt } })); } catch (e) { /* sem CustomEvent */ }

    var target = document.querySelector('#header-logo svg');
    var sr = stage.getBoundingClientRect();
    if (!target || !sr.width) { return; }
    var tr = target.getBoundingClientRect();
    /* transform e opacidade na mesma declaração: a inline sobrescreve a do CSS, então a troca precisa estar aqui */
    stage.style.transition = 'transform ' + dur + 'ms ' + (F.ease || 'cubic-bezier(0.32, 0, 0.18, 1)') + ', opacity ' + (h.swap || 160) + 'ms ease';
    if (!tr.width || tr.width < 20 || !tr.height) {
      stage.style.transform = 'translate(' + (sr.width * 0.15).toFixed(1) + 'px,' + (sr.height * 0.15).toFixed(1) + 'px) scale(0.7)';
      return;
    }
    /* geometria real: o viewBox da intro (-40 -50 946 340) envolve a marca (0 0 866 250) do cabeçalho */
    var sx = sr.width / 946;
    var k = tr.width / (866 * sx);
    var tx = tr.left - sr.left - k * 40 * sx;
    var ty = tr.top - sr.top - k * 50 * sx;
    /* telas pequenas: trajeto parcial e dissolução no lugar, para uma passagem mais serena */
    var p = small ? (F.smallPath || 0.72) : 1;
    var kk = 1 - (1 - k) * p;
    stage.style.transform = 'translate(' + (tx * p).toFixed(1) + 'px,' + (ty * p).toFixed(1) + 'px) scale(' + kk.toFixed(4) + ')';
  }

  /* ---------- foco, inert e rolagem ---------- */
  function lockPage(lock) {
    ['header', 'main', 'footer'].forEach(function (sel) {
      var n = document.querySelector(sel);
      if (!n) { return; }
      if (lock) { n.setAttribute('inert', ''); n.setAttribute('aria-hidden', 'true'); }
      else { n.removeAttribute('inert'); n.removeAttribute('aria-hidden'); }
    });
    document.body.classList.toggle('has-overlay', lock);
  }

  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); finish('skip'); }
  }
  function onVisibility() {
    if (!state.running || state.isStatic) { return; }
    if (document.hidden) { state.pausedAt = performance.now(); window.cancelAnimationFrame(state.raf); }
    else if (state.pausedAt) { state.start += performance.now() - state.pausedAt; state.pausedAt = 0; if (!state.paused) { state.raf = window.requestAnimationFrame(frame); } }
  }
  function onMotionChange(e) {
    if (e.matches && state.running && !state.isStatic) { finish('reduced'); }
  }

  /* ---------- movimento reduzido: marca estática inline, sem overlay nem inert ---------- */
  var staticHost = null, staticTrigger = null, staticScroll = null;
  function showStaticInline(trigger) {
    var main = document.getElementById('conteudo') || document.querySelector('main');
    if (!main) { return false; }
    if (!staticHost || staticHost.hidden) {
      staticScroll = { x: window.scrollX || 0, y: window.scrollY || 0 };
    }
    if (!staticHost) {
      staticHost = document.createElement('section');
      staticHost.id = 'brand-static';
      staticHost.className = 'brand-static';
      staticHost.setAttribute('aria-label', 'Marca OneX (versão estática)');
      staticHost.innerHTML = '<div class="brand-static__stage"><div class="brand-static__persp"></div></div>' +
        '<p class="brand-static__note">Versão estática da abertura, exibida porque o sistema pede menos movimento.</p>' +
        '<button type="button" class="btn btn--sm brand-static__close">Fechar</button>';
      main.insertBefore(staticHost, main.firstChild);
      staticHost.querySelector('.brand-static__close').addEventListener('click', hideStaticInline);
      staticHost.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Esc') { hideStaticInline(); } });
    }
    staticTrigger = trigger || null;
    var host = staticHost.querySelector('.brand-static__persp');
    try { build(host); applyFinalState(); } catch (err) { if (window.console) { console.error('[intro] marca estática indisponível.', err); } return false; }
    staticHost.hidden = false;
    try { staticHost.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (e) { /* sem opções */ }
    var close = staticHost.querySelector('.brand-static__close');
    try { close.focus({ preventScroll: true }); } catch (e) { close.focus(); }
    return true;
  }
  function hideStaticInline() {
    if (!staticHost || staticHost.hidden) { return; }
    staticHost.hidden = true;
    staticHost.querySelector('.brand-static__persp').innerHTML = '';
    if (staticScroll) {
      window.scrollTo({ left: staticScroll.x, top: staticScroll.y, behavior: 'instant' });
      staticScroll = null;
    }
    if (staticTrigger && document.contains(staticTrigger)) {
      try { staticTrigger.focus({ preventScroll: true }); } catch (e) { staticTrigger.focus(); }
    }
    staticTrigger = null;
  }

  /* ---------- ciclo de vida ---------- */
  function cancelCleanup() {
    if (state.cleanupTimer) { window.clearTimeout(state.cleanupTimer); state.cleanupTimer = 0; cleanup(); }
  }
  /* limpeza completa e idempotente */
  function cleanup() {
    state.cleanupTimer = 0;
    overlay.hidden = true;
    resetClasses();
    setPageClasses(false, false, false);
    persp.innerHTML = '';
    state.svg = null; state.sweep = null; state.specular = null; state.xOutline = null;
    state.traces = []; state.branches = []; state.nodes = []; state.xnodes = [];
  }

  function start(opts) {
    opts = opts || {};
    if (state.running) { return false; }
    if (prefersReduced() || opts.staticOnly) {
      /* briefing: com movimento reduzido, site direto com marca estática, inclusive no replay */
      return showStaticInline(opts.trigger);
    }
    cancelCleanup();
    state.runId += 1;
    state.replay = !!opts.replay;
    state.trigger = opts.trigger || null;
    state.paused = false;
    state.pausedAt = 0;
    state.isStatic = false;
    state.prevScroll = { x: window.scrollX || window.pageXOffset || 0, y: window.scrollY || window.pageYOffset || 0 };

    try {
      resetClasses();
      build();
    } catch (err) {
      if (window.console) { console.error('[intro] falha ao montar a intro; site liberado.', err); }
      persp.innerHTML = '';
      overlay.hidden = true;
      return false;
    }

    overlay.hidden = false;
    setPageClasses(true, false, false);   // cabeçalho sem logo e hero preparado só durante a execução animada
    lockPage(true);
    state.running = true;
    if (!state.replay) { window.scrollTo(0, 0); }
    document.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);
    if (reducedMQ && reducedMQ.addEventListener) { reducedMQ.addEventListener('change', onMotionChange); }
    state.safety = window.setTimeout(function () { finish('safety'); }, T.safety);

    state.status = 'running';
    state.start = performance.now();
    state.raf = window.requestAnimationFrame(frame);
    try { overlay.focus({ preventScroll: true }); } catch (e) { overlay.focus(); }
    return true;
  }

  function finish(reason) {
    if (!state.running) { return; }
    state.running = false;
    state.paused = false;
    window.cancelAnimationFrame(state.raf);
    window.clearTimeout(state.safety);
    window.clearTimeout(state.staticTimer);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVisibility);
    if (reducedMQ && reducedMQ.removeEventListener) { reducedMQ.removeEventListener('change', onMotionChange); }

    var quick = reason !== 'complete';
    if (quick) {
      overlay.style.transition = '';
      setPageClasses(false, false, false);   // pular/Esc/erro/segurança: título, ações e logo visíveis de imediato
    }
    overlay.classList.add('is-leaving');

    var focusInside = overlay.contains(document.activeElement);
    lockPage(false);

    /* devolve a posição de rolagem anterior (replay iniciado no rodapé volta ao rodapé) */
    if (state.prevScroll) {
      try { window.scrollTo({ left: state.prevScroll.x, top: state.prevScroll.y, behavior: 'instant' }); }
      catch (e) { window.scrollTo(state.prevScroll.x, state.prevScroll.y); }
    }
    var restore = state.replay && state.trigger && document.contains(state.trigger) ? state.trigger : null;
    if (restore) {
      try { restore.focus({ preventScroll: true }); } catch (e) { restore.focus(); }
    } else if (focusInside && document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }

    var art = document.querySelector('.xart');
    if (art) { art.classList.add('is-live'); }

    var myRun = state.runId;
    state.cleanupTimer = window.setTimeout(function () {
      if (state.runId !== myRun) { return; }   // uma nova execução já assumiu o overlay
      cleanup();
    }, quick ? 220 : 480);

    state.status = 'done';
    try { document.dispatchEvent(new CustomEvent('onex:introdone', { detail: { reason: reason } })); } catch (e) { /* sem CustomEvent */ }
  }

  /* ---------- depuração: congela no instante ms reconstruindo o estado ---------- */
  function seek(ms) {
    if (!state.running || state.isStatic) { return false; }
    window.cancelAnimationFrame(state.raf);
    window.clearTimeout(state.safety);
    state.paused = true;
    var debug = overlay.classList.contains('is-debug');
    overlay.className = 'intro' + (debug ? ' is-debug' : '');
    state.stageName = 'idle';
    state.flipped = false; state.leaving = false; state.swapped = false; state.arriveAt = 0;
    stage.style.transform = ''; stage.style.transition = ''; overlay.style.transition = '';
    overlay.style.removeProperty('--leave-dur'); overlay.style.removeProperty('--swap-dur');
    root.classList.remove('hero-enter'); root.classList.remove('brand-swap');
    state.nodes.concat(state.xnodes).forEach(function (n) { n.lit = false; n.el.classList.remove('is-lit'); });
    state.traces.concat(state.branches).forEach(function (tr) { tr.p = -1; });
    if (state.sweep) { state.sweep.setAttribute('transform', 'translate(0 0)'); }
    if (state.specular) { state.specular.setAttribute('transform', 'translate(0 0) skewX(-18)'); }
    if (state.xOutline) { state.xOutline.style.strokeDashoffset = state.xLen; }
    state.start = performance.now() - ms;
    frame(performance.now());
    return state.running;
  }
  function resume() {
    if (!state.running || !state.paused) { return; }
    state.paused = false;
    state.safety = window.setTimeout(function () { finish('safety'); }, T.safety);
    state.raf = window.requestAnimationFrame(frame);
  }

  /* ---------- execução automática ---------- */
  function shouldAutoRun() {
    if (prefersReduced()) { return false; }
    var hash = window.location.hash;
    if (hash && hash.length > 1) {
      try { if (document.querySelector(hash)) { return false; } } catch (e) { /* hash inválido */ }
    }
    if (storageGet(T.storageKey) === '1') { return false; }
    return true;
  }
  function debugAt() {
    var m = /[?&]introAt=(\d+)/.exec(window.location.search);
    return m ? parseInt(m[1], 10) : null;
  }
  function decided() {
    if (state.status === 'pending') { state.status = 'dismissed'; }
    try { document.dispatchEvent(new CustomEvent('onex:introdecided', { detail: { status: state.status } })); } catch (e) { /* sem CustomEvent */ }
  }
  function autoRun() {
    var at = debugAt();
    if (at !== null) {
      overlay.classList.add('is-debug');
      if (start({ replay: false })) { seek(at); }
      decided();
      return;
    }
    if (shouldAutoRun()) {
      storageSet(T.storageKey, '1');
      if (!start({ replay: false })) { lockPage(false); }
    } else {
      var art = document.querySelector('.xart');
      if (art) { art.classList.add('is-live'); }
    }
    decided();
  }

  window.ONEX = window.ONEX || {};
  window.ONEX.intro = {
    start: start,
    finish: finish,
    seek: seek,
    resume: resume,
    isRunning: function () { return state.running; },
    status: function () { return state.status; },
    stage: function () { return state.stageName; },
    lastBuildMs: function () { return state.lastBuildMs; },
    timings: T
  };

  /* o script fica no fim do body: o DOM necessário já existe, então a decisão é tomada de imediato
     (main.js, carregado em seguida, consulta ONEX.intro.status()) */
  if (document.getElementById('conteudo')) { autoRun(); }
  else { document.addEventListener('DOMContentLoaded', autoRun); }
})();
