/* ==========================================================================
   AIVELO — « Méthode » : une goutte d'eau sur verre (variante verre 3D)

   Story, A → B, driven by the scroll but obeying gravity:
   A  Condensation beads sit on the glass at the top of the section. When the
      visitor starts scrolling they coalesce into one drop (the idea forms).
   →  The drop slides down the glass: it accelerates, stretches into a tear
      when fast, rounds up and jiggles when it brakes, leaves a wet film that
      breaks into tiny beads, and swallows the beads lying on its way.
   ●  Each step is a station: the drop dwells in the step's ring, leaves a
      bead there (the step is "done") and moves on.
   B  It settles in the final ring as a round lens: « Projet livré ».
   Water never climbs back: scrolling up leaves everything in place; the
   scene quietly resets only once the section is out of view, below it.

   Rendering: WebGL2 metaballs in two passes.
   1. Every drop / film point is an additive point sprite writing a smooth
      kernel into a half-float field texture (R: mass, G: "flatness").
   2. A full-screen pass thresholds the field and shades it as clear water
      on glass: refracted dark rim, bright caustic crescent, sharp specular
      glint, soft cast shadow. Merging between drops comes for free.

   Active only with <html data-hero="3d"> (or #logo-3d), motion allowed,
   GSAP, WebGL2 and float render targets available. Otherwise the regular
   rail stays untouched.
   ========================================================================== */
(() => {
  'use strict';

  const html = document.documentElement;
  const timeline = document.querySelector('.timeline');
  if (!timeline || html.dataset.hero !== '3d') return;
  if (!window.gsap || !window.ScrollTrigger || !html.classList.contains('motion')) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'w-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) return;
  if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return;

  html.classList.add('water');
  timeline.insertBefore(canvas, timeline.firstChild);

  const basin = document.createElement('div');
  basin.className = 'w-basin';
  basin.setAttribute('aria-hidden', 'true');
  basin.innerHTML = `
    <span class="w-well"></span>
    <span class="w-done"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Projet livré</span>`;
  timeline.appendChild(basin);
  const well = basin.querySelector('.w-well');
  const done = basin.querySelector('.w-done');
  const steps = Array.from(timeline.querySelectorAll('.step'));

  /* ---------- GL programs ---------- */
  const T = 0.3721; // kernel value at r = R for a kernel of support 1.6 R

  const fieldVS = `#version 300 es
    in vec4 aP; // x, y (css px), R (css px), flatness 0..1
    uniform vec2 uSize; uniform float uDpr;
    out float vFlat;
    void main(){
      gl_Position = vec4(aP.x / uSize.x * 2. - 1., 1. - aP.y / uSize.y * 2., 0., 1.);
      gl_PointSize = max(aP.z * 3.2 * uDpr, 1.);
      vFlat = aP.w;
    }`;
  const fieldFS = `#version 300 es
    precision highp float;
    in float vFlat; out vec4 o;
    void main(){
      vec2 c = gl_PointCoord * 2. - 1.;
      float q = dot(c, c);
      if (q >= 1.) discard;
      float k = (1. - q) * (1. - q);
      o = vec4(k, k * vFlat, 0., 0.);
    }`;
  const quadVS = `#version 300 es
    in vec2 a; out vec2 vUv;
    void main(){ vUv = a * .5 + .5; gl_Position = vec4(a, 0., 1.); }`;
  const shadeFS = `#version 300 es
    precision highp float;
    in vec2 vUv; out vec4 o;
    uniform sampler2D uF;
    uniform vec2 uTexel;   // 1 / texture size
    uniform float uDpr;
    const float T = ${T.toFixed(4)};

    float F(vec2 uv){ return texture(uF, uv).r; }

    void main(){
      vec4 s = texture(uF, vUv);
      float f = s.r;
      float fl = f > .0005 ? clamp(s.g / f, 0., 1.) : 0.;

      // cast shadow, soft (two taps), below-right of the water (texture v grows upwards)
      vec2 sh = vec2(-2.2, 5.) * uDpr * uTexel;
      float fs = (F(vUv + sh) + F(vUv + sh * 1.8) + F(vUv + sh * .5)) / 3.;
      float shadow = smoothstep(T * .2, T * 1.15, fs) * .16;

      float w = max(fwidth(f) * .8, .002);
      float inside = smoothstep(T - w, T + w, f);
      if (inside <= 0. && shadow <= .002) { o = vec4(0.); return; }

      vec2 g = vec2(F(vUv + vec2(uTexel.x, 0.)) - F(vUv - vec2(uTexel.x, 0.)),
                    F(vUv - vec2(0., uTexel.y)) - F(vUv + vec2(0., uTexel.y))); // screen y down
      vec2 dir = g / (length(g) + 1e-5);           // points inward
      float h = smoothstep(T, 1.05, f);            // 0 at the edge, 1 on a thick dome
      float tilt = (1. - h) * mix(1.35, .3, fl);
      vec3 n = normalize(vec3(-dir * tilt, 1.));   // outward-facing normal, screen space

      vec3 L = normalize(vec3(-.42, -.78, .9));
      float sp = max(dot(reflect(-L, n), vec3(0., 0., 1.)), 0.);
      float glint = (pow(sp, 110.) * 1.2 + pow(sp, 18.) * .14) * (1. - fl * .8);

      // liquid-glass bevel: lit rim toward the light, darker rim away from it
      vec2 out2 = -dir;                                    // outward direction
      float lit = dot(out2, normalize(vec2(-.5, -.86)));   // +1 facing the light (top-left)
      float edge = 1. - smoothstep(0., .34, h);
      float hair = 1. - smoothstep(0., .07, h);            // crisp outline
      float rimLight = edge * smoothstep(-.1, .9, lit) * mix(.95, .35, fl);
      float rimDark = edge * smoothstep(-.1, .9, -lit) * mix(.42, .12, fl);
      // light focused through the drop: bright crescent inside the lower edge
      float cres = smoothstep(.2, .95, dot(out2, vec2(.22, .975))) * smoothstep(.04, .3, h) * (1. - smoothstep(.3, .72, h)) * (1. - fl);
      // chromatic fringe on the bevel
      vec3 fringe = mix(vec3(.55, .45, 1.), vec3(.35, .75, 1.), smoothstep(-1., 1., lit));

      // frosted body: slightly tinted, lighter toward the bottom (refracted light)
      float vy = clamp(out2.y * (1. - h), -1., 1.);
      vec3 bodyCol = mix(vec3(.80, .86, 1.), vec3(1.), smoothstep(-.5, .8, vy));
      float body = mix(.34, .12, fl);

      vec3 c = bodyCol * body;
      float a = body;
      c = c * (1. - rimDark) + vec3(.13, .20, .45) * rimDark; a = a + rimDark * (1. - a);
      c = c + (fringe * .35 + vec3(1.) * .65) * rimLight; a = a + rimLight * .8 * (1. - a);
      c = c * (1. - hair * .5) + vec3(.16, .24, .50) * hair * .5; a = a + hair * .5 * (1. - a);
      c += vec3(1.) * (cres * .7 + glint); a = min(1., a + (cres * .5 + glint * .8) * (1. - a));
      float aDrop = clamp(a, 0., 1.) * inside;
      vec3 cDrop = c * inside;

      vec3 cSh = vec3(.08, .12, .28) * shadow * (1. - inside);
      float aSh = shadow * (1. - inside);
      o = vec4(cDrop + cSh * (1. - aDrop), aDrop + aSh * (1. - aDrop));
    }`;

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  };
  const program = (vs, fs) => {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  };
  let pField, pShade;
  try {
    pField = program(fieldVS, fieldFS);
    pShade = program(quadVS, shadeFS);
  } catch (err) {
    console.error(err);
    canvas.remove(); basin.remove(); html.classList.remove('water');
    return;
  }

  const MAX_PTS = 900;
  const ptData = new Float32Array(MAX_PTS * 4);
  const ptBuf = gl.createBuffer();
  const ptVao = gl.createVertexArray();
  gl.bindVertexArray(ptVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
  gl.bufferData(gl.ARRAY_BUFFER, ptData.byteLength, gl.DYNAMIC_DRAW);
  const aP = gl.getAttribLocation(pField, 'aP');
  gl.enableVertexAttribArray(aP);
  gl.vertexAttribPointer(aP, 4, gl.FLOAT, false, 0, 0);

  const quadVao = gl.createVertexArray();
  gl.bindVertexArray(quadVao);
  const qBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, qBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aQ = gl.getAttribLocation(pShade, 'a');
  gl.enableVertexAttribArray(aQ);
  gl.vertexAttribPointer(aQ, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  const uf = { size: gl.getUniformLocation(pField, 'uSize'), dpr: gl.getUniformLocation(pField, 'uDpr') };
  const us = { F: gl.getUniformLocation(pShade, 'uF'), texel: gl.getUniformLocation(pShade, 'uTexel'), dpr: gl.getUniformLocation(pShade, 'uDpr') };

  const fieldTex = gl.createTexture();
  const fbo = gl.createFramebuffer();
  const allocField = (w, h) => {
    gl.bindTexture(gl.TEXTURE_2D, fieldTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fieldTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  /* ---------- deterministic randomness (same glass every visit) ---------- */
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  /* ---------- layout: path A → dots → B as a smooth spline ---------- */
  const L = { W: 0, H: 0, path: [], len: [], total: 0, stations: [], A: null, B: null, dots: [] };
  let dpr = 1;

  const catmull = (p0, p1, p2, p3, t) => {
    const t2 = t * t, t3 = t2 * t;
    return [
      .5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
      .5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
    ];
  };

  let beads = [];        // dew on the glass: { x, y, r, cond?, residue?, born? }
  let film = [];         // wet trail: { x, y, r0, born }
  let stationBeads = []; // beads left in the rings

  const pointAt = (s) => {
    s = Math.max(0, Math.min(L.total, s));
    let lo = 0, hi = L.len.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L.len[m] < s) lo = m; else hi = m; }
    const t = (s - L.len[lo]) / Math.max(1e-6, L.len[hi] - L.len[lo]);
    const a = L.path[lo], b = L.path[hi];
    const tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
    return { x: a[0] + tx * t, y: a[1] + ty * t, tx: tx / tl, ty: ty / tl };
  };

  const seedGlass = () => {
    seed = 7;
    beads = [];
    // condensation cluster at A
    for (let i = 0; i < 16; i++) {
      const a = rnd() * Math.PI * 2, d = 6 + Math.pow(rnd(), .7) * 30;
      beads.push({ x: L.A[0] + Math.cos(a) * d, y: L.A[1] + Math.sin(a) * d * .8, r: 1.2 + rnd() * 2.6, cond: true });
    }
    // scattered dew along the corridor
    const n = Math.round(L.total / 26);
    for (let i = 0; i < n; i++) {
      const p = pointAt(rnd() * L.total);
      const x = Math.max(4, Math.min(L.W - 6, p.x + (rnd() - .5) * 70));
      beads.push({ x, y: p.y + (rnd() - .5) * 20, r: .9 + Math.pow(rnd(), 2.2) * 3.4 });
    }
  };

  const layout = () => {
    const cr = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    L.W = cr.width; L.H = cr.height;
    canvas.width = Math.max(1, Math.round(L.W * dpr));
    canvas.height = Math.max(1, Math.round(L.H * dpr));
    allocField(canvas.width, canvas.height);

    // offsets, not bounding boxes: entry animations translate the steps while we measure
    const ox = -canvas.offsetLeft, oy = -canvas.offsetTop;
    L.dots = steps.map((s) => {
      const d = s.querySelector('.step-dot');
      return [s.offsetLeft + d.offsetLeft + d.offsetWidth / 2 + ox, s.offsetTop + d.offsetTop + d.offsetHeight / 2 + oy];
    });
    const cx = L.dots.length ? L.dots[0][0] : L.W - 40;
    L.B = [basin.offsetLeft + well.offsetLeft + well.offsetWidth / 2 + ox, basin.offsetTop + well.offsetTop + well.offsetHeight / 2 + oy];
    L.A = [cx - Math.min(34, cx * .3), 48];

    // gentle wander between stations, like a real rivulet finding its way
    const amp = Math.min(26, Math.max(6, (cx - 18) * .28));
    const ctrl = [L.A];
    let prev = L.A;
    [...L.dots, L.B].forEach((p, i) => {
      ctrl.push([cx - amp * (i % 2 ? .35 : 1), prev[1] + (p[1] - prev[1]) * .5]);
      ctrl.push(p);
      prev = p;
    });
    L.path = [];
    for (let i = 0; i < ctrl.length - 1; i++) {
      const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
      const n = Math.max(4, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 4));
      for (let k = 0; k < n; k++) L.path.push(catmull(p0, p1, p2, p3, k / n));
    }
    L.path.push(ctrl[ctrl.length - 1]);
    L.len = [0];
    for (let i = 1; i < L.path.length; i++) L.len.push(L.len[i - 1] + Math.hypot(L.path[i][0] - L.path[i - 1][0], L.path[i][1] - L.path[i - 1][1]));
    L.total = L.len[L.len.length - 1];
    const sAt = (p) => {
      let best = 0, bd = 1e9;
      L.path.forEach((q, i) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; best = i; } });
      return L.len[best];
    };
    L.stations = [0, ...L.dots.map(sAt), L.total];
    if (!S.started) seedGlass();
  };

  /* ---------- scroll → target arc length, with a dwell at each station ---------- */
  const ease = (u) => { u = Math.max(0, Math.min(1, (u - .14) / .72)); return u * u * u * (u * (u * 6 - 15) + 10); };
  let progress = 0;
  ScrollTrigger.create({
    trigger: timeline, start: 'top 68%', end: 'bottom 72%',
    onUpdate: (self) => { progress = self.progress; },
  });
  const targetFromProgress = (p) => {
    const st = L.stations;
    const seg = st.length - 1;
    const x = p * seg;
    const i = Math.min(seg - 1, Math.floor(x));
    return st[i] + (st[i + 1] - st[i]) * ease(x - i);
  };

  /* ---------- simulation state ---------- */
  const fresh = () => ({ started: false, s: 0, v: 0, R: 4.5, maxTarget: 0, lastDeposit: 0, jiggleAt: -1, reached: 0, settled: false });
  const S = fresh();
  const reset = () => {
    Object.assign(S, fresh());
    film = []; stationBeads = [];
    seedGlass();
    steps.forEach((st) => st.classList.remove('is-wet'));
    well.classList.remove('is-wet');
    done.classList.remove('is-on');
  };

  layout();
  window.addEventListener('resize', layout);
  if (document.fonts) document.fonts.ready.then(layout);
  ScrollTrigger.addEventListener('refresh', layout);

  let visible = false;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    // water never climbs back: reset only once the section is out of view, below the screen
    if (!visible && S.started && e.boundingClientRect.top > window.innerHeight) reset();
  }, { rootMargin: '300px 0px' }).observe(timeline);

  /* ---------- frame ---------- */
  const t0 = performance.now();
  let last = t0;
  const R_MAIN = 16;

  const frame = (now) => {
    requestAnimationFrame(frame);
    const dt = Math.min(.04, (now - last) / 1000);
    last = now;
    if (!visible || document.hidden || !L.total) return;
    const t = (now - t0) / 1000;

    // A — condensation: before the scroll starts, the seed drop slowly grows
    const target = Math.max(S.maxTarget, targetFromProgress(progress));
    S.maxTarget = target;
    if (!S.started && target > 1) S.started = true;
    if (!S.started) S.R = Math.min(7, S.R + dt * .35);

    // coalescence at A: the cluster is pulled into the drop once it starts
    const head = pointAt(S.s);
    if (S.started) {
      beads.forEach((b) => {
        if (!b.cond) return;
        const dx = head.x - b.x, dy = head.y - b.y, d = Math.hypot(dx, dy) || 1;
        const pull = Math.min(1, dt * (2.2 + 60 / d));
        b.x += dx * pull; b.y += dy * pull;
      });
      S.R += (R_MAIN - S.R) * (1 - Math.pow(.06, dt));
    }

    // motion along the path: spring toward the scroll target, it may brake but never climbs
    if (S.started && !S.settled) {
      const acc = 34 * (target - S.s) - 10.5 * S.v;
      S.v = Math.max(0, Math.min(560, S.v + acc * dt));
      S.s = Math.max(0, Math.min(L.total, S.s + S.v * dt));
    }

    // stations: arrive → jiggle, leave a bead, light the step
    for (let i = S.reached + 1; i < L.stations.length; i++) {
      if (S.s < L.stations[i] - 3) break;
      S.reached = i;
      S.jiggleAt = t;
      const p = pointAt(L.stations[i]);
      if (i < L.stations.length - 1) {
        stationBeads.push({ x: p.x, y: p.y, r: 0, rT: 5.2 });
        steps[i - 1].classList.add('is-wet');
      } else {
        well.classList.add('is-wet');
      }
    }
    if (S.reached === L.stations.length - 1 && S.v < 8) S.settled = true;
    done.classList.toggle('is-on', S.settled);
    if (S.settled) S.R += (19.5 - S.R) * (1 - Math.pow(.05, dt)); // merges into a lens

    // absorb the dew on the way
    if (S.started) beads = beads.filter((b) => Math.hypot(head.x - b.x, head.y - b.y) >= S.R * .85 + b.r || b.residue);

    // wet film behind the drop, which then breaks into tiny beads
    if (S.started && !S.settled && S.s - S.lastDeposit > 2.2) {
      const tail = pointAt(Math.max(0, S.s - S.R * .6));
      film.push({ x: tail.x + (rnd() - .5) * .8, y: tail.y, r0: S.R * .34, born: t });
      if (rnd() < .16) beads.push({ x: tail.x + (rnd() - .5) * 4, y: tail.y + (rnd() - .5) * 3, r: .7 + rnd() * 1.5, residue: true, born: t });
      S.lastDeposit = S.s;
    }
    film = film.filter((f) => t - f.born < 1.5);

    // point list
    let n = 0;
    const push = (x, y, r, flat) => { if (n < MAX_PTS && r > .3) { ptData[n * 4] = x; ptData[n * 4 + 1] = y; ptData[n * 4 + 2] = r; ptData[n * 4 + 3] = flat; n++; } };
    beads.forEach((b) => push(b.x, b.y, b.r * (b.residue ? Math.min(1, (t - b.born) * 3) : 1), 0));
    stationBeads.forEach((b) => { b.r += (b.rT - b.r) * (1 - Math.pow(.02, dt)); push(b.x, b.y, b.r, 0); });
    film.forEach((f) => { const a = (t - f.born) / 1.5; push(f.x, f.y, f.r0 * (1 - a * a) * .95, .85); });

    // main drop: head + tail stretched by speed (tear shape), squash & jiggle when braking
    const stretch = Math.min(1, S.v / 380);
    const jig = S.jiggleAt > 0 ? Math.sin((t - S.jiggleAt) * 19) * Math.exp(-(t - S.jiggleAt) * 4.2) : 0;
    const wob = 1 + .025 * Math.sin(t * 5.3) + jig * .09;
    const px = -head.ty, py = head.tx;
    push(head.x, head.y, S.R * wob, 0);
    const side = Math.max(0, -jig) * .55 + .08 * (1 - stretch);
    push(head.x + px * S.R * .32 * side, head.y + py * S.R * .32 * side, S.R * .7, 0);
    push(head.x - px * S.R * .32 * side, head.y - py * S.R * .32 * side, S.R * .7, 0);
    for (let i = 1; i <= 6; i++) {
      const back = pointAt(S.s - i * S.R * .34 * (.25 + stretch));
      push(back.x, back.y, S.R * (1 - i * .11) * (.75 + .25 * stretch), 0);
    }

    // pass 1: field
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(pField);
    gl.uniform2f(uf.size, L.W, L.H);
    gl.uniform1f(uf.dpr, dpr);
    gl.bindVertexArray(ptVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, ptData.subarray(0, n * 4));
    gl.drawArrays(gl.POINTS, 0, n);

    // pass 2: shade
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(pShade);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fieldTex);
    gl.uniform1i(us.F, 0);
    gl.uniform2f(us.texel, 1 / canvas.width, 1 / canvas.height);
    gl.uniform1f(us.dpr, dpr);
    gl.bindVertexArray(quadVao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  requestAnimationFrame(frame);
  ScrollTrigger.refresh();
})();
