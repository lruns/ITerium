// Interactive stations of the beauty room. The interactions are the main content;
// the exhibit cards only float alongside them.
// Stations: living ink (ASCII field), calendar-as-canvas (inspired by @jordan.gladman)
// and a blooming graph.
// NOTE: everything here is an original, simplified re-implementation — no third-party
// code is copied; the originals are credited with links instead.

import { authorChipHtml } from '../chrome';
import { onCleanup, reducedMotion } from '../runtime';

const INK = ' .·:-=+*#%@';

/* ------------------------------------ ink ----------------------------------- */

export function inkHtml(): string {
  return `<section class="station ink">
    <p class="station-cmd">$ ./ink --alive</p>
    <h3>чернила ещё не высохли</h3>
    <pre class="ink-field" id="ink-field" aria-hidden="true"></pre>
    <p class="station-note">буквы — не текст, а вещество. проведи по ним мышкой</p>
  </section>`;
}

/**
 * The ink leaves a trail. We keep a tail of recent pointer positions: each dab pulls
 * the substance toward itself and fades out slowly, so the hand leaves a stroke behind
 * instead of a single attraction point.
 */
interface InkDab {
  x: number;
  y: number;
  born: number;
  hard: number;
}

export function mountInk(root: ParentNode): void {
  const el = root.querySelector('#ink-field') as HTMLElement | null;
  if (!el) return;
  const W = 54;
  const H = 18;
  const LIFE = 2600; // dab lifetime, ms
  let mx = 0.5;
  let my = 0.5;
  let dabs: InkDab[] = [];
  let touched = false;

  const at = (ev: PointerEvent): { x: number; y: number } | null => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return {
      x: Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height)),
    };
  };
  const drop = (x: number, y: number, hard: number): void => {
    dabs.push({ x, y, born: performance.now(), hard });
    if (dabs.length > 90) dabs.shift();
  };
  const move = (ev: PointerEvent): void => {
    const p = at(ev);
    if (!p) return;
    mx = p.x;
    my = p.y;
    touched = true;
    drop(p.x, p.y, 1);
  };
  // a click drops a heavy blot, so the field reacts to taps and not only to movement
  const blot = (ev: PointerEvent): void => {
    const p = at(ev);
    if (!p) return;
    touched = true;
    for (let i = 0; i < 6; i += 1) drop(p.x, p.y, 2.4);
  };
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerdown', blot);

  const paint = (t: number): void => {
    dabs = dabs.filter((d) => t - d.born < LIFE);
    const rows: string[] = [];
    for (let y = 0; y < H; y += 1) {
      let line = '';
      for (let x = 0; x < W; x += 1) {
        const u = x / W;
        const v = y / H;
        const wave =
          Math.sin(u * 7 + t * 0.0007) * 0.5 +
          Math.sin(v * 9 - t * 0.0005) * 0.35 +
          Math.sin((u + v) * 11 + t * 0.0009) * 0.3;
        // trail: sum of every live dab, each weighted by its own age
        let pull = 0;
        for (let i = 0; i < dabs.length; i += 1) {
          const d = dabs[i];
          const age = 1 - (t - d.born) / LIFE;
          if (age <= 0) continue;
          const dist = Math.hypot(u - d.x, (v - d.y) * 1.7);
          pull += Math.exp(-dist * 9) * age * age * 0.55 * d.hard;
        }
        // before any input the substance still pulls toward the centre, so the idle
        // station stays alive
        if (!touched) pull += Math.exp(-Math.hypot(u - mx, (v - my) * 1.7) * 5) * 1.5;
        const k = Math.max(0, Math.min(0.999, (wave + Math.min(pull, 2.2) + 1.1) / 2.4));
        line += INK[Math.floor(k * INK.length)];
      }
      rows.push(line);
    }
    el.textContent = rows.join('\n');
  };

  if (reducedMotion()) {
    paint(0);
    return;
  }
  let raf = 0;
  const loop = (now: number): void => {
    if (!document.hidden) paint(now);
    raf = window.requestAnimationFrame(loop);
  };
  raf = window.requestAnimationFrame(loop);
  onCleanup(() => {
    window.cancelAnimationFrame(raf);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerdown', blot);
  });
}

/* -------------------------------- calendar ---------------------------------- */

const PICTURES: string[][] = [
  [
    '................',
    '.....xxx........',
    '....xxxxx.......',
    '...xxxxxxx..x...',
    '..xxxxxxxxxxx...',
    '...xxxxxxx..x...',
    '....xxxxx.......',
    '.....x.x........',
    '....xx.xx.......',
  ],
  [
    '................',
    '..xxx.....xxx...',
    '.xxxxx...xxxxx..',
    '.xxxxxxxxxxxxx..',
    '..xxxxxxxxxxx...',
    '...xxxxxxxxx....',
    '.....xxxxx......',
    '......xxx.......',
    '.......x........',
  ],
  [
    '................',
    '.........xxxx...',
    '........xxxxxx..',
    '.......xxxxxx...',
    '.....xx.xxx.....',
    '...xx...........',
    '..x.............',
    '.x..............',
    'x...............',
  ],
];

export function calendarHtml(): string {
  return `<section class="station cal">
    <p class="station-cmd">$ ./calendar --as=canvas</p>
    <h3>расписание как холст</h3>
    <div class="cal-grid" id="cal-grid"></div>
    <p class="station-note" id="cal-note">встречи проступают по одной — а ты закрашивай клетки сам, твои встречи дополнят картинку</p>
    ${authorChipHtml(
      'по мотивам работы @jordan.gladman',
      'instagram',
      'https://www.instagram.com/reel/DbBZDozOtz-/',
      'https://www.instagram.com/jordan.gladman/',
    )}
  </section>`;
}

export function mountCalendar(root: ParentNode): void {
  const grid = root.querySelector('#cal-grid') as HTMLElement | null;
  const note = root.querySelector('#cal-note') as HTMLElement | null;
  if (!grid) return;
  const W = PICTURES[0][0].length;
  const H = PICTURES[0].length;
  grid.style.setProperty('--cols', String(W));
  let html = '';
  for (let i = 0; i < W * H; i += 1) html += '<i></i>';
  grid.innerHTML = html;
  const cells = Array.from(grid.children) as HTMLElement[];

  let pic = 0;
  let order: number[] = [];
  let k = 0;

  const start = (): void => {
    const p = PICTURES[pic % PICTURES.length];
    order = [];
    for (let y = 0; y < H; y += 1) {
      for (let x = 0; x < W; x += 1) if (p[y][x] === 'x') order.push(y * W + x);
    }
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = order[i];
      order[i] = order[j];
      order[j] = t;
    }
    k = 0;
    // visitor-owned cells survive a picture change; only the generated ones are reset
    cells.forEach((c) => c.classList.remove('on'));
  };
  start();

  // Clicking a cell adds the visitor's own "meeting": those cells get a separate
  // colour and stay on top of whatever picture is currently drawing.
  let mine = 0;
  const MINE_WORDS = [
    'первая встреча в календаре. пиксель',
    'две встречи. уже композиция',
    'расписание становится холстом',
    'ты рисуешь неделей',
    'у художника это заняло тысячи встреч',
  ];
  grid.addEventListener('click', (ev) => {
    const cell = ev.target as HTMLElement;
    if (cell.tagName !== 'I') return;
    const had = cell.classList.contains('mine');
    cell.classList.toggle('mine', !had);
    mine += had ? -1 : 1;
    if (mine < 0) mine = 0;
    if (note) {
      note.textContent = mine
        ? `${MINE_WORDS[Math.min(mine, MINE_WORDS.length) - 1]} · твоих встреч: ${mine}`
        : 'встречи проступают по одной — а ты закрашивай клетки сам, твои встречи дополнят картинку';
    }
  });

  if (reducedMotion()) {
    order.forEach((i) => cells[i].classList.add('on'));
    return;
  }

  const id = window.setInterval(() => {
    if (document.hidden) return;
    if (k < order.length) {
      cells[order[k]].classList.add('on');
      k += 1;
      return;
    }
    k += 1;
    if (k > order.length + 22) {
      pic += 1;
      start();
    }
  }, 55);
  onCleanup(() => window.clearInterval(id));
}

/* ---------------------------------- graph ----------------------------------- */

export function graphHtml(): string {
  return `<section class="station graph">
    <p class="station-cmd">$ ./graph --bloom</p>
    <h3>связи, которых не было</h3>
    <canvas class="graph-canvas" id="graph-canvas" width="620" height="330"></canvas>
    <p class="station-note" id="graph-note">каждая новая точка тянется к тем, кто уже здесь. ткни — посадишь свою, узлы потянутся к руке</p>
  </section>`;
}

const MAX_NODES = 46; // how many nodes the canvas holds before it starts forgetting

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  links: number[];
  mine?: boolean;
}

export function mountGraph(root: ParentNode): void {
  const canvas = root.querySelector('#graph-canvas') as HTMLCanvasElement | null;
  const note = root.querySelector('#graph-note') as HTMLElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  let nodes: Node[] = [];
  let next = 0;
  // hand: nodes are attracted to the pointer while it is over the canvas
  let hand: { x: number; y: number } | null = null;
  let mine = 0;

  const local = (ev: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    return { x: ((ev.clientX - r.left) / r.width) * W, y: ((ev.clientY - r.top) / r.height) * H };
  };

  const add = (now: number, at?: { x: number; y: number }, isMine = false): void => {
    const n: Node = {
      x: at ? at.x : W * (0.12 + Math.random() * 0.76),
      y: at ? at.y : H * (0.12 + Math.random() * 0.76),
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      born: now,
      links: [],
      mine: isMine,
    };
    const near = nodes
      .map((o, i) => ({ i, d: Math.hypot(o.x - n.x, o.y - n.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    near.forEach((o) => n.links.push(o.i));
    nodes.push(n);
    // Drop old nodes ONE AT A TIME instead of clearing the whole set: the graph
    // should grow and age, not blink back to an empty canvas.
    while (nodes.length > MAX_NODES) {
      nodes.shift();
      nodes.forEach((o) => {
        o.links = o.links.map((k) => k - 1).filter((k) => k >= 0);
      });
    }
  };

  canvas.addEventListener('pointermove', (ev) => {
    hand = local(ev);
  });
  canvas.addEventListener('pointerleave', () => {
    hand = null;
  });
  canvas.addEventListener('pointerdown', (ev) => {
    add(performance.now(), local(ev), true);
    mine += 1;
    if (note) {
      note.textContent =
        mine < 3
          ? `твоих связей: ${mine}. каждая нашла себе двух соседей`
          : `твоих связей: ${mine}. это уже твой граф, а не наш`;
    }
  });

  const draw = (now: number): void => {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach((n) => {
      if (hand) {
        // weak pull toward the pointer, so the graph stretches instead of collapsing
        const dx = hand.x - n.x;
        const dy = hand.y - n.y;
        const d = Math.max(28, Math.hypot(dx, dy));
        n.vx += (dx / d) * 0.05;
        n.vy += (dy / d) * 0.05;
      }
      n.vx *= 0.965;
      n.vy *= 0.965;
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 8 || n.x > W - 8) n.vx *= -1;
      if (n.y < 8 || n.y > H - 8) n.vy *= -1;
      n.x = Math.max(6, Math.min(W - 6, n.x));
      n.y = Math.max(6, Math.min(H - 6, n.y));
    });
    ctx.lineWidth = 1;
    nodes.forEach((n) => {
      const age = Math.min(1, (now - n.born) / 900);
      n.links.forEach((j) => {
        const o = nodes[j];
        if (!o) return;
        const g = ctx.createLinearGradient(n.x, n.y, o.x, o.y);
        g.addColorStop(0, `rgba(141, 245, 232, ${(0.42 * age).toFixed(3)})`);
        g.addColorStop(1, `rgba(255, 178, 108, ${(0.3 * age).toFixed(3)})`);
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(n.x + (o.x - n.x) * age, n.y + (o.y - n.y) * age);
        ctx.stroke();
      });
    });
    nodes.forEach((n) => {
      const age = Math.min(1, (now - n.born) / 700);
      const r = (n.mine ? 2.2 : 1.4) + age * 2.2 + Math.sin(now * 0.002 + n.x) * 0.5;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = n.mine
        ? `rgba(255, 208, 150, ${(0.95 * age).toFixed(3)})`
        : `rgba(214, 252, 248, ${(0.85 * age).toFixed(3)})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 3.4, 0, Math.PI * 2);
      ctx.fillStyle = n.mine
        ? `rgba(255, 178, 108, ${(0.09 * age).toFixed(3)})`
        : `rgba(88, 230, 217, ${(0.06 * age).toFixed(3)})`;
      ctx.fill();
    });
  };

  if (reducedMotion()) {
    for (let i = 0; i < 14; i += 1) add(0);
    draw(1000);
    return;
  }
  let raf = 0;
  const loop = (now: number): void => {
    if (!document.hidden) {
      if (now > next) {
        add(now);
        next = now + 380;
      }
      draw(now);
    }
    raf = window.requestAnimationFrame(loop);
  };
  raf = window.requestAnimationFrame(loop);
  onCleanup(() => window.cancelAnimationFrame(raf));
}

/* ------------------------------ machine vision ------------------------------ */

const VISION_TAGS = ['человек? 0.71', 'что-то тёплое 0.63', 'дом 0.94', 'дерево 0.88', 'память 0.12'];
const VISION_LINES = [
  'здесь кто-то стоял',
  'модель уверена на 0.63',
  'the earth is still warm from you',
  'объект не найден в словаре',
];

/**
 * What the model "sees" where the pointer is. The world is split by height into sky,
 * horizon and ground; each band has its own tag and caption, so the box follows the
 * pointer and the labels change with its vertical position.
 */
const VISION_ZONES: Array<{ upto: number; tag: string; line: string }> = [
  { upto: 0.3, tag: 'небо 0.98', line: 'небо. распознано с первой попытки, ничего больше не сказано' },
  { upto: 0.52, tag: 'облако? 0.44', line: 'облако или дым. модель не уверена и всё равно отвечает' },
  { upto: 0.66, tag: 'горизонт 0.81', line: 'граница между двумя ничем. подписано как объект' },
  { upto: 0.8, tag: 'кто-то стоял 0.29', line: 'the earth is still warm from you' },
  { upto: 1.01, tag: 'земля 0.93', line: 'земля. тёплая. это не метрика, это она так сказала' },
];

export function visionHtml(): string {
  return `<section class="station vision">
    <p class="station-cmd">$ ./vision --read-poetry</p>
    <h3>машинное зрение читает стихи</h3>
    <canvas class="vision-canvas" id="vision-canvas" width="620" height="330"></canvas>
    <p class="station-note" id="vision-line">веди мышкой по кадру — рамки пойдут за тобой и подпишут то место, куда ты смотришь</p>
    ${authorChipHtml(
      'по мотивам работы @drezzdon',
      'tiktok',
      'https://www.tiktok.com/@drezzdon/video/7494013737150450990',
      'https://www.tiktok.com/@drezzdon',
    )}
  </section>`;
}

/**
 * The world behind the boxes: the detector has to look at something rather than at
 * nothing. A dusk horizon with ridges and grain is painted once into an offscreen
 * canvas; a dimmed sky photo (assets/posters/sky.jpg) is layered on top once it loads.
 * The procedural backdrop is always there, so the station works even if the image fails.
 */
function visionWorld(W: number, H: number): { canvas: HTMLCanvasElement; sky: (img: HTMLImageElement) => void } {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const paint = (img: HTMLImageElement | null): void => {
    if (!g) return;
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#071722');
    sky.addColorStop(0.62, '#0d2a34');
    sky.addColorStop(0.75, '#1d3d3f');
    sky.addColorStop(1, '#050d12');
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);

    if (img) {
      // the sky photo is kept dimmed: it is a backdrop, not the exhibit
      g.save();
      g.globalAlpha = 0.34;
      const k = Math.max(W / img.width, H / img.height);
      const iw = img.width * k;
      const ih = img.height * k;
      g.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
      g.restore();
      g.fillStyle = 'rgba(4, 14, 20, 0.5)';
      g.fillRect(0, 0, W, H);
    }

    // distant hills: two ridges, the nearer one darker, which reads as depth
    const ridge = (base: number, amp: number, step: number, fill: string): void => {
      g.beginPath();
      g.moveTo(0, H);
      for (let x = 0; x <= W; x += step) {
        const y = base + Math.sin(x * 0.011) * amp + Math.sin(x * 0.037 + 1.7) * amp * 0.45;
        g.lineTo(x, y);
      }
      g.lineTo(W, H);
      g.closePath();
      g.fillStyle = fill;
      g.fill();
    };
    ridge(H * 0.68, 14, 7, 'rgba(9, 32, 40, 0.86)');
    ridge(H * 0.79, 9, 5, 'rgba(4, 18, 24, 0.94)');

    // horizon line and sensor grain
    g.fillStyle = 'rgba(141, 245, 232, 0.16)';
    g.fillRect(0, Math.round(H * 0.66), W, 1);
    for (let i = 0; i < 2600; i += 1) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      g.fillStyle = `rgba(200, 235, 245, ${(Math.random() * 0.05).toFixed(3)})`;
      g.fillRect(x, y, 1, 1);
    }
  };
  paint(null);
  return { canvas: c, sky: (img) => paint(img) };
}

export function mountVision(root: ParentNode): void {
  const canvas = root.querySelector('#vision-canvas') as HTMLCanvasElement | null;
  const line = root.querySelector('#vision-line') as HTMLElement | null;
  if (!canvas || !line) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  const world = visionWorld(W, H);
  const img = new Image();
  img.onload = (): void => world.sky(img);
  img.src = 'assets/posters/sky.jpg';
  const boxes = VISION_TAGS.map((tag, i) => ({
    tag,
    x: 40 + ((i * 137) % (W - 200)),
    y: 30 + ((i * 91) % (H - 130)),
    w: 90 + ((i * 37) % 120),
    h: 60 + ((i * 53) % 90),
    p: Math.random() * Math.PI * 2,
  }));

  // EYE: where the visitor is looking. The hunting box follows the pointer with a lag,
  // so it reads as the model CATCHING UP with the gaze rather than being glued to it.
  let look: { x: number; y: number } | null = null;
  let eyeX = W * 0.5;
  let eyeY = H * 0.5;
  let zone = -1;
  const local = (ev: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    return { x: ((ev.clientX - r.left) / r.width) * W, y: ((ev.clientY - r.top) / r.height) * H };
  };
  canvas.addEventListener('pointermove', (ev) => {
    look = local(ev);
  });
  canvas.addEventListener('pointerleave', () => {
    look = null;
  });

  const draw = (now: number): void => {
    ctx.clearRect(0, 0, W, H);
    // the world drifts slowly, so the boxes slide over it instead of hanging in a void
    const px = Math.sin(now * 0.00008) * 10;
    ctx.drawImage(world.canvas, px, 0);
    ctx.drawImage(world.canvas, px > 0 ? px - W : px + W, 0);
    ctx.font = '11px ui-monospace, monospace';
    boxes.forEach((b, i) => {
      const dx = Math.sin(now * 0.00035 + b.p) * 12;
      const dy = Math.cos(now * 0.00027 + b.p) * 8;
      const on = (0.35 + 0.45 * (0.5 + 0.5 * Math.sin(now * 0.0009 + i))) * (look ? 0.45 : 1);
      ctx.strokeStyle = `rgba(255, 74, 74, ${on.toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(b.x + dx, b.y + dy, b.w, b.h);
      // plate behind the label: above the horizon the text would be unreadable
      ctx.fillStyle = `rgba(4, 12, 18, ${(0.62 * (look ? 0.5 : 1)).toFixed(2)})`;
      ctx.fillRect(b.x + dx, b.y + dy - 15, ctx.measureText(b.tag).width + 6, 13);
      ctx.fillStyle = `rgba(255, 120, 110, ${(on * 0.9).toFixed(3)})`;
      ctx.fillText(b.tag, b.x + dx + 2, b.y + dy - 5);
    });

    if (!look) return;
    eyeX += (look.x - eyeX) * 0.16;
    eyeY += (look.y - eyeY) * 0.16;
    const v = Math.max(0, Math.min(0.999, eyeY / H));
    let z = 0;
    while (z < VISION_ZONES.length - 1 && v > VISION_ZONES[z].upto) z += 1;
    if (z !== zone) {
      zone = z;
      line.textContent = VISION_ZONES[z].line;
    }
    // box around the gaze point: it breathes slightly but never jumps
    const bw = 128 + Math.sin(now * 0.0011) * 10;
    const bh = 92 + Math.cos(now * 0.0013) * 8;
    const x = eyeX - bw / 2;
    const y = eyeY - bh / 2;
    ctx.strokeStyle = 'rgba(255, 90, 82, 0.95)';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(x, y, bw, bh);
    // corner brackets make the box read as a detector reticle
    ctx.beginPath();
    const c = 14;
    ctx.moveTo(x, y + c); ctx.lineTo(x, y); ctx.lineTo(x + c, y);
    ctx.moveTo(x + bw - c, y); ctx.lineTo(x + bw, y); ctx.lineTo(x + bw, y + c);
    ctx.moveTo(x + bw, y + bh - c); ctx.lineTo(x + bw, y + bh); ctx.lineTo(x + bw - c, y + bh);
    ctx.moveTo(x + c, y + bh); ctx.lineTo(x, y + bh); ctx.lineTo(x, y + bh - c);
    ctx.lineWidth = 2.4;
    ctx.stroke();
    const tag = VISION_ZONES[zone].tag;
    ctx.fillStyle = 'rgba(4, 12, 18, 0.8)';
    ctx.fillRect(x, y - 16, ctx.measureText(tag).width + 8, 14);
    ctx.fillStyle = 'rgba(255, 160, 150, 0.98)';
    ctx.fillText(tag, x + 3, y - 5);
  };

  if (reducedMotion()) {
    draw(0);
    line.textContent = VISION_LINES[0];
    return;
  }
  let raf = 0;
  let next = 0;
  let k = 0;
  const loop = (now: number): void => {
    if (!document.hidden) {
      draw(now);
      // with no pointer on the canvas the model cycles through its idle captions
      if (!look && now > next) {
        line.textContent = VISION_LINES[k % VISION_LINES.length];
        k += 1;
        next = now + 3200;
        zone = -1;
      }
    }
    raf = window.requestAnimationFrame(loop);
  };
  raf = window.requestAnimationFrame(loop);
  onCleanup(() => window.cancelAnimationFrame(raf));
}
