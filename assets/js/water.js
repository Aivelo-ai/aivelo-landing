/* ==========================================================================
   AIVELO — « Méthode » : filet d'eau (test, variante verre 3D uniquement)
   The timeline rail becomes a glass tube that fills with water as you scroll.
   When the water reaches a step, its dot fills and ripples; at the end the
   stream pours into a small glass basin: « Projet livré ».
   Active only with <html data-hero="3d"> (or #logo-3d), motion allowed and
   GSAP present. Otherwise the regular rail stays untouched.
   ========================================================================== */
(() => {
  'use strict';

  const html = document.documentElement;
  const timeline = document.querySelector('.timeline');
  if (!timeline || html.dataset.hero !== '3d') return;
  if (!window.gsap || !window.ScrollTrigger || !html.classList.contains('motion')) return;

  html.classList.add('water');
  const rail = timeline.querySelector('.timeline-rail');
  const steps = Array.from(timeline.querySelectorAll('.step'));

  // Tube content: water column, rising bubbles, glass highlight
  const water = document.createElement('span');
  water.className = 'w-water';
  water.innerHTML = '<span class="w-surface"></span>' + '<i class="w-bubble"></i>'.repeat(6);
  rail.appendChild(water);
  const shine = document.createElement('span');
  shine.className = 'w-shine';
  rail.appendChild(shine);

  // Each dot gets an inner water fill and a ripple layer
  steps.forEach((step) => {
    const dot = step.querySelector('.step-dot');
    dot.innerHTML = '<span class="w-dot-fill"></span><span class="w-ripple"></span><span class="w-ripple w-ripple--2"></span>';
  });

  // Stream + basin after the last step
  const basin = document.createElement('div');
  basin.className = 'w-basin';
  basin.setAttribute('aria-hidden', 'true');
  basin.innerHTML = `
    <span class="w-stream"></span>
    <span class="w-bowl"><span class="w-bowl-water"><span class="w-surface"></span></span></span>
    <span class="w-done"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Projet livré</span>`;
  timeline.appendChild(basin);

  const splash = (dot) => {
    dot.classList.remove('is-splash');
    void dot.offsetWidth; // restart the CSS animation
    dot.classList.add('is-splash');
    for (let i = 0; i < 3; i++) {
      const d = document.createElement('i');
      d.className = 'w-droplet';
      dot.appendChild(d);
      const ang = (-90 + (i - 1) * 55) * Math.PI / 180;
      gsap.fromTo(d, { x: 0, y: 0, opacity: 1, scale: 1 }, {
        x: Math.cos(ang) * 18, y: Math.sin(ang) * 18, opacity: 0, scale: .4,
        duration: .7, ease: 'power2.out', onComplete: () => d.remove(),
      });
    }
  };

  // Water level follows the scroll (both ways)
  ScrollTrigger.create({
    trigger: timeline, start: 'top 60%', end: 'bottom 60%', scrub: .6,
    onUpdate: (self) => timeline.style.setProperty('--w', self.progress.toFixed(4)),
  });

  // Steps: the dot fills when the water reaches it, with a splash on the way down
  steps.forEach((step) => {
    const dot = step.querySelector('.step-dot');
    ScrollTrigger.create({
      trigger: step, start: 'top 60%',
      onEnter: () => { step.classList.add('is-wet'); splash(dot); },
      onLeaveBack: () => step.classList.remove('is-wet'),
    });
  });

  // Basin fills after the last step
  ScrollTrigger.create({
    trigger: basin, start: 'top 85%', end: 'top 45%', scrub: .6,
    onUpdate: (self) => {
      basin.style.setProperty('--b', self.progress.toFixed(4));
      basin.classList.toggle('is-full', self.progress > .92);
    },
  });

  ScrollTrigger.refresh();
})();
