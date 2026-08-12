// Art room: a real 3D spiral around a DNA-like rope (three.js, bundled).
// Scroll rotates the camera around the axis and lifts it along the rope; the pointer can nudge it.
// Cards are rendered with CSS3D, so they stay live DOM with working author links.
// The rope is drawn by a WebGL layer that sits BELOW the card layer, so the strands
// are never painted on top of the artwork.

import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Quaternion,
  RepeatWrapping,
  Scene,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import { onCleanup, onScroll, reducedMotion } from './runtime';

// Cards are laid out LARGE (640px) and scaled down by the scene, so text and poster
// stay crisp — the browser downscales the layer instead of upscaling it.
const CARD_PX = 640;
const SCALE = 0.0048; // px -> world units: a card is ~3.07 units wide
const R_ORBIT = 4.3; // orbit radius; the card (3.06) is clearly narrower than it
const R_ROPE = 0.95; // radius of the rope itself
const GAP = 2.45; // vertical rise between neighbouring cards
const STEP = 1.04; // rotation between neighbouring cards, radians
const R_SAT = 4.62; // satellites sit AROUND their station, slightly further from the axis
const R_CAM = 10.1; // camera distance from the axis

const R_FOCUS = 5.6; // how close a focused card comes to the camera

/**
 * Rope mood. The whole environment shifts together — scene, background and rope share one
 * mood. Only restrained properties change: hue, glow strength, rung behaviour. The
 * construction itself never changes.
 */
export interface RopeMood {
  warm: string; // colour of the warm (human) strand
  cold: string; // colour of the digital strand
  glow: number; // halo strength around the warm strand
  rung: number; // rung brightness
  pulse: number; // how strongly the rungs breathe
  rate: number; // how fast they breathe
}

export interface Spiral3D {
  progress(): number;
  webgl(): boolean;
  /** Index of the station currently in front of the camera; -1 until resolved. */
  station(): number;
  /** Subscribe to station changes (the scene uses this). */
  onStation(fn: (i: number) => void): void;
  /** Free-flight mode: no snapping, the view can be dragged anywhere. */
  setFree(on: boolean): void;
  /** Pull a card towards the camera (pass null to release it). */
  focus(el: HTMLElement | null): void;
  /** Recolour the rope to match the station's mood. */
  setMood(mood: RopeMood): void;
}

/**
 * WebGL availability probe. Uses a SEPARATE canvas: asking the real canvas would lock in a
 * context type and three could no longer request its own (with alpha).
 * Without WebGL the room still works — cards live in CSS3D and a CSS fallback draws the rope.
 */
function hasWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    return !!(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch (e) {
    return false;
  }
}

/**
 * Binary digits running along the digital strand. Both strands must keep their own
 * identity: warm/human and digital.
 *
 * NOTE: on TubeGeometry uv.x runs ALONG the tube and uv.y runs AROUND it. An earlier
 * texture was 64x512 with the digits laid out ACROSS the canvas height and repeat(1, 6):
 * the digits wrapped around the strand six times while being stretched over its whole
 * length, which read on screen as a uniform smear.
 *
 * Now the digits sit IN A ROW ALONG the strand (texture x axis), each rotated 90 degrees so
 * it reads upright on the tube, and repeat tiles the strip along the length.
 */
const BITS_PER_TILE = 24;

function bitsTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024; // ALONG the strand
  c.height = 128; // AROUND the strand
  const g = c.getContext('2d');
  if (g) {
    g.fillStyle = '#000';
    g.fillRect(0, 0, c.width, c.height);
    g.font = 'bold 56px ui-monospace, monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const cell = c.width / BITS_PER_TILE;
    for (let i = 0; i < BITS_PER_TILE; i += 1) {
      g.save();
      g.translate(i * cell + cell / 2, c.height / 2);
      // rotate 90 degrees, otherwise the digit lies sideways on the tube
      g.rotate(-Math.PI / 2);
      g.fillStyle = i % 3 === 0 ? '#bff8f0' : '#6fe6d4';
      g.fillText(Math.random() > 0.5 ? '1' : '0', 0, 0);
      g.restore();
    }
  }
  const t = new CanvasTexture(c);
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  // the digit strip tiles ALONG the strand; exactly one wrap around it
  t.repeat.set(3, 1);
  return t;
}

function helixCurve(phase: number, from: number, to: number): CatmullRomCurve3 {
  const pts: Vector3[] = [];
  for (let y = from; y <= to; y += 0.5) {
    const a = y * 0.62 + phase;
    pts.push(new Vector3(Math.sin(a) * R_ROPE, y, Math.cos(a) * R_ROPE));
  }
  return new CatmullRomCurve3(pts);
}

/**
 * Dust along the rope, so depth reads even where there are no cards.
 * The cloud is deliberately wide: when it hugged the axis, the edges of the frame were
 * left as empty blackness.
 */
function dust(from: number, to: number): Points {
  const g = new BufferGeometry();
  const pos: number[] = [];
  for (let i = 0; i < 1100; i += 1) {
    const a = Math.random() * Math.PI * 2;
    // sqrt of a uniform sample, otherwise points bunch near the axis and the rim stays bare
    const r = 1.6 + Math.sqrt(Math.random()) * 15;
    pos.push(Math.sin(a) * r, from + Math.random() * (to - from), Math.cos(a) * r);
  }
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  const m = new PointsMaterial({
    // Dust is kept dim: it still carries depth, but no longer shimmers distractingly.
    size: 0.04,
    color: new Color(0.62, 0.93, 0.9),
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  return new Points(g, m);
}

/**
 * Distant ghost cards: empty frames at a large radius. They carry no content — they are
 * depth filler, not exhibits. Without them the edges of the frame were black.
 */
function ghostCards(top: number): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (let i = 0; i < 14; i += 1) {
    const el = document.createElement('div');
    el.className = 'card3d ghost';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="ghost-frame"><i class="ghost-sprocket"></i><i class="ghost-shot"></i><i class="ghost-sprocket"></i></div>';
    out.push(el);
  }
  void top;
  return out;
}

export function startSpiral3D(
  host: HTMLElement,
  glCanvas: HTMLCanvasElement,
  cssHost: HTMLElement,
  spacer: HTMLElement,
  stations: HTMLElement[],
  /** Satellites are GROUPED BY STATION: each station has its own constellation of sources. */
  clusters: HTMLElement[][],
): Spiral3D {
  const cards = stations;
  const scene = new Scene();
  const cssScene = new Scene();
  const camera = new PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 220);

  const canDraw = hasWebGL();
  // Cheap rope: no antialiasing and always 1:1 pixel ratio. On software rendering
  // (which some visitors get) every extra pixel costs seconds per frame.
  const gl = canDraw ? new WebGLRenderer({ canvas: glCanvas, alpha: true, antialias: false }) : null;
  if (gl) gl.setPixelRatio(1);
  else host.classList.add('no-webgl');

  const css = new CSS3DRenderer();
  css.domElement.className = 'css3d';
  cssHost.appendChild(css.domElement);

  const topY = (cards.length - 1) * GAP;
  const rope = new Group();

  // warm strand — the human one: thick and lively
  const warm = new Mesh(
    new TubeGeometry(helixCurve(0, -8, topY + 8), 320, 0.085, 10, false),
    new MeshBasicMaterial({
      color: new Color('#ffb26c'),
      transparent: true,
      opacity: 0.85,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const warmGlow = new Mesh(
    new TubeGeometry(helixCurve(0, -8, topY + 8), 160, 0.24, 8, false),
    new MeshBasicMaterial({
      color: new Color('#ff8c3c'),
      transparent: true,
      opacity: 0.16,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  // cold strand — the digital one: zeroes and ones scroll along it
  const bits = bitsTexture();
  const cold = new Mesh(
    new TubeGeometry(helixCurve(Math.PI, -8, topY + 8), 420, 0.11, 12, false),
    new MeshBasicMaterial({
      map: bits,
      color: new Color('#8df5e8'),
      transparent: true,
      opacity: 0.95,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  rope.add(warmGlow, warm, cold);

  // rungs between the strands — they hold the two together
  const rungGeo = new CylinderGeometry(0.018, 0.018, 1, 6);
  const rungMat = new MeshBasicMaterial({
    color: new Color('#cfe9ff'),
    transparent: true,
    opacity: 0.36,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const rungCount = Math.max(8, Math.round((topY + 16) / 0.62));
  const rungs = new InstancedMesh(rungGeo, rungMat, rungCount);
  const dummy = new Object3D();
  const up = new Vector3(0, 1, 0);
  const q = new Quaternion();
  for (let i = 0; i < rungCount; i += 1) {
    const y = -8 + i * 0.62;
    const a = y * 0.62;
    const p1 = new Vector3(Math.sin(a) * R_ROPE, y, Math.cos(a) * R_ROPE);
    const p2 = new Vector3(-p1.x, y, -p1.z);
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    const dir = p2.clone().sub(p1);
    dummy.position.copy(mid);
    q.setFromUnitVectors(up, dir.clone().normalize());
    dummy.quaternion.copy(q);
    dummy.scale.set(1, dir.length(), 1);
    dummy.updateMatrix();
    rungs.setMatrixAt(i, dummy.matrix);
  }
  rungs.instanceMatrix.needsUpdate = true;
  rope.add(rungs);

  // Faint outer coils that populate the emptiness. Thin strands at a larger radius run off
  // the edge of the frame and cross the black margins, so the room reads as continuing
  // beyond the central helix.
  const halos: Mesh[] = [];
  const halo = (radius: number, phase: number, color: string, opacity: number): void => {
    const pts: Vector3[] = [];
    for (let y = -10; y <= topY + 10; y += 0.6) {
      const a = y * 0.34 + phase;
      pts.push(new Vector3(Math.sin(a) * radius, y, Math.cos(a) * radius));
    }
    const m = new Mesh(
      new TubeGeometry(new CatmullRomCurve3(pts), 260, 0.028, 6, false),
      new MeshBasicMaterial({
        color: new Color(color),
        transparent: true,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    halos.push(m);
    scene.add(m);
  };
  halo(6.4, 0.6, '#7fd9ff', 0.1);
  halo(8.9, 2.3, '#ffb26c', 0.075);
  halo(11.6, 4.1, '#8df5e8', 0.05);

  scene.add(rope);
  scene.add(dust(-10, topY + 10));

  // Stations — the main objects on the coil: live interactive panels
  const objs: CSS3DObject[] = stations.map((el, i) => {
    const a = i * STEP;
    const o = new CSS3DObject(el);
    o.position.set(Math.sin(a) * R_ORBIT, i * GAP, Math.cos(a) * R_ORBIT);
    o.rotation.y = a;
    o.scale.setScalar(SCALE);
    cssScene.add(o);
    return o;
  });

  // Satellites — the source cards. They are placed as a CLUSTER AROUND THEIR STATION rather
  // than scattered across the whole spiral, so one scroll stop shows a station AND its
  // sources in the same frame.
  const sats: Array<{
    o: CSS3DObject;
    el: HTMLElement;
    a: number;
    r: number;
    base: number;
    ph: number;
    /** how far the card is currently pulled towards the camera, 0..1 */
    f: number;
  }> = [];
  clusters.forEach((group, i) => {
    const own = i * STEP;
    const m = group.length;
    group.forEach((el, j) => {
      // spread along an arc around the station: half to the left, half to the right
      const side = (j - (m - 1) / 2) * (m > 1 ? 1 : 0);
      const a = own + (side >= 0 ? 0.56 : -0.56) + side * 0.16;
      const r = R_SAT + (j % 2) * 0.5;
      const base = i * GAP + (j % 2 ? 1.35 : -1.28) + (j > 1 ? 0.35 : 0);
      const o = new CSS3DObject(el);
      o.position.set(Math.sin(a) * r, base, Math.cos(a) * r);
      o.rotation.y = a;
      o.scale.setScalar(SCALE);
      cssScene.add(o);
      sats.push({ o, el, a, r, base, ph: (i * 3 + j) * 1.7, f: 0 });
    });
  });

  // Distant ghosts — they populate the emptiness without pretending to be exhibits
  const ghosts = ghostCards(topY).map((el, j) => {
    const a = j * 1.31 + 0.4;
    // IMPORTANT: this radius MUST stay below R_CAM. CSS3D has no near clipping plane, so
    // anything that passes behind the camera is stretched across tens of thousands of pixels.
    const r = 5.6 + (j % 4) * 0.62;
    const y = -4 + (j / 14) * (topY + 8) + (j % 3) * 0.6;
    const o = new CSS3DObject(el);
    o.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    o.rotation.y = a;
    o.scale.setScalar(SCALE * (0.85 + (j % 3) * 0.22));
    cssScene.add(o);
    return { o, a, base: y, ph: j * 2.1 };
  });

  /** Wrap an angle into -PI..PI so "behind" and "in front" are never confused. */
  function wrap(x: number): number {
    let v = x;
    while (v > Math.PI) v -= Math.PI * 2;
    while (v < -Math.PI) v += Math.PI * 2;
    return v;
  }

  const MAX_TILT = 0.55; // ~31 degrees: a card always faces the viewer, never showing its back

  let drag = 0;
  let dragTarget = 0;
  let progress = 0;
  // free-flight mode: no snapping, dragging works sideways and vertically
  let free = false;
  let lift = 0;
  let liftTarget = 0;
  let stationNow = -1;
  const stationFns: Array<(i: number) => void> = [];
  // DOM node of the card currently pulled towards the camera
  let focusedEl: HTMLElement | null = null;

  // rope mood: the station sets the target and the rope EASES into it instead of switching
  const moodWarm = new Color('#ffb26c');
  const moodCold = new Color('#8df5e8');
  const wantWarm = new Color('#ffb26c');
  const wantCold = new Color('#8df5e8');
  let moodGlow = 0.16;
  let moodRung = 0.36;
  let wantGlow = 0.16;
  let wantRung = 0.36;
  let moodPulse = 0.05;
  let moodRate = 0.0006;

  // Progress is measured against the scroll WELL rather than the whole page, so each
  // floor's scroll-snap point lines up exactly with a station.
  const readScroll = (): void => {
    const top = spacer.offsetTop;
    const span = spacer.offsetHeight - window.innerHeight;
    const y = (window.scrollY || 0) - top;
    // the room reads bottom-up: the base of the well is the start of the coil
    progress = span > 4 ? 1 - Math.min(1, Math.max(0, y / span)) : 0;
  };

  const resize = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (gl) gl.setSize(w, h);
    css.setSize(w, h);
  };
  resize();
  window.addEventListener('resize', resize);
  onScroll(readScroll);

  // pointer nudging, deliberately without setPointerCapture: it breaks real link clicks
  let px = 0;
  let py = 0;
  let dragging = false;
  let moved = 0;
  const onDown = (ev: PointerEvent): void => {
    const t = ev.target as HTMLElement | null;
    // stations are interactive: dragging must not start on them or the click never lands
    if (t && (t.closest('a') || t.closest('.station') || t.closest('button'))) return;
    dragging = true;
    moved = 0;
    px = ev.clientX;
    py = ev.clientY;
    host.classList.add('grabbing');
  };
  const onMove = (ev: PointerEvent): void => {
    if (!dragging) return;
    const dx = ev.clientX - px;
    const dy = ev.clientY - py;
    px = ev.clientX;
    py = ev.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    dragTarget -= dx * 0.005;
    // in free flight the pointer also lifts the camera, so the room stops being a rail
    if (free) liftTarget = Math.max(-topY * 0.6, Math.min(topY * 0.6, liftTarget + dy * 0.012));
  };
  const onUp = (): void => {
    if (!dragging) return;
    dragging = false;
    host.classList.remove('grabbing');
    if (moved > 8) {
      const kill = (e: Event): void => {
        e.preventDefault();
        e.stopPropagation();
      };
      window.addEventListener('click', kill, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener('click', kill, true), 60);
    }
  };
  host.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  const still = reducedMotion();
  const eye = new Vector3();
  const look = new Vector3();
  const fwd = new Vector3();
  let raf = 0;

  // Safety valve. Some visitors have no GPU: the browser rasterises the page in software and
  // a fullscreen WebGL layer on top of everything kills the tab (measured at 0.1 fps and a
  // crash). Measure REAL frame time for the first two seconds; if it is bad, drop the WebGL
  // rope and let the room run on CSS3D with the CSS fallback rope, which stays scrollable.
  const WATCH_MS = 2000; // observation window
  const SLOW_FRAME_MS = 40; // above this the room no longer scrolls smoothly
  const STALL_MS = 1500; // no frame for this long means the tab is choking; stop waiting
  let glOff = false;
  let watching = gl !== null;
  let watchFrom = 0;
  let frames = 0;
  let lastFrame = 0;

  const dropWebGL = (): void => {
    if (glOff) return;
    glOff = true;
    watching = false;
    host.classList.add('no-webgl');
    glCanvas.style.display = 'none';
    if (gl) gl.dispose();
  };

  // A second watchdog on a timer: it keeps ticking even when frames stop arriving.
  // Without it we would only learn about the problem after the first multi-second frame
  // finally completed.
  if (gl) {
    let guard = 0;
    guard = window.setInterval(() => {
      if (!watching) {
        window.clearInterval(guard);
        return;
      }
      if (document.hidden || !lastFrame) return;
      if (performance.now() - lastFrame > STALL_MS) dropWebGL();
    }, 300);
    onCleanup(() => window.clearInterval(guard));
  }

  const frame = (now: number): void => {
    raf = window.requestAnimationFrame(frame);
    if (document.hidden) return;
    if (watching) {
      if (!watchFrom) watchFrom = lastFrame || now;
      frames += 1;
      const span = now - watchFrom;
      if (span > WATCH_MS && frames >= 3) {
        if (span / frames > SLOW_FRAME_MS) dropWebGL();
        else watching = false; // the machine keeps up, the watchdog is no longer needed
      }
      lastFrame = now;
    }
    draw(now);
  };

  const draw = (now: number): void => {
    drag += (dragTarget - drag) * 0.12;
    lift += (liftTarget - lift) * 0.1;
    const turn = progress * (cards.length - 1) * STEP + drag;
    const y = progress * topY + lift;
    eye.set(Math.sin(turn) * R_CAM, y, Math.cos(turn) * R_CAM);
    look.set(0, y, 0);
    camera.position.copy(eye);
    camera.lookAt(look);

    // Which station we are at is derived from rotation, not scroll: in free flight the
    // scroll position stays put while the viewer still travels around the axis.
    const near = Math.max(0, Math.min(cards.length - 1, Math.round(turn / STEP)));
    if (near !== stationNow) {
      stationNow = near;
      stationFns.forEach((fn) => fn(near));
    }

    // A station sits on the coil but never shows its back: it is turned towards the camera,
    // keeping just enough tilt for depth to read.
    for (let i = 0; i < objs.length; i += 1) {
      const own = i * STEP;
      const d = wrap(own - turn);
      objs[i].rotation.y = turn + Math.max(-MAX_TILT, Math.min(MAX_TILT, d));
    }
    // Card focus: a point directly in front of the camera is the destination the selected
    // card travels to, while the rest stay where they are.
    fwd.copy(look).sub(eye).normalize();
    const fx = eye.x + fwd.x * R_FOCUS;
    const fy = eye.y + fwd.y * R_FOCUS;
    const fz = eye.z + fwd.z * R_FOCUS;

    for (let i = 0; i < sats.length; i += 1) {
      const s0 = sats[i];
      const want = s0.el === focusedEl ? 1 : 0;
      s0.f += (want - s0.f) * (still ? 1 : 0.13);
      const k = s0.f;
      const d = wrap(s0.a - turn);
      const floatY = still ? 0 : Math.sin(now * 0.00042 + s0.ph) * 0.26;
      if (k < 0.002) {
        s0.o.position.set(Math.sin(s0.a) * s0.r, s0.base + floatY, Math.cos(s0.a) * s0.r);
        s0.o.rotation.y = turn + Math.max(-MAX_TILT, Math.min(MAX_TILT, d));
        if (!still) s0.o.rotation.z = Math.sin(now * 0.00031 + s0.ph) * 0.035;
        continue;
      }
      const bx = Math.sin(s0.a) * s0.r;
      const bz = Math.cos(s0.a) * s0.r;
      s0.o.position.set(
        bx + (fx - bx) * k,
        s0.base + floatY + (fy - (s0.base + floatY)) * k,
        bz + (fz - bz) * k,
      );
      // once fully pulled in, the card stops tilting and faces the camera head-on
      s0.o.rotation.y = turn + Math.max(-MAX_TILT, Math.min(MAX_TILT, d)) * (1 - k);
      s0.o.rotation.z = still ? 0 : Math.sin(now * 0.00031 + s0.ph) * 0.035 * (1 - k);
    }

    for (let i = 0; i < ghosts.length; i += 1) {
      const g0 = ghosts[i];
      const d = wrap(g0.a - turn);
      g0.o.rotation.y = turn + Math.max(-MAX_TILT, Math.min(MAX_TILT, d));
      if (!still) g0.o.position.y = g0.base + Math.sin(now * 0.00026 + g0.ph) * 0.4;
    }

    if (!still) {
      rope.rotation.y = now * 0.00006;
      bits.offset.x = -now * 0.00004;
    }

    // Mood: the rope eases into the station's colour together with the scene and background
    moodWarm.lerp(wantWarm, 0.03);
    moodCold.lerp(wantCold, 0.03);
    moodGlow += (wantGlow - moodGlow) * 0.03;
    moodRung += (wantRung - moodRung) * 0.03;
    (warm.material as MeshBasicMaterial).color.copy(moodWarm);
    (warmGlow.material as MeshBasicMaterial).color.copy(moodWarm);
    (warmGlow.material as MeshBasicMaterial).opacity = moodGlow;
    (cold.material as MeshBasicMaterial).color.copy(moodCold);
    // rungs breathe differently at each station — that is the "behaviour" part of the mood
    rungMat.opacity = Math.max(
      0.05,
      moodRung + (still ? 0 : Math.sin(now * moodRate) * moodPulse),
    );

    if (gl && !glOff) gl.render(scene, camera);
    css.render(cssScene, camera);
  };

  // Mount synchronously rather than from rAF: in a background tab rAF never ticks and the
  // room would not assemble at all (CSS3D attaches the cards to the document on render).
  draw(performance.now());
  lastFrame = performance.now(); // gives the watchdog a baseline before the first frame
  raf = window.requestAnimationFrame(frame);

  // tab became visible again: resume immediately instead of waiting on the frame scheduler
  const onVisible = (): void => {
    if (document.hidden) return;
    window.cancelAnimationFrame(raf);
    readScroll();
    draw(performance.now());
    // time spent in the background is not the machine's fault: restart the measurement
    watchFrom = 0;
    frames = 0;
    lastFrame = performance.now();
    raf = window.requestAnimationFrame(frame);
  };
  document.addEventListener('visibilitychange', onVisible);

  onCleanup(() => {
    window.cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('resize', resize);
    host.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    objs.forEach((o) => cssScene.remove(o));
    sats.forEach((s0) => cssScene.remove(s0.o));
    ghosts.forEach((g0) => cssScene.remove(g0.o));
    if (css.domElement.parentNode) css.domElement.parentNode.removeChild(css.domElement);
    warm.geometry.dispose();
    warmGlow.geometry.dispose();
    cold.geometry.dispose();
    halos.forEach((m) => m.geometry.dispose());
    rungGeo.dispose();
    bits.dispose();
    if (gl && !glOff) gl.dispose();
  });

  readScroll();
  return {
    progress: () => progress,
    webgl: () => canDraw,
    station: () => stationNow,
    onStation: (fn) => {
      stationFns.push(fn);
      if (stationNow >= 0) fn(stationNow);
    },
    setFree: (on: boolean) => {
      free = on;
      if (!on) liftTarget = 0;
    },
    focus: (el: HTMLElement | null) => {
      focusedEl = el;
    },
    setMood: (m: RopeMood) => {
      wantWarm.set(m.warm);
      wantCold.set(m.cold);
      wantGlow = m.glow;
      wantRung = m.rung;
      moodPulse = m.pulse;
      moodRate = m.rate;
    },
  };
}

/** Card width in pixels — needed by both the layout and the scene. */
export const CARD_WIDTH_PX = CARD_PX;
