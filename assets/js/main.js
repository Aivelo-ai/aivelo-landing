/* ==========================================================================
   AIVELO — interactions & motion
   Stack : GSAP 3.13 (ScrollTrigger, SplitText) + Lenis smooth scroll.
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
     1b. Optical kerning in display type: pull trailing punctuation closer,
         and shorten hyphens (this face draws them very wide at large sizes)
     ------------------------------------------------------------------ */
  $$('[data-split], .hero-title, .contact-title, .stack-copy h3, .plan h3, .sector h3, .bento-card h3, .marquee-track span').forEach((root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const re = /((?<=[^\s])[.,](?=\s|$)|(?<=\p{L})-(?=\p{L}))/u;
    nodes.forEach((node) => {
      if (node.parentElement.closest('.serif')) return;
      if (!re.test(node.nodeValue)) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(new RegExp(re.source, 'gu')).forEach((part, i) => {
        if (i % 2) {
          const sp = document.createElement('span');
          sp.className = part === '-' ? 'hy' : 'punct';
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
    // every section counts: the hero, the FAQ or the contact clear the highlight instead of leaving a stale one
    $$('section[id]').forEach((el) => io.observe(el));
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
      if (window.labOdo) {
        window.labOdo(priceEl, String(price));
      } else if (motion) {
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
     5. Add-ons filter
     ------------------------------------------------------------------ */
  const addons = $$('.addon');
  // « Tous » shows the first 6 only, until « Voir tous les add-ons »
  const FOLD = 6;
  let folded = addons.length > FOLD;
  let currentFilter = 'all';
  const moreBtn = $('#addons-more');
  const moreWrap = moreBtn && moreBtn.parentElement;
  const matches = (a, f) => (f === 'all' ? !(folded && addons.indexOf(a) >= FOLD) : a.dataset.cat.split(' ').includes(f));
  const syncMore = () => {
    if (!moreBtn) return;
    moreWrap.hidden = currentFilter !== 'all' || addons.length <= FOLD;
    moreBtn.setAttribute('aria-expanded', String(!folded));
    $('.btn-roll', moreBtn).textContent = folded ? 'Voir tous les add-ons' : 'Réduire la liste';
    $('#addons-more-n').textContent = folded ? '+' + (addons.length - FOLD) : '';
  };
  addons.forEach((a) => a.classList.toggle('is-hidden', !matches(a, 'all')));
  syncMore();
  const runFilter = (f) => {
      currentFilter = f;
      syncMore();
      const apply = () => addons.forEach((a) => {
        const show = matches(a, f);
        a.classList.toggle('is-hidden', !show);
      });

      if (motion) {
        // Only what changes moves: removed cards fade out in place, cards that stay
        // glide to their new slot (FLIP), new cards rise in, the grid height eases.
        const grid = $('#addons-grid');
        const shown = (a) => !a.classList.contains('is-hidden');
        const willShow = (a) => matches(a, f);
        const visible = addons.filter(shown);
        const leaving = visible.filter((a) => !willShow(a));
        const staying = visible.filter(willShow);
        const entering = addons.filter((a) => !shown(a) && willShow(a));
        gsap.killTweensOf([grid, ...addons]);
        gsap.set(addons, { clearProps: 'transform' });

        const reflow = () => {
          const h0 = grid.offsetHeight;
          const rects = new Map(staying.map((a) => [a, a.getBoundingClientRect()]));
          apply();
          gsap.set(leaving, { clearProps: 'opacity,scale' });
          const h1 = grid.offsetHeight;
          gsap.fromTo(grid, { height: h0 }, { height: h1, duration: .55, ease: 'power3.inOut', clearProps: 'height', onComplete: refresh });
          staying.forEach((a) => {
            const r0 = rects.get(a);
            const r1 = a.getBoundingClientRect();
            gsap.fromTo(a, { x: r0.left - r1.left, y: r0.top - r1.top }, { x: 0, y: 0, duration: .6, ease: 'power3.inOut', clearProps: 'transform' });
          });
          gsap.fromTo(entering, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6, ease: 'expo.out', stagger: .04, delay: .18, clearProps: 'transform' });
        };

        if (leaving.length) {
          gsap.to(leaving, { opacity: 0, scale: .97, duration: .18, ease: 'power2.in', onComplete: reflow });
        } else {
          reflow();
        }
      } else {
        apply();
      }
  };
  $$('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.filter').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      runFilter(btn.dataset.filter);
    });
  });
  if (moreBtn) moreBtn.addEventListener('click', () => {
    folded = !folded;
    runFilter('all');
    if (folded && lenis) lenis.scrollTo('#addons', { duration: 1.2 });
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
  gsap.defaults({ ease: 'expo.out', duration: 1.1 });

  /* ---------- Lenis smooth scroll ---------- */
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', (e) => { ScrollTrigger.update(); onScrollNav(e.scroll); });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
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
        // images loading and pinned sections can move the target while we travel:
        // when the scroll lands, check where the section really is and finish the move
        let tries = 0;
        const land = () => {
          if (target === 0 || tries++ > 2) return;
          const off = target.getBoundingClientRect().top;
          if (Math.abs(off) > 6) lenis.scrollTo(target, { duration: .5, easing: (t) => 1 - Math.pow(1 - t, 3), force: true, onComplete: land });
        };
        lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), force: true, onComplete: land });
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
      .fromTo('[data-intro]', { opacity: 0, y: 80, rotateX: 10, scale: .95 }, { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.6, stagger: .12 }, '-=1.3')
      .call(() => liveSite && liveSite.play(), null, '-=.6')
      .fromTo('.scroll-cue', { opacity: 0 }, { opacity: 1, duration: .8 }, '-=.6');
    return tl;
  };

  const liveSite = initLiveSite();

  let started = false;
  const startSite = () => {
    if (started) return;
    started = true;
    html.classList.add('motion-ready');
    if (lenis) lenis.start();
    try { heroIntro(); } catch (e) { console.error(e); }
  };
  // Never leave the page locked behind the intro, whatever happens above
  setTimeout(() => {
    startSite();
    const p = document.getElementById('preloader');
    if (p) p.remove();
  }, 6000);

  const pre = $('#preloader');
  let seen = false;
  try { seen = sessionStorage.getItem('aivelo-intro') === '1'; sessionStorage.setItem('aivelo-intro', '1'); } catch (e) { /* storage blocked */ }

  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((r) => setTimeout(r, 1500)),
  ]);

  fontsReady.then(() => {
    try { initScrollAnimations(); } catch (e) { console.error(e); }
    if (!pre) return startSite();
    pre.style.animation = 'none'; // disarm CSS failsafe now that JS is in control
    const letters = $$('.preloader-word span', pre);
    const tl = gsap.timeline({ onComplete: () => pre.remove() });
    if (seen) {
      tl.to(pre, { opacity: 0, duration: .5, ease: 'power2.out', onStart: startSite });
      return;
    }
    tl.from('.preloader .logo-img', { scale: 0, rotate: -90, duration: .9, ease: 'back.out(1.6)' })
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

    /* Marquee: scrolls on its own, can be grabbed and dragged (mouse or touch),
       keeps a little inertia on release and speeds up with the page scroll */
    const marquee = $('.marquee');
    const track = $('.marquee-track');
    marquee.classList.add('is-js');
    let mx = 0;
    let half = track.scrollWidth / 2;
    let fling = 0;
    let boost = 0;
    let dragging = false;
    let lastX = 0;
    const setX = gsap.quickSetter(track, 'x', 'px');
    const skew = gsap.quickTo(track, 'skewX', { duration: .6, ease: 'power3.out' });
    const measure = () => { half = track.scrollWidth / 2; };
    window.addEventListener('resize', measure);
    if (document.fonts) document.fonts.ready.then(measure);
    gsap.ticker.add((time, dt) => {
      if (!dragging) {
        mx += -0.045 * dt * (1 + boost) + fling;
        fling *= 0.94;
        boost *= 0.92;
      }
      if (mx <= -half) mx += half;
      if (mx > 0) mx -= half;
      setX(mx);
    });
    marquee.addEventListener('pointerdown', (e) => {
      dragging = true;
      lastX = e.clientX;
      fling = 0;
      marquee.classList.add('is-dragging');
      marquee.setPointerCapture(e.pointerId);
    });
    marquee.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      mx += dx;
      fling = dx;
    });
    const release = () => { dragging = false; marquee.classList.remove('is-dragging'); };
    marquee.addEventListener('pointerup', release);
    marquee.addEventListener('pointercancel', release);
    ScrollTrigger.create({
      trigger: marquee, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => {
        const v = self.getVelocity();
        skew(gsap.utils.clamp(-8, 8, v / -300));
        boost = Math.min(6, Math.abs(v) / 400);
      },
    });

    /* Manifesto: section eases in, words light up as you read */
    gsap.from('.manifesto', {
      scale: .94, borderRadius: 80, ease: 'none',
      scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'top 40%', scrub: true },
    });
    const manifesto = $('[data-scrub-words]');
    if (manifesto) {
      const split = SplitText.create(manifesto, { type: 'words', wordsClass: 'word', aria: 'none' }); // a <p> may not carry aria-label
      gsap.fromTo(split.words, { opacity: .14 }, {
        opacity: 1, stagger: .1, ease: 'none',
        scrollTrigger: { trigger: manifesto, start: 'top 78%', end: 'bottom 50%', scrub: true },
      });
      gsap.from('.manifesto-line', { scaleX: 0, transformOrigin: 'left', duration: 1.2, scrollTrigger: { trigger: '.manifesto-sign', start: 'top 90%' } });
    }

    /* Expertises: copy slides up, visuals float in */
    $$('.stack-card').forEach((card) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 105%', once: true } });
      tl.from($$('.stack-copy > *', card), { y: 40, opacity: 0, duration: 1, stagger: .05 })
        .from($$('.stack-visual > *', card), { y: 60, opacity: 0, rotate: -2, duration: 1.1, stagger: .08 }, '-=.95');
      $$('.ticks li', card).forEach((li, i) => tl.from(li, { x: -16, opacity: 0, duration: .8 }, .35 + i * .06));
    });

    /* Expertises: sticky stacking — previous card recedes */
    mm.add('(min-width: 861px)', () => {
      const cards = $$('.stack-card');
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, {
          // the card underneath recedes and fades out completely: no ghost edges peeking above the new one
          scale: .92, yPercent: -4, opacity: 0, ease: 'none',
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
        gsap.from(s, {
          y: 60, opacity: 0, duration: 1,
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

    /* Footer brand lockup rises in */
    gsap.from('[data-footer-word] > *', { y: 60, opacity: 0, duration: 1.4, stagger: .12, scrollTrigger: { trigger: '[data-footer-word]', start: 'top 95%', once: true } });

    /* Pointer micro-interactions */
    if (finePointer) initPointerFx();

    window.addEventListener('load', refresh);
  }

  /* ---------- Hero "live site": wireframe → design → code → live, on a loop ---------- */
  function initLiveSite() {
    const root = $('.live-site');
    if (!root) return null;
    const phases = [
      { id: 'wire', label: 'Maquette', d: 2.6 },
      { id: 'design', label: 'Design', d: 2.6 },
      { id: 'dev', label: 'Développement', d: 3.2 },
      { id: 'live', label: 'En ligne', d: 3.8 },
    ];
    const steps = $$('.ls-step', root);
    const badge = $('#ls-badge');
    const codeEl = $('#ls-code');
    const cta = $('#ls-cta');
    const pointer = $('#ls-pointer');
    const code = [
      '<section class="hero">',
      '  <h1>Vendre avec',
      '    <em>exigence.</em></h1>',
      '  <a class="btn" href="/estimation">',
      '    Estimer mon bien</a>',
      '</section>',
    ].join('\n');

    const setPhase = (id) => {
      if (root.classList.contains('is-real')) hideReals();   // never true before the reals are set up
      root.dataset.phase = id;
      const idx = phases.findIndex((p) => p.id === id);
      steps.forEach((s, i) => {
        s.classList.toggle('is-on', i === idx);
        s.classList.toggle('is-done', i < idx);
      });
      badge.textContent = phases[idx].label;
      if (id === 'wire') codeEl.textContent = '';
      cta.classList.remove('is-click');
    };
    setPhase('live');
    codeEl.textContent = code;

    const typing = { n: 0 };
    const tl = gsap.timeline({ repeat: -1, paused: true });
    let t = 0;
    let liveAt = 0;
    phases.forEach((p) => {
      if (p.id === 'live') liveAt = t;
      tl.call(setPhase, [p.id], t);
      tl.fromTo('#ls-progress', { scaleX: 0 }, { scaleX: 1, duration: p.d, ease: 'none', immediateRender: false }, t);
      if (p.id === 'dev') {
        tl.fromTo(typing, { n: 0 }, {
          n: code.length, duration: p.d * .75, ease: 'none', immediateRender: false,
          onUpdate: () => { codeEl.textContent = code.slice(0, Math.round(typing.n)); },
        }, t + .3);
      }
      if (p.id === 'live') {
        tl.fromTo(pointer, { left: '86%', top: '96%', opacity: 0 }, { left: '19%', top: '63%', opacity: 1, duration: 1.3, ease: 'power3.inOut', immediateRender: false }, t + .5)
          .to(pointer, { scale: .8, duration: .12, yoyo: true, repeat: 1, transformOrigin: '20% 15%' }, t + 1.85)
          .call(() => cta.classList.add('is-click'), null, t + 1.9)
          .to(pointer, { opacity: 0, duration: .5 }, t + p.d - .6);
      }
      t += p.d;
    });

    // After « En ligne »: the window shows real client sites, each one scrolled from top to bottom
    const REALS = [
      ['real-carnot', 'L\u2019Avenue Carnot · immobilier'],
      ['real-patrimoine', 'Architecture Patrimoine · monuments historiques'],
      ['real-ekkout2', 'EKKOUT · immobilier de commerce'],
      ['real-opsform', 'OpsForm · plateforme de formation'],
    ];
    const stage = $('.ls-stage', root);
    const urlText = [...$('.ls-url', root).childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    const urlDefault = urlText ? urlText.textContent : '';
    const realStep = $('.ls-step[data-step="real"]', root);
    const reals = document.createElement('div');
    reals.className = 'ls-reals';
    reals.innerHTML = REALS.map(([img]) => `<img alt="" decoding="async" data-src="assets/img/${img}.webp" />`).join('');
    stage.appendChild(reals);
    const realImgs = $$('img', reals);
    let realTween = null;
    const loadReals = () => realImgs.forEach((im) => { if (!im.src) im.src = im.dataset.src; });
    const ready = (im) => im.complete && im.naturalWidth > 0;
    const showReal = (i) => {
      // a capture still loading would show a white window: keep the current view instead
      if (!ready(realImgs[i])) return;
      root.classList.add('is-real');
      steps.forEach((s) => { s.classList.remove('is-on'); s.classList.add('is-done'); });
      if (realStep) { realStep.classList.remove('is-done'); realStep.classList.add('is-on'); }
      badge.textContent = 'Réalisation';
      if (urlText) urlText.textContent = REALS[i][1];
      realImgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
      const im = realImgs[i];
      if (realTween) realTween.kill();
      gsap.set(im, { y: 0 });
      const travel = () => Math.max(0, stage.clientWidth * (im.naturalHeight || 0) / (im.naturalWidth || 1) - stage.clientHeight);
      realTween = gsap.to(im, { y: () => -travel(), duration: 3.1, delay: .45, ease: 'power1.inOut' });
    };
    const hideReals = () => {
      root.classList.remove('is-real');
      if (urlText) urlText.textContent = urlDefault;
      if (realStep) realStep.classList.remove('is-on', 'is-done');
    };
    REALS.forEach((r, i) => { tl.call(showReal, [i], t); t += 3.8; });
    tl.call(hideReals, null, t - .01);
    tl.fromTo('#ls-progress', { scaleX: 0 }, { scaleX: 1, duration: REALS.length * 3.8, ease: 'none', immediateRender: false }, t - REALS.length * 3.8);

    // Only run while the hero is on screen
    let wanted = false;
    let visible = true;
    const sync = () => (wanted && visible && !document.hidden ? tl.play() : tl.pause());
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(root);
    document.addEventListener('visibilitychange', sync);
    let first = true;
    return { play: () => { if (first) { first = false; tl.time(liveAt + .01); setTimeout(loadReals, 800); } wanted = true; sync(); } };
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
