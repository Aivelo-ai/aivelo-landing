/* ==========================================================================
   AIVELO — logo Aivelo en verre 3D (three.js, chargé à la demande)
   - Toujours : une grande version discrète derrière la section contact et
     le logo du bloc de pied de page, chargés seulement quand le visiteur
     approche du bas de la page.
   - Variante « hero » (#logo-3d dans l'adresse ou <html data-hero="3d">) :
     le visuel du hero devient aussi le logo en verre.
   Sans WebGL, le logo plat reste affiché.
   ========================================================================== */
(() => {
  'use strict';

  const html = document.documentElement;
  const slot = document.querySelector('.live-site');
  const heroVariant = !!slot && (location.hash === '#logo-3d' || html.dataset.hero === '3d');
  const footerLogo = document.querySelector('[data-footer-word] img');
  if (!heroVariant && !footerLogo) return;
  // three.js weighs ~600 kB: phones, data-saver and low-memory devices keep the flat logo
  const conn = navigator.connection || {};
  const lite = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '') ||
    window.matchMedia('(max-width: 760px), (pointer: coarse)').matches ||
    (navigator.deviceMemory && navigator.deviceMemory < 4);
  if (lite && !heroVariant) return;
  if (heroVariant) html.dataset.hero = '3d';

  /* Logo geometry, traced from assets/img/aivelo-logo.png (471 × 471 px):
     one closed outline per piece, in source pixels, with its exact colour. */
  const LOGO = [{"name":"star","color":"#1967f7","pts":[[266.9,22.3],[267.7,23.5],[271.1,37.5],[275.7,49.5],[279.1,55.5],[281.5,58.5],[286.5,62.9],[294.5,67.3],[307.5,71.9],[316.5,74.1],[318.3,75.3],[317.5,76.1],[312.5,77.1],[300.5,80.9],[293.5,83.7],[286.5,88.1],[280.5,93.5],[277.7,97.5],[271.9,110.5],[267.1,127.7],[266.1,126.5],[263.9,117.5],[259.3,104.5],[255.3,96.5],[252.5,92.5],[247.5,88.1],[244.5,86.1],[235.5,81.7],[224.5,78.1],[215.5,75.9],[214.7,75.1],[216.5,74.1],[228.5,71.1],[238.5,67.3],[246.5,62.9],[252.5,57.5],[254.9,54.5],[258.3,48.5],[262.9,36.5],[266.1,23.5]]},{"name":"notch","color":"#2773f7","pts":[[199.5,282.5],[200.5,282.5],[200.5,388.5],[192.5,389.5],[188.5,391.5],[154.5,400.5],[146.5,403.5],[146.5,311.5]]},{"name":"tower-tall","color":"#081b58","pts":[[237.5,116.5],[237.5,380.5],[224.5,382.5],[201.5,388.5],[201.5,343.5],[201.5,282.5],[200.5,281.5],[201.5,280.5],[201.5,257.5],[199.5,256.5],[195.5,258.5],[146.5,286.5],[146.5,172.5]]},{"name":"tower-blue","color":"#2c73ed","pts":[[296.5,155.5],[298.5,155.5],[316.5,168.5],[322.5,171.5],[322.5,367.5],[321.5,368.5],[301.5,369.5],[300.5,370.5],[284.5,372.5],[257.5,376.5],[257.5,182.5]]},{"name":"tower-left","color":"#071953","pts":[[125.5,235.5],[126.5,235.5],[126.5,409.5],[77.5,427.5],[69.5,429.5],[69.5,269.5]]},{"name":"tower-right","color":"#406991","pts":[[343.5,235.5],[393.5,267.5],[393.5,366.5],[377.5,366.5],[342.5,366.5],[342.5,236.5]]},{"name":"base","color":"#164d92","pts":[[339.5,384.9],[341.5,384.5],[387.5,384.5],[391.5,385.3],[392.9,386.1],[393.5,387.5],[393.5,426.5],[392.3,428.3],[208.5,428.5],[160.5,428.5],[155.5,429.5],[149.5,429.5],[144.5,428.5],[139.5,428.9],[133.7,428.5],[155.5,420.9],[194.5,409.1],[200.5,407.9],[222.5,402.1],[249.5,396.5],[265.5,393.5],[297.5,388.5],[300.5,388.5],[305.5,387.5],[310.5,387.5],[315.5,386.5],[321.5,386.5],[326.5,385.5],[336.5,385.5]]}];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // three.js, fetched once, only when a stage needs it
  let threeLoading = null;
  const loadThree = () => threeLoading || (threeLoading = new Promise((resolve, reject) => {
    if (window.THREE) return resolve(window.THREE);
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js';
    s.onload = () => resolve(window.THREE);
    s.onerror = reject;
    document.head.appendChild(s);
  }));

  // 1. Hero variant: swap the hero visual (runs before main.js: deferred scripts keep their order)
  if (heroVariant) {
    const visual = document.createElement('div');
    visual.className = 'hero-visual glass3d';
    visual.setAttribute('aria-hidden', 'true');
    visual.innerHTML = `
      <div class="g3-stage" data-intro>
        <canvas class="g3-canvas"></canvas>
        <img class="g3-fallback" src="assets/img/aivelo-logo.png" alt="" width="192" height="192" />
      </div>
      <span class="g3-chip g3-chip--a" data-intro><span class="dot dot-blue"></span>Sites web sur-mesure</span>
      <span class="g3-chip g3-chip--b" data-intro><span class="dot dot-green"></span>Plateformes de formation</span>
      <span class="g3-chip g3-chip--c" data-intro><span class="dot dot-blue"></span>UX &amp; motion design</span>`;
    slot.replaceWith(visual);
    const heroStage = visual.querySelector('.g3-stage');

    const fail = () => heroStage.classList.add('is-fallback');
    loadThree().then((THREE) => {
      try { mount(THREE, heroStage, 'hero'); } catch (e) { fail(); }
    }, fail);
  }

  // Lazy mount: load three.js and start a stage only when its section comes near
  const whenNear = (target, start) => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      start();
    }, { rootMargin: '600px 0px' });
    io.observe(target);
  };

  // 2. Large, quiet version behind « Parlons de votre projet »
  const contactBg = document.querySelector('.contact-bg');
  if (contactBg) {
    const bgStage = document.createElement('div');
    bgStage.className = 'g3-bg';
    bgStage.innerHTML = '<canvas class="g3-canvas"></canvas>';
    contactBg.appendChild(bgStage);
    whenNear(contactBg.parentElement, () => loadThree().then((THREE) => {
      try { mount(THREE, bgStage, 'background'); } catch (e) { bgStage.remove(); }
    }, () => bgStage.remove()));
  }

  // 3. Footer brand mark: the flat logo becomes glass when the footer comes near
  if (footerLogo) {
    const mark = document.createElement('div');
    mark.className = 'g3-mark';
    mark.innerHTML = '<canvas class="g3-canvas"></canvas>';
    footerLogo.before(mark);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      loadThree().then((THREE) => {
        try {
          mount(THREE, mark, 'mark');
          footerLogo.hidden = true;
        } catch (err) { mark.remove(); }
      }, () => mark.remove());
    }, { rootMargin: '600px 0px' });
    io.observe(footerLogo.parentElement); // the mark itself stays hidden until it is ready
  }

  /* ---------- shared pieces ---------- */

  // Studio lighting baked into an environment map: soft gradient dome + white softboxes
  function studioEnvironment(THREE, renderer) {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(
      new THREE.SphereGeometry(10, 48, 24),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y * .5 + .5; vec3 low = vec3(.30,.42,.85); vec3 mid = vec3(.80,.83,.98); vec3 top = vec3(1.0); vec3 c = mix(low, mid, smoothstep(0.,.5,h)); c = mix(c, top, smoothstep(.5,1.,h)); gl_FragColor = vec4(c,1.0); }',
      }),
    ));
    const box = (w, h, x, y, z, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    };
    box(7, 2.4, -5, 4.5, 4, 2.2);   // key, top-left
    box(1.6, 7, 6.5, 0.5, 3, 1.6);  // tall strip, right: crisp vertical edge highlights
    box(9, 1.1, 0, 7, -1, 1.4);     // top
    box(1.2, 6, -6.5, -1, 1.5, 1.0); // left rim
    box(6, 0.8, 1.5, -5.5, 5, 0.8); // floor bounce
    const pmrem = new THREE.PMREMGenerator(renderer);
    const tex = pmrem.fromScene(env, 0.02).texture;
    pmrem.dispose();
    return tex;
  }

  // The logo as extruded, bevelled pieces, faithful to the artwork
  function buildLogo(THREE, glass) {
    const k = 1 / 62;
    const cx = 231, cy = 225;
    const group = new THREE.Group();
    const parts = {};
    LOGO.forEach((piece) => {
      const shape = new THREE.Shape();
      piece.pts.forEach(([x, y], i) => {
        const X = (x - cx) * k, Y = (cy - y) * k;
        i ? shape.lineTo(X, Y) : shape.moveTo(X, Y);
      });
      shape.closePath();
      const isStar = piece.name === 'star';
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: isStar ? 0.36 : 0.46,
        bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.032, bevelOffset: -0.004, bevelSegments: 10,
        curveSegments: 1, steps: 1,
      });
      geo.translate(0, 0, isStar ? -0.18 : -0.23);
      geo.computeVertexNormals();
      const color = new THREE.Color(piece.color).convertSRGBToLinear();
      const dark = color.r + color.g + color.b < 0.15;
      const mat = glass
        ? new THREE.MeshPhysicalMaterial({
          color, metalness: 0, roughness: 0.1,
          transmission: dark ? 0 : 0.3, thickness: 1.1, ior: 1.46,
          attenuationColor: color, attenuationDistance: 0.45,
          clearcoat: 1, clearcoatRoughness: 0.05,
          iridescence: dark ? 0 : 0.18, iridescenceIOR: 1.3,
          specularIntensity: dark ? 0.6 : 1, envMapIntensity: dark ? 0.55 : 0.9,
        })
        : new THREE.MeshPhysicalMaterial({
          color, metalness: 0.05, roughness: dark ? 0.3 : 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: dark ? 0.5 : 0.9,
        });
      const mesh = new THREE.Mesh(geo, mat);
      if (piece.name === 'base') mesh.position.z = 0.12;
      if (isStar) mesh.position.z = 0.2;
      parts[piece.name] = mesh;
      group.add(mesh);
    });
    return { group, parts };
  }

  /* ---------- a renderer per stage ---------- */
  function mount(THREE, stage, mode) {
    const canvas = stage.querySelector('canvas');
    const isHero = mode === 'hero';
    const isMark = mode === 'mark';
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !isHero, powerPreference: 'high-performance' });
    if (!renderer.getContext()) throw new Error('no webgl');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.NoToneMapping; // keeps the brand blues exact (ACES drifts them to violet)
    if (!isHero) renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.environment = studioEnvironment(THREE, renderer);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.1, isHero ? 17 : isMark ? 18 : 14);   // the mark keeps a margin: it never touches its canvas edge while it turns

    if (isHero) {
      // What the glass refracts: the page's pearl tone, brand halos, a faint grid, a soft ground shadow
      const c = document.createElement('canvas');
      c.width = c.height = 1024;
      const g = c.getContext('2d');
      g.fillStyle = '#EEF1F8'; g.fillRect(0, 0, 1024, 1024);
      [['#8FB0FF', 300, 330, 400], ['#C4B5FF', 730, 420, 360], ['#A8F0D6', 520, 840, 300], ['#FFD2E4', 820, 820, 220]].forEach(([col, x, y, r]) => {
        const grd = g.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, col); grd.addColorStop(1, 'rgba(238,241,248,0)');
        g.fillStyle = grd; g.fillRect(0, 0, 1024, 1024);
      });
      g.strokeStyle = 'rgba(58,103,236,.09)'; g.lineWidth = 2;
      for (let i = 0; i <= 1024; i += 64) {
        g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.stroke();
        g.beginPath(); g.moveTo(0, i); g.lineTo(1024, i); g.stroke();
      }
      const sh = g.createRadialGradient(512, 770, 0, 512, 770, 260);
      sh.addColorStop(0, 'rgba(20,40,110,.22)'); sh.addColorStop(1, 'rgba(20,40,110,0)');
      g.save(); g.translate(512, 770); g.scale(1, 0.22); g.translate(-512, -770);
      g.fillStyle = sh; g.fillRect(0, 0, 1024, 1024); g.restore();
      const tex = new THREE.CanvasTexture(c);
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = 8;
      const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
      backdrop.position.z = -5;
      scene.add(backdrop);
    }

    const { group: logo, parts } = buildLogo(THREE, isHero);
    scene.add(logo);
    const starY = parts.star.position.y;

    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(-4, 6, 7);
    scene.add(key);

    const resize = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    // Smooth, damped motion: idle sway + pointer (hero) or scroll (background)
    const pointer = { x: 0, y: 0 };
    if (isHero || isMark) {
      window.addEventListener('pointermove', (e) => {
        pointer.x = e.clientX / window.innerWidth - 0.5;
        pointer.y = e.clientY / window.innerHeight - 0.5;
      }, { passive: true });
    }
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stage);

    const clock = new THREE.Clock();
    const cur = { rx: 0, ry: 0 };
    const tick = () => {
      requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      const t = reduceMotion ? 0 : clock.getElapsedTime();
      let tx, ty;
      if (isHero || isMark) {
        ty = Math.sin(t * 0.4) * (isMark ? 0.45 : 0.28) + pointer.x * 0.75;
        tx = Math.sin(t * 0.55) * 0.05 + pointer.y * 0.3;
      } else {
        const r = stage.getBoundingClientRect();
        const p = 1 - (r.top + r.height / 2) / (window.innerHeight + r.height); // 0 → 1 while it crosses the screen
        ty = -0.6 + p * 1.2 + Math.sin(t * 0.3) * 0.08;
        tx = 0.08;
      }
      cur.ry += (ty - cur.ry) * 0.045;
      cur.rx += (tx - cur.rx) * 0.045;
      logo.rotation.set(cur.rx, cur.ry, 0);
      logo.position.y = Math.sin(t * 0.8) * 0.1;
      parts.star.position.y = starY + Math.sin(t * 1.4) * 0.07;
      renderer.render(scene, camera);
    };
    tick();
    stage.classList.add('is-ready');
  }
})();
