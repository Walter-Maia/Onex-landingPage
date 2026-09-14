/* ==========================================================================
   OneX — interações da página: menu, seção ativa, explorador de soluções,
   proteção (relações desenhadas), contato via WhatsApp, revelação por rolagem
   ========================================================================== */
(function () {
  'use strict';

  var cfg = (window.ONEX && window.ONEX.config) || { links: {}, whatsapp: {} };
  var reducedMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(reducedMQ && reducedMQ.matches);

  /* ---------- destinos centralizados ---------- */
  document.querySelectorAll('[data-link]').forEach(function (a) {
    var key = a.getAttribute('data-link');
    if (cfg.links && cfg.links[key]) { a.setAttribute('href', cfg.links[key]); }
  });

  /* ---------- WhatsApp oficial: mensagem preparada por assunto (o visitante revisa e envia) ---------- */
  var WA = cfg.whatsapp || {};
  function waUrl(key) {
    var msg = (WA.messages && WA.messages[key]) || WA.generic || '';
    return (WA.base || 'https://api.whatsapp.com/send') + '?phone=' + encodeURIComponent(WA.number || '') + '&text=' + encodeURIComponent(msg);
  }
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    var key = a.getAttribute('data-wa');
    if (WA.messages && WA.messages[key]) { a.setAttribute('href', waUrl(key)); }
  });

  /* ---------- cabeçalho ao rolar ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- seção ativa no menu (Soluções, Infraestrutura, Sobre, Contato) ---------- */
  var sectionLinks = {};
  document.querySelectorAll('.nav__link[href^="#"]').forEach(function (a) { sectionLinks[a.getAttribute('href').slice(1)] = a; });
  var trackedSections = Array.prototype.slice.call(document.querySelectorAll('main section'));
  var activeTick = false;
  function updateActiveSection() {
    activeTick = false;
    var headerH = header ? header.getBoundingClientRect().height : 72;
    var line = headerH + 24;
    var current = null;
    trackedSections.forEach(function (sec) {
      var r = sec.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) { current = sec; }
    });
    var link = current && current.id ? sectionLinks[current.id] : null;
    Object.keys(sectionLinks).forEach(function (id) {
      var a = sectionLinks[id];
      var on = a === link;
      a.classList.toggle('is-active', on);
      if (on) { a.setAttribute('aria-current', 'location'); } else { a.removeAttribute('aria-current'); }
    });
  }
  function scheduleActive() {
    if (!activeTick) { activeTick = true; window.requestAnimationFrame(updateActiveSection); }
  }
  if (trackedSections.length) {
    window.addEventListener('scroll', scheduleActive, { passive: true });
    window.addEventListener('resize', scheduleActive);
    window.addEventListener('hashchange', function () { window.setTimeout(updateActiveSection, 50); });
    window.addEventListener('load', updateActiveSection);
    updateActiveSection();
  }

  /* ---------- âncora na URL: realinha após fontes/imagens carregarem ---------- */
  function realignHash() {
    var h = window.location.hash;
    if (!h || h.length < 2 || performance.now() > 4000) { return; }
    if (window.ONEX && window.ONEX.intro && window.ONEX.intro.isRunning()) { return; }
    var el = null;
    try { el = document.querySelector(h); } catch (e) { return; }
    if (!el) { return; }
    var prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    el.scrollIntoView({ block: 'start' });
    document.documentElement.style.scrollBehavior = prev;
    updateActiveSection();
  }
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { window.setTimeout(realignHash, 0); }); }
  window.addEventListener('load', function () { window.setTimeout(realignHash, 60); });

  /* ---------- menu mobile ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu-principal');
  function setMenu(open) {
    if (!toggle || !nav) { return; }
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
    if (open) {
      var first = nav.querySelector('a');
      if (first) { first.focus(); }
    }
  }
  function menuOpen() { return toggle && toggle.getAttribute('aria-expanded') === 'true'; }
  if (toggle && nav) {
    document.documentElement.classList.add('js-nav');
    toggle.addEventListener('click', function () { setMenu(!menuOpen()); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { setMenu(false); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen()) { setMenu(false); toggle.focus(); } });
    document.addEventListener('click', function (e) { if (menuOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) { setMenu(false); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 960 && menuOpen()) { setMenu(false); } });
  }

  // Pausa os pulsos dos racks quando a arte sai da tela.
  var heroArt = document.querySelector('.xart');
  if (heroArt && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      heroArt.classList.toggle('is-paused', !entries[0].isIntersecting);
    }).observe(heroArt);
  }

  /* ---------- aba oculta: pausa animações ---------- */
  document.addEventListener('visibilitychange', function () {
    document.documentElement.classList.toggle('is-hidden', document.hidden);
  });

  /* ---------- explorador de soluções ----------
     Base: <details> acessíveis (funcionam sem JS e no mobile). No desktop, um índice com papel de
     tablist mostra um detalhe por vez; teclado: setas, Home/End, Enter/Espaço. */
  var explorer = document.getElementById('explorer');
  var indexHost = document.getElementById('explorer-index');
  var products = explorer ? Array.prototype.slice.call(explorer.querySelectorAll('.product')) : [];
  var tabsMQ = window.matchMedia ? window.matchMedia('(min-width: 901px)') : null;
  var tabs = [];
  var marker = null;
  var current = 0;

  function replayArt(product) {
    product.classList.remove('is-entering');
    void product.offsetWidth; // reinicia as animações da arte e do painel
    product.classList.add('is-entering');
  }

  function moveMarker() {
    if (!marker || !tabs[current]) { return; }
    var t = tabs[current];
    marker.style.transform = 'translateY(' + t.offsetTop + 'px)';
    marker.style.height = t.offsetHeight + 'px';
  }

  function selectTab(i, focus) {
    if (!products.length) { return; }
    i = (i + products.length) % products.length;
    var changed = i !== current;
    current = i;
    products.forEach(function (p, j) {
      var on = j === i;
      if (on) { if (!p.open) { p.open = true; } }
      else if (p.open) { p.open = false; }
    });
    tabs.forEach(function (t, j) {
      var on = j === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    if (focus === true && tabs[i]) { tabs[i].focus(); }   // só por interação; a inicialização não rouba foco nem rolagem
    moveMarker();
    if (changed || focus === 'init') { replayArt(products[i]); }
  }

  function buildTabs() {
    if (!indexHost || tabs.length) { return; }
    var list = document.createElement('ul');
    list.className = 'explorer__tablist';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Soluções');
    list.setAttribute('aria-orientation', 'vertical');
    marker = document.createElement('span');
    marker.className = 'explorer__marker';
    marker.setAttribute('aria-hidden', 'true');
    list.appendChild(marker);
    products.forEach(function (p, i) {
      var li = document.createElement('li');
      li.setAttribute('role', 'presentation');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'explorer__tab';
      b.id = 'tab-' + p.dataset.product;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', p.id);
      b.innerHTML = '<span class="explorer__tab-name">' + p.querySelector('.product__name').textContent + '</span>' +
        '<span class="explorer__tab-hint">' + p.querySelector('.product__opener').textContent + '</span>';
      b.addEventListener('click', function () { selectTab(i, true); });
      b.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); selectTab(i + 1, true); }
        else if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); selectTab(i - 1, true); }
        else if (k === 'Home') { e.preventDefault(); selectTab(0, true); }
        else if (k === 'End') { e.preventDefault(); selectTab(products.length - 1, true); }
      });
      li.appendChild(b);
      list.appendChild(li);
      tabs.push(b);
    });
    indexHost.appendChild(list);
  }

  function enterTabsMode() {
    buildTabs();
    indexHost.hidden = false;
    explorer.classList.add('is-tabs');
    products.forEach(function (p) {
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', 'tab-' + p.dataset.product);
      p.tabIndex = 0;
    });
    var openIdx = products.findIndex(function (p) { return p.open; });
    selectTab(openIdx >= 0 ? openIdx : 0, 'init');
    window.addEventListener('resize', moveMarker);
  }

  function enterAccordionMode() {
    if (!explorer) { return; }
    explorer.classList.remove('is-tabs');
    if (indexHost) { indexHost.hidden = true; }
    products.forEach(function (p) {
      p.removeAttribute('role');
      p.removeAttribute('aria-labelledby');
      p.removeAttribute('tabindex');
    });
    window.removeEventListener('resize', moveMarker);
  }

  if (explorer && products.length) {
    products.forEach(function (p) {
      p.addEventListener('toggle', function () {
        if (p.open) { replayArt(p); }
        if (explorer.classList.contains('is-tabs') && !p.open && products[current] === p) { p.open = true; } // no modo índice o painel atual não fecha
      });
    });
    function applyMode() {
      if (tabsMQ && tabsMQ.matches) { enterTabsMode(); } else { enterAccordionMode(); }
    }
    applyMode();
    if (tabsMQ) {
      if (tabsMQ.addEventListener) { tabsMQ.addEventListener('change', applyMode); }
      else if (tabsMQ.addListener) { tabsMQ.addListener(applyMode); }
    }
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(moveMarker); }
    window.addEventListener('load', moveMarker);
    /* produto pela âncora (#produto-…): na carga, em hashchange e em cliques internos */
    function productFromHash() {
      var h = window.location.hash;
      if (!h || h.indexOf('#produto-') !== 0) { return -1; }
      return products.findIndex(function (p) { return '#' + p.id === h; });
    }
    function openFromHash(scroll) {
      var idx = productFromHash();
      if (idx < 0) { return; }
      if (explorer.classList.contains('is-tabs')) { selectTab(idx, false); } else { products[idx].open = true; }
      if (scroll) {
        var prev = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        products[idx].scrollIntoView({ block: 'start' });
        document.documentElement.style.scrollBehavior = prev;
      }
    }
    openFromHash(false);                       // o salto inicial do navegador é realinhado por realignHash()
    window.addEventListener('hashchange', function () { openFromHash(true); });
  }

  /* ---------- contato: assunto escolhido → mensagem do WhatsApp ---------- */
  var waMain = document.getElementById('wa-main');
  var waHint = document.getElementById('wa-hint');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.contact__chips input[name="assunto"]'));
  function applySubject(key) {
    if (!waMain) { return; }
    waMain.setAttribute('href', waUrl(key || 'generic'));
    if (waHint) {
      var label = WA.labels && WA.labels[key];
      waHint.textContent = label
        ? 'Assunto: ' + label + '. Abre o WhatsApp oficial da OneX com uma mensagem pronta; você revisa e envia.'
        : 'Abre o WhatsApp oficial da OneX com uma mensagem pronta. Você revisa e envia.';
    }
  }
  chips.forEach(function (input) {
    input.addEventListener('change', function () { if (input.checked) { applySubject(input.value); } });
  });

  /* ---------- proteção: relações desenhadas uma vez, quando a seção entra na tela ---------- */
  var protectArt = document.getElementById('protect-art');
  if (protectArt) {
    if (reduced || !('IntersectionObserver' in window)) {
      protectArt.classList.add('is-drawn');
    } else {
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { protectArt.classList.add('is-drawn'); pio.disconnect(); }
        });
      }, { threshold: 0.35 });
      pio.observe(protectArt);
    }
  }

  /* ---------- revelação por rolagem (visível por padrão; só arma o que está fora da viewport) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  function armReveals() {
    if (!reveals.length || reduced || !('IntersectionObserver' in window)) { return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var n = entry.target;
        if (entry.isIntersecting) {
          n.classList.add('is-in');
          n.classList.remove('reveal-armed');
          io.unobserve(n);
        } else if (!n.classList.contains('is-in')) {
          n.classList.add('reveal-armed');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (n) { io.observe(n); });
  }
  function whenIntroSettled(cb) {
    var intro = window.ONEX && window.ONEX.intro;
    if (!intro || !intro.status) { cb(); return; }
    var st = intro.status();
    if (st === 'dismissed' || st === 'done') { cb(); return; }
    var called = false;
    function once() { if (!called) { called = true; cb(); } }
    document.addEventListener('onex:introdone', once, { once: true });
    document.addEventListener('onex:introdecided', function () { if (intro.status() === 'dismissed') { once(); } }, { once: true });
  }
  whenIntroSettled(armReveals);

  /* ---------- peça do hero: pausa fora da viewport ---------- */
  var art = document.querySelector('.xart');
  if (art && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { art.classList.toggle('is-offscreen', !entry.isIntersecting); });
    }, { threshold: 0.05 }).observe(art);
  }

  /* ---------- rever abertura ---------- */
  document.querySelectorAll('[data-replay-intro]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (window.ONEX && window.ONEX.intro) { window.ONEX.intro.start({ replay: true, trigger: btn }); }
    });
  });
})();
