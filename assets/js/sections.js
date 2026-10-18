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
    v.disablePictureInPicture = true;
    const card = v.closest('.stack-card');
    const next = card && card.nextElementSibling;
    let inView = false;
    const sync = () => {
      // in the sticky stack the card stays "in view" while the next one slides over it
      const covered = next && next.getBoundingClientRect().top < card.getBoundingClientRect().top + card.offsetHeight * .5;
      if (inView && !covered) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
    };
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: .4 }).observe(v);
    let ticking = false;
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; sync(); }); } }, { passive: true });
  });

  /* ------------------------------------------------------------------
     2. Démo : l'aperçu de votre site en 10 secondes
     ------------------------------------------------------------------ */
  const DEMO = {
    immo: { brand: 'Maison Lumière', links: ['Acheter', 'Vendre', "L'agence"], nav: 'Contact', eyebrow: 'Agence immobilière · Bordeaux', title: 'Vendre avec exigence.', sub: "Estimation offerte sous 48 h, accompagnement jusqu'à la signature.", cta: 'Estimer mon bien', cta2: 'Nos biens', img: 'secteur-immobilier', cards: [['Villa · Pessac', '620 000 €', 'bien-1'], ['T3 · Chartrons', '380 000 €', 'bien-2'], ['Loft · Bastide', '455 000 €', 'bien-3']] },
    formation: { brand: 'Académie Nova', links: ['Formations', 'Programme', 'Avis'], nav: 'Espace apprenant', eyebrow: 'Organisme de formation', title: 'Apprendre, vraiment.', sub: 'Des parcours en ligne et en présentiel, à votre rythme.', cta: 'Voir les formations', cta2: 'Être rappelé', img: 'secteur-formation', cards: [['Management · 21 h', 'Blended'], ['Bureautique · 14 h', '100 % en ligne'], ['Sécurité · 7 h', 'Présentiel']] },
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
      // step 1 hands its choices over to step 2 (the estimate), which sends everything at once
      window.labSketch = { metier: DEMO[s.metier].eyebrow, kind: s.metier, mood: MOODS[s.mood], color: `${label} (${s.color})`, name: s.name, subject, body, touched: sketched };
      document.dispatchEvent(new CustomEvent('lab:sketch'));
    };
    let sketched = false;
    form.addEventListener('change', () => { sketched = true; });
    form.addEventListener('change', render);
    // « Pour qui » → the sketch starts from the visitor's trade
    $$('[data-metier-go]').forEach((a) => a.addEventListener('click', () => {
      const r = form.querySelector(`[name="metier"][value="${a.dataset.metierGo}"]`);
      if (r && !r.checked) { r.checked = true; form.dispatchEvent(new Event('change', { bubbles: true })); }
    }));
    let typing;
    el('demo-name').addEventListener('input', () => { sketched = true; clearTimeout(typing); typing = setTimeout(render, 120); });
    fillText(last);
    updateCta();
  }

  /* ------------------------------------------------------------------
     2b. Estimation : budget et délai calculés en direct (grille dans PRICING)
         Le niveau de design change toujours le prix ; la taille du projet
         s'ajoute par-dessus. « Sur-mesure » n'a pas de prix : il mène à l'audit.
     ------------------------------------------------------------------ */
  const PRICING = {
    site: {
      sizeLabel: 'Nombre de pages', hint: 'Accueil, services, à propos, contact… chaque page compte.', max: 25, def: 5, unit: ['page', 'pages'],
      levels: {
        std: { name: 'Essentiel', label: 'Essentiel', sub: 'Design personnalisé', base: 2000, incl: 5, extra: 150, days: 11, max: 8, maxHint: 'Au-delà de 8 pages, la formule Signature est plus adaptée.' },
        sig: { name: 'Signature', label: 'Signature', sub: 'DA, motion & back-office', base: 3500, incl: 12, extra: 220, days: 15, includes: ['cms', 'blog', 'rdv'] },
      },
      daysPerExtra: 1,
      options: [
        { id: 'brand', label: 'Identité visuelle (logo & charte)', price: 890, days: 5, tag: 'Valeur' },
        { id: 'cms', label: 'Back-office autonome & SEO automatisé', price: 690, days: 3, tag: 'Valeur' },
        { id: 'content', label: 'Rédaction des contenus & SEO', price: 490, days: 3 },
        { id: 'migrate', label: 'Reprise de l’ancien site & redirections SEO', price: 390, days: 2, tag: 'Valeur' },
        { id: 'blog', label: 'Blog & actualités', price: 390, days: 1 },
        { id: 'rdv', label: 'Prise de rendez-vous en ligne', price: 290, days: 1 },
        { id: 'lang', label: 'Version multilingue (1 langue)', price: 390, days: 3 },
        { id: 'client', label: 'Espace client', price: 990, days: 5 },
        { id: 'shop', label: 'E-commerce & paiement', price: 1500, days: 7 },
        { id: 'maint', label: 'Gestion & maintenance', monthly: 49 },
        { id: 'seo', label: 'SEO local suivi', monthly: 69 },
        { id: 'ai', label: 'Assistant IA sur le site', monthly: 59 },
      ],
    },
    formation: {
      sizeLabel: 'Modules à intégrer', hint: 'Vous fournissez vos contenus (vidéos, PDF, quiz) : je les intègre et les mets en forme.', max: 60, def: 10, unit: ['module', 'modules'],
      levels: {
        std: { name: 'Lancement', label: 'Lancement', sub: 'Parcours, quiz, attestations', base: 2490, incl: 10, extra: 45, days: 11 },
        sig: { name: 'Académie', label: 'Académie', sub: 'Catalogue, paiement, suivi', base: 4990, incl: 20, extra: 35, days: 20, includes: ['report'] },
      },
      daysPerExtra: .25,
      options: [
        { id: 'import', label: 'Mise en forme avancée de vos supports', price: 690, days: 4 },
        { id: 'report', label: 'Tableau de bord de progression des apprenants', price: 590, days: 3 },
        { id: 'sso', label: 'Connexion à vos outils (CRM, SSO)', price: 790, days: 4, tag: 'Valeur' },
        { id: 'train', label: 'Prise en main de vos formateurs (2 h)', price: 290, days: 1, tag: 'Valeur' },
        { id: 'brand', label: 'Identité visuelle de la plateforme', price: 690, days: 4 },
        { id: 'live', label: 'Classes virtuelles', monthly: 39 },
        { id: 'cert', label: 'Certificats & émargement', monthly: 29 },
        { id: 'maint', label: 'Gestion & maintenance', monthly: 49 },
      ],
    },
  };
  const SPEED = { std: { label: 'Standard', k: 1, add: 0 }, fast: { label: 'Prioritaire', k: .7, add: .2 }, express: { label: 'Express', k: .5, add: .4 } };
  const sim = $('#sim-form');
  if (sim) {
    const out = (id) => document.getElementById(id);
    const fmt = (n) => Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ');
    const round = (n, step) => Math.round(n / step) * step;
    const optsBox = out('sim-opts');
    const checked = new Set();
    let type = 'site';
    let prev = { low: null, high: null };
    const half = (d) => String(Math.round(d / 5 * 2) / 2).replace('.', ',');
    const delayText = (lo, hi) => (hi <= 7 ? `${lo} à ${hi} jours ouvrés` : (half(lo) === half(hi) ? `${half(lo)} semaines` : `${half(lo)} à ${half(hi)} semaines`));

    const buildOptions = () => {
      const P = PRICING[type];
      if (!P) { optsBox.innerHTML = ''; return; }
      const inc = (P.levels[sim.level.value].includes || []);
      optsBox.innerHTML = P.options.map((o) => {
        const isInc = inc.includes(o.id);
        return `
        <label class="sim-opt${isInc ? ' is-included' : ''}"><input type="checkbox" value="${o.id}" ${isInc || checked.has(type + o.id) ? 'checked' : ''} ${isInc ? 'disabled' : ''} />
          <span><i aria-hidden="true"></i>${o.label}${o.tag && !isInc ? ' <u>★</u>' : ''}<em>${isInc ? `Inclus ${P.levels[sim.level.value].name}` : (o.monthly ? `+${o.monthly} €/mois` : `+${fmt(o.price)} €`)}</em></span></label>`;
      }).join('');
      // a level can cap the size (Essentiel stops at 8 pages, Signature takes over)
      const LV = P.levels[sim.level.value];
      const size = out('sim-size');
      size.max = LV.max || P.max;
      if (+size.value > +size.max) size.value = size.max;
      out('sim-size-label').textContent = P.sizeLabel;
      out('sim-size-hint').textContent = LV.maxHint ? `${P.hint} ${LV.maxHint}` : P.hint;
      $$('#sim-levels [data-level]').forEach((lv) => {
        const L = P.levels[lv.dataset.level];
        $('b', lv).textContent = L.label;
        $('small', lv).textContent = L.sub;
      });
    };

    const compute = () => {
      const P = PRICING[type];
      const size = +out('sim-size').value;
      const L = P.levels[sim.level.value];
      const speed = SPEED[sim.speed.value];
      const extraUnits = Math.max(0, size - L.incl);
      let total = L.base + extraUnits * L.extra;
      let days = L.days + extraUnits * P.daysPerExtra;
      let monthly = 0;
      const lines = [[`${L.name} · ${L.incl} ${P.unit[1]} inclus`, L.base]];
      if (extraUnits) lines.push([`${extraUnits} ${P.unit[extraUnits > 1 ? 1 : 0]} en plus`, extraUnits * L.extra]);
      const inc = L.includes || [];
      const incLabels = P.options.filter((o) => inc.includes(o.id)).map((o) => o.label.split(' & ')[0].split(' (')[0]);
      if (incLabels.length) lines.push([`Inclus : ${incLabels.join(', ')}`, 0, false, true]);
      P.options.forEach((o) => {
        if (inc.includes(o.id) || !checked.has(type + o.id)) return;
        if (o.monthly) { monthly += o.monthly; lines.push([o.label, o.monthly, true]); }
        else { total += o.price; days += (o.days || 0) * .6; lines.push([o.label, o.price]); }  // options are built in parallel
      });
      if (speed.add) { const fee = round(total * speed.add, 10); lines.push([`Livraison ${speed.label.toLowerCase()}`, fee]); total += fee; }
      days *= speed.k;
      const low = total;
      const high = round(total * 1.15, 100);
      // projects this large or this connected deserve an audit first
      const big = total > 9000 || checked.has('siteshop') && checked.has('siteclient');
      return { P, L, size, low, high, dLow: Math.max(5, Math.round(days)), dHigh: Math.round(days * 1.25), monthly, lines, speed, big };
    };

    const render = () => {
      const custom = type === 'custom';
      sim.classList.toggle('is-custom', custom);
      out('sim-result').classList.toggle('is-custom', custom);
      if (custom) { updateSend(); return; }
      const r = compute();
      out('sim-size-out').textContent = r.size;
      out('sim-plan').textContent = `Formule ${r.L.name}`;
      const lowEl = out('sim-low'); const highEl = out('sim-high');
      if (window.labOdo && prev.low !== null) { window.labOdo(lowEl, fmt(r.low)); window.labOdo(highEl, fmt(r.high)); }
      else { lowEl.textContent = fmt(r.low); highEl.textContent = fmt(r.high); }
      prev = { low: r.low, high: r.high };
      out('sim-peek-price').textContent = `${fmt(r.low)} – ${fmt(r.high)} € HT`;
      out('sim-delay').textContent = delayText(r.dLow, r.dHigh);
      out('sim-monthly').textContent = r.monthly ? `${r.monthly} € / mois` : 'Aucun';
      out('sim-bar').style.transform = `scaleX(${Math.min(1, r.high / 12000)})`;
      out('sim-lines').innerHTML = r.lines.map(([l, v, m, inc]) => `<li${inc ? ' class="is-inc"' : ''}><span>${l}</span><b>${inc ? 'inclus' : (m ? `${v} €/mois` : `${fmt(v)} €`)}</b></li>`).join('');
      out('sim-audit').hidden = !r.big;
      updateSend(r);
    };

    const updateSend = (r) => {
      const sk = window.labSketch && window.labSketch.touched ? window.labSketch : null;
      const sketch = sk ? `   · Métier : ${sk.metier}\n   · Ambiance : ${sk.mood}\n   · Couleur : ${sk.color}\n   · Nom : ${sk.name || '(à préciser)'}` : '   · (non renseignée)';
      let subject; let body;
      if (type === 'custom') {
        const needs = [...sim.querySelectorAll('[name="need"]:checked')].map((c) => `   · ${c.value}`).join('\n') || '   · (à préciser ensemble)';
        subject = 'Mon projet sur-mesure Aivelo : demande d’audit';
        body = `Bonjour Arthur,\n\nJ'ai un projet sur-mesure et je souhaite l'audit offert.\n\n1. ESQUISSE\n${sketch}\n\n2. MES BESOINS\n${needs}\n\n3. EN QUELQUES MOTS\n   (décrivez votre projet ici)\n\nQuand pouvons-nous en parler ?\n`;
        out('sim-book').querySelector('.btn-roll').textContent = 'Réserver mon audit offert';
      } else {
        const opts = r.lines.slice(1).map(([l, v, m, inc]) => `   · ${l}${inc ? '' : ` (${m ? `${v} €/mois` : `${fmt(v)} €`})`}`).join('\n') || '   · aucune';
        subject = `Mon projet Aivelo : ${type === 'site' ? 'site web' : 'plateforme de formation'}, ${fmt(r.low)} à ${fmt(r.high)} € HT`;
        body = `Bonjour Arthur,\n\nVoici mon projet, composé sur votre site.\n\n1. ESQUISSE\n${sketch}\n\n2. ESTIMATION\n   · Formule ${r.L.name}, ${r.size} ${r.P.unit[1]}\n${opts}\n   · Livraison : ${r.speed.label}\n   · Budget estimé : ${fmt(r.low)} à ${fmt(r.high)} € HT\n   · Délai estimé : ${out('sim-delay').textContent}\n${r.monthly ? `   · Abonnements : ${r.monthly} €/mois\n` : ''}\nJe souhaite réserver l'atelier découverte pour affiner tout ça.\n`;
        out('sim-book').querySelector('.btn-roll').textContent = 'Réserver l\u2019atelier avec ce projet';
      }
      out('sim-send').href = `mailto:arthur.s@aivelo.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      // the brief that follows the visitor into the booking window
      window.labBrief = body.replace(/^Bonjour Arthur,\n\n/, '').replace(/\nJe souhaite[^\n]*\n?$|\nQuand pouvons[^\n]*\n?$/, '').trim();
    };

    sim.addEventListener('change', (e) => {
      if (e.target.name === 'level') buildOptions();
      if (e.target.name === 'type') {
        type = e.target.value;
        if (PRICING[type]) { out('sim-size').value = PRICING[type].def; buildOptions(); }
      } else if (e.target.type === 'checkbox' && e.target.name !== 'need') {
        e.target.checked ? checked.add(type + e.target.value) : checked.delete(type + e.target.value);
      }
      render();
    });
    out('sim-size').addEventListener('input', render);
    document.addEventListener('lab:sketch', () => {
      const sk = window.labSketch;
      if (sk && sk.kind === 'formation' && type === 'site' && prev.low !== null && !sim.dataset.touched) {
        sim.type.value = 'formation'; type = 'formation'; out('sim-size').value = PRICING.formation.def; buildOptions(); render();
      } else if (type === 'custom') updateSend();
      else updateSend(compute());
    });
    sim.addEventListener('pointerdown', () => { sim.dataset.touched = '1'; }, { once: true });
    const auditLink = out('sim-audit-link');
    if (auditLink) auditLink.addEventListener('click', (e) => { e.preventDefault(); sim.type.value = 'custom'; type = 'custom'; render(); out('estimation').scrollIntoView({ behavior: 'smooth', block: 'start' }); });

    const steps = $$('.proj-steps li');
    if (steps.length) {
      new IntersectionObserver(([e]) => {
        steps[0].classList.toggle('is-on', !e.isIntersecting);
        steps[1].classList.toggle('is-on', e.isIntersecting);
      }, { rootMargin: '-45% 0px -45% 0px' }).observe(out('estimation'));
    }

    // booking from the estimate: the brief and the contact details travel into the booking form
    out('sim-book').addEventListener('click', () => { window.labBriefArmed = true; });
    $$('#sim-contact input').forEach((i) => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); out('sim-book').click(); } }));

    // any « Estimer ce projet » button on the page can pre-fill the estimate
    window.labSimPreset = ({ type: t, level, opt } = {}) => {
      if (t && t !== type) { sim.type.value = t; type = t; if (PRICING[t]) out('sim-size').value = PRICING[t].def; }
      if (level && sim.level) sim.level.value = level;
      if (opt) checked.add(type + opt);
      buildOptions();
      render();
    };
    $$('[data-sim]').forEach((a) => a.addEventListener('click', () => {
      window.labSimPreset({ type: a.dataset.sim, level: a.dataset.simLevel, opt: a.dataset.simOpt });
    }));

    buildOptions();
    render();
    const q = new URLSearchParams(location.search);
    if (q.get('sim') && (PRICING[q.get('sim')] || q.get('sim') === 'custom')) {
      window.labSimPreset({ type: q.get('sim'), level: q.get('level') === 'sig' ? 'sig' : (q.get('level') === 'std' ? 'std' : undefined), opt: q.get('opt') || undefined });
    }
  }

  /* ------------------------------------------------------------------
     Réservation de l'atelier : l'agenda s'ouvre dans le site
     ------------------------------------------------------------------ */
  // Changer d'agenda = changer cette ligne. Un lien Calendly (https://calendly.com/…) est reconnu :
  // le récapitulatif du simulateur y est alors pré-rempli, sans copier-coller.
  const BOOKING = 'https://calendly.com/arthur-s-aivelo/atelier-decouverte';
  const BOOKING_PUBLIC = BOOKING;
  const isCalendly = /calendly\.com/.test(BOOKING);
  // what the visitor typed at the end of the estimate, ready for the booking form
  const contactInfo = () => {
    const v = (id) => (document.getElementById(id)?.value || '').trim();
    let tel = v('sim-c-tel').replace(/[^\d+]/g, '');
    if (/^0\d{9}$/.test(tel)) tel = '+33' + tel.slice(1);
    const email = v('sim-c-email');
    return { name: v('sim-c-name'), email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '', tel };
  };
  // Calendly : nom, e-mail, question 1 (le projet) et question 2 (téléphone) arrivent pré-remplis
  const bookingUrl = (brief, embed) => {
    if (!isCalendly) return BOOKING;
    const u = new URL(BOOKING);
    if (embed) {
      u.searchParams.set('embed_domain', location.hostname || 'aivelo.fr');
      u.searchParams.set('embed_type', 'Inline');
    }
    if (brief) {
      const c = contactInfo();
      if (c.name) u.searchParams.set('name', c.name);
      if (c.email) u.searchParams.set('email', c.email);
      u.searchParams.set('a1', brief.slice(0, 9000));
      if (c.tel) u.searchParams.set('a2', c.tel);
    }
    return u.toString();
  };
  const book = document.createElement('dialog');
  book.className = 'book';
  book.setAttribute('aria-label', 'Réserver l\u2019atelier découverte');
  book.innerHTML = `
    <div class="book-head">
      <div><small>Atelier découverte · 30 min · offert</small><b>Choisissez votre créneau</b></div>
      <form method="dialog"><button class="book-close" aria-label="Fermer">×</button></form>
    </div>
    <div class="book-brief" hidden><div class="book-brief-txt"></div><details><summary>Voir le récapitulatif</summary><pre></pre></details></div>
    <div class="book-body"><span class="book-loading">Chargement de l\u2019agenda…</span>
      <div class="book-fallback" hidden><b>L\u2019agenda ne peut pas s\u2019afficher ici.</b><p>Votre navigateur ou cet aperçu bloque les agendas intégrés. Ouvrez-le dans un nouvel onglet, la réservation prend une minute.</p><a class="btn btn-primary" href="${BOOKING_PUBLIC}" target="_blank" rel="noreferrer"><span class="btn-roll">Ouvrir l\u2019agenda</span></a></div></div>
    <p class="book-foot">Vous préférez écrire ? <a href="mailto:arthur.s@aivelo.fr">arthur.s@aivelo.fr</a> · <a href="https://wa.me/33624434801" target="_blank" rel="noreferrer">WhatsApp</a></p>`;
  document.body.appendChild(book);
  if (typeof book.showModal === 'function') {
    const body = $('.book-body', book);
    let blocked = false;
    const fallback = (hard) => { blocked = blocked || hard; body.classList.add('is-blocked'); $('.book-fallback', body).hidden = false; };
    // an embedded calendar refused by a Content-Security-Policy reports here: show the way out instead of an error page
    document.addEventListener('securitypolicyviolation', (e) => {
      if (/calendar\.google|calendly/.test(e.blockedURI || '')) fallback(true);
    });
    const ready = () => { if (blocked) return; body.classList.add('is-ready'); body.classList.remove('is-blocked'); $('.book-fallback', body).hidden = true; };
    window.addEventListener('message', (e) => {
      if (/(^|\.)calendly\.com$/.test((() => { try { return new URL(e.origin).hostname; } catch (x) { return ''; } })()) && e.data && /^calendly\./.test(e.data.event || '')) ready();
    });
    let lastSrc = '';
    const open = () => {
      const brief = window.labBriefArmed && window.labBrief ? window.labBrief : '';
      window.labBriefArmed = false;
      const src = bookingUrl(brief, true);
      $('.book-fallback a', body).href = bookingUrl(brief, false);
      if (src !== lastSrc && !blocked) {
        $('iframe', body)?.remove(); body.classList.remove('is-ready');
        const f = document.createElement('iframe');
        f.src = src; f.title = 'Agenda de réservation';
        // a slow agenda that arrives after the fallback still takes its place; a refused one never does
        // the iframe's load event also fires on a browser error page: a no-cors request tells us whether
        // the agenda is reachable at all (blocked by a firewall, an ad blocker or a CSP → the way out)
        let reachable = null;
        fetch(src, { mode: 'no-cors', cache: 'no-store' }).then(() => { reachable = true; if (f.dataset.loaded) ready(); }, () => { reachable = false; fallback(true); });
        f.addEventListener('load', () => { f.dataset.loaded = '1'; if (reachable !== false) setTimeout(() => { if (reachable) ready(); }, 120); });
        body.appendChild(f); lastSrc = src;
        setTimeout(() => { if (!body.classList.contains('is-ready')) fallback(false); }, 9000);
      }
      const box = $('.book-brief', book);
      box.hidden = !brief;
      if (brief) {
        $('.book-brief-txt', box).innerHTML = isCalendly
          ? '<b>Votre projet est joint à la réservation.</b> Il est déjà dans le formulaire : choisissez simplement votre créneau.'
          : '<b>Votre projet est copié.</b> Collez-le (Ctrl + V) dans le champ « Informations supplémentaires » de la réservation : j\u2019arriverai à l\u2019atelier en le connaissant déjà.';
        $('pre', box).textContent = brief;
      }
      book.showModal();
    };
    window.labBook = open;
    // the triggers become buttons: no link, so nothing can open a second tab behind the window
    $$('[data-book]').forEach((a) => {
      a.removeAttribute('target'); a.setAttribute('href', '#reserver'); a.setAttribute('role', 'button');
      a.addEventListener('click', (e) => { e.preventDefault(); open(); });
    });
    book.addEventListener('click', (e) => { if (e.target === book) book.close(); });
  }

  /* ------------------------------------------------------------------
     Mobile : une barre d'action toujours à portée de pouce
     ------------------------------------------------------------------ */
  const dock = document.createElement('div');
  dock.className = 'm-dock';
  // « Estimer » goes straight to the estimate: on this page, or on the home page from the other pages
  const homeHref = ($('.nav .logo') || {}).getAttribute ? $('.nav .logo').getAttribute('href') : '';
  // each page can tune the middle button and the WhatsApp message (data-dock-href / -label / data-wa on <main>)
  const pageCfg = ($('#main') || {}).dataset || {};
  const estimateHref = pageCfg.dockHref || ($('#estimation') ? '#estimation' : `${homeHref && homeHref[0] !== '#' ? homeHref : ''}#estimation`);
  const dockLabel = pageCfg.dockLabel || 'Estimer';
  const waText = pageCfg.wa || 'Bonjour Arthur, je vous contacte depuis le site Aivelo au sujet d\u2019un projet.';
  dock.innerHTML = `<a href="https://wa.me/33624434801?text=${encodeURIComponent(waText)}" class="m-dock-wa" target="_blank" rel="noreferrer" aria-label="Écrire sur WhatsApp"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg></a><a href="${estimateHref}" class="m-dock-ghost">${dockLabel}</a><a href="https://calendly.com/arthur-s-aivelo/atelier-decouverte" target="_blank" rel="noreferrer" class="m-dock-main" data-book>Réserver l\u2019atelier</a>`;
  document.body.appendChild(dock);
  dock.inert = true; dock.setAttribute('aria-hidden', 'true');
  if (window.labBook) { const d = $('[data-book]', dock); d.removeAttribute('target'); d.setAttribute('href', '#reserver'); d.setAttribute('role', 'button'); d.addEventListener('click', (e) => { e.preventDefault(); window.labBook(); }); }
  const hero = $('.hero'); const contact = $('#contact'); const est = $('#estimation');
  const dockState = { hero: true, contact: false, est: false };
  // hidden off-screen, the dock must not be reachable by keyboard or screen readers either
  const syncDock = () => { const on = !dockState.hero && !dockState.contact && !dockState.est; dock.classList.toggle('is-on', on); dock.inert = !on; if (on) dock.removeAttribute('aria-hidden'); else dock.setAttribute('aria-hidden', 'true'); };
  [[hero, 'hero', 0], [contact, 'contact', 0], [est, 'est', 0]].forEach(([el, k]) => {
    if (el) new IntersectionObserver(([e]) => { dockState[k] = e.isIntersecting; syncDock(); }, { threshold: 0 }).observe(el);
  });

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
      if (!/\d/.test(ch)) return `<span aria-hidden="true">${ch}</span>`;
      // the invisible digit gives the box the exact width and baseline of the final text,
      // so nothing moves when the reels stop and the price turns back into plain text
      return `<span class="odo-d" aria-hidden="true"><span class="odo-ghost">${ch}</span><span class="odo-reel">${REEL}</span></span>`;
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
  // the manifesto glass pane: a light reflection slides across it as you scroll
  const initSheen = () => {
    if (!window.ScrollTrigger || !motion() || reduceMotion) return;
    const pane = $('.manifesto .container');
    if (!pane) return;
    gsap.fromTo(pane, { '--sheen': '100%' }, { '--sheen': '0%', ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: true, refreshPriority: -1 } });
  };
  const ready = () => setTimeout(() => { initFade(); initSheen(); if (window.ScrollTrigger) ScrollTrigger.refresh(); }, 50);
  (document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1600))]) : Promise.resolve()).then(ready);


  /* Expertises sur mobile : points de position du carrousel */
  const stack = $('.stack');
  if (stack) {
    const cards = $$('.stack-card', stack);
    const hint = document.createElement('div');
    hint.className = 'stack-hint'; hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = cards.map(() => '<i></i>').join('');
    stack.after(hint);
    const dots = $$('i', hint);
    const sync = () => {
      const mid = stack.scrollLeft + stack.clientWidth / 2;
      let best = 0; let d = Infinity;
      cards.forEach((c, i) => { const k = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (k < d) { d = k; best = i; } });
      dots.forEach((x, i) => x.classList.toggle('is-on', i === best));
    };
    stack.addEventListener('scroll', sync, { passive: true }); sync();
  }

  /* ------------------------------------------------------------------
     Mesure d'audience (Umami, sans cookie) : les clics qui comptent
     ------------------------------------------------------------------ */
  const track = (name, data) => { try { if (window.umami) window.umami.track(name, data); } catch (e) { /* never break the page for a statistic */ } };
  const where = (el) => (el.closest('.m-dock') ? 'barre-mobile' : el.closest('.nav, .mobile-menu') ? 'menu' : el.closest('.book') ? 'fenetre-reservation' : el.closest('.footer') ? 'pied-de-page' : (el.closest('section[id]') || {}).id || 'page');
  // Umami counts every click on an element carrying data-umami-event, including those added here
  const tag = (el, name, extra = {}) => {
    el.setAttribute('data-umami-event', name);
    Object.entries({ section: where(el), ...extra }).forEach(([k, v]) => el.setAttribute(`data-umami-event-${k}`, v));
  };
  $$('a[href$="#demo"], a[href$="#estimation"]').forEach((a) => { if (!a.hasAttribute('data-sim')) tag(a, a.dataset.metierGo ? 'esquisser-metier' : a.closest('.m-dock') || /#estimation$/.test(a.getAttribute('href')) ? 'estimer' : 'demarrer-projet', a.dataset.metierGo ? { metier: a.dataset.metierGo } : {}); });
  $$('[data-sim]').forEach((a) => tag(a, 'estimer', { type: a.dataset.sim, niveau: a.dataset.simLevel || '' }));
  $$('[data-book]').forEach((a) => tag(a, a.id === 'sim-book' ? 'reserver-avec-estimation' : 'reserver-atelier'));
  $$('a[href*="wa.me"]').forEach((a) => tag(a, 'whatsapp'));
  $$('a[href*="linkedin.com"]').forEach((a) => tag(a, 'linkedin'));
  $$('a[href^="mailto:"]').forEach((a) => tag(a, a.id === 'sim-send' ? 'recapitulatif-email' : 'email'));
  // the funnel: sketch → estimate → booking confirmed
  const once = (el, name) => { if (el) el.addEventListener('change', () => track(name), { once: true }); };
  once($('#demo-form'), 'esquisse-composee');
  once($('#sim-form'), 'estimation-composee');
  window.addEventListener('message', (e) => {
    if (/calendly\.com$/.test((() => { try { return new URL(e.origin).hostname; } catch (x) { return ''; } })()) && e.data && e.data.event === 'calendly.event_scheduled') track('rdv-confirme');
  });
  /* ------------------------------------------------------------------
     Lot 2 · menu « Expertises » : survol à la souris, clic au doigt ou au clavier
     ------------------------------------------------------------------ */
  (() => {
    const dd = $('#nav-dd'), btn = $('#nav-dd-btn');
    if (!dd || !btn) return;
    const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
    let timer = 0, openY = 0, seen = false;
    const set = (open) => {
      clearTimeout(timer);
      if (dd.classList.contains('is-open') === open) return;
      dd.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) { openY = window.scrollY; if (!seen) { seen = true; track('menu-expertises'); } }
    };
    // with a mouse the panel is already open from the hover: a click must not close it again
    btn.addEventListener('click', (e) => set(e.pointerType === 'mouse' && hover.matches ? true : !dd.classList.contains('is-open')));
    dd.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && hover.matches) set(true); });
    dd.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && hover.matches) timer = setTimeout(() => set(false), 220); });
    dd.addEventListener('focusout', (e) => { if (!dd.contains(e.relatedTarget)) set(false); });
    $$('a, [data-book]', dd).forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('click', (e) => { if (!dd.contains(e.target)) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dd.classList.contains('is-open')) { set(false); btn.focus(); } });
    window.addEventListener('scroll', () => { if (dd.classList.contains('is-open') && Math.abs(window.scrollY - openY) > 80) set(false); }, { passive: true });
    // the button replaces the old « Expertises » link: it lights up while that section is on screen
    const sec = $('#expertises');
    if (sec && 'IntersectionObserver' in window) {
      new IntersectionObserver((en) => en.forEach((x) => btn.classList.toggle('is-active', x.isIntersecting)), { rootMargin: '-45% 0px -50% 0px' }).observe(sec);
    }
  })();
  /* ------------------------------------------------------------------
     Lot 2 · pages dédiées : chaque bloc ne s'active que si sa page le contient
     ------------------------------------------------------------------ */
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const onView = (el, cb, opts) => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver((en) => en.forEach((x) => cb(x.isIntersecting)), opts || { threshold: .25 }).observe(el);
  };
  const onceInView = (el, cb, opts) => { let done = false; onView(el, (v) => { if (v && !done) { done = true; cb(); } }, opts); };
  // roving tabs shared by the journey, the audience switcher and the agents
  const tabset = (tabs, show) => {
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(i, true));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        const n = (i + d + tabs.length) % tabs.length;
        show(n, true); tabs[n].focus();
      });
    });
  };
  const select = (tabs, panels, i) => {
    tabs.forEach((t, k) => { const on = k === i; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; t.classList.toggle('is-on', on); });
    panels.forEach((p, k) => { const on = k === i; p.hidden = !on; p.classList.toggle('is-on', on); });
  };

  // formation · the learner journey plays itself until the visitor takes over
  (() => {
    const box = $('#lms');
    if (!box) return;
    const tabs = $$('.lms-steps button', box), scenes = $$('.lms-scene', box);
    const fill = $('#lms-fill'), pay = $('#lms-pay'), paid = $('#lms-paid'), vbar = $('#lms-vbar'), fb = $('#lms-feedback');
    const answers = $$('#lms-answers button');
    let step = 0, auto = !RM, visible = false, timer = 0, run = 0;
    const later = (fn, ms) => { clearTimeout(timer); const id = ++run; timer = setTimeout(() => { if (id === run) fn(); }, ms); };
    const reset = () => {
      pay.classList.remove('is-busy', 'is-done'); pay.firstElementChild.textContent = 'Payer et commencer'; paid.hidden = true;
      answers.forEach((a) => a.classList.remove('is-right', 'is-wrong')); fb.textContent = '';
    };
    const doPay = () => {
      if (pay.classList.contains('is-done') || pay.classList.contains('is-busy')) return;
      pay.classList.add('is-busy');
      setTimeout(() => { pay.classList.remove('is-busy'); pay.classList.add('is-done'); pay.firstElementChild.textContent = 'Accès ouvert'; paid.hidden = false; later(() => show(1), 1300); }, 1100);
    };
    const answer = (a) => {
      answers.forEach((x) => x.classList.remove('is-wrong'));
      if (a.dataset.ok === '1') {
        a.classList.add('is-right');
        fb.textContent = 'Bonne réponse : reformuler montre au client qu\'il a été compris.';
        later(() => show(3), 1600);
      } else {
        void a.offsetWidth; a.classList.add('is-wrong');
        fb.textContent = 'Pas tout à fait. Indice : commencez par écouter.';
      }
    };
    function show(i, user) {
      if (user) { auto = false; clearTimeout(timer); }
      step = i; select(tabs, scenes, i);
      fill.style.width = (i + 1) * 25 + '%';
      if (i === 0) reset();
      if (i === 1) {
        vbar.style.transition = 'none'; vbar.style.width = '0';
        void vbar.offsetWidth; vbar.style.transition = 'width 3.6s linear'; vbar.style.width = '100%';
      }
      if (!auto) return;
      if (i === 1) later(() => show(2), 4200);
      if (i === 0) later(doPay, 1600);
      if (i === 2) later(() => answer(answers.find((a) => a.dataset.ok === '1')), 2200);
      if (i === 3) later(() => show(0), 5200);
    }
    tabset(tabs, show);
    pay.addEventListener('click', () => { auto = false; doPay(); });
    answers.forEach((a) => a.addEventListener('click', () => { auto = false; answer(a); }));
    box.addEventListener('pointerdown', () => { auto = false; });
    box.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { auto = false; clearTimeout(timer); run++; } });
    onView(box, (v) => {
      visible = v;
      if (v && auto) show(step);
      else if (!v) { clearTimeout(timer); run++; }
    });
  })();

  // formation · audience switcher with a sliding pill
  (() => {
    const tabs = $$('.aud-tab'), panels = $$('.aud-panel'), ind = $('.aud-ind');
    if (!tabs.length) return;
    let cur = 0;
    const place = () => { const t = tabs[cur]; ind.style.width = t.offsetWidth + 'px'; ind.style.transform = `translateX(${t.offsetLeft}px)`; };
    tabset(tabs, (i) => { cur = i; select(tabs, panels, i); place(); track('page-profil', { profil: tabs[i].textContent }); });
    place(); window.addEventListener('resize', place);
    if (document.fonts) document.fonts.ready.then(place);
  })();

  // formation · bento: bars grow once, the swatches recolour the whole block
  (() => {
    const lb = $('#lb');
    if (!lb) return;
    onceInView(lb, () => lb.classList.add('is-in'));
    $$('.lb-swatches button').forEach((b) => b.addEventListener('click', () => {
      $$('.lb-swatches button').forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      lb.style.setProperty('--b', b.style.getPropertyValue('--sw'));
    }));
  })();

  // shared · numbered steps draw their rail when they arrive
  $$('.xp-steps').forEach((el) => onceInView(el, () => el.classList.add('is-in')));

  // maintenance · console: response time wanders, the backup clock ticks, the log writes itself
  (() => {
    const ops = $('#ops');
    if (!ops) return;
    const msEl = $('#ops-ms'), path = $('#ops-path'), bk = $('#ops-backup'), log = $('#ops-log');
    const pts = Array.from({ length: 24 }, () => 170 + Math.random() * 40);
    let secs = 2 * 3600 + 14 * 60, li = 0, visible = false;
    const EVENTS = [['09:40', 'Formulaire de contact vérifié'], ['10:02', 'Certificat SSL contrôlé · valide'], ['11:15', 'Modification : nouvelle actualité publiée'], ['12:30', 'Temps de réponse normal sur tout le site'], ['14:05', 'Photos de la page Équipe remplacées'], ['15:20', 'Liens cassés vérifiés · aucun']];
    const draw = () => {
      const max = 240, min = 140;
      path.setAttribute('d', pts.map((v, i) => `${i ? 'L' : 'M'}${(i / (pts.length - 1) * 120).toFixed(1)} ${(32 - (v - min) / (max - min) * 28).toFixed(1)}`).join(' '));
    };
    const fmt = (t) => { const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60); return `il y a ${h} h ${String(m).padStart(2, '0')} min`; };
    draw();
    onView(ops, (v) => { visible = v; });
    if (RM) return;
    setInterval(() => {
      if (!visible || document.hidden) return;
      const last = pts[pts.length - 1];
      pts.push(Math.max(150, Math.min(230, last + (Math.random() - .5) * 26))); pts.shift();
      msEl.textContent = Math.round(pts[pts.length - 1]); draw();
    }, 1200);
    setInterval(() => { if (visible && !document.hidden) { secs += 1; bk.textContent = fmt(secs); } }, 1000);
    setInterval(() => {
      if (!visible || document.hidden) return;
      const [t, txt] = EVENTS[li++ % EVENTS.length];
      const el = document.createElement('li'); el.innerHTML = `<time>${t}</time>`; el.append(txt);
      log.append(el);
      while (log.children.length > 5) log.firstElementChild.remove();
    }, 3400);
  })();

  // maintenance · a day over Bordeaux, painted live on a canvas: the scroll is the clock. Sky, clouds, the stone of the
  // quays, the windows, the Garonne and its reflections all follow the hour; the city keeps living in between
  // (clouds, tram, river shuttle, birds, planes, shooting stars). Each moment of the day stacks up as a notification.
  (() => {
    const sky = $('#day');
    if (!sky) return;
    const path = $('#sky-done'), clock = $('#sky-time'), ticksBox = $('#sky-ticks'), dome = $('.sky-dome', sky), cv = $('#sky-cv');
    const stack = $('#sky-notes');
    const items = $$('.day-events li', sky);
    const ats = items.map((li) => parseFloat(li.dataset.at));
    const total = path.getTotalLength();
    path.setAttribute('stroke-dasharray', `${total} ${total}`);
    const ticks = ats.map(() => ticksBox.appendChild(document.createElement('i')));
    const cards = items.map((li) => {
      const c = document.createElement('div');
      c.className = 'sky-note';
      c.innerHTML = `<span class="sky-app"><i></i>Aivelo · votre-site.fr</span><time>${$('time', li).textContent}</time><b>${$('h3', li).textContent}</b><span>${$('p', li).textContent}</span>`;
      return stack.appendChild(c);
    });
    const ctx = cv.getContext('2d');
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
    const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
    const bell = (d, c, w) => Math.exp(-Math.pow((d - c) / w, 2));
    // time of day → sky (top, middle, horizon), river
    const KEYS = [
      [0, '#050820', '#0E1744', '#1F2A62', '#0A1236'],
      [.15, '#141C4E', '#3E3C7E', '#8A5F8E', '#22224C'],
      [.21, '#2C3C86', '#8A78B4', '#FFB08A', '#4A4C86'],
      [.3, '#4F86E8', '#9EC2FA', '#FFE2B8', '#5C84C8'],
      [.5, '#2F6FE0', '#86B4FF', '#D6E8FF', '#4F7FC8'],
      [.7, '#3F78E0', '#9CBEF5', '#FFE6BC', '#5B80C4'],
      [.79, '#2A3478', '#A0649A', '#FF9A5C', '#4A3C70'],
      [.86, '#121A4A', '#3A2E6A', '#7A4A78', '#1E1C48'],
      [1, '#050820', '#0E1744', '#1F2A62', '#0A1236'],
    ].map(([t, ...c]) => [t, c.map(hex)]);
    const colorsAt = (d) => {
      let i = 0; while (i < KEYS.length - 2 && d > KEYS[i + 1][0]) i++;
      const [t0, c0] = KEYS[i], [t1, c1] = KEYS[i + 1], k = clamp((d - t0) / (t1 - t0));
      const s = k * k * (3 - 2 * k);
      return c0.map((c, j) => mix(c, c1[j], s));
    };
    // a fixed seed: the same Bordeaux every visit
    let seed = 1;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const pick = (a, b) => a + (b - a) * rnd();

    let W = 0, H = 0, DPR = 1, U = 1, RT = 0, M = 0, mobile = false;
    let waves = [], stars = [], clouds = [], far = [], near = [], marks = [], hills = [], lamps = [], glints = [];
    let farC, nearC, buf, milky, moonS;
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w * DPR)); c.height = Math.max(1, Math.ceil(h * DPR)); const x = c.getContext('2d'); x.scale(DPR, DPR); return [c, x]; };
    const at = (d) => { const pt = path.getPointAtLength(total * d); return [pt.x / 1000 * W, pt.y / 340 * H]; };

    // ---------- the scene, generated once per size ----------
    const build = () => {
      W = dome.clientWidth; H = dome.clientHeight;
      if (!W || !H) return false;
      mobile = W < 700;
      DPR = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      RT = Math.round(H * (mobile ? .76 : .79));
      U = Math.min(H * .12, W * (mobile ? .16 : .1));
      M = Math.ceil(U * .5);
      seed = 7;
      ticks.forEach((t, i) => { const [x, y] = at(ats[i]); t.style.transform = `translate(${x}px, ${y}px)`; });
      // stars, brighter and denser towards the zenith
      stars = Array.from({ length: Math.round(W * RT / (mobile ? 1500 : 2200)) }, () => {
        const y = Math.pow(rnd(), 1.5) * RT * .9;
        return { x: rnd() * W, y, r: rnd() < .06 ? pick(1.1, 1.7) : pick(.35, .95), a: pick(.35, 1), p: rnd() * 6.3, s: pick(.6, 2.2), t: rnd() < .12 ? 1 : 0 };
      });
      // the milky way, painted once
      let mx; [milky, mx] = mk(W, RT);
      mx.translate(W * .5, RT * .4); mx.rotate(-.42);
      for (let i = 0; i < 26; i++) {
        const x = pick(-W * .7, W * .7), y = pick(-1, 1) * U * .5, r = pick(U * .5, U * 1.4);
        const g = mx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rnd() < .5 ? '190,200,255' : '255,220,235'},.07)`); g.addColorStop(1, 'rgba(0,0,0,0)');
        mx.fillStyle = g; mx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      for (let i = 0; i < W * 1.4; i++) {
        const x = pick(-W * .75, W * .75), y = (rnd() + rnd() + rnd() - 1.5) * U * .55;
        mx.fillStyle = `rgba(255,255,255,${pick(.15, .6).toFixed(2)})`; mx.fillRect(x, y, .7, .7);
      }
      for (let i = 0; i < 9; i++) { // dust lanes
        const x = pick(-W * .6, W * .6), y = pick(-.15, .15) * U, r = pick(U * .2, U * .5);
        const g = mx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(5,8,30,.35)'); g.addColorStop(1, 'rgba(5,8,30,0)');
        mx.fillStyle = g; mx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      // the moon, waxing gibbous, painted once
      const mr = Math.max(9, U * .14); let ms;
      [moonS, ms] = mk(mr * 2 + 2, mr * 2 + 2);
      const mg = ms.createRadialGradient(mr * .8, mr * .75, mr * .1, mr + 1, mr + 1, mr); mg.addColorStop(0, '#FFFFFF'); mg.addColorStop(.7, '#E9EDF8'); mg.addColorStop(1, '#C5CDE4');
      ms.fillStyle = mg; ms.beginPath(); ms.arc(mr + 1, mr + 1, mr, 0, 7); ms.fill();
      ms.fillStyle = 'rgba(150,160,195,.35)';
      [[.62, .7, .22], [1.2, .55, .16], [1.05, 1.25, .26], [.55, 1.3, .12], [1.45, 1.05, .1]].forEach(([x, y, r]) => { ms.beginPath(); ms.arc(x * mr + 1, y * mr + 1, r * mr, 0, 7); ms.fill(); });
      ms.globalCompositeOperation = 'source-atop';
      const sh = ms.createLinearGradient(0, 0, mr * 2, 0); sh.addColorStop(0, 'rgba(10,16,48,.85)'); sh.addColorStop(.32, 'rgba(10,16,48,.25)'); sh.addColorStop(.5, 'rgba(10,16,48,0)');
      ms.fillStyle = sh; ms.fillRect(0, 0, mr * 2 + 2, mr * 2 + 2);
      // clouds: soft puffs, flat bottoms; tinted every time the hour changes
      clouds = Array.from({ length: mobile ? 6 : 9 }, (_, i) => {
        const w = pick(U * 2.2, U * 4.6) * (i % 3 === 0 ? 1.3 : 1), h = w * .42;
        const [shape, sx] = mk(w, h);
        sx.save(); sx.beginPath(); sx.rect(0, 0, w, h * .86); sx.clip();
        const n = 16 + Math.round(rnd() * 10);
        for (let k = 0; k < n; k++) {
          const t = rnd(), x = w * (.14 + .72 * t), hump = Math.sin(Math.PI * t), r = h * pick(.16, .3) * (.55 + hump * .8), y = h * .86 - r * pick(.4, .95);
          const g = sx.createRadialGradient(x, y, r * .25, x, y, r); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.65, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)');
          sx.fillStyle = g; sx.fillRect(x - r, y - r, r * 2, r * 2);
        }
        sx.restore();
        const [tint, tx] = mk(w, h);
        return { shape, tint, tx, w, h, y: pick(.05, .5) * RT, x0: rnd() * (W + w), v: pick(4, 11) * (mobile ? .6 : 1), z: pick(.3, 1), a: pick(.7, 1) };
      });
      // the hills of Entre-deux-Mers far behind
      hills = Array.from({ length: 60 }, (_, i) => [i / 59 * (W + 2 * M) - M, RT - U * (1.02 + .14 * Math.sin(i * .31) + .08 * Math.sin(i * .83 + 2) + .04 * Math.sin(i * 2.1))]);
      // far roofs, the spires and the Chaban-Delmas bridge
      far = []; let x = -M;
      while (x < W + M) { const w = pick(U * .5, U * 1.3); far.push({ x, w, h: pick(U * .95, U * 1.35), roof: rnd() < .4, win: Array.from({ length: 4 }, () => [rnd(), rnd(), pick(.76, .92), pick(.06, .2)]) }); x += w; }
      const L = (f) => f * W;
      marks = mobile
        ? [['michel', L(.16)], ['cathedrale', L(.47)], ['chaban', L(.86)]]
        : [['michel', L(.12)], ['cloche', L(.27)], ['cathedrale', L(.4)], ['peyberland', L(.47)], ['cite', L(.95)], ['chaban', L(.79)]];
      // the stone façades of the quays, Place de la Bourse in the middle
      near = []; x = -M - pick(0, U);
      const bourse = mobile ? [W * .52, U * 2.6] : [W * .6, U * 3.4];
      while (x < W + M) {
        if (x + U * .4 > bourse[0] - bourse[1] / 2 && x < bourse[0] + bourse[1] / 2) { x = bourse[0] + bourse[1] / 2; near.push({ bourse: true, x: bourse[0] - bourse[1] / 2, w: bourse[1] }); continue; }
        const w = pick(U * .7, U * 1.35), fl = rnd() < .65 ? 3 : 2;
        const cols = Math.max(2, Math.round(w / (U * .19)));
        const b = { x, w, fl, cols, mans: rnd() < .75, dorm: rnd() < .8, chim: rnd() < .7, shade: pick(-.08, .08), win: [] };
        for (let f = 0; f <= fl; f++) for (let c = 0; c < cols; c++) { const m0 = pick(.16, .24); b.win.push({ f, c, on: pick(.74, .92), late: pick(.9, 1.18), m0, m1: rnd() < .4 ? m0 + pick(.03, .08) : 0, warm: rnd() < .82, k: pick(.75, 1) }); }
        near.push(b); x += w;
      }
      // the lamps of the quay, and the glitter on the water
      lamps = []; for (let lx = pick(0, U * .5); lx < W; lx += U * .62) lamps.push(lx);
      waves = Array.from({ length: mobile ? 26 : 46 }, () => ({ y: Math.pow(rnd(), 1.3), x: rnd(), l: pick(.04, .16), v: pick(-.006, .006) }));
      glints = Array.from({ length: mobile ? 70 : 120 }, () => ({ y: Math.pow(rnd(), .8), w: pick(.3, 1), p: rnd() * 6.3, s: pick(1.5, 4), o: pick(-1, 1) }));
      [farC] = mk(W + 2 * M, RT); [nearC] = mk(W + 2 * M, RT);
      buf = document.createElement('canvas'); buf.width = Math.ceil(W * .3); buf.height = Math.ceil(RT * .3);
      return true;
    };

    // ---------- landmarks ----------
    const spire = (c, x, base, w, h) => { c.beginPath(); c.moveTo(x - w / 2, base); c.lineTo(x - w / 2, base - h * .55); c.lineTo(x, base - h); c.lineTo(x + w / 2, base - h * .55); c.lineTo(x + w / 2, base); c.fill(); };
    const drawMark = (c, kind, x, base, col, lights, night) => {
      c.fillStyle = css(col);
      if (kind === 'michel') { // the flèche Saint-Michel, the tallest spire in the south of France
        c.fillRect(x - U * .13, base - U * 1.7, U * .26, U * 1.7);
        c.fillRect(x - U * .16, base - U * 1.78, U * .32, U * .1);
        spire(c, x, base - U * 1.76, U * .2, U * 1.55);
        lights.push([x, base - U * 1.2, 1]);
      } else if (kind === 'cathedrale') {
        c.fillRect(x - U * .62, base - U * 1.15, U * 1.24, U * 1.15);
        c.beginPath(); c.moveTo(x - U * .7, base - U * 1.15); c.lineTo(x, base - U * 1.45); c.lineTo(x + U * .7, base - U * 1.15); c.fill();
        [-.42, -.2].forEach((o) => { c.fillRect(x + U * o - U * .07, base - U * 1.75, U * .14, U * .6); spire(c, x + U * o, base - U * 1.74, U * .13, U * .95); });
        lights.push([x - U * .31, base - U * 1.5, .8]);
      } else if (kind === 'peyberland') {
        c.fillRect(x - U * .11, base - U * 1.95, U * .22, U * 1.95);
        spire(c, x, base - U * 1.93, U * .16, U * .55);
        c.fillRect(x - U * .02, base - U * 2.7, U * .04, U * .3);
      } else if (kind === 'cloche') { // the Grosse Cloche, two pepper-pot turrets
        c.fillRect(x - U * .3, base - U * 1.2, U * .6, U * 1.2);
        [-.24, .24].forEach((o) => { c.fillRect(x + U * o - U * .1, base - U * 1.45, U * .2, U * .4); spire(c, x + U * o, base - U * 1.42, U * .22, U * .45); });
        c.fillRect(x - U * .12, base - U * 1.45, U * .24, U * .28);
      } else if (kind === 'cite') { // la Cité du Vin, a swirl of glass
        c.beginPath(); c.moveTo(x - U * .42, base); c.bezierCurveTo(x - U * .58, base - U * .55, x - U * .3, base - U * 1.05, x + U * .06, base - U * 1.5);
        c.quadraticCurveTo(x + U * .2, base - U * 1.62, x + U * .26, base - U * 1.5); c.bezierCurveTo(x + U * .08, base - U * 1.1, x + U * .62, base - U * .6, x + U * .44, base); c.fill();
        lights.push([x, base - U * .7, .8]);
      } else if (kind === 'chaban') { // the Chaban-Delmas lift bridge: four pylons, a deck between them
        const ph = U * 2.05, P = [-1.05, -.36, .36, 1.05];
        P.forEach((o) => { const px = x + U * o; c.beginPath(); c.moveTo(px - U * .045, base); c.lineTo(px - U * .026, base - ph); c.lineTo(px + U * .026, base - ph); c.lineTo(px + U * .045, base); c.fill(); });
        c.fillRect(x - U * 1.5, base - U * .34, U * 3, U * .05);
        c.fillRect(x - U * .36, base - U * .62, U * .72, U * .07);
        c.strokeStyle = c.fillStyle; c.lineWidth = .7; c.beginPath();
        P.forEach((o) => { const px = x + U * o; c.moveTo(px, base - ph + U * .05); c.lineTo(px + (o < 0 ? -1 : 1) * U * .3, base - U * .32); c.moveTo(px, base - ph + U * .05); c.lineTo(px - (o < 0 ? -1 : 1) * U * .3, base - U * .32); });
        c.stroke();
        if (night > .05) P.forEach((o) => lights.push([x + U * o, base - ph, .7, [150, 200, 255]]));
      }
    };

    // ---------- the city, repainted when the hour changes ----------
    const STONE = [232, 214, 178], SLATE = [92, 104, 128], NIGHT = [16, 20, 46];
    let lampOn = 0;
    const isOn = (w, d) => (d > w.on && d < w.late) || d < w.late - 1 || (d > w.m0 && d < w.m1);
    const paintCity = (d, c) => {
      const { sunUp, night, horizon, low, mid } = c;
      const day = clamp(sunUp * 1.5 + horizon * .25);
      const warm = mix(STONE, [255, 168, 112], horizon * .55);
      const stone = mix(mix(NIGHT, mix(low, [70, 70, 110], .5), .35), warm, day);
      const slate = mix(mix(NIGHT, [30, 34, 70], .6), mix(SLATE, mid, .25), day);
      // far layer: in the haze, between the sky and the stone
      const fx = farC.getContext('2d'); fx.setTransform(DPR, 0, 0, DPR, 0, 0); fx.clearRect(0, 0, W + 2 * M, RT);
      const farCol = mix(mix(stone, [112, 124, 158], .4), low, .46 - night * .22);
      const lights = [];
      fx.save(); fx.translate(M, 0);
      marks.forEach(([k, x]) => drawMark(fx, k, x, RT - U * .25, mix(farCol, low, .12), lights, night));
      fx.fillStyle = css(farCol);
      far.forEach((b) => {
        fx.fillRect(b.x, RT - b.h, b.w + .5, b.h);
        if (b.roof) { fx.beginPath(); fx.moveTo(b.x, RT - b.h); fx.lineTo(b.x + b.w * .5, RT - b.h - U * .16); fx.lineTo(b.x + b.w, RT - b.h); fx.fill(); }
      });
      if (night > .02) for (const b of far) for (const [wx, wy, on, off] of b.win) {
        if (!(d > on || d < off)) continue;
        fx.fillStyle = `rgba(255,214,140,${(.55 * night).toFixed(3)})`; fx.fillRect(b.x + wx * b.w, RT - b.h + U * .1 + wy * (b.h - U * .4), U * .035, U * .045);
      }
      lights.forEach(([x, y, s, col]) => { // floodlit monuments
        const g = fx.createRadialGradient(x, y, 0, x, y, U * .5 * s); g.addColorStop(0, css(col || [255, 196, 120], .45 * night)); g.addColorStop(1, css(col || [255, 196, 120], 0));
        fx.fillStyle = g; fx.fillRect(x - U * s, y - U * s, U * 2 * s, U * 2 * s);
        if (col) { fx.fillStyle = css([230, 240, 255], night); fx.fillRect(x - 1, y - 1.5, 2, 2); }
      });
      fx.restore();
      // near layer: the quays
      const nx = nearC.getContext('2d'); nx.setTransform(DPR, 0, 0, DPR, 0, 0); nx.clearRect(0, 0, W + 2 * M, RT);
      nx.save(); nx.translate(M, 0);
      const qH = U * .2, base = RT - qH, gH = U * .26, fH = U * .2, rH = U * .22;
      const glass = mix(mix(mid, [40, 50, 80], .55), NIGHT, night * .7);
      for (const b of near) {
        if (b.bourse) { // Place de la Bourse: lit in gold at night
          const bw = b.w, bx = b.x, h = gH + fH * 2, gold = mix(stone, [236, 178, 96], night * .85);
          nx.fillStyle = css(mix(gold, NIGHT, night * .1));
          nx.fillRect(bx, base - h, bw, h);
          const pw = bw * .26, px = bx + bw / 2 - pw / 2;
          nx.fillRect(px, base - h - U * .1, pw, h + U * .1);
          nx.fillStyle = css(mix(slate, [70, 60, 50], night * .3));
          nx.beginPath(); nx.moveTo(bx - U * .02, base - h); nx.lineTo(bx + U * .12, base - h - rH * .8); nx.lineTo(bx + bw - U * .12, base - h - rH * .8); nx.lineTo(bx + bw + U * .02, base - h); nx.fill();
          nx.beginPath(); nx.moveTo(px - U * .03, base - h - U * .1); nx.quadraticCurveTo(px + pw / 2, base - h - rH * 2.2, px + pw + U * .03, base - h - U * .1); nx.fill();
          nx.fillStyle = css(mix(gold, [255, 255, 255], .15 + night * .2)); nx.fillRect(bx, base - h, bw, U * .025); nx.fillRect(bx, base - gH, bw, U * .02);
          const cols = Math.round(bw / (U * .17));
          for (let i = 0; i < cols; i++) for (let f = 0; f < 3; f++) {
            const wx = bx + (i + .3) * bw / cols, wy = f === 0 ? base - gH + U * .05 : base - gH - f * fH + U * .045;
            nx.fillStyle = night > .3 ? css([255, 214, 140], .35 + night * .4) : css(glass, .9);
            if (f === 0) { nx.beginPath(); nx.moveTo(wx, base); nx.lineTo(wx, wy + U * .04); nx.arc(wx + U * .045, wy + U * .04, U * .045, Math.PI, 0); nx.lineTo(wx + U * .09, base); nx.fill(); }
            else nx.fillRect(wx, wy, U * .07, fH * .55);
          }
          const g = nx.createRadialGradient(bx + bw / 2, base, 0, bx + bw / 2, base, bw * .8); g.addColorStop(0, css([255, 190, 110], .35 * night)); g.addColorStop(1, css([255, 190, 110], 0));
          nx.fillStyle = g; nx.fillRect(bx - bw * .3, base - bw * .8, bw * 1.6, bw * .8);
          continue;
        }
        const h = gH + fH * b.fl, top = base - h;
        const wall = mix(stone, b.shade > 0 ? [255, 255, 255] : NIGHT, Math.abs(b.shade) * (1 - night * .5));
        // mansard roof, dormers, chimneys
        nx.fillStyle = css(slate);
        if (b.mans) { nx.beginPath(); nx.moveTo(b.x, top); nx.lineTo(b.x + U * .07, top - rH); nx.lineTo(b.x + b.w - U * .07, top - rH); nx.lineTo(b.x + b.w, top); nx.fill(); }
        else { nx.fillRect(b.x, top - U * .05, b.w, U * .05); }
        if (b.chim) { nx.fillRect(b.x + b.w * .2, top - rH - U * .1, U * .07, U * .12); nx.fillRect(b.x + b.w * .75, top - rH - U * .08, U * .06, U * .1); }
        nx.fillStyle = css(wall); nx.fillRect(b.x, top, b.w + .4, h);
        nx.fillStyle = css(mix(wall, [255, 255, 255], .18 * day)); nx.fillRect(b.x, top, b.w, U * .025);
        nx.fillStyle = css(mix(wall, NIGHT, .18)); nx.fillRect(b.x, base - gH, b.w, U * .018);
        for (const w of b.win) {
          const wx = b.x + (w.c + .5) * b.w / b.cols - U * .033;
          if (w.f === b.fl && b.mans && b.dorm) { // dormer in the roof
            if (w.c % 2) continue;
            const dy = top - rH * .72;
            nx.fillStyle = css(wall); nx.fillRect(wx - U * .015, dy - U * .02, U * .096, U * .13);
            const on = isOn(w, d - .02);
            nx.fillStyle = on ? css(w.warm ? [255, 200, 120] : [205, 222, 255], w.k) : css(glass); nx.fillRect(wx, dy, U * .066, U * .1);
            continue;
          }
          if (w.f === b.fl) continue;
          const on = isOn(w, d);
          if (w.f === 0) { // shopfronts: open in the evening
            const shop = d > .72 && d < .95 && w.c % 2 === 0;
            nx.fillStyle = shop ? css([255, 210, 140], .9) : css(glass);
            nx.fillRect(wx - U * .01, base - gH + U * .08, U * .086, gH - U * .08);
            continue;
          }
          const wy = base - gH - w.f * fH + U * .045;
          nx.fillStyle = on ? css(w.warm ? [255, 204, 128] : [208, 224, 255], w.k) : css(glass);
          nx.fillRect(wx, wy, U * .066, fH * .58);
          if (on) { nx.fillStyle = css(w.warm ? [255, 190, 110] : [180, 205, 255], .16 * night); nx.fillRect(wx - U * .04, wy - U * .04, U * .146, fH * .58 + U * .08); }
          else if (day > .3) { nx.fillStyle = css([255, 255, 255], .14 * day); nx.fillRect(wx, wy, U * .066, U * .02); }
          nx.fillStyle = css(mix(wall, NIGHT, .25)); nx.fillRect(wx - U * .01, wy + fH * .58, U * .086, U * .012); // balcony
        }
      }
      // the quay: stone wall, lamps
      nx.fillStyle = css(mix(stone, NIGHT, .35)); nx.fillRect(-M, base, W + 2 * M, qH);
      nx.fillStyle = css(mix(stone, [255, 255, 255], .12 * day)); nx.fillRect(-M, base, W + 2 * M, U * .02);
      lampOn = clamp((night - .1) * 2 + horizon * .3);
      lamps.forEach((lx) => {
        nx.fillStyle = css(mix(slate, NIGHT, .5)); nx.fillRect(lx - .6, base - U * .3, 1.2, U * .3);
        if (lampOn > 0) {
          const g = nx.createRadialGradient(lx, base - U * .31, 0, lx, base - U * .31, U * .3); g.addColorStop(0, css([255, 214, 150], .55 * lampOn)); g.addColorStop(1, css([255, 214, 150], 0));
          nx.fillStyle = g; nx.fillRect(lx - U * .3, base - U * .61, U * .6, U * .6);
          nx.fillStyle = css([255, 236, 200], lampOn); nx.fillRect(lx - 1.2, base - U * .33, 2.4, 2.4);
        }
      });
      nx.restore();
    };

    // ---------- each frame ----------
    let d = 0, dT = 0, last = -1, px = 0, pxT = 0, py = 0, pyT = 0, t0 = performance.now(), cur = -1;
    let shoot = null, nextShoot = 2, lastNow = 0;
    const tint = (cl, c) => {
      const { sunUp, night, horizon, mid } = c;
      const litC = mix(mix(mix([255, 255, 255], [255, 186, 146], horizon * .85), [120, 132, 182], night), mid, .08);
      const shade = mix(mix(mix(mid, [150, 162, 196], .55), [150, 92, 130], horizon * .6), [22, 28, 62], night);
      cl.tx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cl.tx.globalCompositeOperation = 'copy'; cl.tx.drawImage(cl.shape, 0, 0, cl.w, cl.h);
      cl.tx.globalCompositeOperation = 'source-in';
      const g = cl.tx.createLinearGradient(0, 0, 0, cl.h); g.addColorStop(0, css(litC)); g.addColorStop(.45, css(mix(litC, shade, .3))); g.addColorStop(.9, css(shade));
      cl.tx.fillStyle = g; cl.tx.fillRect(0, 0, cl.w, cl.h);
      cl.alpha = cl.a * (.55 + .35 * clamp(sunUp * 2) - night * .15);
    };
    const frame = (now) => {
      const t = (now - t0) / 1000;
      const dt = clamp((now - (lastNow || now)) / 16.67, 0, 4); lastNow = now;
      const kd = RM ? 1 : 1 - Math.pow(.88, dt), kp = 1 - Math.pow(.94, dt);
      d += (dT - d) * kd; if (Math.abs(dT - d) < .0004) d = dT;
      px += (pxT - px) * kp; py += (pyT - py) * kp;
      const [top, mid, low, river] = colorsAt(d);
      const sunUp = d > .2 && d < .82 ? Math.sin(Math.PI * (d - .2) / .62) : 0;
      const night = clamp(d < .5 ? (.25 - d) / .1 : (d - .8) / .08);
      const horizon = bell(d, .225, .05) + bell(d, .8, .045);
      const C = { sunUp, night, horizon, low, mid };
      if (Math.abs(d - last) > .0015 || last < 0) { paintCity(d, C); clouds.forEach((cl) => tint(cl, C)); last = d; }
      const [sx, sy] = at(clamp(d, .002, .998));
      const elev = clamp((RT - sy) / (RT * .7));
      const sunCol = mix([255, 236, 196], [255, 140, 64], 1 - elev);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      // sky
      let g = ctx.createLinearGradient(0, 0, 0, RT);
      g.addColorStop(0, css(top)); g.addColorStop(.55, css(mid)); g.addColorStop(1, css(low));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, RT);
      ctx.globalCompositeOperation = 'screen';
      if (horizon > .01) { // the glow of dawn and dusk, around the sun
        g = ctx.createRadialGradient(sx, RT, 0, sx, RT, W * .75); g.addColorStop(0, css([255, 150, 80], .7 * horizon)); g.addColorStop(.4, css([255, 110, 90], .25 * horizon)); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, RT);
      }
      // night: milky way, stars, a shooting star now and then
      if (night > .01) {
        ctx.globalAlpha = night * .9; ctx.drawImage(milky, px * -4, py * -3, W, RT); ctx.globalAlpha = 1;
        for (const s of stars) {
          const a = s.a * night * (.55 + .45 * Math.sin(t * s.s + s.p)) * clamp((RT - s.y) / (RT * .5));
          ctx.fillStyle = s.t ? `rgba(200,215,255,${a.toFixed(3)})` : `rgba(255,255,255,${a.toFixed(3)})`;
          const x = s.x - px * 5, y = s.y - py * 4;
          if (s.r > 1) { ctx.beginPath(); ctx.arc(x, y, s.r, 0, 7); ctx.fill(); ctx.fillStyle = `rgba(200,215,255,${(a * .25).toFixed(3)})`; ctx.fillRect(x - s.r * 3, y - .3, s.r * 6, .6); ctx.fillRect(x - .3, y - s.r * 3, .6, s.r * 6); }
          else ctx.fillRect(x - s.r / 2, y - s.r / 2, s.r, s.r);
        }
        if (!RM && night > .6) {
          if (!shoot && t > nextShoot) { shoot = { x: pick(W * .3, W), y: pick(0, RT * .35), a: pick(2.4, 2.9), v: pick(W * .6, W * .9), b: t }; }
          if (shoot) {
            const k = (t - shoot.b) / .9;
            if (k > 1) { shoot = null; nextShoot = t + pick(2.5, 6); }
            else {
              const hx = shoot.x + Math.cos(shoot.a) * shoot.v * k * .4, hy = shoot.y + Math.sin(shoot.a) * shoot.v * k * .4, len = U * 1.6 * Math.sin(Math.PI * k);
              const sg = ctx.createLinearGradient(hx, hy, hx - Math.cos(shoot.a) * len, hy - Math.sin(shoot.a) * len); sg.addColorStop(0, `rgba(255,255,255,${(.9 * night).toFixed(2)})`); sg.addColorStop(1, 'rgba(255,255,255,0)');
              ctx.strokeStyle = sg; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - Math.cos(shoot.a) * len, hy - Math.sin(shoot.a) * len); ctx.stroke();
            }
          }
        }
      }
      // the sun: halo, rays, disc — or the moon
      if (sunUp > .001) {
        g = ctx.createRadialGradient(sx, sy, 0, sx, sy, H * .7); g.addColorStop(0, css(sunCol, .55 * sunUp)); g.addColorStop(.12, css(sunCol, .22 * sunUp)); g.addColorStop(1, css(sunCol, 0));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, RT);
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, RT); ctx.clip();
        g = ctx.createRadialGradient(sx, sy, U * .2, sx, sy, H * .95); g.addColorStop(0, css(sunCol, .16 * sunUp * (.5 + (1 - elev)))); g.addColorStop(1, css(sunCol, 0));
        ctx.fillStyle = g; ctx.beginPath();
        for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + t * .025 + Math.sin(k * 3.7) * .1, w = .035 + .02 * Math.sin(k * 1.7 + t * .3); ctx.moveTo(sx, sy); ctx.arc(sx, sy, H * .95, a - w, a + w); ctx.closePath(); }
        ctx.fill(); ctx.restore();
        const r = U * .19;
        g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2.4); g.addColorStop(0, 'rgba(255,255,250,1)'); g.addColorStop(.38, css(mix([255, 250, 230], sunCol, .4), 1)); g.addColorStop(.46, css(sunCol, .55)); g.addColorStop(1, css(sunCol, 0));
        ctx.globalAlpha = clamp(sunUp * 4); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, r * 2.4, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        if (elev > .25) { // a whisper of lens flare
          const cx = W / 2, cy = H / 2;
          [[.5, .5, [140, 190, 255], .05], [.75, .25, [255, 200, 140], .06], [1.25, .9, [170, 140, 255], .035], [1.5, .35, [120, 255, 210], .045]].forEach(([k, s, col, a]) => {
            const fx = sx + (cx - sx) * k * 2, fy = sy + (cy - sy) * k * 2;
            const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, U * s); fg.addColorStop(0, css(col, a * sunUp * elev)); fg.addColorStop(.85, css(col, a * .6 * sunUp * elev)); fg.addColorStop(1, css(col, 0));
            ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(fx, fy, U * s, 0, 7); ctx.fill();
          });
        }
      }
      const mph = (d + .5) % 1, [mx, my] = at(clamp(mph, .002, .998));
      const moonA = clamp(1 - sunUp * 3) * clamp(night * 1.5 + .2) * clamp(Math.min(mph, 1 - mph) * 6);
      if (moonA > .01) {
        g = ctx.createRadialGradient(mx, my, 0, mx, my, U * 1.2); g.addColorStop(0, `rgba(190,205,255,${(.4 * moonA).toFixed(3)})`); g.addColorStop(1, 'rgba(190,205,255,0)');
        ctx.fillStyle = g; ctx.fillRect(mx - U * 1.2, my - U * 1.2, U * 2.4, U * 2.4);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = moonA;
        const mw = moonS.width / DPR; ctx.drawImage(moonS, mx - mw / 2, my - mw / 2, mw, mw);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'screen';
      }
      ctx.globalCompositeOperation = 'source-over';
      // planes by day (contrail), blinking lights by night; birds at morning and evening
      if (!RM) {
        const pk = (t % 26) / 26, plx = lerp(-U, W + U, pk), ply = RT * (.16 + .08 * Math.sin(pk * 3));
        if (sunUp > .25) {
          const cg = ctx.createLinearGradient(plx, ply, plx - W * .35, ply); cg.addColorStop(0, `rgba(255,255,255,${(.7 * sunUp).toFixed(2)})`); cg.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = cg; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(plx - 4, ply); for (let k = 1; k < 12; k++) ctx.lineTo(plx - W * .35 * k / 11, ply + Math.sin(k * .8 + t) * .6 * k / 11 + k * .35); ctx.stroke();
          ctx.fillStyle = css(mix([255, 255, 255], top, .2)); ctx.fillRect(plx - 4, ply - .8, 6, 1.6); ctx.fillRect(plx - 2, ply - 2.5, 1.6, 5);
        } else if (night > .3) {
          const bl = (t * 1.3) % 1 < .12;
          ctx.fillStyle = `rgba(255,80,80,${night.toFixed(2)})`; ctx.fillRect(plx, ply, 2, 2);
          if (bl) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(plx + 4, ply + 1, 1.6, 0, 7); ctx.fill(); }
        }
        const birds = bell(d, .32, .07) + bell(d, .72, .06);
        if (birds > .05) {
          const bk = (t % 19) / 19, bx = lerp(W + U, -U * 2, bk), by = RT * (.42 - .1 * bk);
          ctx.strokeStyle = css(mix(top, NIGHT, .55), clamp(birds * 1.5)); ctx.lineWidth = 1.3; ctx.beginPath();
          [[0, 0], [1, -.5], [1.1, .6], [2.1, -1], [2.2, 1.1], [3.2, -1.4], [3.1, 1.6]].forEach(([ox, oy], i) => {
            const x = bx + ox * U * .2, y = by + oy * U * .16 + Math.sin(t * 2 + i) * 2, f = Math.sin(t * 9 + i * 1.3) * U * .045, w = U * .07;
            ctx.moveTo(x - w, y - f); ctx.quadraticCurveTo(x - w * .3, y - f * .2, x, y); ctx.quadraticCurveTo(x + w * .3, y - f * .2, x + w, y - f);
          });
          ctx.stroke();
        }
      }
      // clouds, drifting at their own pace
      for (const cl of clouds) {
        const span = W + cl.w * 2, x = ((cl.x0 + (RM ? 0 : t * cl.v)) % span) - cl.w - px * 10 * cl.z;
        ctx.globalAlpha = clamp(cl.alpha); ctx.drawImage(cl.tint, x, cl.y - py * 6 * cl.z, cl.w, cl.h);
      }
      ctx.globalAlpha = 1;
      // the hills, the far city, the quays (each with its own depth)
      ctx.fillStyle = css(mix(mix(low, mid, .5), NIGHT, .12 + night * .3)); ctx.beginPath(); ctx.moveTo(-M, RT);
      hills.forEach(([x, y]) => ctx.lineTo(x - px * 3, y)); ctx.lineTo(W + M, RT); ctx.fill();
      if (horizon > .05 || bell(d, .25, .04) > .05) { // morning mist
        const mist = bell(d, .25, .05);
        g = ctx.createLinearGradient(0, RT - U * 1.4, 0, RT); g.addColorStop(0, 'rgba(255,240,230,0)'); g.addColorStop(1, css(mix([255, 236, 220], low, .3), .45 * mist));
        ctx.fillStyle = g; ctx.fillRect(0, RT - U * 1.4, W, U * 1.4);
      }
      ctx.drawImage(farC, -M - px * 6, 0, W + 2 * M, RT);
      ctx.drawImage(nearC, -M - px * 12, 0, W + 2 * M, RT);
      // the tram glides along the quay
      if (!RM) {
        const tk = (t % 34) / 34, tw = U * 1.5, tx = lerp(W + U, -tw - U, tk) - px * 12, ty = RT - U * .2 - U * .17;
        const body = mix([226, 230, 236], NIGHT, night * .55);
        ctx.fillStyle = css(body); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(tx, ty, tw, U * .15, U * .05) : ctx.rect(tx, ty, tw, U * .15); ctx.fill();
        ctx.fillStyle = night > .2 || horizon > .3 ? css([255, 232, 180], .95) : css(mix(mid, NIGHT, .5), .9);
        for (let k = 0; k < 7; k++) ctx.fillRect(tx + U * .08 + k * tw / 7.4, ty + U * .03, tw / 7.4 - U * .05, U * .06);
        ctx.fillStyle = css([150, 40, 70], .9 - night * .3); ctx.fillRect(tx, ty + U * .11, tw, U * .015);
        if (night > .2) { g = ctx.createRadialGradient(tx, ty + U * .1, 0, tx, ty + U * .1, U * .5); g.addColorStop(0, css([255, 240, 210], .5 * night)); g.addColorStop(1, css([255, 240, 210], 0)); ctx.fillStyle = g; ctx.fillRect(tx - U * .5, ty - U * .4, U, U); }
      }
      // the Garonne: a mirror of everything above, rippling
      const RH = H - RT;
      const bctx = buf.getContext('2d'); bctx.setTransform(1, 0, 0, 1, 0, 0); bctx.globalCompositeOperation = 'copy'; bctx.drawImage(cv, 0, 0, cv.width, RT * DPR, 0, 0, buf.width, buf.height);
      ctx.fillStyle = css(river); ctx.fillRect(0, RT, W, RH);
      const step = mobile ? 3 : 2;
      ctx.globalAlpha = .7; ctx.imageSmoothingQuality = 'high';
      const RD = buf.height / RT;
      for (let y = 0; y < RH; y += step) {
        const k = y / RH, src = RT - 1 - y - Math.sin(y * .5 + t * 3) * k * 1.5;
        if (src < 0) break;
        const off = Math.sin(y * .22 + t * 1.7) * (.4 + k * 2.5) + Math.sin(y * .07 - t * .9) * k * 2;
        ctx.drawImage(buf, 0, src * RD, buf.width, step * RD, off, RT + y, W, step);
      }
      ctx.globalAlpha = 1;
      g = ctx.createLinearGradient(0, RT, 0, H); g.addColorStop(0, css(river, .32)); g.addColorStop(.45, css(mix(river, NIGHT, .15), .55)); g.addColorStop(1, css(mix(river, NIGHT, .35), .82));
      ctx.fillStyle = g; ctx.fillRect(0, RT, W, RH);
      // the sky catches on the ripples
      ctx.strokeStyle = css(mix(top, [255, 255, 255], .35), .16 - night * .08); ctx.lineWidth = 1; ctx.beginPath();
      for (const w of waves) { const y = RT + 3 + w.y * (RH - 6), x = ((w.x + t * w.v) % 1 + 1) % 1 * (W + 80) - 40, l = w.l * W * (.4 + w.y); ctx.moveTo(x, y); ctx.lineTo(x + l, y); }
      ctx.stroke();
      // glitter under the sun (or the moon)
      const gl = Math.max(sunUp * (.45 + (1 - elev) * .55), moonA * .55);
      if (gl > .02) {
        ctx.globalCompositeOperation = 'screen';
        const gc = sunUp > .01 ? sunCol : [210, 220, 255], gx = sunUp > .01 ? sx : mx;
        for (const s of glints) {
          const y = RT + 2 + s.y * (RH - 4), spread = U * (.15 + s.y * 1.6), x = gx + s.o * spread + Math.sin(t * .8 + s.p) * U * .1;
          const a = gl * (.35 + .65 * Math.max(0, Math.sin(t * s.s + s.p))) * (1 - s.y * .5);
          ctx.fillStyle = css(gc, a); ctx.fillRect(x - s.w * U * .12, y, s.w * U * .24 * (1 + s.y), 1 + s.y);
        }
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.fillStyle = css([255, 255, 255], .12 + .1 * (1 - night)); ctx.fillRect(0, RT, W, .8);
      // the river shuttle crosses the Garonne
      if (!RM) {
        const bk = (t % 42) / 42, bw = U * .55, by = RT + RH * .4, bx = lerp(-bw * 2, W + bw, bk) - px * 16;
        ctx.strokeStyle = `rgba(255,255,255,${(.25 + .1 * (1 - night)).toFixed(2)})`; ctx.lineWidth = 1;
        ctx.beginPath(); for (let k = 1; k < 4; k++) { ctx.moveTo(bx - k * U * .18, by + U * .1 + k * 1.2); ctx.lineTo(bx - k * U * .18 - U * .2, by + U * .1 + k * 2); } ctx.stroke();
        ctx.fillStyle = css(mix([250, 250, 252], NIGHT, night * .6)); ctx.beginPath(); ctx.moveTo(bx, by + U * .05); ctx.lineTo(bx + bw, by + U * .05); ctx.lineTo(bx + bw * .9, by + U * .12); ctx.lineTo(bx + bw * .06, by + U * .12); ctx.fill();
        ctx.fillStyle = css(mix([30, 90, 190], NIGHT, night * .4)); ctx.fillRect(bx + bw * .15, by - U * .02, bw * .62, U * .075);
        ctx.fillStyle = night > .2 ? css([255, 226, 160], .95) : css(mix(mid, [255, 255, 255], .3)); for (let k = 0; k < 4; k++) ctx.fillRect(bx + bw * (.19 + k * .14), by, bw * .09, U * .035);
      }
      // night lights stretch down the water
      if (lampOn > .02) {
        ctx.globalCompositeOperation = 'screen';
        lamps.forEach((lx, i) => {
          const x = lx - px * 12; const a = lampOn * .35;
          for (let k = 0; k < 7; k++) { ctx.fillStyle = css([255, 210, 140], a * (1 - k / 7)); ctx.fillRect(x - 1.5 + Math.sin(t * 2 + k + i) * 1.5, RT + 3 + k * RH * .07, 3, RH * .045); }
        });
        ctx.globalCompositeOperation = 'source-over';
      }
      // the light of the moment on the whole scene, and a soft vignette
      g = ctx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .35, W / 2, H * .5, Math.max(W, H) * .8);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(4,6,24,${(.22 + night * .18).toFixed(2)})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // the timeline over the scene, and the notifications
      path.setAttribute('stroke-dashoffset', (total * (1 - d)).toFixed(2));
      const mins = Math.round(d * 24 * 60) % (24 * 60);
      clock.textContent = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      let c = -1; ats.forEach((a, i) => { if (d >= a - .03) c = i; });
      if (c !== cur) {
        cur = c;
        items.forEach((li, i) => { li.classList.toggle('is-lit', i <= c); li.classList.toggle('is-on', i === c); });
        ticks.forEach((tk, i) => tk.classList.toggle('is-lit', i <= c));
        cards.forEach((el, i) => { const k = c - i; el.dataset.depth = k < 0 ? 'next' : k > 2 ? 'gone' : String(k); });
      }
    };

    // ---------- run only while on screen ----------
    let on = false, raf = 0, ready = false;
    const loop = (now) => { raf = 0; if (!on) return; frame(now); if (!RM) raf = requestAnimationFrame(loop); };
    const kick = () => { if (on && !raf) raf = requestAnimationFrame(loop); };
    const progress = () => { const r = sky.getBoundingClientRect(), span = r.height - window.innerHeight; return clamp(-r.top / Math.max(1, span)); };
    const resize = () => { ready = build(); last = -1; if (ready) { if (RM) frame(performance.now()); else kick(); } };
    if (RM) { sky.classList.remove('is-scrub'); dT = d = .42; }
    else {
      sky.classList.add('is-scrub');
      window.addEventListener('scroll', () => { dT = .09 + progress() * .91; kick(); }, { passive: true });
      dome.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; const r = dome.getBoundingClientRect(); pxT = (e.clientX - r.left) / r.width - .5; pyT = (e.clientY - r.top) / r.height - .5; });
      dome.addEventListener('pointerleave', () => { pxT = pyT = 0; });
      dT = d = .09 + progress() * .91;
    }
    let rt = 0; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
    resize();
    onView(dome, (v) => { on = v && ready; if (on) { if (RM) frame(performance.now()); else kick(); } }, { threshold: 0 });
  })();

  // bordeaux · a live 3D map of where we work: the camera flies from Caudéran out to the whole of France over real
  // geography (the Garonne, the ring road, the towns, the coast); each zone lands on a project we did there
  (() => {
    const map = $('#bmap');
    if (!map) return;
    const box = $('.bmap-map', map), cv = $('#bmap-cv'), ctx = cv.getContext('2d');
    const tabs = $$('.bmap-zones button', map), line = $('#bmap-line');
    const hud = $('#bmap-hud'), bar = $('#bmap-bar'), kmT = $('#bmap-km'), card = $('#bmap-card');
    const TXT = ['<b>À Caudéran</b> : rendez-vous au studio, sur réservation, ou chez vous.', '<b>À Bordeaux</b> : de la Bastide aux Chartrons, je viens dans vos locaux en quelques minutes.',
      '<b>Dans la métropole</b> : Mérignac (Vendôme Immobilier), Pessac, Le Bouscat, Talence… sur place ou en visio.', '<b>En Gironde</b> : du Bassin d\'Arcachon à Saint-Émilion, rendez-vous sur place ou en visio.',
      '<b>Partout en France</b> : tout le projet en visio, avec la même méthode et les mêmes délais.'];
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 1.15;
    // lon/lat → km from the studio in Caudéran (good enough at this latitude)
    const O = [-0.607, 44.853];
    const P = (lon, lat) => [(lon - O[0]) * 78.9, (lat - O[1]) * 111.1];
    const PL = (a) => a.map(([x, y]) => P(x, y));
    const GARONNE = PL([[.48, 44.24], [.17, 44.35], [-.1, 44.45], [-.25, 44.55], [-.4, 44.63], [-.5, 44.72], [-.528, 44.795], [-.545, 44.815], [-.556, 44.828], [-.5627, 44.838], [-.5675, 44.845], [-.5665, 44.852], [-.5605, 44.858], [-.5526, 44.8606], [-.546, 44.866], [-.5395, 44.8766], [-.537, 44.9], [-.545, 44.95], [-.53, 45.04]]);
    const ESTUARY = PL([[-.53, 45.04], [-.65, 45.2], [-.75, 45.33], [-.9, 45.47], [-1.06, 45.57]]);
    const DORDOGNE = PL([[-.53, 45.04], [-.45, 44.98], [-.35, 44.93], [-.242, 44.915], [-.05, 44.86], [.2, 44.85], [.48, 44.85]]);
    const FRANCE = PL([[-1.79, 43.37], [-1.38, 43.03], [-.7, 42.88], [0, 42.69], [.7, 42.86], [1.45, 42.6], [2.2, 42.42], [3.17, 42.43], [3.05, 43.03], [3.4, 43.28], [4.1, 43.5], [4.85, 43.35], [5.35, 43.21], [6, 43.08], [6.65, 43.25], [7.5, 43.78], [7.65, 44.15], [6.9, 44.4], [7, 45.1], [6.8, 45.8], [6.15, 46.15], [6.1, 46.4], [7, 47.4], [7.55, 47.6], [7.6, 48.3], [8.2, 48.97], [7.4, 49.17], [6.36, 49.47], [5.8, 49.55], [4.85, 50.15], [4.2, 49.95], [2.55, 51.09], [1.6, 50.9], [1.55, 50.3], [1.4, 50.07], [.2, 49.7], [.1, 49.45], [-.3, 49.3], [-1.1, 49.36], [-1.26, 49.7], [-1.6, 49.65], [-1.58, 49.2], [-1.4, 48.65], [-2, 48.6], [-3, 48.8], [-4.1, 48.7], [-4.75, 48.4], [-4.4, 48], [-4.7, 47.95], [-3.5, 47.7], [-2.8, 47.5], [-2.2, 47.25], [-2.1, 46.9], [-1.8, 46.5], [-1.2, 46.15], [-1.25, 45.85], [-1.07, 45.58], [-1.15, 45.3], [-1.2, 45], [-1.24, 44.75], [-1.26, 44.62], [-1.3, 44.3], [-1.45, 43.8], [-1.5, 43.5]]);
    const CORSE = PL([[9.4, 43], [9.55, 42.6], [9.4, 41.4], [9.1, 41.4], [8.6, 41.9], [8.7, 42.6]]);
    const BASSIN = Array.from({ length: 28 }, (_, i) => { const a = i / 28 * Math.PI * 2, [x, y] = P(-1.11, 44.69); return [x + Math.cos(a) * 8.5 * (a > 2.6 && a < 3.7 ? 1.25 : 1), y + Math.sin(a) * 6.5]; });
    const ROCADE = Array.from({ length: 72 }, (_, i) => { const a = i / 72 * Math.PI * 2, [x, y] = P(-.578, 44.842); return [x + Math.cos(a) * 7.2 * (1 + .06 * Math.sin(a * 3)), y + Math.sin(a) * 6.3]; });
    const BRIDGES = [[-.5627, 44.838], [-.5526, 44.8606], [-.5395, 44.8766], [-.5555, 44.8287], [-.5452, 44.816], [-.528, 44.797]].map(([a, b]) => P(a, b));
    const RINGS = [1.6, 5.5, 13, 70];
    const inPoly = ([x, y], poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
    const segDist = ([x, y], poly) => { let m = 1e9; for (let i = 1; i < poly.length; i++) { const [ax, ay] = poly[i - 1], [bx, by] = poly[i], dx = bx - ax, dy = by - ay, k = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)); m = Math.min(m, Math.hypot(x - ax - k * dx, y - ay - k * dy)); } return m; };
    // the lights of the towns: a point cloud, denser where people live
    const CL = [[-.575, 44.842, 2.4, 900], [-.607, 44.853, .9, 170], [-.646, 44.838, 1.5, 260], [-.631, 44.806, 1.4, 220], [-.588, 44.808, 1, 160], [-.548, 44.805, 1, 130], [-.6, 44.866, .8, 120],
      [-.612, 44.883, .9, 80], [-.65, 44.885, 1.1, 100], [-.525, 44.862, 1.3, 200], [-.53, 44.835, 1, 100], [-.565, 44.78, 1.2, 120], [-.615, 44.772, 1.1, 90], [-.635, 44.91, .9, 60], [-.72, 44.9, 1.3, 70],
      [-.68, 44.87, .8, 50], [-1.16, 44.655, 1.6, 110], [-1.1, 44.745, .8, 40], [-.242, 44.915, 1.3, 80], [-.155, 44.894, .6, 25], [-.25, 44.553, .9, 40], [-.66, 45.128, .7, 30], [-.94, 45.31, .7, 25],
      [-1.08, 45, .7, 25], [-.32, 44.64, .5, 20], [-.49, 44.78, .5, 25], [2.35, 48.86, 14, 650], [4.84, 45.76, 8, 230], [5.37, 43.3, 8, 220], [1.44, 43.6, 7, 190], [-1.55, 47.22, 6, 150], [3.06, 50.63, 7, 160],
      [7.75, 48.58, 5, 100], [-1.68, 48.11, 5, 100], [7.26, 43.7, 5, 100], [3.88, 43.61, 5, 100], [.1, 49.49, 4, 60], [6.18, 48.69, 4, 60], [5.04, 47.32, 4, 60], [.69, 47.39, 4, 60], [-1.5, 43.49, 4, 50]];
    const pts = [];
    CL.forEach(([lon, lat, sg, n]) => {
      const [cx, cy] = P(lon, lat);
      for (let i = 0; i < n; i++) {
        let x, y, k = 0;
        do { x = cx + gauss() * sg; y = cy + gauss() * sg; k++; } while (k < 6 && (segDist([x, y], GARONNE) < .16 || !inPoly([x, y], FRANCE) || inPoly([x, y], BASSIN)));
        pts.push([x, y, .35 + rnd() * .65, rnd() * 140 + 20, rnd()]);
      }
    });
    for (let i = 0; i < 900; i++) { const x = -350 + rnd() * 1030, y = -320 + rnd() * 1020; if (inPoly([x, y], FRANCE)) pts.push([x, y, .15 + rnd() * .3, rnd() * 140 + 20, rnd()]); }
    const LABELS = [
      ['Bordeaux', -.574, 44.845, 7, 45, 1], ['Chartrons', -.571, 44.856, 30, 400], ['La Bastide', -.553, 44.843, 30, 400], ['Saint-Michel', -.565, 44.833, 38, 400], ['Le Bouscat', -.6, 44.868, 18, 400],
      ['Mérignac', -.646, 44.838, 9, 400], ['Pessac', -.631, 44.806, 9, 400], ['Talence', -.588, 44.808, 12, 400], ['Bègles', -.548, 44.805, 12, 400], ['Lormont', -.522, 44.877, 12, 400], ['Cenon', -.528, 44.857, 14, 400],
      ['Arcachon', -1.168, 44.658, 1.5, 9], ['Libourne', -.242, 44.915, 1.5, 9], ['Saint-Émilion', -.155, 44.894, 3.2, 9], ['Langon', -.25, 44.553, 1.5, 9], ['Blaye', -.66, 45.128, 1.5, 9], ['Lacanau', -1.08, 45, 1.8, 9],
      ['Paris', 2.35, 48.86, 0, 1.4, 1], ['Lyon', 4.84, 45.76, 0, 1.4], ['Marseille', 5.37, 43.3, 0, 1.4], ['Toulouse', 1.44, 43.6, 0, 1.4], ['Nantes', -1.55, 47.22, 0, 1.4], ['Lille', 3.06, 50.63, 0, 1.4], ['Strasbourg', 7.75, 48.58, 0, 1.4], ['Bordeaux', -.574, 44.845, 0, 1.4, 1],
    ].map(([n, lon, lat, a, b, big]) => [n, P(lon, lat), a, b, big]);
    const FR_ARCS = [[2.35, 48.86], [4.84, 45.76], [5.37, 43.3], [1.44, 43.6], [-1.55, 47.22], [3.06, 50.63], [7.75, 48.58], [-1.68, 48.11]].map(([a, b]) => P(a, b));
    // what each zone lands on
    const SPOTS = {
      studio: { at: [0, 0], k: 'Le studio', b: 'Aivelo · Caudéran', s: 'Rendez-vous sur réservation' },
      carnot: { at: P(-.578, 44.84), k: 'Étude de cas', b: 'L\'Avenue Carnot', s: 'Agence immobilière · Bordeaux & Bassin' },
      vendome: { at: P(-.646, 44.838), k: 'Client', b: 'Vendôme Immobilier', s: 'Agence immobilière · Mérignac' },
      opsform: { at: P(-.49, 44.78), k: 'Étude de cas', b: 'OpsForm', s: 'Plateforme de formation · Aérocampus' },
      bassin: { at: P(-1.16, 44.655), k: '', b: '', s: '' },
      france: { at: [0, 0], k: 'Partout en France', b: 'Tout le projet en visio', s: 'Même méthode, mêmes délais' },
    };
    const BEAMS = ['carnot', 'vendome', 'opsform', 'bassin'];
    const ZONES = [
      { c: [.6, -.5], s: 64, p: .95, spot: 'studio' }, { c: [1.6, -1], s: 27, p: .98, spot: 'carnot' }, { c: [.4, -2.2], s: 12, p: 1, spot: 'vendome' },
      { c: [-21, -9], s: 2.3, p: .95, spot: 'opsform' }, { c: [150, 170], s: .34, p: .8, spot: 'france' },
    ];

    let W = 0, H = 0, DPR = 1, K = 1, FONT = 'system-ui, sans-serif';
    const cam = { x: 150, y: 170, ls: Math.log(.34), p: .8, yaw: 0 };
    let fly = null, cur = 0, auto = !RM, visible = false, t0 = performance.now(), yawT = 0, tiltT = 0, intro = RM ? 1 : 0, introAt = 0;
    const size = () => {
      const r = box.getBoundingClientRect(); W = r.width; H = r.height; if (!W || !H) return;
      DPR = Math.min(window.devicePixelRatio || 1, 2); cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      K = W / 480; FONT = getComputedStyle(map).fontFamily;
    };
    const go = (z, dur) => {
      const Z = ZONES[z];
      fly = { a: { x: cam.x, y: cam.y, ls: cam.ls, p: cam.p }, b: { x: Z.c[0], y: Z.c[1], ls: Math.log(Z.s), p: Z.p }, t: performance.now(), d: RM ? 0 : dur };
    };
    let F = 700, sP = 0, cP = 1, sY = 0, cY = 1, S = 1;
    const proj = (x, y, z = 0, soft) => {
      const dx = x - cam.x, dy = y - cam.y;
      const rx = dx * cY - dy * sY, ry = dx * sY + dy * cY;
      const X = rx * S, Y = ry * S;
      let den = F + Y * sP; if (soft) den = Math.max(den, F * .3); else if (den < F * .2) return null;
      const f = F / den;
      return [W / 2 + X * f, H * .58 - (Y * cP + z * K) * f, f];
    };
    const pathOf = (poly, close, soft) => {
      ctx.beginPath(); let first = true;
      for (const [x, y] of poly) { const q = proj(x, y, 0, soft); if (!q) { first = true; continue; } if (first) { ctx.moveTo(q[0], q[1]); first = false; } else ctx.lineTo(q[0], q[1]); }
      if (close) ctx.closePath();
    };
    const circle = (cx, cy, r, n = 64) => Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos(i / n * Math.PI * 2) * r, cy + Math.sin(i / n * Math.PI * 2) * r]);
    const NICE = [.1, .2, .5, 1, 2, 5, 10, 20, 50, 100, 200, 500];
    let hudAt = 0, cw = 200, ch = 60, prevNow = 0;
    const BUCKETS = 10;

    const draw = (now) => {
      const t = (now - t0) / 1000;
      if (fly) {
        const u = fly.d ? clamp((now - fly.t) / fly.d) : 1, e = ease(u);
        const hop = Math.abs(fly.a.ls - fly.b.ls) < 2 ? Math.sin(Math.PI * e) * .35 : 0;
        cam.ls = lerp(fly.a.ls, fly.b.ls, e) - hop;
        const w = fly.b.ls < fly.a.ls ? 1 - Math.pow(1 - e, 2.2) : Math.pow(e, .7);
        cam.x = lerp(fly.a.x, fly.b.x, w); cam.y = lerp(fly.a.y, fly.b.y, w); cam.p = lerp(fly.a.p, fly.b.p, e);
        if (u >= 1) fly = null;
      }
      const dt = clamp((now - (prevNow || now)) / 16.67, 0, 4); prevNow = now;
      cam.yaw += (yawT - cam.yaw) * (1 - Math.pow(.94, dt));
      const tilt = cam.p + tiltT * .12;
      S = Math.exp(cam.ls) * K; F = 720 * K; sP = Math.sin(tilt); cP = Math.cos(tilt); sY = Math.sin(cam.yaw); cY = Math.cos(cam.yaw);
      const s = Math.exp(cam.ls);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#040716'); g.addColorStop(.5, '#08102E'); g.addColorStop(1, '#0B1740');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      g = ctx.createRadialGradient(W * .5, H * .62, 0, W * .5, H * .62, W * .7); g.addColorStop(0, 'rgba(60,100,255,.22)'); g.addColorStop(1, 'rgba(60,100,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // ground grid, spaced for the zoom
      const gs = NICE.find((n) => n * s > 34 * K) || 500, range = Math.ceil((W / s) * 1.6 / gs) * gs;
      ctx.strokeStyle = 'rgba(120,160,255,.09)'; ctx.lineWidth = 1; ctx.beginPath();
      const gx0 = Math.floor((cam.x - range) / gs) * gs, gy0 = Math.floor((cam.y - range * .7) / gs) * gs;
      for (let x = gx0; x <= cam.x + range; x += gs) { const a = proj(x, cam.y - range * .7, 0, 1), b = proj(x, cam.y + range * 1.6, 0, 1); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      for (let y = gy0; y <= cam.y + range * 1.6; y += gs) { const a = proj(cam.x - range, y, 0, 1), b = proj(cam.x + range, y, 0, 1); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      ctx.stroke();
      // the land, the coast, the water
      const land = clamp((7 - s) / 4);
      if (land > 0) {
        ctx.globalAlpha = land;
        ctx.fillStyle = 'rgba(70,110,255,.07)'; ctx.strokeStyle = 'rgba(150,185,255,.55)'; ctx.lineWidth = 1.2;
        pathOf(FRANCE, true, true); ctx.fill(); ctx.stroke(); pathOf(CORSE, true, true); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#07102E'; pathOf(BASSIN, true, true); ctx.fill(); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      const water = (poly, wKm, a) => {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = `rgba(80,140,255,${(.18 * a).toFixed(3)})`; ctx.lineWidth = clamp(wKm * s * 2.4, 4, 16); pathOf(poly, false, true); ctx.stroke();
        ctx.strokeStyle = `rgba(120,175,255,${(.75 * a).toFixed(3)})`; ctx.lineWidth = clamp(wKm * s, 1.4, 5); ctx.stroke();
        ctx.setLineDash([2, 14]); ctx.lineDashOffset = -t * 18; ctx.strokeStyle = `rgba(220,235,255,${(.7 * a).toFixed(3)})`; ctx.lineWidth = clamp(wKm * s * .35, .8, 1.8); ctx.stroke(); ctx.setLineDash([]);
      };
      water(GARONNE, .25, 1); water(DORDOGNE, .25, clamp((7 - s) / 3)); water(ESTUARY, 3, clamp((7 - s) / 3));
      // the ring road, with traffic
      const rA = clamp((s - 3) / 5) * clamp((90 - s) / 30);
      if (rA > 0) {
        ctx.strokeStyle = `rgba(255,190,110,${(.28 * rA).toFixed(3)})`; ctx.lineWidth = 1.2; ctx.setLineDash([5, 5]); pathOf(ROCADE, true); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255,214,150,${(.9 * rA).toFixed(3)})`;
        for (let i = 0; i < 28; i++) { const u = ((i / 28 + t * (i % 2 ? .012 : -.009)) % 1 + 1) % 1, k = u * 72, a = ROCADE[Math.floor(k) % 72], b = ROCADE[(Math.floor(k) + 1) % 72], f = k % 1; const q = proj(lerp(a[0], b[0], f), lerp(a[1], b[1], f)); if (q) ctx.fillRect(q[0] - 1, q[1] - 1, 2, 2); }
      }
      // zones around the studio: rings, a ripple, a radar sweep
      const zc = Math.min(cur, 3), ringA = clamp((s - .9) / 1.5);
      if (ringA > 0) {
        RINGS.forEach((r, i) => {
          const on = i <= zc, isCur = i === cur;
          pathOf(circle(0, 0, r), true, true);
          if (isCur) { ctx.fillStyle = `rgba(79,126,247,${(.1 * ringA).toFixed(3)})`; ctx.fill(); }
          ctx.strokeStyle = `rgba(${isCur ? '140,175,255' : '120,150,255'},${((isCur ? .95 : on ? .4 : .16) * ringA).toFixed(3)})`; ctx.lineWidth = isCur ? 1.6 : 1;
          if (!isCur) ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]);
        });
        if (!RM && cur < 4) {
          const R = RINGS[cur], u = (t % 2.6) / 2.6;
          pathOf(circle(0, 0, R * ease(u)), true, true); ctx.strokeStyle = `rgba(160,190,255,${((1 - u) * .8 * ringA).toFixed(3)})`; ctx.lineWidth = 2; ctx.stroke();
          const a0 = t * 1.1;
          for (let k = 0; k < 14; k++) {
            const a = a0 - k * .045, b = a - .045, q0 = proj(0, 0, 0, 1), q1 = proj(Math.cos(a) * R, Math.sin(a) * R, 0, 1), q2 = proj(Math.cos(b) * R, Math.sin(b) * R, 0, 1);
            ctx.fillStyle = `rgba(110,150,255,${((1 - k / 14) * .16 * ringA).toFixed(3)})`; ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.fill();
          }
        }
      }
      // the lights of the towns, raining down into place on arrival
      ctx.globalCompositeOperation = 'lighter';
      const ie = ease(intro);
      const bins = Array.from({ length: BUCKETS }, () => []);
      for (const [x, y, a, h, r] of pts) {
        const k = clamp(ie * 1.6 - r * .6), q = proj(x, y, (1 - k) * h);
        if (!q || q[0] < -4 || q[0] > W + 4 || q[1] < -4 || q[1] > H + 4) continue;
        const al = a * k * (.55 + .45 * Math.sin(t * 1.3 + r * 40));
        if (al > .02) bins[Math.min(BUCKETS - 1, Math.floor(al * BUCKETS))].push(q[0], q[1], clamp(q[2] * (s > 20 ? 1.5 : 1.1), .8, 2.2));
      }
      bins.forEach((b, i) => {
        if (!b.length) return;
        ctx.fillStyle = `rgba(150,190,255,${((i + .5) / BUCKETS).toFixed(2)})`; ctx.beginPath();
        for (let j = 0; j < b.length; j += 3) ctx.rect(b[j] - b[j + 2] / 2, b[j + 1] - b[j + 2] / 2, b[j + 2], b[j + 2]);
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
      if (s > 16) { // the bridges over the Garonne
        ctx.strokeStyle = `rgba(230,240,255,${clamp((s - 16) / 10).toFixed(3)})`; ctx.lineWidth = 2;
        BRIDGES.forEach(([x, y]) => { const a = proj(x - .18, y + .03), b = proj(x + .18, y - .03); if (a && b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); } });
      }
      // arcs from the studio: to our projects, or to the whole country
      const arc = (bx, by, hgt, a, phase) => {
        const n = 30, P0 = []; let ok = true;
        for (let i = 0; i <= n; i++) { const u = i / n, q = proj(bx * u, by * u, Math.sin(Math.PI * u) * hgt); if (!q) { ok = false; break; } P0.push(q); }
        if (!ok) return;
        ctx.strokeStyle = `rgba(160,140,255,${(.5 * a).toFixed(3)})`; ctx.lineWidth = 1.2; ctx.beginPath(); P0.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke();
        if (RM) return;
        const u = (t * .55 + phase) % 1, i = Math.floor(u * n), q = P0[i];
        const gr = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], 7); gr.addColorStop(0, `rgba(235,225,255,${a.toFixed(3)})`); gr.addColorStop(1, 'rgba(160,140,255,0)');
        ctx.fillStyle = gr; ctx.fillRect(q[0] - 7, q[1] - 7, 14, 14);
      };
      const frA = clamp((1.2 - s) / .6);
      if (frA > 0) FR_ARCS.forEach(([x, y], i) => arc(x, y, Math.hypot(x, y) * s * .3 / K, frA, i * .13));
      const beamA = clamp((s - .8) / 1.2);
      if (beamA > 0) BEAMS.forEach((k, i) => { const [x, y] = SPOTS[k].at; arc(x, y, clamp(Math.hypot(x, y) * s * .35 / K, 14, 90), beamA * (k === ZONES[cur].spot ? 1 : .55), i * .27); });
      // beams: the studio, and the places we worked
      const beam = (x, y, hgt, col, a, big) => {
        const q = proj(x, y), top = proj(x, y, hgt);
        if (!q || !top) return null;
        const lg = ctx.createLinearGradient(q[0], q[1], top[0], top[1]); lg.addColorStop(0, `rgba(${col},${(.9 * a).toFixed(3)})`); lg.addColorStop(1, `rgba(${col},0)`);
        ctx.strokeStyle = lg; ctx.lineWidth = big ? 3 : 2; ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(top[0], top[1]); ctx.stroke();
        const rg = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], big ? 22 : 12); rg.addColorStop(0, `rgba(${col},${(.55 * a).toFixed(3)})`); rg.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = rg; ctx.beginPath(); ctx.ellipse(q[0], q[1], big ? 22 : 12, (big ? 22 : 12) * cP, 0, 0, 7); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(q[0], q[1], big ? 3.5 : 2.5, 0, 7); ctx.fill();
        if (!RM) { const u = (t % 1.8) / 1.8; ctx.strokeStyle = `rgba(${col},${((1 - u) * a).toFixed(3)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(q[0], q[1], 4 + u * 22, (4 + u * 22) * cP, 0, 0, 7); ctx.stroke(); }
        return top;
      };
      const tops = {};
      if (beamA > 0) BEAMS.forEach((k) => { const [x, y] = SPOTS[k].at; tops[k] = beam(x, y, k === ZONES[cur].spot ? 46 : 26, '170,145,255', beamA * (k === 'bassin' ? clamp((12 - s) / 4) : 1)); });
      tops.studio = beam(0, 0, 64, '120,170,255', 1, true); tops.france = tops.studio;
      // place names, each at the zooms where it reads
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '1.2px';
      LABELS.forEach(([n, [x, y], a, b, big]) => {
        const ls = Math.log(s), al = clamp((ls - Math.log(Math.max(a, .01))) / .35) * clamp((Math.log(b) - ls) / .35);
        if (al <= 0) return;
        const q = proj(x, y); if (!q) return;
        ctx.font = `${big ? 700 : 600} ${big ? 11 : 9.5}px ${FONT}`;
        ctx.fillStyle = `rgba(${big ? '235,240,255' : '170,190,240'},${(al * .9).toFixed(3)})`; ctx.fillText(n.toUpperCase(), q[0], q[1] - 6);
      });
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      // edges fade into the night
      g = ctx.createLinearGradient(0, 0, 0, H * .3); g.addColorStop(0, 'rgba(4,7,22,.95)'); g.addColorStop(1, 'rgba(4,7,22,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * .3);
      g = ctx.createRadialGradient(W / 2, H * .55, Math.min(W, H) * .45, W / 2, H * .55, Math.max(W, H) * .75); g.addColorStop(0, 'rgba(4,7,22,0)'); g.addColorStop(1, 'rgba(4,7,22,.6)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // the card follows its place
      const tp = tops[ZONES[cur].spot];
      if (tp) { const right = tp[0] < W * .58; card.style.transform = `translate(${Math.round(clamp(right ? tp[0] + 12 : tp[0] - 12 - cw, 8, W - cw - 8))}px, ${Math.round(clamp(tp[1] - 18, 46, H - ch - 40))}px)`; }
      // the HUD: coordinates and scale
      if (now - hudAt > 90) {
        hudAt = now;
        const lat = O[1] + cam.y / 111.1, lon = O[0] + cam.x / 78.9;
        hud.textContent = `${Math.abs(lat).toFixed(3).replace('.', ',')}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lon).toFixed(3).replace('.', ',')}° ${lon >= 0 ? 'E' : 'O'}`;
        const kmv = NICE.find((n) => n * S > 46 * K) || 500;
        bar.style.width = `${Math.round(kmv * S)}px`; kmT.textContent = `${String(kmv).replace('.', ',')} km`;
      }
    };
    const setCard = (spot) => {
      const sp = SPOTS[spot];
      card.classList.remove('is-in'); void card.offsetWidth;
      $('small', card).textContent = sp.k; $('b', card).textContent = sp.b; $('span', card).textContent = sp.s;
      card.classList.add('is-in'); cw = card.offsetWidth; ch = card.offsetHeight;
    };
    const show = (i, user) => {
      if (user) auto = false;
      line.setAttribute('aria-live', user ? 'polite' : 'off');
      cur = i;
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      map.classList.toggle('is-france', i === 4);
      line.innerHTML = TXT[i]; line.classList.remove('is-swap'); void line.offsetWidth; line.classList.add('is-swap');
      go(i, 1700); setCard(ZONES[i].spot);
      if (RM) requestAnimationFrame(draw);
    };
    tabset(tabs, show);
    box.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; const r = box.getBoundingClientRect(); yawT = ((e.clientX - r.left) / r.width - .5) * .3; tiltT = (e.clientY - r.top) / r.height - .5; });
    box.addEventListener('pointerleave', () => { yawT = 0; tiltT = 0; });
    map.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') auto = false; });
    map.addEventListener('focusin', () => { auto = false; });
    map.addEventListener('pointerdown', () => { auto = false; });
    size();
    if ('ResizeObserver' in window) new ResizeObserver(() => { size(); if (RM) draw(performance.now()); }).observe(box);
    // the first time it shows: fly in from the whole of France down to the studio while the lights rain into place
    cur = 0; tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === 0)); t.tabIndex = k === 0 ? 0 : -1; });
    setCard('studio');
    if (RM) { const Z = ZONES[0]; cam.x = Z.c[0]; cam.y = Z.c[1]; cam.ls = Math.log(Z.s); cam.p = Z.p; draw(performance.now()); }
    let raf = 0, last = performance.now(), started = false, drawn = 0, cycles = 0;
    const loop = (now) => {
      raf = 0; if (!visible || document.hidden) return;
      if (!started) { started = true; introAt = now; go(0, 2600); }
      intro = clamp((now - introAt) / 2200);
      if (fly || intro < 1 || Math.abs(yawT - cam.yaw) > .002 || now - drawn > 32) { drawn = now; draw(now); }
      if (auto && now - last > (cycles ? 6000 : 8000) && !fly) { last = now; cycles++; show((cur + 1) % tabs.length); }
      raf = requestAnimationFrame(loop);
    };
    onView(box, (v) => { visible = v; if (v && !RM && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }, { threshold: .1 });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !RM && !raf) raf = requestAnimationFrame(loop); });
  })();

  // bordeaux · method: one pinned scene, the scroll builds the site — sticky notes fly in, fold into a wireframe,
  // the design paints over it, then the site goes live and shows up on Google
  (() => {
    const mk = $('#build');
    if (!mk) return;
    const canvas = $('#mk-canvas', mk), notes = $$('.mk-note', mk), steps = $$('.mk-step', mk), bars = $$('.mk-bars b', mk);
    const num = $('#mk-num'), host = $('.mk-host', mk), query = $('#mk-query');
    const lerp = (a, b, t) => a + (b - a) * t, clamp = (v) => Math.max(0, Math.min(1, v));
    const ease = (t) => 1 - Math.pow(1 - t, 3), inout = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const mix = (c1, c2, t) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)));
    const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    // scattered on the desk (x, y, w, h in % of the canvas, rotation) → the block each note becomes
    const N = [
      { from: [5, 9, 30, 19, -6], to: [6, 27, 26, 3.6], pastel: [255, 242, 184], ink: [59, 47, 18], fin: [201, 162, 107] },
      { from: [37, 6, 30, 19, 4], to: [52, 7, 26, 3.2], pastel: [255, 224, 236], ink: [74, 24, 48], fin: [214, 219, 232] },
      { from: [68, 12, 27, 19, -3], to: [6, 35, 44, 15], pastel: [221, 243, 230], ink: [18, 53, 42], fin: [11, 13, 23] },
      { from: [9, 45, 28, 18, 5], to: [5, 6, 15, 5], pastel: [227, 234, 255], ink: [27, 42, 107], fin: [27, 42, 107] },
      { from: [40, 50, 30, 19, -4], to: [6, 59, 22, 8], pastel: [255, 236, 214], ink: [90, 50, 10], fin: [46, 91, 217] },
      { from: [70, 46, 26, 19, 3], to: [82, 5, 13, 6.5], pastel: [236, 228, 255], ink: [55, 30, 110], fin: [46, 91, 217] },
    ];
    const GRAY = [229, 233, 243];
    notes[4].classList.add('is-btn');
    const words = 'agence immobilière caudéran';
    let lastStep = -1;
    const render = (p) => {
      const k = p * 4, step = Math.min(3, Math.floor(k));
      const a = clamp(k / 1), b = clamp(k - 1), c = clamp(k - 2), d = clamp(k - 3);
      notes.forEach((el, i) => {
        const n = N[i];
        const appear = ease(clamp(a * 1.6 - i * .12));                 // phase A: each note drops in
        const fold = inout(clamp(b * 1.25 - i * .04));                 // phase B: notes fold into the wireframe
        const x = lerp(n.from[0], n.to[0], fold), y = lerp(n.from[1], n.to[1], fold);
        const w = lerp(n.from[2], n.to[2], fold), h = lerp(n.from[3], n.to[3], fold);
        const rot = lerp(n.from[4], 0, fold) + (1 - appear) * 14;
        const lift = (1 - appear) * -40;
        const paint = clamp(c * 1.8 - (n.to[0] / 100));               // phase C: colour follows the light sweep
        const bg = paint > 0 ? mix(GRAY, n.fin, paint) : mix(n.pastel, GRAY, fold);
        el.style.left = x + '%'; el.style.top = y + '%'; el.style.width = w + '%'; el.style.height = h + '%';
        el.style.transform = `translateY(${lift}px) rotate(${rot}deg) scale(${lerp(1.15, 1, appear)})`;
        el.style.opacity = appear;
        el.style.background = rgb(bg);
        el.style.color = rgb(n.ink, Math.max(0, 1 - fold * 1.6));
        el.style.borderRadius = lerp(4, i === 4 || i === 5 ? 100 : 6, fold) + 'px';
        el.style.boxShadow = `0 ${lerp(10, 0, fold)}px ${lerp(22, 0, fold)}px -12px rgba(80,60,0,${.45 * (1 - fold)})`;
        // the title bars give way to the real text once painted
        if (i === 0 || i === 2) el.style.opacity = appear * (1 - clamp((c - .55) * 3));
      });
      mk.style.setProperty('--imgo', clamp(b * 2 - .6).toFixed(3));
      mk.style.setProperty('--imgc', clamp(c * 2 - .7).toFixed(3));
      mk.style.setProperty('--paint', inout(clamp(c * 1.25)).toFixed(3));
      mk.style.setProperty('--txt', clamp((c - .55) * 3).toFixed(3));
      mk.style.setProperty('--btn', clamp((c - .6) * 3).toFixed(3));
      mk.style.setProperty('--lock', clamp(d * 4).toFixed(3));
      mk.style.setProperty('--live', clamp(d * 4 - .4).toFixed(3));
      mk.style.setProperty('--serp', ease(clamp(d * 2.2 - .5)).toFixed(3));
      query.textContent = words.slice(0, Math.round(words.length * clamp(d * 2.2 - .7)));
      host.textContent = d > 0 ? 'votre-site.fr' : 'maquette.aivelo.fr';
      bars.forEach((bar, i) => bar.style.setProperty('--f', clamp(k - i).toFixed(3)));
      if (step !== lastStep) {
        lastStep = step;
        steps.forEach((s, i) => s.classList.toggle('is-on', i === step));
        num.textContent = String(step + 1).padStart(2, '0');
      }
    };
    if (RM) { mk.classList.remove('is-scrub'); render(1); return; }
    mk.classList.add('is-scrub');
    let raf = 0;
    const tick = () => { raf = 0; const r = mk.getBoundingClientRect(); render(clamp(-r.top / Math.max(1, r.height - window.innerHeight))); };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  })();

  // maintenance · report figures count up once
  (() => {
    const rep = $('#report');
    if (!rep) return;
    const nums = $$('[data-num]', rep);
    // formatted by hand: some browsers ship without French number formatting
    const out = (el, v) => { const [i, d] = Number(v).toFixed(+(el.dataset.dec || 0)).split('.'); el.textContent = i.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f') + (d ? ',' + d : ''); };
    if (RM) { nums.forEach((el) => out(el, el.dataset.num)); return; }
    onceInView(rep, () => nums.forEach((el) => {
      const to = parseFloat(el.dataset.num), t0 = performance.now(), D = 1600;
      const step = (now) => { const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3); out(el, to * e); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }));
  })();

  // crm · a lead arrives, gets read, scored and handled; three scenarios loop while on screen
  (() => {
    const box = $('#lead');
    if (!box) return;
    const S = [
      { av: 'CL', name: 'Claire L.', src: 'via votre site · à l\'instant', msg: 'Bonjour, je cherche un T3 aux Chartrons, budget 420 k€, pour un achat d\'ici 3 mois. Je suis disponible samedi matin.',
        chips: [['ok', 'Projet', 'achat T3'], ['ok', 'Secteur', 'Chartrons'], ['ok', 'Budget', '420 k€'], ['ok', 'Délai', '3 mois'], ['q', 'Financement', 'à confirmer']],
        score: 86, verdict: 'Lead chaud · à rappeler aujourd\'hui', actions: ['3 biens correspondants trouvés', 'Visite proposée samedi à 10 h 30', 'Relance J+1 programmée'] },
      { av: 'MB', name: 'Marc B.', src: 'via « Estimer mon bien » · à l\'instant', msg: 'Bonjour, j\'envisage de vendre ma maison au Bouscat d\'ici la fin de l\'année. Pouvez-vous l\'estimer ?',
        chips: [['ok', 'Projet', 'vente maison'], ['ok', 'Secteur', 'Le Bouscat'], ['ok', 'Délai', 'fin d\'année'], ['q', 'Surface', 'à préciser']],
        score: 74, verdict: 'Vendeur · estimation à proposer', actions: ['Fiche vendeur créée', 'Créneau d\'estimation proposé', 'Rappel J+1 si pas de réponse'] },
      { av: 'SN', name: 'Sarah N.', src: 'via votre site · à l\'instant', msg: 'Bonjour, je regarde un peu le marché à Mérignac, pas de projet précis pour l\'instant.',
        chips: [['ok', 'Secteur', 'Mérignac'], ['q', 'Budget', 'non précisé'], ['q', 'Délai', 'non précisé']],
        score: 38, verdict: 'Lead froid · à faire mûrir', actions: ['Alerte nouveaux biens activée', 'Relance J+14 programmée'] },
    ];
    const $id = (id) => document.getElementById(id);
    const msg = $id('lead-msg'), chips = $id('lead-chips'), ring = $id('lead-ring'), num = $id('lead-num'), verdict = $id('lead-verdict'), acts = $id('lead-actions'), status = $id('lead-status');
    const C = 314.16;
    let visible = false, playing = false;
    const color = (v) => (v >= 70 ? '#12A26B' : v >= 50 ? '#E39410' : '#7A8BB5');
    const chip = ([k, a, b]) => { const li = document.createElement('li'); li.className = k === 'ok' ? 'is-ok' : 'is-q'; li.innerHTML = `<b></b> `; li.firstChild.textContent = a + ' :'; li.append(b); return li; };
    const paint = (sc, final) => {
      $id('lead-av').textContent = sc.av; $id('lead-name').textContent = sc.name; $id('lead-src').textContent = sc.src;
      if (final) {
        msg.textContent = sc.msg; chips.replaceChildren(...sc.chips.map(chip));
        ring.style.stroke = color(sc.score); ring.style.strokeDashoffset = C * (1 - sc.score / 100); num.textContent = sc.score;
        verdict.textContent = sc.verdict; acts.replaceChildren(...sc.actions.map((t) => Object.assign(document.createElement('li'), { textContent: t })));
        status.textContent = 'Agent Qualification · lead qualifié en 28 s'; box.classList.add('is-done');
      }
    };
    const until = async () => { while (!visible || document.hidden) await wait(400); };
    const play = async () => {
      if (playing) return; playing = true;
      for (let n = 0; ; n = (n + 1) % S.length) {
        const sc = S[n];
        await until();
        box.classList.remove('is-done'); paint(sc);
        msg.textContent = ''; chips.replaceChildren(); acts.replaceChildren(); num.textContent = '0'; verdict.textContent = 'Score du lead';
        ring.style.strokeDashoffset = C; status.textContent = 'Nouveau message reçu';
        msg.classList.add('is-typing');
        for (let i = 1; i <= sc.msg.length; i++) { msg.textContent = sc.msg.slice(0, i); await wait(22); }
        msg.classList.remove('is-typing');
        status.textContent = 'Agent Qualification · analyse en cours'; await wait(500);
        for (const c of sc.chips) { chips.append(chip(c)); await wait(380); }
        ring.style.stroke = color(sc.score); ring.style.strokeDashoffset = C * (1 - sc.score / 100);
        const t0 = performance.now();
        await new Promise((res) => { const f = (now) => { const k = Math.min(1, (now - t0) / 1300); num.textContent = Math.round(sc.score * (1 - Math.pow(1 - k, 3))); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
        verdict.textContent = sc.verdict;
        for (const t of sc.actions) { await wait(520); acts.append(Object.assign(document.createElement('li'), { textContent: t })); }
        status.textContent = 'Agent Qualification · lead qualifié en 28 s'; box.classList.add('is-done');
        await wait(4200);
      }
    };
    if (RM) { paint(S[0], true); return; }
    onView(box, (v) => { visible = v; if (v) play(); });
  })();

  // crm · six agents: pick one to watch it work; rotates on its own until touched
  (() => {
    const ui = $('#agents-ui');
    if (!ui) return;
    const tabs = $$('.agent', ui), panels = $$('.ag-panel', ui);
    let cur = 0, auto = !RM, visible = false, typing = 0;
    const type = (el) => {
      const txt = el.dataset.text, id = ++typing;
      if (RM) { el.textContent = txt; return; }
      el.textContent = ''; el.classList.add('is-typing');
      let i = 0;
      const step = () => { if (id !== typing) return; el.textContent = txt.slice(0, ++i); if (i < txt.length) setTimeout(step, 18); else el.classList.remove('is-typing'); };
      step();
    };
    const show = (i, user) => {
      if (user) auto = false;
      cur = i; select(tabs, panels, i);
      const t = $('.ag-typed', panels[i]); if (t) type(t);
    };
    tabset(tabs, show);
    let hold = false;
    ui.addEventListener('pointerenter', () => { hold = true; });
    ui.addEventListener('pointerleave', () => { hold = false; });
    ui.addEventListener('focusin', () => { hold = true; });
    ui.addEventListener('focusout', () => { hold = false; });
    onView(ui, (v) => { visible = v; });
    setInterval(() => { if (auto && visible && !hold && !document.hidden) show((cur + 1) % tabs.length); }, 6500);
  })();
  // maintenance · an incident, replayed once it scrolls into view (and on demand)
  (() => {
    const inc = $('#inc');
    if (!inc) return;
    const items = $$('.inc-log li', inc), label = $('#inc-label');
    const LABEL = ['Incident · le site ne répond plus', 'Diagnostic en cours', 'Correction déployée · surveillance renforcée', 'Tous les services fonctionnent'];
    let run = 0;
    const set = (k) => {
      inc.dataset.step = k;
      items.forEach((li, i) => li.classList.toggle('is-done', i <= k));
      label.textContent = k < 0 ? 'Tous les services fonctionnent' : LABEL[k];
    };
    const play = async () => {
      const id = ++run; set(-1);
      for (const [k, ms] of [[0, 500], [1, 1500], [2, 1500], [3, 1600]]) { await wait(ms); if (id !== run) return; set(k); }
    };
    if (RM) { inc.classList.add('is-static'); set(3); }
    else onceInView(inc, play, { threshold: .4 });
    $('#inc-replay').addEventListener('click', () => (RM ? set(3) : play()));
  })();

  // formation · from files to learners: four states that play in turn, any tab takes over
  (() => {
    const pipe = $('#pipe');
    if (!pipe) return;
    const tabs = $$('.ps', pipe), panels = $$('.pt', pipe);
    const DUR = 5200;
    let cur = 0, auto = !RM, visible = false, hold = false, timer = 0;
    pipe.style.setProperty('--dur', DUR + 'ms');
    const show = (i, user) => {
      if (user) { auto = false; pipe.classList.add('is-paused'); }
      cur = i; pipe.dataset.step = i;
      select(tabs, panels, i);
      tabs.forEach((t, k) => t.classList.toggle('is-done', k < i));
      clearTimeout(timer);
      if (auto) timer = setTimeout(next, DUR);
    };
    const next = () => { if (!visible || hold || document.hidden) { timer = setTimeout(next, 600); return; } show((cur + 1) % tabs.length); };
    tabset(tabs, show);
    pipe.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hold = true; });
    pipe.addEventListener('pointerleave', () => { hold = false; });
    if (RM) { pipe.classList.add('is-paused'); show(3); return; }
    onView(pipe, (v) => { const was = visible; visible = v; if (v && !was && auto) show(cur); }, { threshold: .35 });
  })();

  // crm · one lead end to end: typed, sent, created, scored, alerted — loops while on screen
  (() => {
    const fl = $('#flow');
    if (!fl) return;
    const nodes = $$('.fl-node', fl), typed = $$('[data-type]', fl);
    let visible = false, playing = false;
    const set = (k) => nodes.forEach((n, i) => { n.classList.toggle('is-on', i === k); n.classList.toggle('is-done', i < k); });
    const fill = () => typed.forEach((b) => { b.textContent = b.dataset.type; });
    if (RM) { fl.classList.add('is-static', 'sent'); fill(); set(4); return; }
    const until = async () => { while (!visible || document.hidden) await wait(400); };
    const play = async () => {
      if (playing) return; playing = true;
      for (;;) {
        await until();
        fl.classList.remove('sent'); typed.forEach((b) => { b.textContent = ''; }); set(0);
        for (const b of typed) { const t = b.dataset.type; for (let i = 1; i <= t.length; i++) { b.textContent = t.slice(0, i); await wait(38); } await wait(200); }
        await wait(300); fl.classList.add('sent'); await wait(700);
        for (const k of [1, 2, 3]) { set(k); await wait(1500); }
        set(4); await wait(3200);
      }
    };
    onView(fl, (v) => { visible = v; if (v) play(); }, { threshold: .3 });
  })();
  // case studies hub · the project you point at opens up and its site scrolls by; on touch screens, the one in view
  (() => {
    const pick = $('#ec-pick');
    if (!pick) return;
    const cards = $$('.ec-card', pick);
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let inView = false, cur = 0;
    const set = (i) => { cur = i; cards.forEach((c, k) => { c.classList.toggle('is-on', k === i); c.classList.toggle('is-play', !RM && inView && k === i); }); };
    if (fine) {
      cards.forEach((c, i) => { c.addEventListener('pointerenter', () => set(i)); c.addEventListener('focus', () => set(i)); });
      onView(pick, (v) => { inView = v; set(cur); }, { threshold: .3 });
    } else {
      cards.forEach((c) => onView(c, (v) => { c.classList.toggle('is-on', v); c.classList.toggle('is-play', !RM && v); }, { threshold: .55 }));
    }
  })();

  // case studies · the site video plays only while on screen; the before/after slider; the purchase journey
  $$('.cs-video').forEach((v) => {
    if (RM) return;
    onView(v, (on) => { if (on) { v.preload = 'auto'; const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } else v.pause(); }, { threshold: .3 });
  });
  (() => {
    const ba = $('#cs-ba');
    if (!ba) return;
    const range = $('.cs-ba-range', ba);
    const set = (v) => ba.style.setProperty('--x', v + '%');
    range.addEventListener('input', () => set(range.value));
    if (RM) return;
    // a short hint on arrival: the divider sweeps once to show it can move
    onceInView(ba, () => {
      const t0 = performance.now();
      const f = (now) => { if (document.activeElement === range) return; const k = Math.min(1, (now - t0) / 1800); const v = 50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k); set(v.toFixed(1)); range.value = v; if (k < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    }, { threshold: .5 });
  })();
  (() => {
    const jr = $('#cs-jr');
    if (!jr) return;
    const steps = $$('li', jr);
    let i = 0, visible = false;
    const set = (k) => { steps.forEach((s, n) => { s.classList.toggle('is-on', n === k); s.classList.toggle('is-done', n < k); }); jr.style.setProperty('--jp', (k / (steps.length - 1)).toFixed(3)); };
    if (RM) { set(steps.length - 1); return; }
    onView(jr, (v) => { visible = v; }, { threshold: .4 });
    setInterval(() => { if (!visible || document.hidden) return; set(i); i = (i + 1) % steps.length; }, 1400);
  })();
})();
