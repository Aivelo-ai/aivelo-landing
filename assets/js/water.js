/* ==========================================================================
   AIVELO — « Méthode » : liquide (test, variante verre 3D uniquement)
   A glossy liquid stream, drawn in a WebGL fragment shader (signed distance
   fields merged with smooth-min, shaded with specular, fresnel rim, moving
   caustics and a soft glow). Driven by the scroll, both ways:
   - the stream flows down the timeline, a drop leading its front;
   - reaching a step, it swells into a bead with a splash;
   - at the end it pools, and « Projet livré » appears.
   Active only with <html data-hero="3d"> (or #logo-3d), motion allowed,
   GSAP and WebGL available. Otherwise the regular rail stays untouched.
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
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) return;

  html.classList.add('water');
  timeline.insertBefore(canvas, timeline.firstChild);

  const basin = document.createElement('div');
  basin.className = 'w-basin';
  basin.setAttribute('aria-hidden', 'true');
  basin.innerHTML = '<span class="w-done"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Projet livré</span>';
  timeline.appendChild(basin);

  const steps = Array.from(timeline.querySelectorAll('.step'));
  const MAX_DOTS = 6;

  /* ---------- shader ---------- */
  const vert = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';
  const frag = `
    precision highp float;
    uniform vec2 uRes;      // canvas size in device px
    uniform float uDpr;
    uniform float uTime;
    uniform float uFront;   // y of the stream front (css px, from canvas top)
    uniform float uCx;      // x of the stream axis
    uniform vec4 uDots[${MAX_DOTS}]; // x, y, wet 0..1, splash age 0..1 (>=1 = none)
    uniform vec3 uPool;     // x, y, amount 0..1

    float smin(float a, float b, float k){ float h = clamp(.5 + .5 * (b - a) / k, 0., 1.); return mix(b, a, h) - k * h * (1. - h); }

    float scene(vec2 p){
      float t = uTime;
      float d = 1e4;
      if (uFront > -10.) {
        float yy = clamp(p.y, -30., uFront);
        float r = 6.4 + 1.1 * sin(yy * .07 - t * 3.1) + .6 * sin(yy * .021 + t * 1.3);
        vec2 q = vec2(uCx + sin(yy * .04 - t * 1.8) * 2.2, yy);
        d = length(p - q) - r;
        // leading drop
        vec2 head = vec2(uCx + sin(uFront * .04 - t * 1.8) * 2.2, uFront + 4. + sin(t * 3.4) * 1.4);
        d = smin(d, length((p - head) * vec2(1., .84)) - 10.5, 10.);
        // a drip falling ahead of the front, until the pool is reached
        float k = fract(t * .55);
        float drip = step(4., uFront) * step(uFront, uPool.y - 50.);
        d = smin(d, length(p - vec2(uCx, uFront + 14. + k * k * 70.)) - 3.4 * (1. - k) * drip - (1. - drip) * -50., 7.);
      }
      for (int i = 0; i < ${MAX_DOTS}; i++) {
        vec4 dt = uDots[i];
        if (dt.z > .001) {
          float wob = 1. + .06 * sin(t * 4. + float(i) * 1.7);
          d = smin(d, length(p - dt.xy) - 14. * dt.z * wob, 11.);
        }
        if (dt.w < 1.) { // splash: two droplets thrown out and falling back
          float a = dt.w;
          float rr = 3.6 * (1. - a);
          vec2 o = vec2(16. + a * 24., -a * 34. + a * a * 46.);
          d = min(d, length(p - dt.xy - o) - rr);
          d = min(d, length(p - dt.xy - o * vec2(-1., 1.)) - rr * .8);
        }
      }
      if (uPool.z > .001) {
        vec2 ab = vec2(46., 12.) * (.25 + .75 * uPool.z);
        vec2 q = (p - uPool.xy) / ab;
        float e = (length(q) - 1.) * min(ab.x, ab.y);
        e += .9 * sin(p.x * .12 + uTime * 2.2) * uPool.z; // surface ripple
        d = smin(d, e, 16.);
      }
      return d;
    }

    void main(){
      vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
      float d = scene(p);
      float ds = scene(p - vec2(3., 7.));
      if (d > 34. && ds > 20.) { gl_FragColor = vec4(0.); return; }
      float e = .8;
      vec2 g = vec2(scene(p + vec2(e, 0.)) - scene(p - vec2(e, 0.)), scene(p + vec2(0., e)) - scene(p - vec2(0., e)));
      float h = smoothstep(0., 8., -d);
      vec3 n = normalize(vec3(-g * (1. - h) * 1.6, .55 + h * .9));
      n.y = -n.y; // screen y points down
      vec3 L = normalize(vec3(-.45, .65, .9));
      float diff = clamp(dot(n, L), 0., 1.);
      float spec = pow(clamp(dot(reflect(-L, n), vec3(0., 0., 1.)), 0., 1.), 48.);
      float spec2 = pow(clamp(dot(reflect(-normalize(vec3(.6, -.3, .8)), n), vec3(0., 0., 1.)), 0., 1.), 22.) * .35;
      float fres = pow(1. - clamp(n.z, 0., 1.), 2.2);

      vec3 deep = vec3(.05, .14, .55);
      vec3 mid  = vec3(.22, .44, 1.);
      vec3 rim  = vec3(.70, .84, 1.);
      vec3 col = mix(deep, mid, smoothstep(.05, .95, diff));
      col = mix(col, rim, fres * .8);
      col *= .82 + .18 * smoothstep(-14., 0., d); // denser core, lighter edges
      // moving caustics inside the liquid
      float c = sin(p.y * .13 - uTime * 3.6 + sin(p.x * .35 + uTime * 1.3) * 2.4) * .5 + .5;
      col += vec3(.35, .45, .6) * pow(c, 7.) * h * .55;
      // thin iridescent edge
      col += vec3(.55, .25, .9) * smoothstep(.0, -2.5, d) * (1. - smoothstep(-2.5, -5., d)) * .18;
      col += vec3(1.) * (spec * 1.1 + spec2);

      float alpha = 1. - smoothstep(-.9, .9, d);
      float glow = exp(-max(d, 0.) / 10.) * .16 * (1. - alpha);
      float shadow = (1. - smoothstep(-4., 12., ds)) * .22 * (1. - alpha);
      vec3 gcol = vec3(.31, .49, .97);
      vec3 scol = vec3(.08, .14, .40);
      gl_FragColor = vec4(col * alpha + gcol * glow + scol * shadow, alpha + glow + shadow);
    }`;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.error(err);
    canvas.remove(); basin.remove(); html.classList.remove('water');
    return;
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const u = { res: U('uRes'), dpr: U('uDpr'), time: U('uTime'), front: U('uFront'), cx: U('uCx'), dots: U('uDots'), pool: U('uPool') };
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  /* ---------- layout (measured, not per frame) ---------- */
  const L = { cx: 0, dots: [], poolY: 0, h: 0 };
  let dpr = 1;
  const layout = () => {
    const tr = timeline.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cr.width * dpr);
    canvas.height = Math.round(cr.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    // offsets, not bounding boxes: entry animations translate the steps while we measure
    const ox = -canvas.offsetLeft, oy = -canvas.offsetTop;
    L.dots = steps.map((s) => {
      const d = s.querySelector('.step-dot');
      return { x: s.offsetLeft + d.offsetLeft + d.offsetWidth / 2 + ox, y: s.offsetTop + d.offsetTop + d.offsetHeight / 2 + oy };
    });
    L.cx = L.dots.length ? L.dots[0].x : cr.width / 2;
    L.poolY = basin.offsetTop + oy + 70;
    L.h = cr.height;
    void tr;
  };
  layout();
  window.addEventListener('resize', layout);
  if (document.fonts) document.fonts.ready.then(layout);
  ScrollTrigger.addEventListener('refresh', layout);

  /* ---------- scroll → target front ---------- */
  let target = -40;
  ScrollTrigger.create({
    trigger: timeline, start: 'top 62%', end: 'bottom 62%',
    onUpdate: (self) => { target = -40 + self.progress * (L.poolY + 40); },
  });

  const state = { front: -40, wet: steps.map(() => 0), splashAt: steps.map(() => -1e9), pool: 0 };
  const done = basin.querySelector('.w-done');
  const dotArr = new Float32Array(MAX_DOTS * 4);

  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '200px 0px' }).observe(timeline);

  const start = performance.now();
  let last = start;
  const frame = (now) => {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible || document.hidden) return;

    // fluid, slightly lagging front
    state.front += (target - state.front) * (1 - Math.pow(0.0025, dt));

    L.dots.forEach((d, i) => {
      const reached = state.front > d.y - 2;
      const was = state.wet[i] > 0.5;
      const goal = reached ? 1 : 0;
      state.wet[i] += (goal - state.wet[i]) * (1 - Math.pow(0.004, dt));
      if (reached && !was && state.wet[i] > 0.5) state.splashAt[i] = now;
      steps[i].classList.toggle('is-wet', reached);
    });
    const poolGoal = gsap.utils.clamp(0, 1, (state.front - (L.poolY - 70)) / 62);
    state.pool += (poolGoal - state.pool) * (1 - Math.pow(0.01, dt));
    done.classList.toggle('is-on', state.pool > 0.85);

    for (let i = 0; i < MAX_DOTS; i++) {
      const d = L.dots[i];
      dotArr.set(d ? [d.x, d.y, state.wet[i], Math.min(1, (now - state.splashAt[i]) / 750)] : [0, 0, 0, 1], i * 4);
    }
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.dpr, dpr);
    gl.uniform1f(u.time, (now - start) / 1000);
    gl.uniform1f(u.front, state.front);
    gl.uniform1f(u.cx, L.cx);
    gl.uniform4fv(u.dots, dotArr);
    gl.uniform3f(u.pool, L.cx, L.poolY, state.pool);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  requestAnimationFrame(frame);
  ScrollTrigger.refresh();
})();
