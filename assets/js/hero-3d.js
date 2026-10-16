/* ==========================================================================
   AIVELO — hero variant « logo en verre liquide »
   Off by default. Turned on by the address hash #logo-3d or by
   <html data-hero="3d">. It swaps the hero visual for the Aivelo logo
   rebuilt in 3D glass (three.js, loaded only when the variant is on).
   Without WebGL it falls back to the flat logo.
   ========================================================================== */
(() => {
  'use strict';

  const html = document.documentElement;
  const wanted = location.hash === '#logo-3d' || html.dataset.hero === '3d';
  const slot = document.querySelector('.live-site');
  if (!wanted || !slot) return;
  html.dataset.hero = '3d';

  // 1. Swap the hero visual (done before main.js runs, scripts are deferred in order)
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

  const stage = visual.querySelector('.g3-stage');
  const canvas = visual.querySelector('.g3-canvas');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fail = () => stage.classList.add('is-fallback');

  // 2. Load three.js on demand
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js';
  s.onload = () => { try { start(window.THREE); } catch (e) { fail(); } };
  s.onerror = fail;
  document.head.appendChild(s);

  function start(THREE) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    if (!renderer.getContext()) return fail();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.15, 15);

    // --- Backdrop the glass refracts: the page's pearl tone, soft brand blobs, a faint blueprint grid
    const bg = document.createElement('canvas');
    bg.width = bg.height = 1024;
    const g = bg.getContext('2d');
    g.fillStyle = '#EEF1F8';
    g.fillRect(0, 0, 1024, 1024);
    [['#8FB0FF', 300, 330, 380], ['#C4B5FF', 720, 420, 360], ['#A8F0D6', 520, 820, 300], ['#FFD2E4', 820, 820, 220]].forEach(([c, x, y, r]) => {
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, c);
      grd.addColorStop(1, 'rgba(238,241,248,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 1024, 1024);
    });
    g.strokeStyle = 'rgba(58,103,236,.10)';
    g.lineWidth = 2;
    for (let i = 0; i <= 1024; i += 64) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(1024, i); g.stroke();
    }
    const bgTex = new THREE.CanvasTexture(bg);
    bgTex.encoding = THREE.sRGBEncoding;
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), new THREE.MeshBasicMaterial({ map: bgTex, toneMapped: false }));
    backdrop.position.z = -5;
    scene.add(backdrop);

    // --- Studio environment for reflections (built in code, no external HDR)
    const envScene = new THREE.Scene();
    const envSphere = new THREE.Mesh(
      new THREE.SphereGeometry(10, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {},
        vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y * .5 + .5; vec3 top = vec3(1.0); vec3 mid = vec3(.82,.84,1.0); vec3 low = vec3(.45,.58,1.0); vec3 c = mix(low, mid, smoothstep(0.,.55,h)); c = mix(c, top, smoothstep(.55,1.,h)); gl_FragColor = vec4(c,1.0); }',
      }),
    );
    envScene.add(envSphere);
    const panel = (w, h, x, y, z, ry) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); m.rotateY(ry || 0);
      envScene.add(m);
    };
    panel(6, 2.2, -5, 4, 4); panel(2, 7, 6, 1, 3); panel(8, 1.2, 0, 6, -2); panel(1.2, 6, -6, -1, 2); panel(5, .8, 2, -5, 5);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(envScene, 0.035).texture;

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(-3, 5, 6);
    scene.add(key);

    // --- The logo, rebuilt as extruded glass from its silhouette (source art is 471 × 471 px)
    const P = (x, y) => new THREE.Vector2((x - 235) / 60, (235 - y) / 60);
    const shapeFrom = (pts) => { const sh = new THREE.Shape(); pts.forEach((p, i) => (i ? sh.lineTo(p.x, p.y) : sh.moveTo(p.x, p.y))); sh.closePath(); return sh; };

    const towers = [
      { pts: [P(68, 430), P(68, 268), P(128, 236), P(128, 430)], tint: 0x1E3A8A },
      { pts: [P(145, 430), P(145, 175), P(238, 118), P(238, 430)], tint: 0x1D3FA6 },
      { pts: [P(258, 430), P(258, 175), P(291, 152), P(325, 175), P(325, 430)], tint: 0x3D7BFF },
      { pts: [P(343, 430), P(343, 236), P(393, 265), P(393, 430)], tint: 0x5B7EA8 },
    ];
    const swoosh = new THREE.Shape();
    { const a = P(132, 445), b = P(250, 372), c = P(398, 382), d = P(398, 418), e = P(262, 408), f = P(150, 458);
      swoosh.moveTo(a.x, a.y); swoosh.quadraticCurveTo(b.x, b.y, c.x, c.y); swoosh.lineTo(d.x, d.y);
      swoosh.quadraticCurveTo(e.x, e.y, f.x, f.y); swoosh.closePath(); }
    const star = new THREE.Shape();
    { const cx = 266, cy = 70, R = 56, r = 13;
      for (let i = 0; i < 8; i++) {
        const ang = -Math.PI / 2 + i * Math.PI / 4;
        const rad = i % 2 ? r : R;
        const p = P(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad);
        i ? star.lineTo(p.x, p.y) : star.moveTo(p.x, p.y);
      }
      star.closePath(); }

    const extrude = { depth: 0.55, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.07, bevelSegments: 8, curveSegments: 32 };
    const glass = (tint) => new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tint).lerp(new THREE.Color(0xffffff), 0.78),
      metalness: 0, roughness: 0.03,
      transmission: 1, thickness: 1.6, ior: 1.52,
      attenuationColor: new THREE.Color(tint), attenuationDistance: 1.9,
      clearcoat: 1, clearcoatRoughness: 0.04,
      iridescence: 0.35, iridescenceIOR: 1.3,
      specularIntensity: 1, envMapIntensity: 1.25,
    });

    const logo = new THREE.Group();
    towers.forEach((t) => logo.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shapeFrom(t.pts), extrude), glass(t.tint))));
    logo.add(new THREE.Mesh(new THREE.ExtrudeGeometry(swoosh, extrude), glass(0x2E5BD9)));
    const starMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(star, { ...extrude, depth: 0.4 }), glass(0x4F7EF7));
    logo.add(starMesh);
    const box = new THREE.Box3().setFromObject(logo);
    const center = box.getCenter(new THREE.Vector3());
    logo.children.forEach((m) => m.position.sub(center));
    const starBase = starMesh.position.clone();
    scene.add(logo);

    // --- Size, pointer, visibility
    const resize = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    const target = { x: 0, y: 0 };
    window.addEventListener('pointermove', (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5);
      target.y = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stage);

    const clock = new THREE.Clock();
    let rx = 0, ry = 0;
    const frame = () => {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const t = reduceMotion ? 0 : clock.getElapsedTime();
      ry += ((Math.sin(t * 0.45) * 0.32 + target.x * 0.7) - ry) * 0.05;
      rx += ((Math.sin(t * 0.6) * 0.06 + target.y * 0.35) - rx) * 0.05;
      logo.rotation.set(rx, ry, 0);
      logo.position.y = Math.sin(t * 0.9) * 0.12;
      starMesh.position.y = starBase.y + Math.sin(t * 1.6) * 0.08;
      renderer.render(scene, camera);
    };
    frame();
    stage.classList.add('is-ready');
  }
})();
