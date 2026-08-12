// Two more exhibits in the "worst UI" genre.
//
// 1. MAZE CAPTCHA. "Would you like to delete your account?" — the checkbox that
//    gates confirmation sits at the CENTRE of a maze; the cursor has to be walked
//    to it. This is our own reimplementation of the genre, not a copy; originals
//    are linked rather than embedded.
// 2. DICE VOLUME. 16 d6 dice, each with a Hold toggle plus a Roll button; the
//    volume value is the sum of the faces. Inspired by the well-known "worst
//    volume control" contest; the write-up is linked on the exhibit itself.
//
// No emoji anywhere: dice, tick and arrows are all inline SVG.

import { svgArrow } from '../chrome';
import { onCleanup, reducedMotion } from '../runtime';

// ---------------------------------------------------------------- maze

const CELL = 26;
const PAD = 8;
const GRID = 7;
const SIZE = GRID * CELL + PAD * 2;
const HALF = 8; // half the corridor width
const DOT = 5;

interface Seg {
  r0: number;
  c0: number;
  r1: number;
  c1: number;
}

/**
 * Maze corridors in grid cells. There is exactly one path from the entrance
 * (6,0) to the checkbox at the centre (3,3); every other branch is a dead end,
 * and two of them stop right next to the centre against a wall.
 */
const MAZE: Seg[] = [
  { r0: 3, c0: 0, r1: 6, c1: 0 }, // entrance, bottom to top
  { r0: 3, c0: 0, r1: 3, c1: 1 },
  { r0: 1, c0: 1, r1: 3, c1: 1 },
  { r0: 1, c0: 1, r1: 1, c1: 4 },
  { r0: 1, c0: 4, r1: 3, c1: 4 },
  { r0: 3, c0: 3, r1: 3, c1: 4 }, // reaches the checkbox
  { r0: 6, c0: 0, r1: 6, c1: 4 }, // dead end along the bottom
  { r0: 4, c0: 4, r1: 6, c1: 4 }, // dead end upwards, into the wall below the centre
  { r0: 3, c0: 1, r1: 5, c1: 1 },
  { r0: 5, c0: 1, r1: 5, c1: 3 }, // dead end
  { r0: 1, c0: 3, r1: 2, c1: 3 }, // stops just short of the centre from above
  { r0: 1, c0: 4, r1: 1, c1: 6 },
  { r0: 1, c0: 6, r1: 3, c1: 6 },
  { r0: 3, c0: 5, r1: 3, c1: 6 }, // stops just short of the centre from the right
];

function cx(c: number): number {
  return PAD + c * CELL + CELL / 2;
}

function cy(r: number): number {
  return PAD + r * CELL + CELL / 2;
}

function segRect(s: Seg): { x: number; y: number; w: number; h: number } {
  const x0 = Math.min(cx(s.c0), cx(s.c1)) - HALF;
  const x1 = Math.max(cx(s.c0), cx(s.c1)) + HALF;
  const y0 = Math.min(cy(s.r0), cy(s.r1)) - HALF;
  const y1 = Math.max(cy(s.r0), cy(s.r1)) + HALF;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function inMaze(x: number, y: number): boolean {
  return MAZE.some((s) => {
    const r = segRect(s);
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  });
}

function mazeSvg(): string {
  const floors = MAZE.map((s) => {
    const r = segRect(s);
    return `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="2" fill="#0b0803"/>`;
  }).join('');
  return `<svg class="maze-svg" id="maze-svg" viewBox="0 0 ${SIZE} ${SIZE}"
       tabindex="0" role="application"
       aria-label="лабиринт: доведи курсор до галочки в центре (стрелки тоже работают)">
    <rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="#2b1d08"/>
    ${floors}
    <g class="maze-start" aria-hidden="true">
      <rect x="${cx(0) - 6}" y="${cy(6) - 6}" width="12" height="12" fill="rgba(255,180,84,0.18)"/>
    </g>
    <g class="maze-check" id="maze-check" aria-hidden="true">
      <rect x="${cx(3) - 8}" y="${cy(3) - 8}" width="16" height="16" rx="2"
            fill="none" stroke="var(--amber, #ffb454)" stroke-width="1.4"/>
      <path id="maze-tick" d="M${cx(3) - 5} ${cy(3)} l3.4 3.6 L${cx(3) + 5.5} ${cy(3) - 4.6}"
            fill="none" stroke="var(--amber, #ffb454)" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <circle class="maze-dot" id="maze-dot" r="${DOT}" cx="${cx(0)}" cy="${cy(6)}" fill="#ffd9a0"/>
  </svg>`;
}

export function mazeCaptchaHtml(): string {
  return `<div class="obj mid toy maze reveal" id="maze">
    <div class="obj-title">$ ./account --delete</div>
    <p class="maze-q">Would you like to delete your account?</p>
    <p class="obj-hint top">чтобы подтвердить, снимите галочку «я передумал». она в центре</p>
    <div class="maze-body">
      ${mazeSvg()}
      <div class="maze-side">
        <p class="maze-state" id="maze-state">галочка «я передумал»: стоит</p>
        <p class="maze-hint">веди мышкой от квадратика внизу слева. или стрелками с клавиатуры</p>
        <div class="maze-btns">
          <button class="obj-btn" id="maze-yes" type="button">Yes</button>
          <button class="obj-btn small" id="maze-no" type="button">No</button>
        </div>
        <p class="maze-out" id="maze-out">> ждём вашего решения</p>
      </div>
    </div>
    <span class="chip genre">жанр: worst UX awards · тикток</span>
  </div>`;
}

export function mountMazeCaptcha(root: HTMLElement): void {
  const host = root.querySelector('#maze') as HTMLElement | null;
  if (!host) return;
  const svg = host.querySelector('#maze-svg') as SVGSVGElement;
  const dot = host.querySelector('#maze-dot') as SVGCircleElement;
  const tick = host.querySelector('#maze-tick') as SVGPathElement;
  const state = host.querySelector('#maze-state') as HTMLElement;
  const out = host.querySelector('#maze-out') as HTMLElement;
  const yes = host.querySelector('#maze-yes') as HTMLButtonElement;
  const no = host.querySelector('#maze-no') as HTMLButtonElement;

  let x = cx(0);
  let y = cy(6);
  let checked = true;

  const paint = (): void => {
    dot.setAttribute('cx', x.toFixed(1));
    dot.setAttribute('cy', y.toFixed(1));
    tick.style.opacity = checked ? '1' : '0';
    state.textContent = checked
      ? 'галочка «я передумал»: стоит'
      : 'галочка «я передумал»: снята (вы прошли лабиринт)';
    host.classList.toggle('armed', !checked);
  };

  const arrive = (): void => {
    if (!checked) return;
    if (Math.abs(x - cx(3)) > 9 || Math.abs(y - cy(3)) > 9) return;
    checked = false;
    out.textContent = '> галочка снята. кнопка Yes наконец работает';
    paint();
  };

  /** Walk towards the target one pixel at a time and stop at the first wall. */
  const moveTo = (tx: number, ty: number): void => {
    const dx = tx - x;
    const dy = ty - y;
    const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)));
    for (let i = 0; i < steps; i += 1) {
      const nx = x + dx / steps;
      const ny = y + dy / steps;
      if (!inMaze(nx, ny)) break;
      x = nx;
      y = ny;
    }
    paint();
    arrive();
  };

  const toSvg = (ev: PointerEvent): { x: number; y: number } => {
    const r = svg.getBoundingClientRect();
    return {
      x: ((ev.clientX - r.left) / r.width) * SIZE,
      y: ((ev.clientY - r.top) / r.height) * SIZE,
    };
  };

  let dragging = false;
  svg.addEventListener('pointerdown', (ev) => {
    dragging = true;
    svg.setPointerCapture(ev.pointerId);
    const p = toSvg(ev);
    moveTo(p.x, p.y);
  });
  svg.addEventListener('pointermove', (ev) => {
    if (!dragging) return;
    const p = toSvg(ev);
    moveTo(p.x, p.y);
  });
  const stop = (): void => {
    dragging = false;
  };
  svg.addEventListener('pointerup', stop);
  svg.addEventListener('pointercancel', stop);

  // Keyboard: exactly one cell per press, so the maze is solvable without a mouse.
  const KEYS: Record<string, [number, number]> = {
    ArrowUp: [0, -CELL],
    ArrowDown: [0, CELL],
    ArrowLeft: [-CELL, 0],
    ArrowRight: [CELL, 0],
  };
  svg.addEventListener('keydown', (ev) => {
    const d = KEYS[(ev as KeyboardEvent).key];
    if (!d) return;
    ev.preventDefault();
    moveTo(x + d[0], y + d[1]);
  });

  yes.addEventListener('click', () => {
    out.textContent = checked
      ? '> удалить нельзя: галочка «я передумал» всё ещё стоит'
      : '> аккаунт удалён. шутка, это музей. ничего не удалено';
  });
  no.addEventListener('click', () => {
    checked = true;
    x = cx(0);
    y = cy(6);
    paint();
    out.textContent = '> спасибо, что остаётесь. галочку мы вернули на место';
  });

  paint();
}

// ------------------------------------------------------------- dice volume

const DICE = 16;

const PIPS: Array<Array<[number, number]>> = [
  [[0.5, 0.5]],
  [[0.28, 0.28], [0.72, 0.72]],
  [[0.26, 0.26], [0.5, 0.5], [0.74, 0.74]],
  [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
  [[0.26, 0.26], [0.74, 0.26], [0.5, 0.5], [0.26, 0.74], [0.74, 0.74]],
  [[0.28, 0.24], [0.72, 0.24], [0.28, 0.5], [0.72, 0.5], [0.28, 0.76], [0.72, 0.76]],
];

function dieSvg(v: number): string {
  const s = 30;
  const pips = PIPS[v - 1]
    .map(([px, py]) => `<circle cx="${(px * s).toFixed(1)}" cy="${(py * s).toFixed(1)}" r="2.4" fill="#ffd9a0"/>`)
    .join('');
  return `<svg viewBox="0 0 ${s} ${s}" class="die-face" role="img" aria-label="кубик: ${v}">
    <rect x="1" y="1" width="${s - 2}" height="${s - 2}" rx="4" fill="#150e04"
          stroke="rgba(255,180,84,0.45)" stroke-width="1.2"/>${pips}</svg>`;
}

export function diceVolumeHtml(): string {
  let cells = '';
  for (let i = 0; i < DICE; i += 1) {
    cells += `<div class="die" data-die="${i}">
      <span class="die-box" id="die-${i}">${dieSvg(1)}</span>
      <label class="die-hold"><input type="checkbox" id="hold-${i}" aria-label="держать кубик ${i + 1}"/> Hold</label>
    </div>`;
  }
  return `<div class="obj mid toy dice reveal" id="dice">
    <div class="obj-title">$ ./volume --input=d6</div>
    <p class="obj-hint top">громкость — это сумма выпавшего. хочешь тише? бросай ещё раз</p>
    <div class="dice-grid">${cells}</div>
    <div class="dice-row">
      <button class="obj-btn" id="dice-roll" type="button">Roll</button>
      <span class="dice-vol">Volume: <b id="dice-val">16</b> / 96</span>
      <span class="dice-bar" aria-hidden="true"><i id="dice-fill"></i></span>
    </div>
    <p class="dice-out" id="dice-out">> установлено значение 16. ровно то, что вы хотели</p>
    <a class="plate" href="https://habr.com/ru/articles/449060/" target="_blank" rel="noopener">
      по мотивам конкурса worst volume control ${svgArrow}</a>
  </div>`;
}

export function mountDiceVolume(root: HTMLElement): void {
  const host = root.querySelector('#dice') as HTMLElement | null;
  if (!host) return;
  const val = host.querySelector('#dice-val') as HTMLElement;
  const fill = host.querySelector('#dice-fill') as HTMLElement;
  const out = host.querySelector('#dice-out') as HTMLElement;
  const roll = host.querySelector('#dice-roll') as HTMLButtonElement;
  const faces: HTMLElement[] = [];
  const holds: HTMLInputElement[] = [];
  for (let i = 0; i < DICE; i += 1) {
    faces.push(host.querySelector(`#die-${i}`) as HTMLElement);
    holds.push(host.querySelector(`#hold-${i}`) as HTMLInputElement);
  }
  const vals: number[] = new Array(DICE).fill(1);

  const say = (sum: number, held: number): string => {
    if (sum >= 88) return '> почти максимум. соседи уже в курсе';
    if (sum <= 24) return '> тихо. слишком тихо. бросьте ещё раз (или не бросайте)';
    if (held >= 8) return `> зажато кубиков: ${held}. вы почти научились управлять громкостью`;
    return '> установлено значение ' + sum + '. ровно то, что вы хотели';
  };

  const paint = (): void => {
    let sum = 0;
    for (let i = 0; i < DICE; i += 1) {
      faces[i].innerHTML = dieSvg(vals[i]);
      sum += vals[i];
    }
    const held = holds.filter((h) => h.checked).length;
    val.textContent = String(sum);
    fill.style.width = `${(((sum - DICE) / (DICE * 5)) * 100).toFixed(1)}%`;
    out.textContent = say(sum, held);
  };

  const throwOnce = (): void => {
    for (let i = 0; i < DICE; i += 1) {
      if (holds[i].checked) continue;
      vals[i] = 1 + Math.floor(Math.random() * 6);
    }
    paint();
  };

  roll.addEventListener('click', () => {
    if (reducedMotion()) {
      throwOnce();
      return;
    }
    host.classList.add('rolling');
    let n = 0;
    const id = window.setInterval(() => {
      throwOnce();
      n += 1;
      if (n >= 6) {
        window.clearInterval(id);
        host.classList.remove('rolling');
      }
    }, 70);
    onCleanup(() => window.clearInterval(id));
  });

  holds.forEach((h) => h.addEventListener('change', paint));
  paint();
}
