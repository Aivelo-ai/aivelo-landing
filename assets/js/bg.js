/* ==========================================================================
   AIVELO — fond « jour / nuit » (WebGL)
   Le défilement raconte une journée : les sections claires sont un ciel de
   jour (nacre, voiles de nuages, lueur de soleil), les sections sombres une
   nuit étoilée (trois profondeurs d'étoiles en parallaxe, Voie lactée,
   étoiles filantes), l'indigo un crépuscule violet. Entre les deux, les
   étoiles s'allument et s'éteignent pendant que le ciel change de couleur.
   Le centre reste plus calme, là où se lit le texte.
   Sans WebGL ou avec « réduire les animations », le fond d'origine reste.
   ========================================================================== */
(() => {
  'use strict';

  const html = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let choice = 'sky';
  try { if (sessionStorage.getItem('aivelo-bg') === 'off') choice = 'off'; } catch (e) { /* storage blocked */ }

  const canvas = document.createElement('canvas');
  canvas.className = 'bgfx';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;

  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG = `
precision highp float;
uniform vec2 uRes, uMouse;
uniform float uTime, uScroll, uDark, uDusk, uContent, uPx, uSun, uConst;
uniform vec4 uEdge[19];   // the constellation of the logo: segment a.xy → b.xy, in sky units around the north star
uniform vec3 uBase, uA, uB;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 hash2(vec2 p){ return vec2(hash(p), hash(p + 17.31)); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.03 + vec2(3.1, 1.7); a *= .5; } return v; }

// one layer of stars: cells of random stars, with twinkle and a soft glow
vec3 stars(vec2 q, float scale, float density, float t, float bright){
  vec2 g = q * scale;
  vec2 id = floor(g);
  vec2 f = fract(g);
  vec3 acc = vec3(0.);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 o = vec2(float(i), float(j));
    vec2 cid = id + o;
    float r = hash(cid);
    if (r > density) continue;
    vec2 pos = o + .15 + .7 * hash2(cid + 4.7);
    vec2 d = (f - pos) / scale;                       // in sky units
    float px = uPx;                                   // one screen pixel in sky units
    float size = mix(.6, 1.9, pow(hash(cid + 9.1), 6.)) * px;
    float tw = .65 + .35 * sin(t * (1. + 3. * hash(cid + 2.3)) + r * 60.);
    float dist = length(d);
    float core = exp(-dist * dist / (size * size));
    float halo = exp(-dist / (size * 5.)) * .12;
    // the brightest few get thin diffraction spikes
    float big = step(.985, hash(cid + 6.6));
    float spikes = big * (exp(-abs(d.x) / (px * .7)) * exp(-abs(d.y) / (px * 9.)) + exp(-abs(d.y) / (px * .7)) * exp(-abs(d.x) / (px * 9.))) * .5;
    vec3 tint = mix(vec3(.72, .82, 1.), vec3(1., .9, .78), hash(cid + 1.9));
    acc += tint * (core + halo + spikes) * tw * bright;
  }
  return acc;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;                  // y up
  float asp = uRes.x / uRes.y;
  vec2 q = vec2((uv.x - .5) * asp, uv.y);
  float t = uTime;
  vec2 m = (uMouse - .5) * vec2(asp, 1.);

  // calm centre behind the text column
  float ex = abs(uv.x - .5) * 2.;
  float side = smoothstep(uContent * .55, uContent * 1.05, ex);
  float calm = mix(.55, 1., side);

  /* ---------- sky colour ---------- */
  vec3 col = uBase;
  // gentle vertical gradient: a touch of colour at the top of the screen
  col = mix(col, mix(uBase, uA, .22 + .12 * uDark), smoothstep(.35, 1.1, uv.y) * .55);
  col = mix(col, mix(uBase, uB, .25), smoothstep(.6, -.2, uv.y) * .35 * uDark);

  /* ---------- twilight: while day turns to night, a pink and violet glow rises from the horizon ---------- */
  float tw = clamp(uDark * (1. - uDark) * 4., 0., 1.);
  vec3 duskCol = mix(vec3(1., .66, .6), vec3(.56, .46, .95), smoothstep(0., .9, uv.y));
  col = mix(col, duskCol * mix(1., .55, uDark), tw * .5 * smoothstep(1.15, 0., uv.y));

  /* ---------- day: an azure sky, the sun and shaded clouds framing the page ---------- */
  float day = 1. - uDark;
  if (day > .01) {
    vec3 azure = mix(uA, vec3(.6, .74, 1.), .55);
    col = mix(col, mix(uBase, azure, .62), smoothstep(.05, 1.05, uv.y) * day);
    // the sun goes down as the page is read: high and white at the top, low and golden at the end
    float set = smoothstep(.02, .97, uSun);
    vec2 sun = vec2(mix(.58, .42, set) * asp, mix(1.02, .2, set) - .03 * sin(t * .05));
    vec3 sunCol = mix(vec3(1., .96, .88), vec3(1., .66, .38), smoothstep(.3, 1., set));
    // golden hour: the low sky warms up, gently enough to keep the text calm
    col = mix(col, mix(col, vec3(1., .8, .64), .55), smoothstep(.35, 1., set) * smoothstep(.75, 0., uv.y) * day * .6);
    vec2 dv = q - sun;
    float sd = length(dv);
    float grow = 1. + .6 * set;
    col += sunCol * (exp(-sd * 3. / grow) * (.32 + .12 * set) + exp(-sd * sd * 380. / grow) * .35) * day;
    float rays = pow(fbm(vec2(atan(dv.y, dv.x) * 7., t * .05)), 3.) * exp(-sd * 1.5);
    col += sunCol * rays * .3 * day;
    // three layers of cumulus, lit from the sun, thicker on the edges and in the low corners
    float edgeW = mix(.5, 1., side) * (.8 + .5 * smoothstep(.65, 0., uv.y));
    for (int l = 0; l < 3; l++) {
      float fl = float(l);
      vec2 cq = q * vec2(1.25 + fl * .5, 2.1 + fl * .7) + vec2(t * (.01 + fl * .006) + fl * 4.1, -uScroll * (.12 + fl * .12));
      vec2 w = vec2(fbm(cq * .7 + t * .008), fbm(cq * .7 - t * .006 + 3.));
      float c = fbm(cq + .6 * w);
      float c2 = fbm(cq + vec2(-.07, .1) + .6 * w);          // towards the sun: lit tops, soft shaded bellies
      float dens = smoothstep(.44 - .08 * edgeW, .72, c) * edgeW;
      float lit = clamp((c - c2) * 7. + .6, 0., 1.);
      vec3 cc = mix(mix(uBase, uA, .42) * .86, mix(vec3(1.), vec3(1., .86, .74), smoothstep(.4, 1., set)), lit);
      col = mix(col, cc, dens * (.95 - fl * .15) * day);
    }
    // as it gets lower, the sun becomes a visible disc, in front of the thin clouds
    float disc = smoothstep(.046 * grow, .026 * grow, sd) * smoothstep(.15, .6, set);
    col = mix(col, mix(vec3(1., .96, .88), vec3(1., .78, .54), smoothstep(.5, 1., set)), disc * .75 * day);
    col += sunCol * exp(-sd * sd * 60. / grow) * .24 * smoothstep(.15, .6, set) * day;
  }

  /* ---------- night: milky way, stars, shooting stars ---------- */
  float night = smoothstep(.15, 1., uDark);
  if (night > .01) {
    // milky way: a diagonal band of soft nebula
    vec2 nq = q + vec2(0., uScroll * .06);
    float band = exp(-pow(nq.y * .85 - nq.x * .42 - .45, 2.) * 7.);
    float neb = fbm(nq * 2.2 + vec2(t * .006, 0.)) * fbm(nq * 4.5 - vec2(0., t * .004) + 3.);
    vec3 nebCol = mix(uA, uB, fbm(nq * 1.4 + 5.));
    col += nebCol * pow(neb, 1.5) * band * (.85 + .5 * uDusk) * night * calm;
    col += vec3(.9, .92, 1.) * pow(fbm(nq * 9.) * band, 3.) * .25 * night * calm;   // dust of tiny stars in the band

    // three depths of stars, each with its own parallax
    vec3 s = vec3(0.);
    s += stars(q + vec2(m.x * .004, uScroll * .05 + m.y * .004), 22., .55, t, .55);
    s += stars(q + vec2(m.x * .009, uScroll * .11 + m.y * .008), 13., .42, t * 1.1, .8);
    s += stars(q + vec2(m.x * .016, uScroll * .19 + m.y * .014), 7., .28, t * .9, 1.15);
    // stars wake up near the pointer
    float near = exp(-dot(q - m - vec2(0., .5), q - m - vec2(0., .5)) * 9.);
    col += s * night * mix(.7, 1., side) * (1. + near * 1.2);

    // the Aivelo star: the four-pointed star of the logo, as the north star of the sky
    vec2 ns = vec2(min(.42 * asp, .5 * asp - .09), .8) + vec2(m.x * .02, m.y * .02);
    vec2 dn = q - ns;
    float pulse = .85 + .15 * sin(t * 1.3);
    float four = exp(-abs(dn.x) * 160.) * exp(-abs(dn.y) * 30.) + exp(-abs(dn.y) * 160.) * exp(-abs(dn.x) * 30.);
    float nCore = exp(-dot(dn, dn) * 14000.);
    float nGlow = exp(-length(dn) * 26.) * .14;
    vec3 brand = vec3(.098, .404, .969);
    col += (mix(brand, vec3(1.), .5) * (four * .5 + nGlow) + vec3(1.) * nCore * .8) * pulse * night;

    // the constellation of the Aivelo logo draws itself, line after line, from the north star
    if (uConst > .001) {
      vec3 cst = vec3(0.);
      for (int e = 0; e < 19; e++) {
        float f = clamp(uConst * 19. - float(e), 0., 1.);
        if (f <= 0.) break;
        vec2 a = ns + uEdge[e].xy; vec2 b = ns + mix(uEdge[e].xy, uEdge[e].zw, f);
        vec2 pa = q - a, ba = b - a;
        float hh = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0., 1.);
        float dl = length(pa - ba * hh);
        cst += vec3(.62, .74, 1.) * exp(-dl / (uPx * 1.3)) * .38;
        float star = exp(-dot(q - b, q - b) * 60000.) * (f < 1. ? 1.6 : .9) + exp(-dot(q - a, q - a) * 60000.) * .9;
        cst += vec3(.9, .94, 1.) * star;
      }
      col += cst * night * (.85 + .15 * sin(t * .9));
    }

    // shooting stars: three independent streams, one every ~2 s on average
    for (int st = 0; st < 3; st++) {
      float fs = float(st);
      float P = 4.3 + fs * 1.7;
      float tt = t + fs * 2.9;
      float kk = floor(tt / P) + fs * 31.;
      float dur = .8 + .5 * hash(vec2(kk, 9.));
      float lt = fract(tt / P) * P;
      if (lt < dur) {
        vec2 a0 = vec2((hash(vec2(kk, 1.)) - .5) * asp * 1.1, .55 + .45 * hash(vec2(kk, 2.)));
        vec2 dir = normalize(vec2((hash(vec2(kk, 4.)) > .5 ? -1. : 1.) * (.7 + .5 * hash(vec2(kk, 3.))), -.5));
        float prog = lt / dur;
        float len = .12 + .14 * hash(vec2(kk, 5.));
        vec2 head = a0 + dir * prog * .75;
        vec2 tail = head - dir * len * smoothstep(0., .3, prog);
        vec2 pa = q - tail, ba = head - tail;
        float hseg = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.);
        float dl = length(pa - ba * hseg);
        float trail = exp(-dl / (uPx * 1.1)) * hseg * hseg * sin(prog * 3.14159);
        col += vec3(.85, .9, 1.) * trail * (.8 + .6 * hash(vec2(kk, 6.))) * night;
      }
    }
  }

  // the pointer: a soft light in the sky
  float md = length(q - m - vec2(0., .5));
  col += (uA * .5 + .25) * exp(-md * md * 14.) * mix(.03, .07, uDark);

  // vignette and grain
  vec2 vc = uv - .5;
  col *= 1. - dot(vc, vc) * mix(.1, .55, uDark);
  col += (hash(gl_FragCoord.xy + fract(t) * 71.) - .5) * (.01 + .016 * uDark);
  gl_FragColor = vec4(col, 1.);
}`;

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { console.warn('bgfx', e); return; }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  ['uRes', 'uMouse', 'uTime', 'uScroll', 'uDark', 'uDusk', 'uContent', 'uPx', 'uBase', 'uA', 'uB', 'uSun', 'uConst', 'uEdge'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });

  document.body.prepend(canvas);

  /* ---------- day, night, dusk ---------- */
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const SCENES = {
    light: { base: hex('#EEF1F8'), a: hex('#7FA0FF'), b: hex('#B4A2FF'), dark: 0, dusk: 0 },
    ink: { base: hex('#070912'), a: hex('#3F6BF0'), b: hex('#7B5CFF'), dark: 1, dusk: 0 },
    indigo: { base: hex('#120F3A'), a: hex('#8B7CFF'), b: hex('#E07AB8'), dark: 1, dusk: 1 },
  };
  const cur = { base: [...SCENES.light.base], a: [...SCENES.light.a], b: [...SCENES.light.b], dark: 0, dusk: 0 };
  const scenes = [...document.querySelectorAll('[data-bg]')];
  const targetScene = () => {
    const mid = window.innerHeight * .5;
    for (const el of scenes) {
      const r = el.getBoundingClientRect();
      if (r.top < mid && r.bottom > mid) return SCENES[el.dataset.bg] || SCENES.ink;
    }
    return SCENES.light;
  };

  /* ---------- the logo as a constellation: towers, roofs and the swoosh, hung from the north star ---------- */
  const P = [[69, 429], [69, 269], [126, 235], [126, 409], [146, 286], [146, 172], [237, 116], [237, 380], [257, 376], [257, 182], [296, 155], [322, 171], [322, 367], [342, 366], [342, 236], [393, 267], [393, 366], [200, 397], [323, 386]];
  const E = [[6, 5], [5, 4], [6, 7], [10, 9], [9, 8], [10, 11], [11, 12], [2, 1], [1, 0], [2, 3], [15, 14], [14, 13], [15, 16], [0, 17], [17, 18], [18, 16], [7, 17], [12, 18], [3, 0]];
  const edges = new Float32Array(19 * 4);
  const layoutConst = (asp) => {
    const s = .36 / 410 * Math.min(1, asp / 1.3);
    E.forEach(([a, b], i) => {
      edges.set([(P[a][0] - 266) * s, -(P[a][1] - 75) * s, (P[b][0] - 266) * s, -(P[b][1] - 75) * s], i * 4);
    });
  };
  // drawn while a night section crosses the screen, erased when the day comes back
  const constTarget = () => {
    const vh = window.innerHeight;
    let v = 0;
    for (const el of scenes) {
      const r = el.getBoundingClientRect();
      if (r.bottom < vh * .2 || r.top > vh * .8) continue;
      v = Math.max(v, Math.min(1, Math.max(0, (vh * .85 - r.top) / Math.min(r.height * .55, vh * 1.1))));
    }
    return v;
  };
  let constV = 0;

  const container = document.querySelector('.container');
  let content = .8; let scale = 1; let quality = 1;
  const resize = () => {
    // stars need a sharp canvas, but never more than ~1.3 device px per css px;
    // 'quality' drops by itself on slower machines
    scale = Math.min(window.devicePixelRatio || 1, 1.5) * (window.innerWidth < 760 ? .7 : .85) * quality;
    canvas.width = Math.max(1, Math.round(window.innerWidth * scale));
    canvas.height = Math.max(1, Math.round(window.innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    const cw = container ? Math.min(container.getBoundingClientRect().width, window.innerWidth) : window.innerWidth * .8;
    content = Math.min(1, cw / window.innerWidth);
    layoutConst(canvas.width / canvas.height);
  };
  resize();
  window.addEventListener('resize', resize);

  const mouse = [.5, .5]; const mT = [.5, .5];
  window.addEventListener('pointermove', (e) => { mT[0] = e.clientX / window.innerWidth; mT[1] = 1 - e.clientY / window.innerHeight; }, { passive: true });

  let running = true; let last = 0; let scrollS = 0; let avgDt = .03; let lastQ = 0; const t0 = performance.now();
  const lerp = (a, b, k) => a + (b - a) * k;
  const frame = (now) => {
    if (!running) return;
    requestAnimationFrame(frame);
    if (choice === 'off') return;
    if (now - last < 28) return;
    const dt = Math.min(.1, (now - (last || now)) / 1000) || .016;
    last = now;
    const k = (rate) => 1 - Math.exp(-dt * rate);
    // adaptive resolution: keep the background smooth on any machine
    avgDt = lerp(avgDt, dt, .05);
    if (avgDt > .045 && quality > .5 && now - lastQ > 1200) { quality *= .85; lastQ = now; resize(); }
    else if (avgDt < .03 && quality < 1 && now - lastQ > 4000) { quality = Math.min(1, quality * 1.1); lastQ = now; resize(); }
    const sc = targetScene();
    ['base', 'a', 'b'].forEach((key) => { for (let i = 0; i < 3; i++) cur[key][i] = lerp(cur[key][i], sc[key][i], k(2.4)); });
    cur.dark = lerp(cur.dark, sc.dark, k(2.4));
    cur.dusk = lerp(cur.dusk, sc.dusk, k(2.4));
    scrollS = lerp(scrollS, window.scrollY / window.innerHeight, k(5));
    mouse[0] = lerp(mouse[0], mT[0], k(3)); mouse[1] = lerp(mouse[1], mT[1], k(3));
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
    gl.uniform1f(U.uTime, (now - t0) / 1000);
    gl.uniform1f(U.uScroll, scrollS);
    gl.uniform1f(U.uDark, cur.dark);
    gl.uniform1f(U.uDusk, cur.dusk);
    gl.uniform1f(U.uContent, content);
    gl.uniform1f(U.uPx, 1 / canvas.height);
    gl.uniform3fv(U.uBase, cur.base); gl.uniform3fv(U.uA, cur.a); gl.uniform3fv(U.uB, cur.b);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    gl.uniform1f(U.uSun, max > 0 ? scrollS * window.innerHeight / max : 0);
    constV = lerp(constV, constTarget(), k(constTarget() > constV ? 1.6 : 4));
    gl.uniform1f(U.uConst, constV);
    gl.uniform4fv(U.uEdge, edges);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) requestAnimationFrame(frame); });

  /* ---------- on / off (Lab: compare with the original background) ---------- */
  const sw = document.createElement('div');
  sw.className = 'bgfx-switch'; sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Fond animé');
  sw.innerHTML = '<span>Fond</span><button type="button" data-bg-mode="sky">Jour / nuit</button><button type="button" data-bg-mode="off">Aucun</button>';
  document.body.appendChild(sw);
  const apply = () => {
    html.classList.toggle('has-bgfx', choice !== 'off');
    canvas.hidden = choice === 'off';
    sw.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x.dataset.bgMode === choice));
  };
  apply();
  sw.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bg-mode]');
    if (!b) return;
    choice = b.dataset.bgMode;
    try { sessionStorage.setItem('aivelo-bg', choice); } catch (err) { /* storage blocked */ }
    apply();
  });
})();
