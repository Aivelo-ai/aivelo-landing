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
      // step 1 hands its choices over to step 2 (the estimate), which sends everything at once
      window.labSketch = { metier: DEMO[s.metier].eyebrow, kind: s.metier, mood: MOODS[s.mood], color: `${label} (${s.color})`, name: s.name, subject, body };
      document.dispatchEvent(new CustomEvent('lab:sketch'));
    };
    form.addEventListener('change', render);
    // « Pour qui » → the sketch starts from the visitor's trade
    $$('[data-metier-go]').forEach((a) => a.addEventListener('click', () => {
      const r = form.querySelector(`[name="metier"][value="${a.dataset.metierGo}"]`);
      if (r && !r.checked) { r.checked = true; form.dispatchEvent(new Event('change', { bubbles: true })); }
    }));
    let typing;
    el('demo-name').addEventListener('input', () => { clearTimeout(typing); typing = setTimeout(render, 120); });
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
        std: { name: 'Essentiel', label: 'Soigné', sub: 'Design personnalisé', base: 2000, incl: 5, extra: 150, days: 10 },
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
      sizeLabel: 'Modules à intégrer', hint: 'Vous fournissez vos contenus (vidéos, PDF, quiz) : nous les intégrons et les mettons en forme.', max: 60, def: 10, unit: ['module', 'modules'],
      levels: {
        std: { name: 'Lancement', label: 'Plateforme', sub: 'Parcours, quiz, attestations', base: 2490, incl: 10, extra: 45, days: 11 },
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
      out('sim-size').max = P.max;
      out('sim-size-label').textContent = P.sizeLabel;
      out('sim-size-hint').textContent = P.hint;
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
      const sk = window.labSketch;
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
    u.searchParams.set('hide_gdpr_banner', '1');
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
        f.addEventListener('load', () => setTimeout(() => { if (blocked) return; body.classList.add('is-ready'); body.classList.remove('is-blocked'); $('.book-fallback', body).hidden = true; }, 120));
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
  dock.innerHTML = `<a href="https://wa.me/33624434801?text=${encodeURIComponent('Bonjour Arthur, je vous contacte depuis le site Aivelo au sujet d\u2019un projet.')}" class="m-dock-wa" target="_blank" rel="noreferrer" aria-label="Écrire sur WhatsApp"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg></a><a href="#demo" class="m-dock-ghost">Estimer</a><a href="https://calendly.com/arthur-s-aivelo/atelier-decouverte" target="_blank" rel="noreferrer" class="m-dock-main" data-book>Réserver l\u2019atelier</a>`;
  document.body.appendChild(dock);
  if (window.labBook) { const d = $('[data-book]', dock); d.removeAttribute('target'); d.setAttribute('href', '#reserver'); d.setAttribute('role', 'button'); d.addEventListener('click', (e) => { e.preventDefault(); window.labBook(); }); }
  const hero = $('.hero'); const contact = $('#contact'); const est = $('#estimation');
  const dockState = { hero: true, contact: false, est: false };
  const syncDock = () => dock.classList.toggle('is-on', !dockState.hero && !dockState.contact && !dockState.est);
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

  /* ------------------------------------------------------------------
     7. Liens légaux : fenêtre au lieu de liens morts
     ------------------------------------------------------------------ */
  const LEGAL = {
    mentions: ['Mentions légales', `
      <h3>Éditeur</h3><p>Aivelo, entreprise d'Arthur Semelier, en cours d'immatriculation (le numéro SIRET sera publié ici dès son attribution). 20 rue Louis Maydieu, Bordeaux, France.<br>Directeur de la publication : Arthur Semelier.</p>
      <h3>Contact</h3><p><a href="mailto:arthur.s@aivelo.fr">arthur.s@aivelo.fr</a> · <a href="https://wa.me/33624434801" target="_blank" rel="noreferrer">+33 6 24 43 48 01</a></p>
      <h3>Hébergement</h3><p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis · <a href="https://vercel.com" target="_blank" rel="noreferrer">vercel.com</a></p>
      <h3>Nom de domaine</h3><p>OVH SAS, 2 rue Kellermann, 59100 Roubaix, France · <a href="https://www.ovhcloud.com" target="_blank" rel="noreferrer">ovhcloud.com</a></p>
      <h3>Propriété intellectuelle</h3><p>Les contenus de ce site (textes, visuels, logo) appartiennent à Aivelo, sauf mention contraire. Les sites clients sont présentés avec leur accord.</p>`],
    confidentialite: ['Confidentialité & RGPD', `
      <p>Ce site ne dépose aucun cookie, ni publicitaire ni de suivi. Le responsable du traitement est Arthur Semelier (Aivelo).</p>
      <h3>Données collectées</h3><p>Uniquement celles que vous nous transmettez : nom, e-mail et téléphone lorsque vous réservez un atelier ou nous écrivez, ainsi que l'estimation composée sur le site si vous choisissez de la joindre. Elles servent à préparer l'atelier et à répondre à votre demande. Elles ne sont ni vendues ni cédées.</p>
      <h3>Prestataires</h3><p>Réservation : Calendly. Visioconférence et agenda : Google. Hébergement : Vercel. Mesure d'audience : Umami, sans cookie, avec des statistiques anonymes et agrégées (pages vues, clics sur les boutons), qui ne permettent pas de vous identifier. Ces prestataires peuvent traiter des données hors de l'Union européenne, encadrés par le Data Privacy Framework UE–États-Unis ou par les clauses contractuelles types de la Commission européenne.</p>
      <h3>Durée de conservation</h3><p>Demandes de contact et rendez-vous sans suite : 3 ans après le dernier échange. Clients : pendant toute la durée du contrat, puis 3 ans. Factures et pièces comptables : 10 ans, comme l'impose la loi.</p>
      <h3>Vos droits</h3><p>Accès, rectification, effacement, limitation, opposition et portabilité : écrivez à <a href="mailto:arthur.s@aivelo.fr">arthur.s@aivelo.fr</a>, réponse sous un mois. Vous pouvez aussi adresser une réclamation à la <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">CNIL</a>.</p>`],
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
  $$('a[href="#demo"]').forEach((a) => tag(a, a.dataset.metierGo ? 'esquisser-metier' : a.closest('.m-dock') ? 'estimer' : 'demarrer-projet', a.dataset.metierGo ? { metier: a.dataset.metierGo } : {}));
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
})();
