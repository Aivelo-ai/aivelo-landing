/* ==========================================================================
   AIVELO — interactions & motion
   Stack : GSAP 3.13 (ScrollTrigger, SplitText, Flip) + Lenis smooth scroll.
   Everything degrades gracefully: without the libraries (or with
   prefers-reduced-motion) the page stays fully readable and usable.
   ========================================================================== */
(() => {
  'use strict';

  const html = document.documentElement;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger && window.SplitText);
  const motion = hasGsap && !reduceMotion && html.classList.contains('motion');

  if (!motion) {
    html.classList.remove('motion');
    html.classList.add('no-motion');
    const pre = $('#preloader');
    if (pre) pre.remove();
  }

  let lenis = null;

  /* ------------------------------------------------------------------
     1. Text roll — wrap labels so they can roll on hover
     ------------------------------------------------------------------ */
  $$('.btn-roll, .roll > span').forEach((el) => {
    const label = el.textContent;
    el.removeAttribute('data-text');
    el.textContent = '';
    const inner = document.createElement('span');
    inner.className = 'roll-inner';
    inner.textContent = label;
    el.appendChild(inner);
  });

  /* ------------------------------------------------------------------
     1b. Optical kerning — pull trailing punctuation closer in display type
     ------------------------------------------------------------------ */
  $$('[data-split], .hero-title, .contact-title').forEach((root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.parentElement.closest('.serif')) return;
      if (!/[^\s][.,](?=\s|$)/.test(node.nodeValue)) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(?<=[^\s])([.,])(?=\s|$)/).forEach((part, i) => {
        if (i % 2) {
          const sp = document.createElement('span');
          sp.className = 'punct';
          sp.textContent = part;
          frag.appendChild(sp);
        } else if (part) {
          frag.appendChild(document.createTextNode(part));
        }
      });
      node.replaceWith(frag);
    });
  });

  /* ------------------------------------------------------------------
     2. Navigation — scrolled state, hide on scroll down, active link
     ------------------------------------------------------------------ */
  const nav = $('#nav');
  const burger = $('#burger');
  const menu = $('#mobile-menu');
  let lastY = window.scrollY;
  let menuOpen = false;

  const onScrollNav = (y) => {
    nav.classList.toggle('is-scrolled', y > 24);
    const goingDown = y > lastY + 2;
    const goingUp = y < lastY - 2;
    if (!menuOpen) {
      if (goingDown && y > 480) nav.classList.add('is-hidden');
      else if (goingUp || y < 480) nav.classList.remove('is-hidden');
    }
    lastY = y;
  };
  onScrollNav(window.scrollY);

  const sectionLinks = $$('.nav-links a');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        sectionLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['expertises', 'secteurs', 'methode', 'offres', 'addons'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  const setMenu = (open) => {
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    nav.classList.remove('is-hidden');
    if (lenis) open ? lenis.stop() : lenis.start();
    else document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menuOpen));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) setMenu(false); });

  /* ------------------------------------------------------------------
     3. Offer tabs (with View Transitions when supported)
     ------------------------------------------------------------------ */
  const tabs = $$('.tab');
  const indicator = $('#tabs-indicator');

  const moveIndicator = () => {
    const active = $('.tab.active');
    if (!active || !indicator) return;
    indicator.style.width = active.offsetWidth + 'px';
    indicator.style.transform = `translateX(${active.offsetLeft - 6}px)`;
  };

  const activateTab = (name, { focus = false } = {}) => {
    const current = $('.panel:not([hidden])');
    const next = $('#panel-' + name);
    if (!next || current === next) return;

    const swap = () => {
      tabs.forEach((t) => {
        const on = t.dataset.tab === name;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      if (current) { current.hidden = true; current.style.viewTransitionName = ''; }
      next.hidden = false;
      next.style.viewTransitionName = 'plans';
      moveIndicator();
    };

    if (document.startViewTransition && !reduceMotion) {
      if (current) current.style.viewTransitionName = 'plans';
      const vt = document.startViewTransition(swap);
      vt.finished.finally(() => { next.style.viewTransitionName = ''; refresh(); });
    } else if (motion) {
      swap();
      gsap.fromTo($$('.plan', next), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .08, ease: 'expo.out' });
      refresh();
    } else {
      swap();
    }
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const target = tabs[(i + dir + tabs.length) % tabs.length];
      activateTab(target.dataset.tab, { focus: true });
    });
  });
  $$('[data-tab-link]').forEach((a) => a.addEventListener('click', () => activateTab(a.dataset.tabLink)));
  moveIndicator();
  window.addEventListener('resize', moveIndicator);
  if (document.fonts) document.fonts.ready.then(moveIndicator);

  /* ------------------------------------------------------------------
     4. CRM billing toggle
     ------------------------------------------------------------------ */
  const pricingData = {
    monthly: { starter: [149, '', ''], pro: [249, '', ''], agency: [499, '', ''] },
    semi:    { starter: [124, '745€ facturés en une fois', '149'], pro: [207, '1 245€ facturés en une fois', '249'], agency: [416, '2 495€ facturés en une fois', '499'] },
    annual:  { starter: [124, '1 490€ facturés en une fois', '298'], pro: [207, '2 490€ facturés en une fois', '498'], agency: [416, '4 990€ facturés en une fois', '998'] },
  };
  const savingsMsg = {
    monthly: '',
    semi: "✦ Économisez l'équivalent d'1 mois d'abonnement avec cet engagement",
    annual: "✦ Économisez l'équivalent de 2 mois d'abonnement avec cet engagement",
  };

  const setBilling = (period) => {
    $$('.billing-btn').forEach((b) => {
      const on = b.dataset.period === period;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    const d = pricingData[period];
    ['starter', 'pro', 'agency'].forEach((p) => {
      const [price, sub, saving] = d[p];
      const priceEl = document.getElementById('price-' + p);
      if (motion) {
        const obj = { v: parseInt(priceEl.textContent, 10) || price };
        gsap.to(obj, { v: price, duration: .7, ease: 'power3.out', onUpdate: () => { priceEl.textContent = Math.round(obj.v); } });
      } else {
        priceEl.textContent = price;
      }
      document.getElementById('sub-' + p).textContent = sub;
      const savEl = document.getElementById('saving-' + p);
      savEl.textContent = saving ? `✓ Économie de ${saving}€` : '';
      savEl.classList.toggle('visible', !!saving);
    });
    document.getElementById('savings-banner').textContent = savingsMsg[period];
  };
  $$('.billing-btn').forEach((b) => b.addEventListener('click', () => setBilling(b.dataset.period)));

  /* ------------------------------------------------------------------
     5. Add-ons filter (GSAP Flip)
     ------------------------------------------------------------------ */
  const addons = $$('.addon');
  $$('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      $$('.filter').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      const apply = () => addons.forEach((a) => {
        const show = f === 'all' || a.dataset.cat.split(' ').includes(f);
        a.classList.toggle('is-hidden', !show);
      });

      if (motion && window.Flip) {
        const state = Flip.getState(addons, { props: 'opacity' });
        apply();
        Flip.from(state, {
          duration: .7,
          ease: 'power3.inOut',
          absolute: true,
          stagger: .03,
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: .92 }, { opacity: 1, scale: 1, duration: .6, ease: 'power3.out' }),
          onLeave: (els) => gsap.to(els, { opacity: 0, scale: .92, duration: .4 }),
          onComplete: refresh,
        });
      } else {
        apply();
      }
    });
  });

  /* ------------------------------------------------------------------
     6. FAQ accordion
     ------------------------------------------------------------------ */
  $$('.acc-item').forEach((item) => {
    const btn = $('.acc-btn', item);
    const panel = $('.acc-panel', item);
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      $$('.acc-item.is-open').forEach((other) => {
        if (other === item) return;
        other.classList.remove('is-open');
        $('.acc-btn', other).setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    panel.addEventListener('transitionend', (e) => { if (e.propertyName === 'grid-template-rows') refresh(); });
  });

  /* ------------------------------------------------------------------
     7. Gauges, sparkline & counters — final state without motion
     ------------------------------------------------------------------ */
  const gauges = $$('[data-gauge]');
  gauges.forEach((c) => {
    const len = 2 * Math.PI * parseFloat(c.getAttribute('r'));
    c.style.strokeDasharray = len;
    c.style.strokeDashoffset = motion ? len : len * (1 - parseFloat(c.dataset.gauge));
  });

  function refresh() { if (motion) ScrollTrigger.refresh(); }

  if (!motion) return;

  /* ==================================================================
     MOTION — from here on GSAP is available and motion is welcome
     ================================================================== */
  gsap.registerPlugin(ScrollTrigger, SplitText);
  if (window.Flip) gsap.registerPlugin(Flip);
  gsap.defaults({ ease: 'expo.out', duration: 1.1 });

  /* ---------- Lenis smooth scroll ---------- */
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', (e) => { ScrollTrigger.update(); onScrollNav(e.scroll); });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop(); // released once the intro has played
  } else {
    window.addEventListener('scroll', () => onScrollNav(window.scrollY), { passive: true });
  }

  // Smooth anchor navigation through Lenis (native CSS smooth scroll otherwise)
  if (lenis) {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id === '#') { e.preventDefault(); return; }
        const target = id === '#top' ? 0 : document.querySelector(id);
        if (target === null) return;
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), force: true });
        history.replaceState(null, '', id === '#top' ? location.pathname : id);
      });
    });
  }

  /* ---------- Scroll progress ---------- */
  gsap.to('#scroll-progress', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .3 },
  });

  /* ---------- Preloader → hero intro ---------- */
  const heroIntro = () => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo('.hero-title .line > span', { yPercent: 110, y: 0, rotate: 3 }, { yPercent: 0, rotate: 0, duration: 1.4, stagger: .12 })
      .fromTo('[data-hero-fade]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, stagger: .1 }, '-=1.1')
      .fromTo('.hero-visual .win', { opacity: 0, y: 90, rotateX: 14, scale: .94 }, { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.6, stagger: .14 }, '-=1.3')
      .fromTo('.hero-visual .chip', { opacity: 0, scale: .6, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 1, stagger: .12, ease: 'back.out(1.8)' }, '-=1')
      .fromTo('.learn-progress i', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 1.6, ease: 'power3.inOut' }, '-=1.2')
      .fromTo('.scroll-cue', { opacity: 0 }, { opacity: 1, duration: .8 }, '-=.6');
    return tl;
  };

  const startSite = () => {
    html.classList.add('motion-ready');
    if (lenis) lenis.start();
    heroIntro();
  };

  const pre = $('#preloader');
  let seen = false;
  try { seen = sessionStorage.getItem('aivelo-intro') === '1'; sessionStorage.setItem('aivelo-intro', '1'); } catch (e) { /* storage blocked */ }

  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((r) => setTimeout(r, 1500)),
  ]);

  fontsReady.then(() => {
    initScrollAnimations();
    if (!pre) return startSite();
    pre.style.animation = 'none'; // disarm CSS failsafe now that JS is in control
    const letters = $$('.preloader-word span', pre);
    const tl = gsap.timeline({ onComplete: () => pre.remove() });
    if (seen) {
      tl.to(pre, { opacity: 0, duration: .5, ease: 'power2.out', onStart: startSite });
      return;
    }
    tl.from('.preloader .logo-mark', { scale: 0, rotate: -90, duration: .9, ease: 'back.out(1.6)' })
      .from(letters, { yPercent: 110, duration: .9, stagger: .05 }, '-=.6')
      .to('#preloader-bar', { scaleX: 1, duration: .9, ease: 'power2.inOut' }, '-=.5')
      .to(['.preloader-inner'], { y: -40, opacity: 0, duration: .6, ease: 'power3.in' }, '+=.1')
      .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut', onStart: () => setTimeout(startSite, 350) }, '-=.2');
  });

  /* ---------- All ScrollTrigger-driven animations ---------- */
  function initScrollAnimations() {
    const mm = gsap.matchMedia();

    /* Split headings: line-by-line slide-up behind a mask */
    $$('[data-split]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: 'visible' });
          return gsap.from(self.lines, {
            yPercent: 115, rotate: 2, duration: 1.3, stagger: .1,
            scrollTrigger: { trigger: el, start: 'top 86%', once: true },
          });
        },
      });
    });

    /* Generic reveals */
    gsap.set('[data-reveal]', { y: 40 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%', once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.2, stagger: .09 }),
    });

    /* Card grids slide up in sequence */
    const cardSel = '#panel-sites .plan, .addon, .bento-card';
    gsap.set(cardSel, { opacity: 0, y: 70 });
    ScrollTrigger.batch(cardSel, {
      start: 'top 92%', once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.3, stagger: .08, overwrite: true }),
    });

    /* Hero parallax on scroll */
    gsap.to('.hero-copy', {
      yPercent: -18, opacity: .2, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero-visual', {
      yPercent: -10, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.orb-1', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.orb-2', { yPercent: 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* Hero pointer parallax */
    if (finePointer) {
      const layers = $$('.hero-visual [data-depth]').map((el) => ({
        d: parseFloat(el.dataset.depth),
        x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }),
      }));
      $('.hero').addEventListener('pointermove', (e) => {
        const nx = e.clientX / window.innerWidth - .5;
        const ny = e.clientY / window.innerHeight - .5;
        layers.forEach((l) => { l.x(nx * l.d * 22); l.y(ny * l.d * 18); });
      });
    }

    /* Marquee reacts to scroll velocity */
    const track = $('.marquee-track');
    const skew = gsap.quickTo(track, 'skewX', { duration: .6, ease: 'power3.out' });
    ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => skew(gsap.utils.clamp(-8, 8, self.getVelocity() / -300)),
    });

    /* Manifesto: section eases in, words light up as you read */
    gsap.from('.manifesto', {
      scale: .94, borderRadius: 80, ease: 'none',
      scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'top 40%', scrub: true },
    });
    const manifesto = $('[data-scrub-words]');
    if (manifesto) {
      const split = SplitText.create(manifesto, { type: 'words', wordsClass: 'word' });
      gsap.fromTo(split.words, { opacity: .14 }, {
        opacity: 1, stagger: .1, ease: 'none',
        scrollTrigger: { trigger: manifesto, start: 'top 78%', end: 'bottom 50%', scrub: true },
      });
      gsap.from('.manifesto-line', { scaleX: 0, transformOrigin: 'left', duration: 1.2, scrollTrigger: { trigger: '.manifesto-sign', start: 'top 90%' } });
    }

    /* Expertises: copy slides up, visuals float in */
    $$('.stack-card').forEach((card) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 78%', once: true } });
      tl.from($$('.stack-copy > *', card), { y: 50, opacity: 0, duration: 1.2, stagger: .07 })
        .from($$('.stack-visual > *', card), { y: 80, opacity: 0, rotate: -2, duration: 1.4, stagger: .12 }, '-=1.1');
      $$('.ticks li', card).forEach((li, i) => tl.from(li, { x: -16, opacity: 0, duration: .8 }, .35 + i * .06));
    });

    /* Expertises: sticky stacking — previous card recedes */
    mm.add('(min-width: 861px)', () => {
      const cards = $$('.stack-card');
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, {
          scale: .9 + i * .015, '--dim': .65, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 25%', scrub: true },
        });
      });
    });

    /* Gauges, sparkline, counters */
    gauges.forEach((c) => {
      const len = parseFloat(c.style.strokeDasharray);
      gsap.to(c, {
        strokeDashoffset: len * (1 - parseFloat(c.dataset.gauge)), duration: 2, ease: 'power3.out',
        scrollTrigger: { trigger: c.closest('.stack-card, .bento-card') || c, start: 'top 75%', once: true },
      });
    });
    $$('[data-draw]').forEach((p) => {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, {
        strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut',
        scrollTrigger: { trigger: p, start: 'top 85%', once: true },
      });
    });
    $$('[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const obj = { v: 0 };
      el.textContent = '0';
      gsap.to(obj, {
        v: target, duration: 2, ease: 'power3.out',
        onUpdate: () => { el.textContent = Math.round(obj.v); },
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });

    /* Secteurs: pinned horizontal scroll on desktop */
    mm.add('(min-width: 1024px)', () => {
      const section = $('.secteurs');
      const trackEl = $('#secteurs-track');
      section.classList.add('is-pinned');
      const dist = () => Math.max(0, trackEl.scrollWidth - window.innerWidth);
      const tween = gsap.to(trackEl, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: section, start: 'top top', end: () => '+=' + dist(),
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
      $$('.sector', trackEl).forEach((s) => {
        gsap.from($$('.sector-art, h3, p, .tags', s), {
          y: 60, opacity: 0, duration: 1, stagger: .06,
          scrollTrigger: { trigger: s, containerAnimation: tween, start: 'left 88%', toggleActions: 'play none none reverse' },
        });
      });
      return () => section.classList.remove('is-pinned');
    });
    mm.add('(max-width: 1023px)', () => {
      gsap.from('.sector', { y: 60, opacity: 0, duration: 1.2, stagger: .08, scrollTrigger: { trigger: '.secteurs-track', start: 'top 88%', once: true } });
    });

    /* Méthode: progress rail + active steps */
    gsap.to('#timeline-fill', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 60%', end: 'bottom 60%', scrub: true },
    });
    $$('.step').forEach((step) => {
      gsap.from(step.children, { y: 40, opacity: 0, duration: 1.1, stagger: .07, scrollTrigger: { trigger: step, start: 'top 85%', once: true } });
      ScrollTrigger.create({ trigger: step, start: 'top 60%', onEnter: () => step.classList.add('is-active'), onLeaveBack: () => step.classList.remove('is-active') });
    });

    /* Contact: background breathes with scroll */
    gsap.fromTo('.contact-bg', { scale: .8, opacity: .3 }, {
      scale: 1.15, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom bottom', scrub: true },
    });

    /* Footer wordmark: characters rise one by one */
    const word = $('[data-footer-word]');
    if (word) {
      const chars = SplitText.create(word, { type: 'chars', charsClass: 'char' }).chars;
      gsap.from(chars, { yPercent: 100, opacity: 0, duration: 1.4, stagger: .06, scrollTrigger: { trigger: word, start: 'top 95%', once: true } });
    }

    /* Pointer micro-interactions */
    if (finePointer) initPointerFx();

    window.addEventListener('load', refresh);
  }

  /* ---------- Cursor, magnetic buttons, tilt cards ---------- */
  function initPointerFx() {
    const cursor = $('#cursor');
    const label = $('#cursor-label');
    const cx = gsap.quickTo(cursor, 'x', { duration: .35, ease: 'power3.out' });
    const cy = gsap.quickTo(cursor, 'y', { duration: .35, ease: 'power3.out' });
    window.addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('a, button, [data-cursor]');
      cursor.classList.toggle('is-hover', !!t);
      const txt = t && t.dataset.cursor;
      cursor.classList.toggle('is-label', !!txt);
      label.textContent = txt || '';
    });
    document.addEventListener('pointerleave', () => gsap.to(cursor, { opacity: 0, duration: .3 }));
    document.addEventListener('pointerenter', () => gsap.to(cursor, { opacity: 1, duration: .3 }));

    $$('.magnetic').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'power3.out' });
      const my = gsap.quickTo(el, 'y', { duration: .6, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .28);
        my((e.clientY - r.top - r.height / 2) * .38);
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .4)' });
      });
    });

    $$('[data-tilt]').forEach((card) => {
      const rx = gsap.quickTo(card, 'rotateX', { duration: .6, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotateY', { duration: .6, ease: 'power3.out' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
        rx((.5 - py) * 7);
        ry((px - .5) * 7);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }
})();
