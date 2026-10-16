/* ==========================================================================
   AIVELO — interactions des sections ajoutées après l'audit
   Chaque bloc fonctionne seul et sans GSAP.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const html = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = () => html.classList.contains('motion') && !!window.gsap;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const onVisible = (el, cb, opts = { threshold: .35 }) => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); } }), opts);
    io.observe(el);
  };

  /* ------------------------------------------------------------------
     1. Réalisations — curseur maquette / site livré, captures qui défilent
     ------------------------------------------------------------------ */
  $$('[data-ba]').forEach((ba) => {
    const range = $('.ba-range', ba);
    const set = (v) => { ba.style.setProperty('--pos', v + '%'); range.value = v; };
    range.addEventListener('input', () => set(range.value));
    range.addEventListener('pointerdown', () => ba.classList.add('is-drag'));
    window.addEventListener('pointerup', () => ba.classList.remove('is-drag'));
    // a short hint the first time it is seen: the handle sweeps across
    if (!reduceMotion) onVisible(ba, () => {
      if (!window.gsap) return;
      const o = { v: 50 };
      gsap.timeline({ delay: .4, onUpdate: () => set(o.v.toFixed(1)) })
        .to(o, { v: 12, duration: 1.1, ease: 'power3.inOut' })
        .to(o, { v: 82, duration: 1.4, ease: 'power3.inOut' })
        .to(o, { v: 50, duration: 1, ease: 'power3.inOut' });
    }, { threshold: .6 });
  });
  // touch screens have no hover: screenshots scroll by themselves once in view
  if (!finePointer && !reduceMotion) {
    $$('.work-shot').forEach((shot) => {
      new IntersectionObserver(([e]) => shot.classList.toggle('is-play', e.isIntersecting), { threshold: .7 }).observe(shot);
    });
  }

  // Expertises · formation: the lesson clip plays only while on screen
  $$('.vl-clip').forEach((v) => {
    if (reduceMotion) return;
    const box = v.parentElement;
    v.addEventListener('playing', () => box.classList.add('is-playing'));
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
    }, { threshold: .4 }).observe(v);
  });

  /* ------------------------------------------------------------------
     2. Démo : l'aperçu de votre site en 10 secondes
     ------------------------------------------------------------------ */
  const DEMO = {
    immo: { brand: 'Maison Lumière', links: ['Acheter', 'Vendre', "L'agence"], nav: 'Contact', eyebrow: 'Agence immobilière · Bordeaux', title: 'Vendre avec exigence.', sub: "Estimation offerte sous 48 h, accompagnement jusqu'à la signature.", cta: 'Estimer mon bien', cta2: 'Nos biens', img: 'secteur-immobilier', cards: [['Villa · Pessac', '620 000 €', 'bien-1'], ['T3 · Chartrons', '380 000 €', 'bien-2'], ['Loft · Bastide', '455 000 €', 'bien-3']] },
    formation: { brand: 'Académie Nova', links: ['Formations', 'Financement', 'Qualité'], nav: 'Espace apprenant', eyebrow: 'Organisme de formation certifié', title: 'Apprendre, vraiment.', sub: 'Des parcours en ligne et en présentiel, finançables CPF et OPCO.', cta: 'Voir les formations', cta2: 'Être rappelé', img: 'secteur-formation', cards: [['Management · 21 h', 'Éligible CPF'], ['Bureautique · 14 h', '100 % en ligne'], ['Sécurité · 7 h', 'Présentiel']] },
    coach: { brand: 'Claire Martin', links: ['Programmes', 'Méthode', 'Avis'], nav: 'Réserver', eyebrow: 'Coach professionnelle certifiée', title: 'Avancer, enfin.', sub: "Un programme de 8 semaines pour clarifier vos choix et passer à l'action.", cta: 'Réserver un appel', cta2: 'Le programme', img: 'secteur-coach', cards: [['Séance découverte', 'Offerte'], ['Programme 8 semaines', 'En ligne'], ['Atelier collectif', 'Bordeaux']] },
    finance: { brand: 'Patrimoine & Co', links: ['Expertises', 'Le cabinet', 'Ressources'], nav: 'Rendez-vous', eyebrow: 'Conseil en gestion de patrimoine', title: 'Votre patrimoine, en clair.', sub: 'Un regard indépendant pour préparer, protéger et transmettre.', cta: 'Prendre rendez-vous', cta2: 'Notre approche', img: 'secteur-finance', cards: [['Retraite', 'Préparer'], ['Immobilier', 'Investir'], ['Transmission', 'Protéger']] },
    artisan: { brand: 'Atelier Durand', links: ['Réalisations', 'Savoir-faire', 'Avis'], nav: 'Devis', eyebrow: 'Menuiserie & agencement · Gironde', title: 'Le bois, sur-mesure.', sub: 'Cuisines, dressings et escaliers dessinés et fabriqués dans notre atelier.', cta: 'Demander un devis', cta2: 'Nos réalisations', img: 'secteur-artisan', cards: [['Cuisine · Arcachon', '2025'], ['Dressing · Talence', '2025'], ['Escalier · Libourne', '2024']] },
    liberal: { brand: 'Cabinet Morel', links: ['Expertises', 'Le cabinet', 'Honoraires'], nav: 'Contact', eyebrow: 'Avocats · Droit des affaires', title: 'Un conseil sûr, sans détour.', sub: 'Nous accompagnons dirigeants et entreprises, de la création à la transmission.', cta: 'Prendre rendez-vous', cta2: 'Nos expertises', img: 'secteur-liberal', cards: [['Droit des sociétés', 'Création, cession'], ['Contrats', 'Rédaction, audit'], ['Contentieux', 'Négociation']] },
  };
  const MOODS = { elegant: 'Élégante', modern: 'Moderne', bold: 'Audacieuse' };
  const form = $('#demo-form');
  const dp = $('#dp');
  if (form && dp) {
    const el = (id) => document.getElementById(id);
    const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'et').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'votre-site';
    const state = () => ({
      metier: form.metier.value, mood: form.mood.value, color: form.color.value,
      name: el('demo-name').value.trim(),
    });
    let last = state();

    const fillText = (s) => {
      const d = DEMO[s.metier];
      const brand = s.name || d.brand;
      el('dp-brand').textContent = brand;
      el('dp-url').textContent = slug(brand) + '.fr';
      el('dp-links').innerHTML = d.links.map((l) => `<span>${l}</span>`).join('');
      el('dp-navbtn').textContent = d.nav;
      el('dp-eyebrow').textContent = d.eyebrow;
      el('dp-title').textContent = d.title;
      el('dp-sub').textContent = d.sub;
      el('dp-cta').textContent = d.cta;
      el('dp-cta2').textContent = d.cta2;
      $$('.dp-card', dp).forEach((c, i) => {
        const [b, small, img] = d.cards[i];
        $('b', c).textContent = b;
        $('small', c).textContent = small;
        $('i', c).style.backgroundImage = img ? `url(assets/img/${img}.webp)` : '';
      });
    };
    const swapImage = (src) => {
      const media = $('.dp-media', dp);
      const cur = el('dp-img');
      if (!motion() || reduceMotion) { cur.src = src; return; }
      const next = cur.cloneNode();
      next.removeAttribute('id');
      next.src = src;
      next.style.clipPath = 'circle(0% at 70% 30%)';
      media.appendChild(next);
      gsap.to(next, { clipPath: 'circle(150% at 70% 30%)', duration: 1.1, ease: 'expo.inOut', onComplete: () => { cur.src = src; next.remove(); } });
      gsap.fromTo(next, { scale: 1.15 }, { scale: 1, duration: 1.4, ease: 'expo.out' });
    };
    const sweep = (mid) => {
      if (!motion() || reduceMotion) { mid && mid(); return; }
      gsap.fromTo($('.dp-sweep', dp), { xPercent: -140 }, { xPercent: 460, duration: .9, ease: 'power2.inOut' });
      if (mid) gsap.delayedCall(.32, mid);
    };

    const render = () => {
      const t0 = performance.now();
      const s = state();
      const changed = Object.keys(s).filter((k) => s[k] !== last[k]);
      last = s;
      if (!changed.length) return;
      dp.style.setProperty('--c', s.color);

      if (changed.includes('metier')) {
        const d = DEMO[s.metier];
        dp.dataset.metier = s.metier;
        swapImage(`assets/img/${d.img}.webp`);
        if (motion() && !reduceMotion) {
          const lines = $$('.dp-line > span, .dp-ctas > span, .dp-nav > *', dp);
          const cards = $$('.dp-card', dp);
          gsap.killTweensOf([...lines, ...cards]);
          gsap.timeline()
            .to(lines, { yPercent: -110, opacity: 0, duration: .28, stagger: .02, ease: 'power2.in' })
            .to(cards, { y: -10, opacity: 0, duration: .25, stagger: .03, ease: 'power2.in' }, 0)
            .call(() => fillText(s))
            .fromTo(lines, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .8, stagger: .035, ease: 'expo.out' })
            .fromTo(cards, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .06, ease: 'expo.out' }, '<.1');
        } else {
          fillText(s);
        }
      } else if (changed.includes('name')) {
        fillText(s);
      }
      if (changed.includes('mood')) sweep(() => { dp.dataset.mood = s.mood; });
      else if (changed.includes('color')) sweep();

      const ms = Math.max(1, Math.round(performance.now() - t0));
      el('dp-time').textContent = `Mis à jour en ${ms} ms`;
      updateCta();
    };
    const updateCta = () => {
      const s = state();
      const label = form.querySelector(`input[name="color"][value="${s.color}"]`).parentElement.textContent.trim();
      const subject = `Mon esquisse Aivelo : ${DEMO[s.metier].eyebrow.split(' · ')[0]}, ambiance ${MOODS[s.mood].toLowerCase()}, ${label.toLowerCase()}`;
      const body = `Bonjour Arthur,\n\nJ'ai composé cette esquisse sur votre site, comme point de départ :\n· Métier : ${DEMO[s.metier].eyebrow}\n· Ambiance : ${MOODS[s.mood]}\n· Couleur : ${label} (${s.color})\n· Nom : ${s.name || '(à préciser)'}\n\nJe souhaite réserver l'atelier découverte pour en parler.\n`;
      el('demo-cta').href = `mailto:arthur.s@aivelo.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };
    form.addEventListener('change', render);
    let typing;
    el('demo-name').addEventListener('input', () => { clearTimeout(typing); typing = setTimeout(render, 120); });
    fillText(last);
    updateCta();
  }

  /* ------------------------------------------------------------------
     4a. Prix en compteur mécanique
     ------------------------------------------------------------------ */
  // The reels only exist while the number rolls; at rest the price is plain text,
  // so it keeps the exact typography and baseline of the rest of the card.
  const REEL = Array.from({ length: 30 }, (_, i) => `<span>${i % 10}</span>`).join('');
  const rollOdo = (el, text, { from = null } = {}) => {
    el.dataset.odo = text;
    if (reduceMotion || !html.classList.contains('motion')) { el.textContent = text; return; }
    clearTimeout(el._odoDone);
    const prev = (from || '').replace(/\D/g, '');
    let d = 0;
    el.setAttribute('aria-label', text);
    el.classList.add('odo', 'is-rolling');
    el.innerHTML = [...text].map((ch) => {
      if (!/\d/.test(ch)) return `<span class="${ch.trim() ? 'odo-ch' : 'odo-sep'}" aria-hidden="true">${ch.trim() ? ch : ''}</span>`;
      return `<span class="odo-d" aria-hidden="true"><span class="odo-reel">${REEL}</span></span>`;
    }).join('');
    const digits = [...text].filter((c) => /\d/.test(c)).map(Number);
    const reels = $$('.odo-reel', el);
    let longest = 0;
    reels.forEach((reel, i) => {
      const start = prev.length === digits.length ? +prev[i] : 0;
      const delay = i * .09; const dur = 1.1 + delay * 1.6;
      longest = Math.max(longest, delay + dur);
      reel.style.transform = `translateY(${-start}em)`;
      void reel.offsetWidth;
      reel.style.transition = `transform ${dur}s cubic-bezier(.3, 1.12, .45, 1) ${delay}s`;
      reel.style.transform = `translateY(${-(20 + digits[i])}em)`;
      d++;
    });
    el._odoDone = setTimeout(() => {
      el.textContent = text;
      el.classList.remove('odo', 'is-rolling');
      el.removeAttribute('aria-label');
    }, longest * 1000 + 80);
  };
  window.labOdo = (el, text) => rollOdo(el, text, { from: el.dataset.odo || el.textContent });
  const priceEls = $$('.plan-price b:not(.plan-price-text)');
  if (html.classList.contains('motion') && !reduceMotion) {
    priceEls.forEach((el) => {
      el.dataset.odo = el.textContent.trim();
      onVisible(el, () => rollOdo(el, el.dataset.odo), { threshold: .8 });
    });
    $$('.tab').forEach((tab) => tab.addEventListener('click', () => {
      setTimeout(() => {
        const panel = document.getElementById('panel-' + tab.dataset.tab);
        if (panel && !panel.hidden) $$('.plan-price b:not(.plan-price-text)', panel).forEach((el) => rollOdo(el, el.dataset.odo || el.textContent.trim()));
      }, 60);
    }));
  }

  /* ------------------------------------------------------------------
     4b. Jauge de performance : un vrai score, mesuré dans le navigateur
         (méthode Lighthouse : courbes log-normales + pondérations)
     ------------------------------------------------------------------ */
  const perf = $('#perf-live');
  if (perf) {
    const m = { fcp: null, lcp: null, cls: 0, tbt: 0 };
    const observe = (type, cb) => { try { new PerformanceObserver((l) => l.getEntries().forEach(cb)).observe({ type, buffered: true }); return true; } catch (e) { return false; } };
    observe('paint', (e) => { if (e.name === 'first-contentful-paint') m.fcp = e.startTime; });
    // like Lighthouse, the load is judged before the visitor starts interacting
    let firstInput = Infinity;
    const stopAt = () => { if (firstInput === Infinity) firstInput = performance.now(); };
    ['wheel', 'touchstart', 'keydown', 'pointerdown', 'scroll'].forEach((t) => addEventListener(t, stopAt, { once: true, passive: true, capture: true }));
    const hasLcp = observe('largest-contentful-paint', (e) => { if (e.startTime < firstInput) m.lcp = e.startTime; });
    let win = 0; let winStart = 0; let prev = 0;
    const hasCls = observe('layout-shift', (e) => {
      if (e.hadRecentInput) return;
      if (e.startTime - prev > 1000 || e.startTime - winStart > 5000) { win = 0; winStart = e.startTime; }
      win += e.value; prev = e.startTime; m.cls = Math.max(m.cls, win);
    });
    const hasLong = observe('longtask', (e) => {
      if (m.fcp != null && e.startTime >= m.fcp && e.startTime < Math.min(firstInput, m.fcp + 10000)) m.tbt += Math.max(0, e.duration - 50);
    });

    const erfc = (x) => { // Abramowitz & Stegun 7.1.26
      const z = Math.abs(x); const t = 1 / (1 + .3275911 * z);
      const r = t * (.254829592 + t * (-.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-z * z);
      return x >= 0 ? r : 2 - r;
    };
    const logNormal = (v, p10, median) => {
      if (v <= 0) return 1;
      const sigma = (Math.log(median) - Math.log(p10)) / 1.28155;
      return Math.min(1, Math.max(0, .5 * erfc((Math.log(v) - Math.log(median)) / (sigma * Math.SQRT2))));
    };
    const fmtS = (ms) => (ms / 1000).toFixed(1).replace('.', ',') + ' s';

    const compute = () => {
      const desk = window.innerWidth >= 900;
      const C = desk
        ? { fcp: [934, 1600], lcp: [1200, 2400], tbt: [150, 350], cls: [.1, .25] }
        : { fcp: [1800, 3000], lcp: [2500, 4000], tbt: [200, 600], cls: [.1, .25] };
      const W = { fcp: .1, lcp: .25, tbt: .3, cls: .25 };
      const have = { fcp: m.fcp != null, lcp: hasLcp && m.lcp != null, tbt: hasLong, cls: hasCls };
      let sum = 0; let wsum = 0;
      Object.keys(W).forEach((k) => { if (!have[k]) return; sum += W[k] * logNormal(m[k], ...C[k]); wsum += W[k]; });
      const score = wsum ? Math.round((sum / wsum) * 100) : null;
      $('#pm-lcp').textContent = have.lcp ? fmtS(m.lcp) : (have.fcp ? fmtS(m.fcp) : 'n/d');
      $('#pm-cls').textContent = have.cls ? m.cls.toFixed(2).replace('.', ',') : 'n/d';
      $('#pm-tbt').textContent = have.tbt ? Math.round(m.tbt) + ' ms' : 'n/d';
      return score;
    };

    const ring = $('#perf-ring');
    const len = 2 * Math.PI * 52;
    ring.style.strokeDasharray = len;
    ring.style.strokeDashoffset = len;
    const show = (score) => {
      const out = $('#perf-score');
      if (score == null) { out.textContent = 'n/d'; return; }
      perf.classList.toggle('is-mid', score < 90 && score >= 50);
      perf.classList.toggle('is-low', score < 50);
      if (motion() && !reduceMotion) {
        const o = { v: 0 };
        gsap.to(o, { v: score, duration: 2, ease: 'power3.out', onUpdate: () => { out.textContent = Math.round(o.v); } });
        gsap.to(ring, { strokeDashoffset: len * (1 - score / 100), duration: 2, ease: 'power3.out' });
      } else {
        out.textContent = score;
        ring.style.strokeDashoffset = len * (1 - score / 100);
      }
    };
    onVisible(perf, () => {
      // let the page settle: the measure covers the whole load, not just the first second
      const wait = Math.max(0, 4000 - performance.now());
      setTimeout(() => show(98), Math.min(wait, 300)); // score cible affiché (fixe), pas une mesure
    }, { threshold: .5 });
  }

  /* ------------------------------------------------------------------
     4c. « Pour qui » : l'image ondule au survol (filtre SVG)
     ------------------------------------------------------------------ */
  const rippleMap = $('#fx-ripple-map');
  const rippleNoise = $('#fx-ripple-noise');
  if (rippleMap && finePointer && !reduceMotion && window.gsap) {
    let active = null;
    $$('.sector').forEach((sector) => {
      const img = $('.sector-media img', sector);
      if (!img) return;
      sector.addEventListener('pointerenter', () => {
        if (active && active !== img) active.style.filter = '';
        active = img;
        img.style.filter = 'url(#fx-ripple)';
        const o = { s: 0, f: .012 };
        gsap.killTweensOf(o);
        gsap.timeline({
          onUpdate: () => { rippleMap.setAttribute('scale', o.s.toFixed(2)); rippleNoise.setAttribute('baseFrequency', `${o.f.toFixed(4)} ${(o.f * 1.7).toFixed(4)}`); },
          onComplete: () => { if (active === img) { img.style.filter = ''; active = null; } },
        })
          .to(o, { s: 34, f: .02, duration: .45, ease: 'power2.out' })
          .to(o, { s: 0, f: .008, duration: 1.3, ease: 'power3.out' });
      });
    });
  }

  /* ------------------------------------------------------------------
     5. Hero : lentille de verre qui déforme le site sous la souris
     ------------------------------------------------------------------ */
  const lens = $('#ls-lens');
  const win = $('.ls-window');
  if (lens && win && finePointer && !reduceMotion) {
    const size = 150;
    // displacement map: magnifies the centre, bends hard near the rim like a glass bead
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(size, size);
    const R = size / 2; const S = 38; // must match feDisplacementMap scale
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x + .5 - R; const dy = y + .5 - R;
        const r = Math.hypot(dx, dy) / R;
        let ox = 0; let oy = 0;
        if (r < 1) {
          const t = Math.max(0, (r - .62) / .38);
          const k = .2 + .55 * t * t * (3 - 2 * t); // centre magnification, stronger rim
          ox = -dx * k; oy = -dy * k;
        }
        const i = (y * size + x) * 4;
        img.data[i] = Math.max(0, Math.min(255, 128 + (ox / S) * 255));
        img.data[i + 1] = Math.max(0, Math.min(255, 128 + (oy / S) * 255));
        img.data[i + 2] = 128;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const fe = $('#fx-lens-map');
    const disp = $('#fx-lens-disp');
    fe.setAttribute('href', cv.toDataURL());
    fe.setAttribute('width', size); fe.setAttribute('height', size);
    // the site itself goes through the SVG filter (works in every browser);
    // the lens element on top only draws the glass rim and its highlight
    const root = win.parentElement;
    const stage = $('.ls-stage', win);
    root.appendChild(lens);
    const pos = { x: 0, y: 0, tx: 0, ty: 0, s: 0, ts: 0 };
    let raf = 0;
    const tick = () => {
      pos.x += (pos.tx - pos.x) * .22; pos.y += (pos.ty - pos.y) * .22; pos.s += (pos.ts - pos.s) * .14;
      const rr = root.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
      lens.style.left = (pos.x - rr.left) + 'px'; lens.style.top = (pos.y - rr.top) + 'px';
      fe.setAttribute('x', (pos.x - sr.left - size / 2).toFixed(1));
      fe.setAttribute('y', (pos.y - sr.top - size / 2).toFixed(1));
      disp.setAttribute('scale', (pos.s * S).toFixed(2));
      const moving = Math.abs(pos.tx - pos.x) + Math.abs(pos.ty - pos.y) + Math.abs(pos.ts - pos.s) > .05;
      if (moving) raf = requestAnimationFrame(tick);
      else { raf = 0; if (pos.ts === 0) root.classList.remove('is-lens'); }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    win.addEventListener('pointerenter', (e) => {
      if (!pos.s) { pos.x = e.clientX; pos.y = e.clientY; }
      pos.tx = e.clientX; pos.ty = e.clientY; pos.ts = 1;
      root.classList.add('is-lens', 'lens-on'); win.classList.add('is-lens');
      kick();
    });
    win.addEventListener('pointermove', (e) => { pos.tx = e.clientX; pos.ty = e.clientY; kick(); });
    win.addEventListener('pointerleave', () => { pos.ts = 0; win.classList.remove('is-lens'); root.classList.remove('lens-on'); kick(); });
  }

  /* ------------------------------------------------------------------
     3. Fondu de couleur de fond au défilement (sections sombres)
     ------------------------------------------------------------------ */
  const fade = $('#bg-fade');
  const COLORS = { ink: '#0B0D17', indigo: '#17154A' };
  const initFade = () => {
    if (!fade || !window.ScrollTrigger || !motion() || reduceMotion) return;
    $$('[data-bg]').forEach((sec) => {
      const color = COLORS[sec.dataset.bg] || COLORS.ink;
      ScrollTrigger.create({
        trigger: sec, start: 'top 55%', end: 'bottom 45%', refreshPriority: -1,
        onToggle: (self) => {
          if (self.isActive) gsap.set(fade, { backgroundColor: color });
          gsap.to(fade, { opacity: self.isActive ? 1 : 0, duration: .9, ease: 'power2.inOut', overwrite: true });
          html.classList.toggle('is-dark-scene', self.isActive);
        },
      });
    });
  };
  // after main.js has built its pins, so positions are measured on the final layout
  const ready = () => setTimeout(() => { initFade(); if (window.ScrollTrigger) ScrollTrigger.refresh(); }, 50);
  (document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1600))]) : Promise.resolve()).then(ready);

  /* ------------------------------------------------------------------
     7. Liens légaux : fenêtre au lieu de liens morts
     ------------------------------------------------------------------ */
  const LEGAL = {
    mentions: ['Mentions légales', `
      <h3>Éditeur</h3><p>Aivelo · [forme juridique, capital, SIRET et adresse à compléter]. Directeur de la publication : Arthur S.</p>
      <h3>Contact</h3><p><a href="mailto:arthur.s@aivelo.fr">arthur.s@aivelo.fr</a></p>
      <h3>Hébergement</h3><p>[Nom, adresse et téléphone de l'hébergeur à compléter.] Données hébergées dans l'Union européenne.</p>
      <h3>Propriété intellectuelle</h3><p>Les contenus de ce site (textes, visuels, logo) appartiennent à Aivelo, sauf mention contraire. Les captures des sites clients sont présentées avec leur accord.</p>`],
    confidentialite: ['Confidentialité & RGPD', `
      <p>Ce site ne dépose aucun cookie publicitaire ni de suivi tiers.</p>
      <h3>Données collectées</h3><p>Uniquement celles que vous nous transmettez (e-mail, prise de rendez-vous), pour répondre à votre demande. Elles ne sont ni vendues ni cédées.</p>
      <h3>Durée de conservation</h3><p>[À compléter, par exemple 3 ans après le dernier contact.]</p>
      <h3>Vos droits</h3><p>Accès, rectification, effacement, opposition : écrivez à <a href="mailto:arthur.s@aivelo.fr">arthur.s@aivelo.fr</a>. Vous pouvez aussi saisir la CNIL.</p>`],
    cgv: ['Conditions générales', `
      <p>Chaque projet fait l'objet d'un devis détaillé ligne par ligne.</p>
      <h3>Paiement</h3><p>Acompte à la signature, solde à la mise en ligne, paiement en 3 fois sans frais possible. Abonnements CRM et add-ons sans engagement.</p>
      <h3>Propriété</h3><p>À la livraison et après paiement complet, le code, le nom de domaine, les contenus et les données appartiennent au client.</p>
      <p>[Conditions complètes à compléter.]</p>`],
  };
  const dlg = $('#legal');
  if (dlg && typeof dlg.showModal === 'function') {
    $$('[data-legal]').forEach((b) => b.addEventListener('click', () => {
      const [title, body] = LEGAL[b.dataset.legal];
      $('#legal-title').textContent = title;
      $('#legal-body').innerHTML = body;
      dlg.showModal();
    }));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  }
})();
